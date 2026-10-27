import { displayInitials } from "@/lib/settings-data";
import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  alt?: string;
}

const sizes = {
  sm: "size-9 text-[11px]",
  md: "size-14 text-sm",
  lg: "size-16 text-base",
};

export function ProfileAvatar({
  name,
  photoUrl,
  size = "md",
  className,
  alt,
}: ProfileAvatarProps) {
  const initials = displayInitials(name);
  const label = alt ?? (name ? `${name}'s profile photo` : "Profile photo");

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-plum font-medium tracking-wide text-ivory",
        sizes[size],
        className,
      )}
    >
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt={label}
          className="size-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );
}
