// Drizzle table definitions. Run `npm run db:push` after changing them.
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-zod"
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

// Fields a user may set when creating a bot. The owner comes from the session.
export const botInsertSchema = createInsertSchema(bots, {
  name: (s) =>
    s
      .trim()
      .min(1, "Give your bot a name.")
      .max(50, "Keep the name to 50 characters or fewer."),
  job: (s) =>
    s
      .trim()
      .min(1, "Give your bot a job.")
      .max(100, "Keep the job to 100 characters or fewer."),
  instructions: (s) =>
    s.trim().max(4000, "Keep the instructions to 4000 characters or fewer."),
}).pick({ name: true, avatar: true, job: true, instructions: true })
