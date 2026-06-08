"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle } from "lucide-react";
import {
  loginSchema,
  signupSchema,
  type LoginInput,
  type SignupInput,
} from "@/lib/schemas";
import { DEMO_CREDENTIALS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span className="mt-1 flex items-center gap-1 text-xs text-danger">
      <AlertCircle className="h-3.5 w-3.5" /> {message}
    </span>
  );
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  if (mode === "signup") {
    return <SignupForm router={router} submitting={submitting} setSubmitting={setSubmitting} />;
  }
  return <LoginForm router={router} submitting={submitting} setSubmitting={setSubmitting} />;
}

interface InnerProps {
  router: ReturnType<typeof useRouter>;
  submitting: boolean;
  setSubmitting: (v: boolean) => void;
}

/** Phase 1: mock submit — simulate latency then enter the app. */
async function mockAuthDelay() {
  await new Promise((r) => setTimeout(r, 650));
}

function LoginForm({ router, submitting, setSubmitting }: InnerProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async () => {
    setSubmitting(true);
    await mockAuthDelay();
    router.push("/app");
  };

  const enterAsDemo = () => {
    setValue("email", DEMO_CREDENTIALS.email);
    setValue("password", DEMO_CREDENTIALS.password);
    void onSubmit();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          className="mt-1.5"
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={!!errors.password}
          className="mt-1.5"
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? "Signing you in…" : "Log in"}
      </Button>

      <DemoButton onClick={enterAsDemo} disabled={submitting} />

      <p className="text-center text-sm text-ink-soft">
        New to Abara?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

function SignupForm({ router, submitting, setSubmitting }: InnerProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", location: "", password: "" },
  });

  const onSubmit = async () => {
    setSubmitting(true);
    await mockAuthDelay();
    router.push("/app");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          autoComplete="name"
          placeholder="Chidinma Okafor"
          aria-invalid={!!errors.fullName}
          className="mt-1.5"
          {...register("fullName")}
        />
        <FieldError message={errors.fullName?.message} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          className="mt-1.5"
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          autoComplete="address-level2"
          placeholder="Enugu, Nigeria"
          aria-invalid={!!errors.location}
          className="mt-1.5"
          {...register("location")}
        />
        <FieldError message={errors.location?.message} />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          aria-invalid={!!errors.password}
          className="mt-1.5"
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? "Setting up your space…" : "Create my account"}
      </Button>

      <p className="text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}

export function DemoButton({
  onClick,
  disabled,
  className,
}: {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={onClick}
      disabled={disabled}
      className={cn("w-full", className)}
    >
      Enter as demo (Chidinma)
    </Button>
  );
}
