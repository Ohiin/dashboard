import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: ButtonProps) {
  const base =
    "font-medium rounded-full transition-all duration-150 ease-in-out active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
  };
  const variants = {
    primary: "bg-cta hover:bg-cta-hover text-white shadow-soft",
    ghost: "bg-transparent hover:bg-white/5 text-accent border border-border",
    danger: "bg-transparent hover:bg-red-500/10 text-red-400 border border-red-400/30",
  };

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
