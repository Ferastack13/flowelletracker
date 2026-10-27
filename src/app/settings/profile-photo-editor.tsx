"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import {
  removeProfilePhoto,
  uploadProfilePhoto,
  type SettingsActionState,
} from "@/app/settings/actions";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  PROFILE_PHOTO_MAX_BYTES,
  PROFILE_PHOTO_MIME_TYPES,
} from "@/lib/profile-photo";

const initialState: SettingsActionState = { status: "idle", message: "" };

interface ProfilePhotoEditorProps {
  displayName: string;
  photoUrl: string | null;
}

export function ProfilePhotoEditor({
  displayName,
  photoUrl,
}: ProfilePhotoEditorProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [uploadState, uploadAction, uploadPending] = useActionState(
    uploadProfilePhoto,
    initialState,
  );
  const [removeState, removeAction, removePending] = useActionState(
    async () => removeProfilePhoto(),
    initialState,
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (uploadState.status === "success") {
      clearSelection();
    }
  }, [uploadState.status]);

  function clearSelection() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedName(null);
    setClientError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const pending = uploadPending || removePending;
  const shownUrl = previewUrl ?? photoUrl;
  const status = clientError
    ? { status: "error" as const, message: clientError }
    : uploadState.message
      ? uploadState
      : removeState;

  return (
    <div className="space-y-4 rounded-xl border border-border/70 bg-muted/25 px-4 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <ProfileAvatar
          name={displayName}
          photoUrl={shownUrl}
          size="lg"
          alt={
            previewUrl
              ? "Preview of the selected profile photo. It is not saved yet."
              : undefined
          }
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-plum">Profile photo</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            JPEG, PNG, or WebP, up to 5 MB. A preview is only local until you
            save.
          </p>
          {previewUrl ? (
            <p className="mt-1 text-xs text-muted-foreground" role="status">
              Preview ready{selectedName ? `: ${selectedName}` : ""}. Not saved
              yet.
            </p>
          ) : null}
        </div>
      </div>

      <form
        action={uploadAction}
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          const file = inputRef.current?.files?.[0];
          if (!file) {
            event.preventDefault();
            setClientError("Choose a photo to upload.");
            return;
          }
          if (file.size > PROFILE_PHOTO_MAX_BYTES) {
            event.preventDefault();
            setClientError("Keep the photo under 5 MB.");
          }
        }}
      >
        <div className="space-y-2">
          <Label htmlFor={inputId}>Choose a photo</Label>
          <input
            ref={inputRef}
            id={inputId}
            name="photo"
            type="file"
            accept={PROFILE_PHOTO_MIME_TYPES.join(",")}
            disabled={pending}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-card file:px-3 file:py-2 file:text-sm file:font-medium file:text-plum"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (previewUrl) URL.revokeObjectURL(previewUrl);
              if (!file) {
                setPreviewUrl(null);
                setSelectedName(null);
                return;
              }
              setClientError(null);
              setSelectedName(file.name);
              setPreviewUrl(URL.createObjectURL(file));
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={pending || !previewUrl}>
            {uploadPending ? "Uploading…" : "Save photo"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending || !previewUrl}
            onClick={clearSelection}
          >
            Cancel
          </Button>
        </div>
      </form>

      {photoUrl ? (
        <form action={removeAction}>
          <Button type="submit" variant="outline" disabled={pending}>
            {removePending ? "Removing…" : "Remove photo"}
          </Button>
        </form>
      ) : null}

      {status.message ? (
        <p
          className={
            status.status === "error"
              ? "text-sm text-destructive"
              : "text-sm text-muted-foreground"
          }
          role="status"
        >
          {status.message}
        </p>
      ) : null}
    </div>
  );
}
