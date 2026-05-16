"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { put } from "@vercel/blob"
import { db } from "@/db"
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

  await db.createResource({
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
  const resource = await db.getResource(id)

  if (!resource) throw new Error("Not found")
  if (resource.authorId !== user.id) throw new Error("Forbidden")

  await db.deleteResource(id)
  revalidatePath("/")
  redirect("/")
}

export async function addComment(resourceId: string, body: string) {
  const user = await requireAuth()

  if (!body.trim() || body.length > 1000) throw new Error("Invalid comment")

  await db.addComment({
    resourceId,
    authorId: user.id!,
    authorName: user.name ?? user.email ?? "Unknown",
    body: body.trim(),
  })

  revalidatePath(`/r/${resourceId}`)
}

export async function deleteComment(commentId: string, resourceId: string) {
  const user = await requireAuth()
  const comments = await db.getComments(resourceId)
  const comment = comments.find((c) => c.id === commentId)

  if (!comment) throw new Error("Not found")
  if (comment.authorId !== user.id) throw new Error("Forbidden")

  await db.deleteComment(commentId)
  revalidatePath(`/r/${resourceId}`)
}

export async function toggleUpvote(resourceId: string) {
  const user = await requireAuth()
  await db.toggleUpvote(resourceId, user.id!)
  revalidatePath(`/r/${resourceId}`)
  revalidatePath("/")
}
