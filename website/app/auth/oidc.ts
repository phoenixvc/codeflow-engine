export const MYSTIRA_IDENTITY_BASE_URL = "https://identity.mystira.app";
export const CODEFLOW_WEBSITE_CLIENT_ID = "phoenixvc-codeflow-website";
export const CODEFLOW_AUTH_STATE_KEY = "codeflow.mystira.auth";
export const CODEFLOW_SESSION_KEY = "codeflow.mystira.session";

export type CodeflowAuthIntent = "login" | "signup";

interface StoredAuthRequest {
  intent: CodeflowAuthIntent;
  state: string;
  nonce: string;
  codeVerifier: string;
  redirectUri: string;
  createdAt: number;
}

export interface TokenResponse {
  access_token?: string;
  expires_in?: number;
  id_token?: string;
  scope?: string;
  token_type?: string;
}

interface JwtHeader {
  alg?: string;
  kid?: string;
}

interface IdTokenClaims {
  aud?: string | string[];
  exp?: number;
  iss?: string;
  nonce?: string;
}

interface MystiraJsonWebKey extends JsonWebKey {
  kid?: string;
}

interface JsonWebKeySet {
  keys?: MystiraJsonWebKey[];
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function sha256Base64Url(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return base64UrlEncode(new Uint8Array(digest));
}

function randomBase64Url(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

function decodeBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function decodeJwtPart<T>(value: string): T {
  const json = new TextDecoder().decode(decodeBase64Url(value));
  return JSON.parse(json) as T;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

export function getRedirectUri(): string {
  return `${window.location.origin}/auth/callback`;
}

export async function startMystiraIdentityFlow(intent: CodeflowAuthIntent): Promise<void> {
  const redirectUri = getRedirectUri();
  const state = randomBase64Url(32);
  const nonce = randomBase64Url(32);
  const codeVerifier = randomBase64Url(64);
  const codeChallenge = await sha256Base64Url(codeVerifier);

  const storedRequest: StoredAuthRequest = {
    intent,
    state,
    nonce,
    codeVerifier,
    redirectUri,
    createdAt: Date.now(),
  };

  sessionStorage.setItem(CODEFLOW_AUTH_STATE_KEY, JSON.stringify(storedRequest));

  const authorizeUrl = new URL("/connect/authorize", MYSTIRA_IDENTITY_BASE_URL);
  authorizeUrl.searchParams.set("client_id", CODEFLOW_WEBSITE_CLIENT_ID);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "openid profile email");
  authorizeUrl.searchParams.set("code_challenge", codeChallenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("nonce", nonce);
  authorizeUrl.searchParams.set("prompt", "login");

  window.location.assign(authorizeUrl.toString());
}

export async function completeMystiraIdentityFlow(code: string, state: string): Promise<TokenResponse> {
  const request = getStoredAuthRequest(state);

  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("client_id", CODEFLOW_WEBSITE_CLIENT_ID);
  body.set("redirect_uri", request.redirectUri);
  body.set("code", code);
  body.set("code_verifier", request.codeVerifier);

  const response = await fetch(`${MYSTIRA_IDENTITY_BASE_URL}/connect/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Mystira Identity token exchange failed (${response.status}).`);
  }

  const tokenResponse = (await response.json()) as TokenResponse;
  await validateIdToken(tokenResponse.id_token, request);
  sessionStorage.setItem(CODEFLOW_SESSION_KEY, JSON.stringify(tokenResponse));
  sessionStorage.removeItem(CODEFLOW_AUTH_STATE_KEY);
  return tokenResponse;
}

export function consumeMystiraIdentityRequest(state: string | null): void {
  getStoredAuthRequest(state);
  sessionStorage.removeItem(CODEFLOW_AUTH_STATE_KEY);
}

function getStoredAuthRequest(state: string | null): StoredAuthRequest {
  const rawRequest = sessionStorage.getItem(CODEFLOW_AUTH_STATE_KEY);
  if (!rawRequest) {
    throw new Error("Missing saved sign-in request. Start login again.");
  }

  const request = JSON.parse(rawRequest) as StoredAuthRequest;
  if (request.state !== state) {
    throw new Error("Sign-in state did not match. Start login again.");
  }

  return request;
}

async function validateIdToken(idToken: string | undefined, request: StoredAuthRequest): Promise<void> {
  if (!idToken) {
    throw new Error("Mystira Identity did not return an ID token.");
  }

  const parts = idToken.split(".");
  if (parts.length !== 3) {
    throw new Error("Mystira Identity returned an invalid ID token.");
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodeJwtPart<JwtHeader>(encodedHeader);
  const claims = decodeJwtPart<IdTokenClaims>(encodedPayload);

  if (header.alg !== "RS256" || !header.kid) {
    throw new Error("Mystira Identity returned an unsupported ID token.");
  }

  const now = Math.floor(Date.now() / 1000);
  const audiences = Array.isArray(claims.aud) ? claims.aud : claims.aud ? [claims.aud] : [];
  if (claims.iss !== `${MYSTIRA_IDENTITY_BASE_URL}/`
    || !audiences.includes(CODEFLOW_WEBSITE_CLIENT_ID)
    || !claims.exp
    || claims.exp <= now
    || claims.nonce !== request.nonce) {
    throw new Error("Mystira Identity returned an ID token with invalid claims.");
  }

  const jwksResponse = await fetch(`${MYSTIRA_IDENTITY_BASE_URL}/.well-known/jwks`, {
    cache: "no-store",
  });
  if (!jwksResponse.ok) {
    throw new Error("Unable to load Mystira Identity signing keys.");
  }

  const jwks = (await jwksResponse.json()) as JsonWebKeySet;
  const jwk = jwks.keys?.find((key) => key.kid === header.kid && key.kty === "RSA");
  if (!jwk) {
    throw new Error("Mystira Identity signing key was not found.");
  }

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["verify"],
  );

  const data = toArrayBuffer(new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`));
  const signature = toArrayBuffer(decodeBase64Url(encodedSignature));
  const isValid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, data);
  if (!isValid) {
    throw new Error("Mystira Identity ID token signature was invalid.");
  }
}
