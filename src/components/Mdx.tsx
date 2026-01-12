import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default function Mdx({ source }: { source: string }) {
  return (
    <article className="prose prose-slate max-w-none prose-headings:scroll-mt-24 prose-a:text-primary">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{source}</ReactMarkdown>
    </article>
  )
}
