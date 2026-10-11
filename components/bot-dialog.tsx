"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ShuffleIcon } from "lucide-react"
import { nanoid } from "nanoid"
import { Controller, useForm } from "react-hook-form"

import { createBot } from "@/action/bot"
import { ChatAvatar } from "@/components/chat-avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { botInsertSchema } from "@/db/schema"

const presets = [
  {
    name: "Ada",
    job: "Research assistant",
    instructions:
      "Answer briefly, cite sources, and ask before running anything destructive.",
  },
  {
    name: "Linus",
    job: "Code reviewer",
    instructions:
      "Look for bugs before style, and suggest concrete fixes with code.",
  },
  {
    name: "Ernest",
    job: "Writing editor",
    instructions:
      "Tighten the prose, keep the author's voice, and explain larger changes.",
  },
  {
    name: "Socrates",
    job: "Tutor",
    instructions:
      "Teach with questions, check understanding, and never just hand over the answer.",
  },
]

export function BotDialog({ children }: { children: React.ReactElement }) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New bot</DialogTitle>
          <DialogDescription>
            Give it a face, a name, and a job to do.
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so every open starts with a fresh form. */}
        <BotForm onCreated={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function BotForm({ onCreated }: { onCreated: () => void }) {
  const id = React.useId()
  const form = useForm({
    resolver: zodResolver(botInsertSchema),
    defaultValues: { name: "", avatar: nanoid(), job: "", instructions: "" },
  })

  return (
    <>
      <form
        id={id}
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await createBot(values)
            toast.add({ title: `${values.name} is ready`, type: "success" })
            onCreated()
          } catch {
            toast.add({ title: "Couldn't create the bot", type: "error" })
          }
        })}
      >
        <FieldGroup>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.job}
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => {
                  form.setValue("name", preset.name, { shouldValidate: true })
                  form.setValue("job", preset.job, { shouldValidate: true })
                  form.setValue("instructions", preset.instructions)
                }}
              >
                {preset.job}
              </Button>
            ))}
          </div>
          <Controller
            name="avatar"
            control={form.control}
            render={({ field }) => (
              <Item className="p-0">
                <ItemMedia>
                  <ChatAvatar
                    seed={field.value ?? ""}
                    animated
                    className="size-10"
                  />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Face</ItemTitle>
                  <ItemDescription>
                    Shuffle until you find one you like.
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => field.onChange(nanoid())}
                  >
                    <ShuffleIcon data-icon="inline-start" />
                    Shuffle
                  </Button>
                </ItemActions>
              </Item>
            )}
          />
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${id}-name`}>Name</FieldLabel>
                <Input
                  {...field}
                  id={`${id}-name`}
                  aria-invalid={fieldState.invalid}
                  placeholder="Ada"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="job"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${id}-job`}>Job</FieldLabel>
                <Input
                  {...field}
                  id={`${id}-job`}
                  aria-invalid={fieldState.invalid}
                  placeholder="Research assistant"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="instructions"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${id}-instructions`}>
                  How it should work
                </FieldLabel>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  id={`${id}-instructions`}
                  aria-invalid={fieldState.invalid}
                  placeholder="Answer briefly, cite sources, and ask before running anything destructive."
                  rows={4}
                  className="min-h-24 resize-none"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </form>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <Button type="submit" form={id} disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Spinner data-icon="inline-start" />}
          Create bot
        </Button>
      </DialogFooter>
    </>
  )
}
