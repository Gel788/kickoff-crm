import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "ghost" | "outline" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-base font-semibold text-black hover:bg-accent/90 shadow-glow",
  ghost: "text-muted hover:bg-hover hover:text-white",
  outline:
    "border border-border bg-transparent text-white hover:border-accent/50 hover:bg-accent-dim",
  danger: "bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 active:scale-[0.98]",
          variants[variant],
          size === "sm" && "px-3 py-1.5 text-sm",
          size === "md" && "px-5 py-2.5 text-sm",
          size === "lg" && "px-8 py-3.5 text-base",
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
