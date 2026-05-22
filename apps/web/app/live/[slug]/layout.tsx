import { QueryProvider } from "@/components/kickoff/query-provider";

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
