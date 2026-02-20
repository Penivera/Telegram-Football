import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  telegramId: text("telegram_id").notNull().unique(),
  username: text("username"),
  walletAddress: text("wallet_address"),
  eloRating: integer("elo_rating").notNull().default(1000),
  coins: integer("coins").notNull().default(0), // Off-chain
  tofBalance: integer("tof_balance").notNull().default(0), // Syncs closely with Jetton
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const players = sqliteTable("players", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  ownerId: integer("owner_id").references(() => users.id).notNull(),
  position: text("position").notNull(), // e.g. "FW", "MF", "DF", "GK"
  rarity: text("rarity").notNull().default("Common"), // Common, Rare, Epic, Legendary

  // Stats
  attack: integer("attack").notNull().default(10),
  defense: integer("defense").notNull().default(10),
  speed: integer("speed").notNull().default(10),
  stamina: integer("stamina").notNull().default(10),

  // Progression
  overallRating: integer("overall_rating").notNull().default(10),
  level: integer("level").notNull().default(1),
  maxLevel: integer("max_level").notNull().default(10),

  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const squads = sqliteTable("squads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  formation: text("formation").notNull().default("4-4-2"),

  // 11 Starters
  gk_id: integer("gk_id").references(() => players.id),
  lf_id: integer("lf_id").references(() => players.id),
  rf_id: integer("rf_id").references(() => players.id),
  lm_id: integer("lm_id").references(() => players.id),
  cm1_id: integer("cm1_id").references(() => players.id),
  cm2_id: integer("cm2_id").references(() => players.id),
  rm_id: integer("rm_id").references(() => players.id),
  lb_id: integer("lb_id").references(() => players.id),
  cb1_id: integer("cb1_id").references(() => players.id),
  cb2_id: integer("cb2_id").references(() => players.id),
  rb_id: integer("rb_id").references(() => players.id),

  // 3 Bench
  bench1_id: integer("bench1_id").references(() => players.id),
  bench2_id: integer("bench2_id").references(() => players.id),
  bench3_id: integer("bench3_id").references(() => players.id),
});

export const matchHistory = sqliteTable("match_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  opponentId: integer("opponent_id").references(() => users.id), // Nullable if playing bot
  isWin: integer("is_win", { mode: 'boolean' }).notNull(),
  isDraw: integer("is_draw", { mode: 'boolean' }).notNull().default(false),
  scoreline: text("scoreline").notNull(), // e.g. "2-1"
  eloChange: integer("elo_change").notNull().default(0),
  coinReward: integer("coin_reward").notNull().default(0),
  playedAt: text("played_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertPlayerSchema = createInsertSchema(players).omit({ id: true, createdAt: true });
export const insertSquadSchema = createInsertSchema(squads).omit({ id: true });
export const insertMatchHistorySchema = createInsertSchema(matchHistory).omit({ id: true, playedAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

export type Squad = typeof squads.$inferSelect;
export type InsertSquad = z.infer<typeof insertSquadSchema>;

export type MatchHistory = typeof matchHistory.$inferSelect;
export type InsertMatchHistory = z.infer<typeof insertMatchHistorySchema>;
