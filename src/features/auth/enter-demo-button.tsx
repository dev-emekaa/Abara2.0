"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * One-tap entry into the seeded demo account. Phase 1 just navigates into the
 * app; Phase 3 will sign in the real demo user before redirecting.
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
        await new Promise((r) => setTimeout(r, 500));
        router.push("/app");
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
