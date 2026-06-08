"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/logo";
import { NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string): boolean {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop: a calm vertical rail. Hidden on mobile. */
export function SideNav() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:gap-2 md:border-r md:border-border md:bg-paper/60 md:px-4 md:py-7">
      <div className="px-2 pb-6">
        <Link href="/app" aria-label="Abara home">
          <Logo />
        </Link>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-[0.95rem] transition-colors",
                active
                  ? "text-primary-foreground"
                  : "text-ink-soft hover:bg-teal-100/60 hover:text-ink",
              )}
            >
              {active && (
                <motion.span
                  layoutId="side-active"
                  className="absolute inset-0 -z-10 rounded-[var(--radius-sm)] bg-primary shadow-soft"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon className="h-5 w-5 shrink-0" strokeWidth={1.9} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-3 pt-6 text-xs leading-relaxed text-ink-faint">
        Abara never replaces a doctor. In an emergency, seek care immediately.
      </div>
    </aside>
  );
}

/** Mobile: a floating bottom bar with the primary destinations. */
export function BottomNav() {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((i) => i.primary);
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      <div className="mx-auto mb-3 flex max-w-md items-center justify-around rounded-full border border-border bg-paper/90 px-2 py-1.5 shadow-lift backdrop-blur">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-1.5"
              aria-current={active ? "page" : undefined}
            >
              {active && (
                <motion.span
                  layoutId="bottom-active"
                  className="absolute inset-0 -z-10 rounded-full bg-teal-100"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  active ? "text-primary" : "text-ink-faint",
                )}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span
                className={cn(
                  "text-[0.62rem] font-medium transition-colors",
                  active ? "text-primary" : "text-ink-faint",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
