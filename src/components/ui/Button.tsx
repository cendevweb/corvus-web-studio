import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

type Variant = "main" | "ghost";
type Size = "md" | "sm";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

const classes = (variant: Variant, size: Size, className?: string) =>
  cn("btn", variant === "main" ? "btn-main" : "btn-ghost", size === "sm" && "btn-sm", className);

/** <button> with the studio look. For arrows that slide on hover, give the icon `className="arr"`. */
export function Button({
  variant = "main",
  size = "md",
  className,
  children,
  ...props
}: BaseProps & Omit<ComponentProps<"button">, keyof BaseProps>) {
  return (
    <button type="button" className={classes(variant, size, className)} {...props}>
      {children}
    </button>
  );
}

/** Internal, locale-aware link styled as a button. */
export function ButtonLink({
  variant = "main",
  size = "md",
  className,
  children,
  ...props
}: BaseProps & Omit<ComponentProps<typeof Link>, keyof BaseProps>) {
  return (
    <Link className={classes(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}

/** Plain anchor styled as a button (external URLs, files, in-page anchors). */
export function ButtonAnchor({
  variant = "main",
  size = "md",
  className,
  children,
  external,
  ...props
}: BaseProps & { external?: boolean } & Omit<ComponentProps<"a">, keyof BaseProps>) {
  return (
    <a
      className={classes(variant, size, className)}
      {...(external ? { target: "_blank", rel: "noopener" } : {})}
      {...props}
    >
      {children}
    </a>
  );
}
