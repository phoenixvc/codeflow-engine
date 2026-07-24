"use client";

import { useState } from "react";
import Button from "../components/Button";
import { startMystiraIdentityFlow, type CodeflowAuthIntent } from "./oidc";

interface AuthStartProps {
  intent: CodeflowAuthIntent;
}

export default function AuthStart({ intent }: AuthStartProps) {
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    setIsStarting(true);
    setError(null);

    try {
      await startMystiraIdentityFlow(intent);
    } catch (ex) {
      setIsStarting(false);
      setError(ex instanceof Error ? ex.message : "Unable to start Mystira Identity.");
    }
  }

  const label = intent === "signup" ? "Create account" : "Sign in";

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center text-center">
      <Button as="button" size="lg" onClick={handleStart} disabled={isStarting}>
        {isStarting ? "Opening Mystira Identity..." : `${label} with Mystira Identity`}
      </Button>
      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
