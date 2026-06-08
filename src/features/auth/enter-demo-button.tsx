"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { loginAction } from "@/server/actions/auth";
import { DEMO_CREDENTIALS } from "@/lib/demo";

/**
 * One-tap entry into the seeded demo account (Chidinma). Signs in with the demo
 * credentials, then lands in the app. If the demo user hasn't been seeded yet,
 * falls back to the login screen.
 */
export function EnterDemoButton(props: ButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      {...props}
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const res = await loginAction({ ...DEMO_CREDENTIALS });
        if (res.ok) {
          router.push("/app");
          router.refresh();
        } else {
          router.push("/login");
        }
      }}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Entering…
        </>
      ) : (
        <>
          Enter as demo <ArrowRight className="h-4 w-4" />
        </>
      )}
    </Button>
  );
}
