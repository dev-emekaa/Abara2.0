import Link from "next/link";
import { SideNav, BottomNav } from "@/components/app/app-nav";
import { Logo } from "@/components/brand/logo";

/**
 * Shell for the in-app (authenticated) experience. Route protection via
 * middleware is added in Phase 3; for now this is pure chrome around the
 * mock-data screens.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl">
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between px-5 pt-5 md:hidden">
          <Link href="/app" aria-label="Abara home">
            <Logo />
          </Link>
        </header>
        <main className="flex-1 px-5 pb-28 pt-4 md:px-10 md:py-10">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
