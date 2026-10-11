"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@clerk/nextjs/server"
import type { z } from "zod"

import { db } from "@/db"
import { bots, botInsertSchema } from "@/db/schema"

export async function createBot(input: z.input<typeof botInsertSchema>) {
  const { userId } = await auth.protect()
  const values = botInsertSchema.parse(input)

  const [bot] = await db
    .insert(bots)
    .values({ ...values, instructions: values.instructions || null, userId })
    .returning({ id: bots.id })

  revalidatePath("/")
  return bot
}
