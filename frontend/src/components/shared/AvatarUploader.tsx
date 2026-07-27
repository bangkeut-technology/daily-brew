"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/shared/Avatar";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

interface AvatarUploaderProps {
  name: string;
  imageUrl?: string | null;
  size?: number;
  radius?: string;
  uploading?: boolean;
  disabled?: boolean;
  onUpload: (file: File) => void;
  onRemove?: () => void;
}

/**
 * Avatar with a camera-icon overlay for picking a new image and an X for
 * removal. The size/type checks here are a UX guard only — the backend
 * validates again, so a rejection still has to be surfaced by the parent.
 */
export function AvatarUploader({
  name,
  imageUrl,
  size = 64,
  radius = "20px",
  uploading = false,
  disabled = false,
  onUpload,
  onRemove,
}: AvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hovering, setHovering] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Image must be JPEG, PNG or WebP");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("Image must be 5 MB or smaller");
      return;
    }
    onUpload(file);
  };

  const openPicker = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  // Overlay icon scales with the avatar — balanced from 32px through 128px.
  const iconSize = Math.max(14, Math.round(size * 0.28));
  const removeButtonSize = Math.max(20, Math.round(size * 0.28));

  return (
    <div
      className="group relative inline-block"
      style={{ width: size, height: size }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <Avatar name={name} imageUrl={imageUrl} size={size} radius={radius} />

      <button
        type="button"
        onClick={openPicker}
        disabled={disabled || uploading}
        aria-label="Upload photo"
        className={cn(
          "absolute inset-0 flex cursor-pointer items-center justify-center bg-black/45 text-white transition-opacity duration-150",
          hovering || uploading ? "opacity-100" : "opacity-0",
          (disabled || uploading) && "cursor-not-allowed",
        )}
        style={{ borderRadius: radius }}
      >
        {uploading ? <Loader2 size={iconSize} className="animate-spin" /> : <Camera size={iconSize} />}
      </button>

      {imageUrl && onRemove && !uploading && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          disabled={disabled}
          aria-label="Remove photo"
          className="absolute -right-1 -top-1 flex cursor-pointer items-center justify-center rounded-full border-2 border-white bg-red text-white shadow-[0_2px_6px_rgba(0,0,0,0.15)] transition-colors hover:bg-red/90 disabled:opacity-50"
          style={{ width: removeButtonSize, height: removeButtonSize }}
        >
          <X size={Math.max(10, Math.round(removeButtonSize * 0.55))} />
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
