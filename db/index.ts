import { Client } from "@botpress/client"
import { randomUUID } from "crypto"
import type { Resource, Comment } from "./schema"

const client = new Client({
  token: process.env.BOTPRESS_TOKEN,
  workspaceId: process.env.BOTPRESS_WORKSPACE_ID,
  botId: process.env.BOTPRESS_BOT_ID,
})

type BpRow = { id: number; [key: string]: any }

// Lazy-initialize tables once per server process
let initPromise: Promise<void> | null = null
function init(): Promise<void> {
  if (!initPromise) initPromise = setup()
  return initPromise
}

async function setup() {
  await Promise.all([
    client.getOrCreateTable({
      table: "resources",
      keyColumn: "uid",
      schema: {
        type: "object",
        properties: {
          uid: { type: "string" },
          authorId: { type: "string" },
          authorName: { type: "string" },
          type: { type: "string" },
          title: { type: "string" },
          url: { type: "string" },
          note: { type: "string" },
          tags: { type: "string" },
          upvotes: { type: "number" },
          createdAt: { type: "string" },
        },
      },
    }),
    client.getOrCreateTable({
      table: "comments",
      keyColumn: "uid",
      schema: {
        type: "object",
        properties: {
          uid: { type: "string" },
          resourceId: { type: "string" },
          authorId: { type: "string" },
          authorName: { type: "string" },
          body: { type: "string" },
          createdAt: { type: "string" },
        },
      },
    }),
    client.getOrCreateTable({
      table: "upvotes",
      schema: {
        type: "object",
        properties: {
          resourceId: { type: "string" },
          userId: { type: "string" },
        },
      },
    }),
  ])
}

const toResource = (row: BpRow): Resource => ({
  id: row.uid as string,
  authorId: row.authorId as string,
  authorName: row.authorName as string,
  type: row.type as "link" | "file",
  title: row.title as string,
  url: row.url as string,
  note: (row.note ?? null) as string | null,
  tags: row.tags ? (row.tags as string).split(",").filter(Boolean) : [],
  upvotes: (row.upvotes as number) ?? 0,
  createdAt: new Date(row.createdAt as string),
})

const toComment = (row: BpRow): Comment => ({
  id: row.uid as string,
  resourceId: row.resourceId as string,
  authorId: row.authorId as string,
  authorName: row.authorName as string,
  body: row.body as string,
  createdAt: new Date(row.createdAt as string),
})

export const db = {
  async getResources(): Promise<Resource[]> {
    await init()
    const { rows } = await client.findTableRows({ table: "resources" })
    return rows.map(toResource).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  },

  async getResource(id: string): Promise<Resource | undefined> {
    await init()
    const { rows } = await client.findTableRows({
      table: "resources",
      filter: { uid: { $eq: id } },
    })
    return rows[0] ? toResource(rows[0]) : undefined
  },

  async getAllComments(): Promise<Comment[]> {
    await init()
    const { rows } = await client.findTableRows({ table: "comments" })
    return rows.map(toComment)
  },

  async getComments(resourceId: string): Promise<Comment[]> {
    await init()
    const { rows } = await client.findTableRows({
      table: "comments",
      filter: { resourceId: { $eq: resourceId } },
    })
    return rows
      .map(toComment)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  },

  async getAllUpvotes(): Promise<Array<{ resourceId: string; userId: string }>> {
    await init()
    const { rows } = await client.findTableRows({ table: "upvotes" })
    return rows.map((r) => ({
      resourceId: r.resourceId as string,
      userId: r.userId as string,
    }))
  },

  async createResource(data: Omit<Resource, "id" | "upvotes" | "createdAt">): Promise<Resource> {
    await init()
    const uid = randomUUID()
    await client.createTableRows({
      table: "resources",
      rows: [{ uid, ...data, tags: data.tags.join(","), upvotes: 0, createdAt: new Date().toISOString() }],
    })
    return { ...data, id: uid, upvotes: 0, createdAt: new Date() }
  },

  async deleteResource(id: string): Promise<void> {
    await init()
    const { rows } = await client.findTableRows({
      table: "resources",
      filter: { uid: { $eq: id } },
    })
    if (rows[0]) {
      await client.deleteTableRows({ table: "resources", ids: [rows[0].id] })
    }
    await Promise.all([
      client.deleteTableRows({ table: "comments", filter: { resourceId: { $eq: id } } }),
      client.deleteTableRows({ table: "upvotes", filter: { resourceId: { $eq: id } } }),
    ])
  },

  async addComment(data: Omit<Comment, "id" | "createdAt">): Promise<Comment> {
    await init()
    const uid = randomUUID()
    await client.createTableRows({
      table: "comments",
      rows: [{ uid, ...data, createdAt: new Date().toISOString() }],
    })
    return { ...data, id: uid, createdAt: new Date() }
  },

  async deleteComment(id: string): Promise<void> {
    await init()
    const { rows } = await client.findTableRows({
      table: "comments",
      filter: { uid: { $eq: id } },
    })
    if (rows[0]) {
      await client.deleteTableRows({ table: "comments", ids: [rows[0].id] })
    }
  },

  async toggleUpvote(resourceId: string, userId: string): Promise<void> {
    await init()
    const [{ rows: upvoteRows }, { rows: resourceRows }] = await Promise.all([
      client.findTableRows({
        table: "upvotes",
        filter: { $and: [{ resourceId: { $eq: resourceId } }, { userId: { $eq: userId } }] },
      }),
      client.findTableRows({
        table: "resources",
        filter: { uid: { $eq: resourceId } },
      }),
    ])

    if (!resourceRows[0]) return
    const currentUpvotes = (resourceRows[0].upvotes as number) ?? 0

    if (upvoteRows[0]) {
      await Promise.all([
        client.deleteTableRows({ table: "upvotes", ids: [upvoteRows[0].id] }),
        client.updateTableRows({
          table: "resources",
          rows: [{ id: resourceRows[0].id, upvotes: Math.max(0, currentUpvotes - 1) }],
        }),
      ])
    } else {
      await Promise.all([
        client.createTableRows({ table: "upvotes", rows: [{ resourceId, userId }] }),
        client.updateTableRows({
          table: "resources",
          rows: [{ id: resourceRows[0].id, upvotes: currentUpvotes + 1 }],
        }),
      ])
    }
  },
}
