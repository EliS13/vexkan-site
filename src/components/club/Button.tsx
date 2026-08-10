import Link from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "md" | "lg";
  external?: boolean;
};

const SIZES = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
} as const;

export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  external = false,
}: Props) {
  const base = `inline-flex items-center justify-center rounded-xl font-semibold transition-opacity hover:opacity-90 ${SIZES[size]}`;

  const style =
    variant === "primary"
      ? { background: "var(--purple)", color: "#fff" }
      : { background: "var(--surface)", color: "var(--foreground)", border: "1px solid var(--line)" };

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={base} style={style}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={base} style={style}>
      {children}
    </Link>
  );
}
