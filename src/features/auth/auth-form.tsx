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
import { DEMO_CREDENTIALS } from "@/lib/demo";
import { loginAction, signupAction } from "@/server/actions/auth";
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

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-danger/30 bg-danger/8 px-3 py-2 text-sm text-danger">
      <AlertCircle className="h-4 w-4 shrink-0" /> {message}
    </div>
  );
}

export function AuthForm({ mode }: { mode: Mode }) {
  return mode === "signup" ? <SignupForm /> : <LoginForm />;
}

function LoginForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function submit(data: LoginInput) {
    setSubmitting(true);
    setFormError(null);
    const res = await loginAction(data);
    if (!res.ok) {
      setFormError(res.error);
      setSubmitting(false);
      return;
    }
    router.push("/app");
    router.refresh();
  }

  function enterAsDemo() {
    setValue("email", DEMO_CREDENTIALS.email);
    setValue("password", DEMO_CREDENTIALS.password);
    void submit({ ...DEMO_CREDENTIALS });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
      <FormError message={formError} />
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

      <div className="flex items-center gap-3 text-xs text-ink-faint">
        <span className="h-px flex-1 bg-border" />
        or have a look around first
        <span className="h-px flex-1 bg-border" />
      </div>

      <DemoButton onClick={enterAsDemo} disabled={submitting} />

      <p className="text-center text-sm text-ink-soft">
        New to Abara?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Create your account
        </Link>
      </p>
    </form>
  );
}

function SignupForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", location: "", password: "" },
  });

  async function submit(data: SignupInput) {
    setSubmitting(true);
    setFormError(null);
    const res = await signupAction(data);
    if (!res.ok) {
      setFormError(res.error);
      setSubmitting(false);
      return;
    }
    router.push("/app");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
      <FormError message={formError} />
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
