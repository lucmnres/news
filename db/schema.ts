import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core"

export const resources = pgTable("resources", {
  id: uuid("id").defaultRandom().primaryKey(),
  authorId: text("author_id").notNull(),
  authorName: text("author_name").notNull(),
  type: text("type", { enum: ["link", "file"] }).notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  note: text("note"),
  tags: text("tags").array().notNull().default([]),
  upvotes: integer("upvotes").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  resourceId: uuid("resource_id")
    .references(() => resources.id, { onDelete: "cascade" })
    .notNull(),
  authorId: text("author_id").notNull(),
  authorName: text("author_name").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const upvotes = pgTable(
  "upvotes",
  {
    resourceId: uuid("resource_id")
      .references(() => resources.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.resourceId, t.userId] })]
)

export type Resource = typeof resources.$inferSelect
export type Comment = typeof comments.$inferSelect
