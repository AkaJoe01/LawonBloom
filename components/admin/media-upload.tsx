"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { ALLOWED_UPLOAD_MIME, MAX_UPLOAD_BYTES, MAX_UPLOAD_EDGE } from "@/lib/validation/media";

export default function MediaUpload() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function preflight(file: File): Promise<string | null> {
    if (!(ALLOWED_UPLOAD_MIME as readonly string[]).includes(file.type)) {
      return "Only JPEG, PNG, or WebP images are accepted.";
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return "Images must be 4 MB or smaller.";
    }
    try {
      const bitmap = await createImageBitmap(file);
      const longest = Math.max(bitmap.width, bitmap.height);
      bitmap.close();
      if (longest > MAX_UPLOAD_EDGE) {
        return `Images must be at most ${MAX_UPLOAD_EDGE}px on their longest edge.`;
      }
    } catch {
      // If the browser cannot decode it, let the server be the authority.
    }
    return null;
  }

  function upload(file: File) {
    setError(null);
    setNotice(null);
    setProgress(0);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/media");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      setProgress(null);
      if (xhr.status === 201) {
        setNotice("Upload complete.");
        router.refresh();
        return;
      }
      try {
        const data = JSON.parse(xhr.responseText) as { error?: { message?: string } };
        setError(data.error?.message ?? "Upload failed. Try a different image.");
      } catch {
        setError("Upload failed. Try a different image.");
      }
    };
    xhr.onerror = () => {
      setProgress(null);
      setError("Network error — check your connection and try again.");
    };
    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  }

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file || progress !== null) return;
    const problem = await preflight(file);
    if (problem) {
      setError(problem);
      return;
    }
    upload(file);
  }

  return (
    <section aria-label="Upload images" className="space-y-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFiles(event.dataTransfer.files);
        }}
        className={`rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
          dragging ? "border-primary bg-primary-fixed/30" : "border-outline-variant bg-background"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-label="Choose an image to upload"
          className="sr-only"
          onChange={(event) => {
            void handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <p className="text-sm font-medium text-foreground">Drag an image here, or</p>
        <div className="mt-3 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={progress !== null}
            onClick={() => inputRef.current?.click()}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-on-primary hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
          >
            <Upload size={15} aria-hidden="true" />
            {progress !== null ? "Uploading…" : "Choose file"}
          </button>
          <p className="text-xs text-on-surface-variant">
            JPEG, PNG or WebP · up to {MAX_UPLOAD_BYTES / (1024 * 1024)} MB · max {MAX_UPLOAD_EDGE}px
          </p>
        </div>
        {progress !== null ? (
          <div className="mx-auto mt-4 max-w-sm" role="status">
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-container-high">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-on-surface-variant">{progress}%</p>
          </div>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="text-sm text-foreground">
          {notice}
        </p>
      ) : null}
    </section>
  );
}
