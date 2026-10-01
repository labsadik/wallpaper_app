import type {ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes} from "react";

const buttonStyles = {
  default:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[var(--line-strong)] bg-[var(--panel)] px-3.5 py-2 text-sm font-extrabold text-[var(--text)] shadow-sm transition duration-200 hover:-translate-y-px hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
  primary:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-3.5 py-2 text-sm font-extrabold text-white shadow-sm transition duration-200 hover:-translate-y-px hover:bg-slate-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
  ghost:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-transparent bg-transparent px-3.5 py-2 text-sm font-bold text-slate-600 transition duration-200 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
} as const;

export function Button({
  children,
  className = "",
  variant = "default",
  ...props
}: {
  children: ReactNode;
  className?: string;
  variant?: keyof typeof buttonStyles;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonStyles[variant] + " " + className} {...props}>
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
  help,
}: {
  label: string;
  children: ReactNode;
  help?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[13px] font-extrabold text-slate-700">{label}</span>
      {children}
      {help ? <span className="text-xs leading-5 text-slate-500">{help}</span> : null}
    </label>
  );
}

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "min-h-11 w-full rounded-xl border border-[var(--line-strong)] bg-[var(--input)] px-3.5 py-2.5 text-sm text-[var(--text)] shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70 disabled:cursor-not-allowed disabled:bg-slate-50 " +
        className
      }
    />
  );
}

export function Select({
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={
        "min-h-11 w-full rounded-xl border border-[var(--line-strong)] bg-[var(--input)] px-3.5 py-2.5 text-sm font-semibold text-[var(--text)] shadow-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70 disabled:cursor-not-allowed disabled:bg-slate-50 " +
        className
      }
    />
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={
        "rounded-2xl border border-[var(--line)] bg-[var(--panel)] text-[var(--text)] shadow-[0_12px_35px_rgba(15,23,42,0.055)] " +
        className
      }
    >
      {children}
    </section>
  );
}

export function Badge({
  children,
  tone = "default",
  className = "",
}: {
  children: ReactNode;
  tone?: "default" | "dark" | "success" | "info" | "danger";
  className?: string;
}) {
  const tones = {
    default: "border-slate-200 bg-slate-50 text-slate-600",
    dark: "border-slate-900 bg-slate-900 text-white",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
    danger: "border-rose-200 bg-rose-50 text-rose-700",
  } as const;
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-extrabold tracking-[0.01em] " +
        tones[tone] +
        " " +
        className
      }
    >
      {children}
    </span>
  );
}
