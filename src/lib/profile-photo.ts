export const PROFILE_PHOTO_BUCKET = "profile-photos";
export const PROFILE_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const PROFILE_PHOTO_SIGNED_URL_SECONDS = 60 * 60;
export const PROFILE_PHOTO_PATH_MAX = 180;

const UUID_FILE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$/i;

export const PROFILE_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type ProfilePhotoKind = "jpeg" | "png" | "webp";

const KIND_BY_MIME: Record<string, ProfilePhotoKind> = {
  "image/jpeg": "jpeg",
  "image/jpg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};

const EXTENSION_BY_KIND: Record<ProfilePhotoKind, string> = {
  jpeg: "jpg",
  png: "png",
  webp: "webp",
};

export function detectImageKind(bytes: Uint8Array): ProfilePhotoKind | null {
  if (bytes.length < 12) return null;

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpeg";
  }

  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "png";
  }

  const riff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  const webp = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
  if (riff === "RIFF" && webp === "WEBP") {
    return "webp";
  }

  return null;
}

export function isOwnedPhotoPath(path: string, userId: string): boolean {
  if (!userId || path.length === 0 || path.length > PROFILE_PHOTO_PATH_MAX) {
    return false;
  }
  if (path.includes("..") || path.includes("\\") || path.startsWith("/")) {
    return false;
  }

  const prefix = `${userId}/`;
  if (!path.startsWith(prefix)) return false;
  return UUID_FILE.test(path.slice(prefix.length));
}

export function buildOwnedPhotoPath(
  userId: string,
  objectId: string,
  kind: ProfilePhotoKind,
): string | null {
  const path = `${userId}/${objectId}.${EXTENSION_BY_KIND[kind]}`;
  return isOwnedPhotoPath(path, userId) ? path : null;
}

export function inspectProfilePhoto(input: {
  userId: string;
  bytes: Uint8Array;
  declaredType: string;
  declaredSize: number;
}):
  | { ok: true; kind: ProfilePhotoKind }
  | { ok: false; message: string } {
  if (!input.userId) {
    return { ok: false, message: "Sign in to change your photo." };
  }
  if (input.declaredSize <= 0 || input.bytes.length === 0) {
    return { ok: false, message: "Choose a photo to upload." };
  }
  if (
    input.declaredSize > PROFILE_PHOTO_MAX_BYTES ||
    input.bytes.length > PROFILE_PHOTO_MAX_BYTES
  ) {
    return { ok: false, message: "Keep the photo under 5 MB." };
  }

  const kind = detectImageKind(input.bytes);
  if (!kind) {
    return {
      ok: false,
      message: "Use a JPEG, PNG, or WebP image.",
    };
  }

  const declaredKind = KIND_BY_MIME[input.declaredType.toLowerCase()];
  if (!declaredKind || declaredKind !== kind) {
    return {
      ok: false,
      message: "That file type does not match the image contents.",
    };
  }

  return { ok: true, kind };
}
