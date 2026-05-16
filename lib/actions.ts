"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { put } from "@vercel/blob"
import { eq, and, sql } from "drizzle-orm"
import { db } from "@/db"
import { resources, comments, upvotes } from "@/db/schema"
import { auth } from "@/lib/auth"
import { z } from "zod"

async function requireAuth() {
  const session = await auth()
  if (!session?.user) redirect("/sign-in")
  return session.user
}

const resourceSchema = z.object({
  type: z.enum(["link", "file"]),
  title: z.string().min(1).max(200),
  url: z.string().url(),
  note: z.string().max(2000).optional(),
  tags: z.string(),
})

export async function createResource(formData: FormData) {
  const user = await requireAuth()

  let url = formData.get("url") as string
  const type = formData.get("type") as "link" | "file"

  if (type === "file") {
    const file = formData.get("file") as File
    if (!file || file.size === 0) throw new Error("No file provided")
    if (file.size > 10 * 1024 * 1024) throw new Error("File exceeds 10 MB limit")
    const blob = await put(file.name, file, { access: "public" })
    url = blob.url
  }

  const parsed = resourceSchema.parse({
    type,
    title: formData.get("title"),
    url,
    note: formData.get("note") || undefined,
    tags: formData.get("tags") || "",
  })

  const tags = parsed.tags
    ? parsed.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : []

  await db.insert(resources).values({
    authorId: user.id!,
    authorName: user.name ?? user.email ?? "Unknown",
    type: parsed.type,
    title: parsed.title,
    url: parsed.url,
    note: parsed.note ?? null,
    tags,
  })

  revalidatePath("/")
  redirect("/")
}

export async function deleteResource(id: string) {
  const user = await requireAuth()
  const [resource] = await db
    .select({ authorId: resources.authorId })
    .from(resources)
    .where(eq(resources.id, id))

  if (!resource) throw new Error("Not found")
  if (resource.authorId !== user.id) throw new Error("Forbidden")

  await db.delete(resources).where(eq(resources.id, id))
  revalidatePath("/")
  redirect("/")
}

export async function addComment(resourceId: string, body: string) {
  const user = await requireAuth()

  if (!body.trim() || body.length > 1000) throw new Error("Invalid comment")

  await db.insert(comments).values({
    resourceId,
    authorId: user.id!,
    authorName: user.name ?? user.email ?? "Unknown",
    body: body.trim(),
  })

  revalidatePath(`/r/${resourceId}`)
}

export async function deleteComment(commentId: string, resourceId: string) {
  const user = await requireAuth()
  const [comment] = await db
    .select({ authorId: comments.authorId })
    .from(comments)
    .where(eq(comments.id, commentId))

  if (!comment) throw new Error("Not found")
  if (comment.authorId !== user.id) throw new Error("Forbidden")

  await db.delete(comments).where(eq(comments.id, commentId))
  revalidatePath(`/r/${resourceId}`)
}

export async function toggleUpvote(resourceId: string) {
  const user = await requireAuth()

  const [existing] = await db
    .select()
    .from(upvotes)
    .where(
      and(eq(upvotes.resourceId, resourceId), eq(upvotes.userId, user.id!))
    )

  if (existing) {
    await db
      .delete(upvotes)
      .where(
        and(eq(upvotes.resourceId, resourceId), eq(upvotes.userId, user.id!))
      )
    await db
      .update(resources)
      .set({ upvotes: sql`${resources.upvotes} - 1` })
      .where(eq(resources.id, resourceId))
  } else {
    await db.insert(upvotes).values({ resourceId, userId: user.id! })
    await db
      .update(resources)
      .set({ upvotes: sql`${resources.upvotes} + 1` })
      .where(eq(resources.id, resourceId))
  }

  revalidatePath(`/r/${resourceId}`)
  revalidatePath("/")
}
