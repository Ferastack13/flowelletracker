export function requireSignedInUserId(
  userId: string | null | undefined,
  message = "Sign in to continue.",
): { ok: true; userId: string } | { ok: false; message: string } {
  if (!userId) {
    return { ok: false, message };
  }
  return { ok: true, userId };
}

export function isSameAccount(ownerId: string, actorId: string): boolean {
  return ownerId.length > 0 && ownerId === actorId;
}
