import { notFound } from "next/navigation"
import { getAllChores, getChoreBySlug } from "@/lib/chores"
import Mdx from "@/components/Mdx"

// ✅ Next 15: use a literal number, not an expression
export const revalidate = 86400 // 24 hours

// If you have this anywhere, REMOVE it (Next 15 complains about config objects):
// export const config = { revalidate: 60 * 60 * 24 }

export async function generateStaticParams() {
  const chores = getAllChores()
  return chores.map((c) => ({ slug: c.slug }))
}

// ✅ Next 15: params is a Promise in PageProps typing
export default async function ChorePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const data = getChoreBySlug(slug)
  if (!data) return notFound()

  const { meta, content } = data

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            {meta.frequency}
          </span>
          <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            {meta.estimateMinutes}m
          </span>
          <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            repeats every {meta.repeatHours}h
          </span>
        </div>

        <h1 className="mt-3 text-xl font-semibold text-foreground">{meta.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{meta.shortDescription}</p>

        <div className="mt-4">
          <Mdx source={content} />
        </div>
      </div>
    </main>
  )
}
