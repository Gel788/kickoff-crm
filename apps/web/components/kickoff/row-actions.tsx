import { Button } from "@/components/kickoff/button";
import { DeleteButton } from "@/components/kickoff/confirm-form";
import Link from "next/link";

export function ViewLink({ href, label = "Открыть" }: { href: string; label?: string }) {
  return (
    <Link href={href}>
      <Button type="button" size="sm" variant="outline">
        {label}
      </Button>
    </Link>
  );
}

export function RowActions({
  viewHref,
  deleteAction,
  deleteHidden,
  deleteMessage,
  deleteLabel,
}: {
  viewHref: string;
  deleteAction: (formData: FormData) => void | Promise<void>;
  deleteHidden: Record<string, string>;
  deleteMessage: string;
  deleteLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ViewLink href={viewHref} />
      <DeleteButton
        action={deleteAction}
        confirmMessage={deleteMessage}
        hidden={deleteHidden}
        label={deleteLabel}
      />
    </div>
  );
}
