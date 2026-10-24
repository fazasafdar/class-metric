import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";

const styles: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark border border-brand",
  secondary: "bg-white text-brand border border-brand hover:bg-tint",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = "primary",
  type = "button",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`min-h-12 rounded-md px-5 py-3 text-base font-semibold transition-colors ${styles[variant]} ${className}`}
      {...props}
    />
  );
}