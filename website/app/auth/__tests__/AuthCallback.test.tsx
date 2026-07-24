import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import AuthCallback from "../AuthCallback";
import { CODEFLOW_AUTH_STATE_KEY } from "../oidc";

const storedRequest = {
  intent: "login",
  state: "expected-state",
  nonce: "nonce",
  codeVerifier: "verifier",
  redirectUri: "https://codeflow.phoenixvc.tech/auth/callback",
  createdAt: Date.now(),
};

describe("AuthCallback", () => {
  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem(CODEFLOW_AUTH_STATE_KEY, JSON.stringify(storedRequest));
  });

  it("consumes a matched cancellation without rendering the provider description", async () => {
    window.history.replaceState(
      {},
      "",
      "/auth/callback?error=access_denied&error_description=Attacker-controlled&state=expected-state",
    );

    render(<AuthCallback />);

    expect(await screen.findByText("Sign-in was cancelled.")).toBeInTheDocument();
    expect(screen.queryByText("Attacker-controlled")).not.toBeInTheDocument();
    expect(sessionStorage.getItem(CODEFLOW_AUTH_STATE_KEY)).toBeNull();
  });

  it("rejects a provider error when the callback state does not match", async () => {
    window.history.replaceState(
      {},
      "",
      "/auth/callback?error=access_denied&error_description=User+cancelled&state=wrong-state",
    );

    render(<AuthCallback />);

    expect(await screen.findByText("Sign-in state did not match. Start login again.")).toBeInTheDocument();
    expect(screen.queryByText("User cancelled")).not.toBeInTheDocument();
    expect(sessionStorage.getItem(CODEFLOW_AUTH_STATE_KEY)).not.toBeNull();
  });
});
