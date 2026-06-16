import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getStartingLineupStats, simulateMatch, type TeamStats } from "./game/matchEngine";
import { calculateElo } from "./game/elo";
import { openPack, type PackType } from "./game/packs";
import { validateInitData } from "./telegram";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/auth/telegram", async (req: Request, res: Response) => {
    try {
      const botToken = process.env.BOT_TOKEN;
      const { initData } = req.body;

      let telegramId: string;
      let username: string;
      let firstName = "";
      let lastName = "";

      if (initData) {
        if (!botToken) {
          return res.status(500).json({ message: "BOT_TOKEN is not configured" });
        }
        const validated = validateInitData(initData, botToken);
        if (!validated) {
          return res.status(401).json({ message: "Invalid Telegram initData" });
        }
        const tgUser = validated.user;
        telegramId = tgUser.id.toString();
        firstName = tgUser.first_name || "";
        lastName = tgUser.last_name || "";
        username = tgUser.username || `${firstName} ${lastName}`.trim() || telegramId;
      } else if (process.env.NODE_ENV !== "production") {
        // Dev-only fallback so the app runs in a plain browser outside Telegram.
        telegramId = "mock_browser_id";
        username = "Browser Admin";
        firstName = "Browser";
        lastName = "User";
      } else {
        return res.status(400).json({ message: "initData is required" });
      }

      // Check if user already exists
      let user = await storage.getUserByTelegramId(telegramId);

      // If they don't exist, create a new record
      if (!user) {
        const insertData = {
          telegramId,
          username: username || `${firstName} ${lastName}`.trim(),
          coins: 1000,
          tofBalance: 100,
          eloRating: 1000
        };

        user = await storage.createUser(insertData);
      }

      res.status(200).json({ user });
    } catch (e: any) {
      console.error("Auth error:", e);
      res.status(500).json({ message: "Internal server error during auth" });
    }
  });

  app.post("/api/match/play", async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ message: "userId is required" });

      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const squad = await storage.getSquadByUser(user.id);
      const players = await storage.getPlayersByUser(user.id);

      let myStats: TeamStats = { attack: 50, defense: 50, speed: 50, stamina: 50 };
      if (squad && players.length > 0) {
        myStats = getStartingLineupStats(players, squad);
      }

      // Handle Opponent logic
      let opponent = await storage.getRandomOpponent(user.id);
      let oppStats: TeamStats = { attack: 55, defense: 45, speed: 50, stamina: 50 }; // Default bot stats

      if (opponent) {
        const oppSquad = await storage.getSquadByUser(opponent.id);
        const oppPlayers = await storage.getPlayersByUser(opponent.id);
        if (oppSquad && oppPlayers.length > 0) {
          oppStats = getStartingLineupStats(oppPlayers, oppSquad);
        }
      }

      const matchResult = simulateMatch(user.id, myStats, opponent ? opponent.id : 0, oppStats);

      // Calculate ELO if opponent exists, otherwise just default gain/loss against bot
      let myEloChange = 15;
      let myCoinReward = matchResult.isDraw ? 50 : (matchResult.winnerId === user.id ? 100 : 20);

      if (opponent) {
        const eloResults = calculateElo(user.eloRating, opponent.eloRating, matchResult.teamAScore, matchResult.teamBScore);
        myEloChange = eloResults.ratingChangeA;

        await storage.updateUserStats(opponent.id, eloResults.ratingChangeB, 0); // Give opponent ELO but no coins for passive play
      } else {
        // Simple bot ELO calculation
        if (matchResult.winnerId === null) myEloChange = 5;
        else if (matchResult.winnerId === user.id) myEloChange = 15;
        else myEloChange = -15;
      }

      await storage.updateUserStats(user.id, myEloChange, myCoinReward);

      await storage.createMatchHistory({
        userId: user.id,
        opponentId: opponent ? opponent.id : null,
        isWin: matchResult.winnerId === user.id,
        isDraw: matchResult.isDraw,
        scoreline: matchResult.scoreline,
        eloChange: myEloChange,
        coinReward: myCoinReward
      });

      res.status(200).json({
        matchResult,
        eloChange: myEloChange,
        rewards: { coins: myCoinReward }
      });
    } catch (e: any) {
      console.error("Match engine error:", e);
      res.status(500).json({ message: "Match simulation failed" });
    }
  });

  app.post("/api/store/packs", async (req: Request, res: Response) => {
    try {
      const { userId, packType } = req.body;
      if (!userId || !packType) {
        return res.status(400).json({ message: "userId and packType are required" });
      }

      // Determine cost
      let coinsCost = 0;
      let tofCost = 0;

      if (packType === "Standard") coinsCost = 500;
      else if (packType === "Premium") coinsCost = 2000;
      else if (packType === "Elite") tofCost = 50;
      else return res.status(400).json({ message: "Invalid packType" });

      // Deduct balance
      const success = await storage.updateUserBalances(userId, -coinsCost, -tofCost);
      if (!success) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Generate dropped player
      const rawPlayer = openPack(packType as PackType);

      // Save player to DB
      const playerRecord = {
        name: rawPlayer.name,
        ownerId: userId,
        position: rawPlayer.position,
        rarity: rawPlayer.rarity,
        attack: rawPlayer.attack,
        defense: rawPlayer.defense,
        speed: rawPlayer.speed,
        stamina: rawPlayer.stamina,
        overallRating: rawPlayer.overallRating,
        level: rawPlayer.level,
        maxLevel: rawPlayer.maxLevel
      };

      const savedPlayer = await storage.createPlayer(playerRecord);

      res.status(200).json({
        message: "Pack opened successfully",
        player: {
          ...savedPlayer
        }
      });
    } catch (e: any) {
      console.error("Pack open error:", e);
      res.status(500).json({ message: "Failed to open pack" });
    }
  });

  app.post("/api/store/upgrade", async (req: Request, res: Response) => {
    try {
      const { userId, playerId, stat } = req.body;
      if (!userId || !playerId || !stat) {
        return res.status(400).json({ message: "userId, playerId, and stat are required" });
      }

      if (!["attack", "defense", "speed", "stamina"].includes(stat)) {
        return res.status(400).json({ message: "Invalid stat type" });
      }

      const player = await storage.getPlayerById(playerId);
      if (!player) return res.status(404).json({ message: "Player not found" });
      if (player.ownerId !== userId) return res.status(403).json({ message: "Not your player" });
      if (player.level >= player.maxLevel) return res.status(400).json({ message: "Player is at max level" });

      // Determine Cost based on level. 
      // Example: 100 coins + (level * 50) coins. Every 10th level costs TOF instead.
      let coinsCost = 100 + (player.level * 50);
      let tofCost = 0;

      if (player.level % 10 === 0) {
        coinsCost = 0;
        tofCost = Math.floor(player.level / 10) * 5; // e.g. lvl 10 = 5 TOF, lvl 20 = 10 TOF
      }

      const success = await storage.updateUserBalances(userId, -coinsCost, -tofCost);
      if (!success) {
        return res.status(400).json({ message: "Insufficient balance for upgrade" });
      }

      const updatedPlayer = await storage.upgradePlayer(playerId, stat as any);

      res.status(200).json({
        message: "Player upgraded successfully",
        player: updatedPlayer,
        cost: { coins: coinsCost, tof: tofCost }
      });
    } catch (e: any) {
      console.error("Upgrade error:", e);
      res.status(500).json({ message: "Failed to upgrade player" });
    }
  });

  // Data Fetching Routes
  app.get("/api/user/:id/players", async (req: Request, res: Response) => {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const userId = parseInt(idParam);
      if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });

      const players = await storage.getPlayersByUser(userId);
      res.status(200).json(players);
    } catch (e: any) {
      res.status(500).json({ message: "Failed to fetch players" });
    }
  });

  app.get("/api/user/:id/squad", async (req: Request, res: Response) => {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const userId = parseInt(idParam);
      if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });

      const squad = await storage.getSquadByUser(userId);
      res.status(200).json(squad || null); // Return null instead of 404 if no squad is set
    } catch (e: any) {
      res.status(500).json({ message: "Failed to fetch squad" });
    }
  });

  app.post("/api/user/:id/squad", async (req: Request, res: Response) => {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const userId = parseInt(idParam);
      if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });

      const squadData = req.body;
      const updatedSquad = await storage.updateSquad(userId, squadData);

      res.status(200).json({ message: "Squad updated successfully", squad: updatedSquad });
    } catch (e: any) {
      console.error("Squad update error:", e);
      res.status(500).json({ message: "Failed to update squad" });
    }
  });

  return httpServer;
}
