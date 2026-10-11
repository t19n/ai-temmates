// Drizzle table definitions. Run `npm run db:push` after changing them.
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"

export const bots = pgTable(
  "bots",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    // Clerk user ID of the owner.
    userId: text("user_id").notNull(),
    name: text().notNull(),
    // Seed for the bot's generated face.
    avatar: text()
      .notNull()
      .$defaultFn(() => nanoid()),
    // What the bot is for, as a short phrase.
    job: text().notNull(),
    // How the bot should go about its job.
    instructions: text(),
    // Sandbox ID, created lazily on first use.
    sandboxId: text("sandbox_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("bots_user_id_idx").on(t.userId)]
)

export type Bot = typeof bots.$inferSelect
export type NewBot = typeof bots.$inferInsert
