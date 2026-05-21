"use client";

import { Button } from "@/components/kickoff/button";
import { cn } from "@/lib/utils";

export function ConfirmForm({
  action,
  confirmMessage,
  children,
  className,
  hidden,
}: {
  action: (formData: FormData) => void | Promise<void>;
  confirmMessage: string;
  children: React.ReactNode;
  className?: string;
  hidden?: Record<string, string>;
}) {
  return (
    <form
      action={action}
      className={cn("inline-flex", className)}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {hidden &&
        Object.entries(hidden).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
      {children}
    </form>
  );
}

export function DeleteButton({
  action,
  confirmMessage,
  hidden,
  label = "Удалить",
}: {
  action: (formData: FormData) => void | Promise<void>;
  confirmMessage: string;
  hidden: Record<string, string>;
  label?: string;
}) {
  return (
    <ConfirmForm action={action} confirmMessage={confirmMessage} hidden={hidden}>
      <Button type="submit" size="sm" variant="danger">
        {label}
      </Button>
    </ConfirmForm>
  );
}
