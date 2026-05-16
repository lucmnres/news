export type Resource = {
  id: string
  authorId: string
  authorName: string
  type: "link" | "file"
  title: string
  url: string
  note: string | null
  tags: string[]
  upvotes: number
  createdAt: Date
}

export type Comment = {
  id: string
  resourceId: string
  authorId: string
  authorName: string
  body: string
  createdAt: Date
}
