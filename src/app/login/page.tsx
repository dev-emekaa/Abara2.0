import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Card, CardContent } from "@/components/ui/card";
import { FadeUp } from "@/components/motion/reveal";
import { AuthForm } from "@/features/auth/auth-form";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <FadeUp>
        <div className="mb-8 text-center">
          <Link href="/" aria-label="Abara home" className="inline-block">
            <Logo />
          </Link>
          <h1 className="mt-6 font-display text-3xl text-ink">Welcome back</h1>
          <p className="mt-2 text-ink-soft">
            Let&apos;s pick up where your health left off.
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <AuthForm mode="login" />
          </CardContent>
        </Card>
      </FadeUp>
    </div>
  );
}
