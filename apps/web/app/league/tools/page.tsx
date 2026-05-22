import { PageHeader } from "@/components/kickoff/page-header";
import { TeamBalancerPanel } from "@/components/league/team-balancer-panel";
import { redirect } from "next/navigation";
import { getOrgContext } from "@/lib/queries";

export default async function ToolsPage() {
  const ctx = await getOrgContext();
  if (!ctx?.season) redirect("/league/settings");

  return (
    <>
      <PageHeader
        label="Инструменты"
        title="Балансировщик команд"
        description="Честное разделение по силе — pickup / Sunday League"
      />
      <TeamBalancerPanel />
    </>
  );
}
