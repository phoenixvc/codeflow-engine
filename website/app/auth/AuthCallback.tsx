"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { completeMystiraIdentityFlow } from "./oidc";

type CallbackState = "loading" | "success" | "error";

export default function AuthCallback() {
  const [state, setState] = useState<CallbackState>("loading");
  const [message, setMessage] = useState("Completing secure sign-in...");
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) {
      return;
    }

    hasStarted.current = true;

    async function complete() {
      const params = new URLSearchParams(window.location.search);
      const error = params.get("error");
      const code = params.get("code");
      const returnedState = params.get("state");

      if (error) {
        setState("error");
        setMessage(params.get("error_description") ?? error);
        return;
      }

      if (!code || !returnedState) {
        setState("error");
        setMessage("Mystira Identity did not return an authorization code.");
        return;
      }

      try {
        await completeMystiraIdentityFlow(code, returnedState);
        window.history.replaceState({}, document.title, "/auth/callback");
        setState("success");
        setMessage("Signed in with Mystira Identity.");
      } catch (ex) {
        setState("error");
        setMessage(ex instanceof Error ? ex.message : "Unable to complete sign-in.");
      }
    }

    void complete();
  }, []);

  return (
    <div className="mx-auto max-w-xl text-center">
      <h1 className="mb-4 text-4xl font-bold text-slate-900 dark:text-slate-50">
        {state === "success" ? "You're signed in" : state === "error" ? "Sign-in needs attention" : "Signing you in"}
      </h1>
      <p className="mb-8 text-lg text-slate-600 dark:text-slate-400">{message}</p>
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        {state === "success" ? (
          <Link
            href="/integration"
            className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-lg font-semibold text-white transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-lg"
          >
            Continue to CodeFlow
          </Link>
        ) : null}
        <Link
          href="/"
          className="rounded-lg border-2 border-slate-300 bg-white/50 px-8 py-3 text-lg font-semibold text-slate-900 backdrop-blur-sm transition-colors hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-50 dark:hover:border-slate-500"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
