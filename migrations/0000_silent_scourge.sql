CREATE TABLE "match_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"opponent_id" integer,
	"is_win" boolean NOT NULL,
	"is_draw" boolean DEFAULT false NOT NULL,
	"scoreline" text NOT NULL,
	"elo_change" integer DEFAULT 0 NOT NULL,
	"coin_reward" integer DEFAULT 0 NOT NULL,
	"played_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"owner_id" integer NOT NULL,
	"position" text NOT NULL,
	"rarity" text DEFAULT 'Common' NOT NULL,
	"attack" integer DEFAULT 10 NOT NULL,
	"defense" integer DEFAULT 10 NOT NULL,
	"speed" integer DEFAULT 10 NOT NULL,
	"stamina" integer DEFAULT 10 NOT NULL,
	"overall_rating" integer DEFAULT 10 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"max_level" integer DEFAULT 10 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "squads" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"formation" text DEFAULT '4-4-2' NOT NULL,
	"gk_id" integer,
	"lf_id" integer,
	"rf_id" integer,
	"lm_id" integer,
	"cm1_id" integer,
	"cm2_id" integer,
	"rm_id" integer,
	"lb_id" integer,
	"cb1_id" integer,
	"cb2_id" integer,
	"rb_id" integer,
	"bench1_id" integer,
	"bench2_id" integer,
	"bench3_id" integer,
	CONSTRAINT "squads_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"telegram_id" text NOT NULL,
	"username" text,
	"wallet_address" text,
	"elo_rating" integer DEFAULT 1000 NOT NULL,
	"coins" integer DEFAULT 0 NOT NULL,
	"tof_balance" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_telegram_id_unique" UNIQUE("telegram_id")
);
--> statement-breakpoint
ALTER TABLE "match_history" ADD CONSTRAINT "match_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_history" ADD CONSTRAINT "match_history_opponent_id_users_id_fk" FOREIGN KEY ("opponent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "squads" ADD CONSTRAINT "squads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "squads" ADD CONSTRAINT "squads_gk_id_players_id_fk" FOREIGN KEY ("gk_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "squads" ADD CONSTRAINT "squads_lf_id_players_id_fk" FOREIGN KEY ("lf_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "squads" ADD CONSTRAINT "squads_rf_id_players_id_fk" FOREIGN KEY ("rf_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "squads" ADD CONSTRAINT "squads_lm_id_players_id_fk" FOREIGN KEY ("lm_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "squads" ADD CONSTRAINT "squads_cm1_id_players_id_fk" FOREIGN KEY ("cm1_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "squads" ADD CONSTRAINT "squads_cm2_id_players_id_fk" FOREIGN KEY ("cm2_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "squads" ADD CONSTRAINT "squads_rm_id_players_id_fk" FOREIGN KEY ("rm_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "squads" ADD CONSTRAINT "squads_lb_id_players_id_fk" FOREIGN KEY ("lb_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "squads" ADD CONSTRAINT "squads_cb1_id_players_id_fk" FOREIGN KEY ("cb1_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "squads" ADD CONSTRAINT "squads_cb2_id_players_id_fk" FOREIGN KEY ("cb2_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "squads" ADD CONSTRAINT "squads_rb_id_players_id_fk" FOREIGN KEY ("rb_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "squads" ADD CONSTRAINT "squads_bench1_id_players_id_fk" FOREIGN KEY ("bench1_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "squads" ADD CONSTRAINT "squads_bench2_id_players_id_fk" FOREIGN KEY ("bench2_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "squads" ADD CONSTRAINT "squads_bench3_id_players_id_fk" FOREIGN KEY ("bench3_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;