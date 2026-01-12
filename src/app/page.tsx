import { getAllChores } from "@/lib/chores"
import AppShell from "@/components/AppShell"

export default function HomePage() {
  const chores = getAllChores()
  return <AppShell chores={chores} />
}
