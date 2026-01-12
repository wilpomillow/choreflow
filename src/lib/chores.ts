import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"

export type ChoreMeta = {
  slug: string
  title: string
  shortDescription: string
  frequency: string
  repeatHours: number
  estimateMinutes: number
  difficulty: "Easy" | "Medium" | "Hard"
  tags: string[]
  automation: string[]
  supplies: string[]
}

const CHORES_DIR = path.join(process.cwd(), "content", "chores")

function toSlug(fileName: string) {
  return fileName.replace(/\.mdx$/, "")
}

export function getAllChores(): ChoreMeta[] {
  const files = fs.readdirSync(CHORES_DIR).filter((f) => f.endsWith(".mdx"))
  const chores = files.map((file) => {
    const raw = fs.readFileSync(path.join(CHORES_DIR, file), "utf-8")
    const { data } = matter(raw)

    return {
      slug: toSlug(file),
      title: String(data.title ?? ""),
      shortDescription: String(data.shortDescription ?? ""),
      frequency: String(data.frequency ?? ""),
      repeatHours: Number(data.repeatHours ?? 168),
      estimateMinutes: Number(data.estimateMinutes ?? 10),
      difficulty: String(data.difficulty ?? "Easy") as any,
      tags: (data.tags ?? []) as string[],
      automation: (data.automation ?? []) as string[],
      supplies: (data.supplies ?? []) as string[],
    } satisfies ChoreMeta
  })

  chores.sort((a, b) => a.estimateMinutes - b.estimateMinutes)
  return chores
}

export function getChoreBySlug(slug: string): { meta: ChoreMeta; content: string } {
  const filePath = path.join(CHORES_DIR, `${slug}.mdx`)
  const raw = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(raw)

  const meta: ChoreMeta = {
    slug,
    title: String(data.title ?? ""),
    shortDescription: String(data.shortDescription ?? ""),
    frequency: String(data.frequency ?? ""),
    repeatHours: Number(data.repeatHours ?? 168),
    estimateMinutes: Number(data.estimateMinutes ?? 10),
    difficulty: String(data.difficulty ?? "Easy") as any,
    tags: (data.tags ?? []) as string[],
    automation: (data.automation ?? []) as string[],
    supplies: (data.supplies ?? []) as string[],
  }

  return { meta, content }
}
