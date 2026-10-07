const SESSION_TOKEN_BYTES = 32;

export function generateSessionToken(): string {
  const bytes = crypto.getRandomValues(
    new Uint8Array(SESSION_TOKEN_BYTES),
  );

  return bytes.toBase64({
    alphabet: "base64url",
    omitPadding: true,
  });
}

export function hashSessionToken(
  token: string,
): string {
  return new Bun.CryptoHasher("sha256")
    .update(token)
    .digest("hex");
}