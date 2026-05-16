# Botpress Knowledge Portal — Spec

## Core concept
One resource type. You post either a **link** or a **file**. That's it.
Optional note on why you found it interesting. Anyone can comment.

---

## Data model

```ts
Resource {
  id: uuid
  author_id: string        // Botpress SSO user ID
  type: "link" | "file"
  title: string            // required
  url: string              // required for link; Vercel Blob URL for file
  note: string?            // optional "why I found this interesting"
  tags: string[]
  upvotes: int
  created_at: timestamp
}

Comment {
  id: uuid
  resource_id: uuid
  author_id: string
  body: string             // plain text, max 1000 chars
  created_at: timestamp
}

Upvote {
  resource_id: uuid
  user_id: string
  // composite PK — one vote per user per resource
}
```

---

## Pages

| Route | Description |
|---|---|
| `/` | Feed — cards sorted by date or upvotes, filterable by tag |
| `/submit` | Single form: pick link or file → fill title + optional note + tags |
| `/r/:id` | Resource detail — full note, comments, upvote |
| `/auth/callback` | Botpress SSO OIDC callback |

---

## UI

See `DESIGN.md` for the full design system (Monad theme, tokens, shadcn mapping).

**Card layout:**
- Icon indicating type (link ↗ or file 📄), title, upvote count
- Author, tags, relative timestamp, comment count
- Note truncated to 2 lines

**Submit form layout:**
- Toggle: Link / File
- URL input or file picker
- Title (required)
- Note — "Why is this interesting?" (optional)
- Tags input with autocomplete
- Publish button

**Detail page layout:** full note, flat comment thread, upvote button.

---

## Auth & permissions

- Botpress SSO (OIDC) — no access without auth
- Everyone can submit, upvote, comment
- Authors can delete their own posts
- Admins can delete anything

---

## Stack (Vercel-native)

| Layer | Choice |
|---|---|
| Framework | Next.js 15 App Router |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui |
| Auth | `next-auth` v5 + Botpress OIDC provider |
| Database | Vercel Postgres (Neon) |
| File storage | Vercel Blob |
| ORM | Drizzle |
| Hosting | Vercel |

Zero external dependencies. One `vercel deploy` and it runs.

---

## Open questions

1. **SSO details** — Botpress OIDC issuer URL, client ID/secret, and which claims carry name/avatar?
2. **File types** — Any restrictions? (PDF, images, code files only — or anything?)
3. **File size limit** — Vercel Blob free tier is 500MB total; cap per upload at 10MB?
4. **Domain** — `knowledge.botpress.com` or internal subdomain?
5. **Notifications** — Slack DM when someone comments on your post?
