import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Zap } from "lucide-react"
import { getAllChores, getChoreBySlug } from "@/lib/chores"
import Mdx from "@/components/Mdx"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-static"
export const revalidate = 60 * 60 * 24 // daily

export async function generateStaticParams() {
  const chores = getAllChores()
  return chores.map((c) => ({ slug: c.slug }))
}

export default function ChorePage({ params }: { params: { slug: string } }) {
  const chores = getAllChores()
  const exists = chores.some((c) => c.slug === params.slug)
  if (!exists) return notFound()

  const { meta, content } = getChoreBySlug(params.slug)

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} />
          Back to checklist
        </Link>

        <Card className="mt-4 bg-white/80">
          <CardHeader>
            <CardTitle className="text-2xl">{meta.title}</CardTitle>
            <CardDescription className="text-base">
              {meta.shortDescription}
            </CardDescription>

            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>{meta.frequency}</Badge>
              <Badge>{meta.estimateMinutes} min</Badge>
              <Badge>{meta.difficulty}</Badge>
              {meta.tags?.map((t) => (
                <Badge key={t} className="text-muted-foreground">{t}</Badge>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-6">
              <section className="rounded-2xl border border-border bg-white p-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Steps
                </div>
                <div className="mt-3">
                  <Mdx source={content} />
                </div>
              </section>

              <section className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-white p-5">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Supplies
                  </div>
                  <ul className="mt-3 list-disc pl-5 text-sm">
                    {meta.supplies?.length ? meta.supplies.map((s) => <li key={s}>{s}</li>) : <li>None</li>}
                  </ul>
                </div>

                <div className="rounded-2xl border border-border bg-white p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Zap size={14} className="text-primary" />
                    Automation ideas
                  </div>
                  <ul className="mt-3 list-disc pl-5 text-sm">
                    {meta.automation?.length ? meta.automation.map((a) => <li key={a}>{a}</li>) : <li>None yet</li>}
                  </ul>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Note: Always follow manufacturer instructions and safety guidance.
                  </p>
                </div>
              </section>

              <div className="rounded-2xl border border-border bg-white p-5 text-xs text-muted-foreground">
                Pro move: If this chore annoys you, automate the *reminder* first. Consistency beats intensity.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
