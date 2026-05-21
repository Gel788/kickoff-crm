import { PortalHeader } from "@/components/kickoff/portal-header";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RefereeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="relative min-h-screen bg-base">
      <div className="pointer-events-none fixed inset-0 grid-pitch opacity-[0.2]" />
      <PortalHeader
        subtitle="Судейская служба"
        nav={[{ href: "/referee", label: "Назначения" }]}
      />
      <div className="relative animate-fade-in">{children}</div>
    </div>
  );
}
