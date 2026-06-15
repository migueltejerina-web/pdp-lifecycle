export function resolveSigningExpiresAt(
  arrasContractSigningExpiresAt?: string | null,
  blockExpiresAt?: string | null
): string | null {
  return arrasContractSigningExpiresAt ?? blockExpiresAt ?? null;
}

export function isSigningDeadlineExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() <= Date.now();
}
