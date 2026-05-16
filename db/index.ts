import { readFileSync, writeFileSync, existsSync } from "fs"
import { join } from "path"
import { randomUUID } from "crypto"
import type { Resource, Comment } from "./schema"

const DATA_FILE = join(process.cwd(), "db", "data.json")

type Upvote = { resourceId: string; userId: string }

type StoredResource = Omit<Resource, "createdAt"> & { createdAt: string }
type StoredComment = Omit<Comment, "createdAt"> & { createdAt: string }

type Store = {
  resources: StoredResource[]
  comments: StoredComment[]
  upvotes: Upvote[]
}

function read(): Store {
  if (!existsSync(DATA_FILE)) return { resources: [], comments: [], upvotes: [] }
  return JSON.parse(readFileSync(DATA_FILE, "utf-8"))
}

function write(store: Store): void {
  writeFileSync(DATA_FILE, JSON.stringify(store, null, 2))
}

const toResource = (r: StoredResource): Resource => ({ ...r, createdAt: new Date(r.createdAt) })
const toComment = (c: StoredComment): Comment => ({ ...c, createdAt: new Date(c.createdAt) })

export const db = {
  getResources(): Resource[] {
    return read().resources.map(toResource)
  },

  getResource(id: string): Resource | undefined {
    const r = read().resources.find((r) => r.id === id)
    return r ? toResource(r) : undefined
  },

  getAllComments(): Comment[] {
    return read().comments.map(toComment)
  },

  getComments(resourceId: string): Comment[] {
    return read()
      .comments.filter((c) => c.resourceId === resourceId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map(toComment)
  },

  getAllUpvotes(): Upvote[] {
    return read().upvotes
  },

  createResource(data: Omit<Resource, "id" | "upvotes" | "createdAt">): Resource {
    const store = read()
    const resource: StoredResource = { ...data, id: randomUUID(), upvotes: 0, createdAt: new Date().toISOString() }
    store.resources.push(resource)
    write(store)
    return toResource(resource)
  },

  deleteResource(id: string): void {
    const store = read()
    store.resources = store.resources.filter((r) => r.id !== id)
    store.comments = store.comments.filter((c) => c.resourceId !== id)
    store.upvotes = store.upvotes.filter((u) => u.resourceId !== id)
    write(store)
  },

  addComment(data: Omit<Comment, "id" | "createdAt">): Comment {
    const store = read()
    const comment: StoredComment = { ...data, id: randomUUID(), createdAt: new Date().toISOString() }
    store.comments.push(comment)
    write(store)
    return toComment(comment)
  },

  deleteComment(id: string): void {
    const store = read()
    store.comments = store.comments.filter((c) => c.id !== id)
    write(store)
  },

  toggleUpvote(resourceId: string, userId: string): void {
    const store = read()
    const idx = store.upvotes.findIndex((u) => u.resourceId === resourceId && u.userId === userId)
    const resource = store.resources.find((r) => r.id === resourceId)
    if (!resource) return

    if (idx >= 0) {
      store.upvotes.splice(idx, 1)
      resource.upvotes = Math.max(0, resource.upvotes - 1)
    } else {
      store.upvotes.push({ resourceId, userId })
      resource.upvotes++
    }
    write(store)
  },
}
