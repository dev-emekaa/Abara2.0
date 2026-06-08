"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Phase 1: clears local UI state and returns to the landing page.
 * Phase 3 will also clear the httpOnly session cookie via a server action.
 */
export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="outline"
      onClick={async () => {
        setLoading(true);
        try {
          localStorage.removeItem("abara-streak");
          localStorage.removeItem("abara-nudges");
        } catch {
          /* ignore storage errors */
        }
        await new Promise((r) => setTimeout(r, 400));
        router.push("/");
      }}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      Log out
    </Button>
  );
}
