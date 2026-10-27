import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PROFILE_PHOTO_MAX_BYTES,
  buildOwnedPhotoPath,
  detectImageKind,
  inspectProfilePhoto,
  isOwnedPhotoPath,
} from "./profile-photo.ts";

const userId = "11111111-1111-4111-8111-111111111111";
const objectId = "22222222-2222-4222-8222-222222222222";

function jpegBytes(): Uint8Array {
  return new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
}

function pngBytes(): Uint8Array {
  return new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x00]);
}

describe("profile photo ownership", () => {
  it("accepts only a file in the signed-in user's folder", () => {
    const path = buildOwnedPhotoPath(userId, objectId, "jpeg");
    assert.equal(path, `${userId}/${objectId}.jpg`);
    assert.equal(isOwnedPhotoPath(path ?? "", userId), true);
    assert.equal(isOwnedPhotoPath(`${userId}/../${objectId}.jpg`, userId), false);
    assert.equal(isOwnedPhotoPath(`other/${objectId}.jpg`, userId), false);
    assert.equal(isOwnedPhotoPath(`${userId}/avatar.png`, userId), false);
  });
});

describe("inspectProfilePhoto", () => {
  it("accepts a JPEG whose bytes match the declared type", () => {
    const bytes = jpegBytes();
    const result = inspectProfilePhoto({
      userId,
      bytes,
      declaredType: "image/jpeg",
      declaredSize: bytes.length,
    });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.kind, "jpeg");
  });

  it("rejects a PNG renamed as JPEG", () => {
    const bytes = pngBytes();
    const result = inspectProfilePhoto({
      userId,
      bytes,
      declaredType: "image/jpeg",
      declaredSize: bytes.length,
    });
    assert.equal(result.ok, false);
  });

  it("rejects files over 5 MB", () => {
    const bytes = jpegBytes();
    const result = inspectProfilePhoto({
      userId,
      bytes,
      declaredType: "image/jpeg",
      declaredSize: PROFILE_PHOTO_MAX_BYTES + 1,
    });
    assert.equal(result.ok, false);
  });

  it("rejects an empty upload from a signed-out user", () => {
    const unsigned = inspectProfilePhoto({
      userId: "",
      bytes: jpegBytes(),
      declaredType: "image/jpeg",
      declaredSize: 12,
    });
    const empty = inspectProfilePhoto({
      userId,
      bytes: new Uint8Array(),
      declaredType: "image/jpeg",
      declaredSize: 0,
    });
    assert.equal(unsigned.ok, false);
    assert.equal(empty.ok, false);
  });
});

describe("detectImageKind", () => {
  it("reads JPEG, PNG, and WebP magic bytes", () => {
    assert.equal(detectImageKind(jpegBytes()), "jpeg");
    assert.equal(detectImageKind(pngBytes()), "png");
    assert.equal(
      detectImageKind(
        new Uint8Array([
          0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
        ]),
      ),
      "webp",
    );
    assert.equal(detectImageKind(new Uint8Array([0x00, 0x01, 0x02])), null);
  });
});
