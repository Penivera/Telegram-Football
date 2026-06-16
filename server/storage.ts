import { users, players, squads, matchHistory, type User, type InsertUser, type Player, type Squad, type InsertMatchHistory } from "../shared/schema.js";
import { db } from "./db.js";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStats(id: number, eloChange: number, coinReward: number): Promise<void>;
  updateUserBalances(id: number, coinsDelta: number, tofDelta: number): Promise<boolean>;

  // Game methods
  getSquadByUser(userId: number): Promise<Squad | undefined>;
  createSquad(squad: any): Promise<Squad>;
  updateSquad(userId: number, squadData: any): Promise<Squad>;
  getPlayersByUser(userId: number): Promise<Player[]>;
  getPlayerById(id: number): Promise<Player | undefined>;
  createPlayer(player: any): Promise<Player>;
  upgradePlayer(id: number, stat: "attack" | "defense" | "speed" | "stamina"): Promise<Player | undefined>;
  createMatchHistory(history: InsertMatchHistory): Promise<void>;
  getRandomOpponent(userId: number): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserStats(id: number, eloChange: number, coinReward: number): Promise<void> {
    const user = await this.getUser(id);
    if (!user) return;

    await db.update(users)
      .set({
        eloRating: user.eloRating + eloChange,
        coins: user.coins + coinReward
      })
      .where(eq(users.id, id));
  }

  async updateUserBalances(id: number, coinsDelta: number, tofDelta: number): Promise<boolean> {
    const user = await this.getUser(id);
    if (!user) return false;

    const newCoins = user.coins + coinsDelta;
    const newTof = user.tofBalance + tofDelta;

    // Check if affordable
    if (newCoins < 0 || newTof < 0) return false;

    await db.update(users)
      .set({ coins: newCoins, tofBalance: newTof })
      .where(eq(users.id, id));

    return true;
  }

  async getSquadByUser(userId: number): Promise<Squad | undefined> {
    const [squad] = await db.select().from(squads).where(eq(squads.userId, userId));
    return squad;
  }

  async createSquad(squad: any): Promise<Squad> {
    const [inserted] = await db.insert(squads).values(squad).returning();
    return inserted;
  }

  async updateSquad(userId: number, squadData: any): Promise<Squad> {
    const existing = await this.getSquadByUser(userId);
    if (!existing) {
      return this.createSquad({ userId, ...squadData });
    }
    const [updated] = await db.update(squads).set(squadData).where(eq(squads.userId, userId)).returning();
    return updated;
  }

  async getPlayersByUser(userId: number): Promise<Player[]> {
    return db.select().from(players).where(eq(players.ownerId, userId));
  }

  async getPlayerById(id: number): Promise<Player | undefined> {
    const [p] = await db.select().from(players).where(eq(players.id, id));
    return p;
  }

  async createPlayer(player: any): Promise<Player> {
    const [inserted] = await db.insert(players).values(player).returning();
    return inserted;
  }

  async upgradePlayer(id: number, stat: "attack" | "defense" | "speed" | "stamina"): Promise<Player | undefined> {
    const player = await this.getPlayerById(id);
    if (!player || player.level >= player.maxLevel) return undefined;

    const newLevel = player.level + 1;
    const increment = Math.floor(Math.random() * 3) + 1; // +1 to +3 stats gain

    const updates: Partial<Player> = { level: newLevel };
    updates[stat] = player[stat] + increment;

    // Recalculate OVR
    const attack = stat === "attack" ? player.attack + increment : player.attack;
    const defense = stat === "defense" ? player.defense + increment : player.defense;
    const speed = stat === "speed" ? player.speed + increment : player.speed;
    const stamina = stat === "stamina" ? player.stamina + increment : player.stamina;

    updates.overallRating = Math.round((attack * 0.35) + (defense * 0.30) + (speed * 0.20) + (stamina * 0.15));

    const [updated] = await db.update(players).set(updates).where(eq(players.id, id)).returning();
    return updated;
  }

  async createMatchHistory(history: InsertMatchHistory): Promise<void> {
    await db.insert(matchHistory).values(history);
  }

  async getRandomOpponent(userId: number): Promise<User | undefined> {
    const allUsers = await db.select().from(users);
    const others = allUsers.filter(u => u.id !== userId);
    if (others.length === 0) return undefined;
    return others[Math.floor(Math.random() * others.length)];
  }
}

export const storage = new DatabaseStorage();
