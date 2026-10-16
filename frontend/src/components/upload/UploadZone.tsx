import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ImageUp, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
export const MAX_MB = 15;

export interface SelectedImage {
  file: File;
  url: string;
  width?: number;
  height?: number;
}

export function validateFile(f: File): string | null {
  if (!ACCEPTED.includes(f.type)) return "Unsupported format. Use JPG, JPEG, PNG or WEBP.";
  if (f.size > MAX_MB * 1024 * 1024) return `File is too large. Maximum size is ${MAX_MB} MB.`;
  return null;
}

const fmtSize = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(2)} MB` : `${(b / 1024).toFixed(0)} KB`);

export function UploadZone({
  value,
  onChange,
  disabled,
}: {
  value: SelectedImage | null;
  onChange: (v: SelectedImage | null) => void;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const pick = useCallback(
    (f?: File) => {
      if (!f) return;
      const e = validateFile(f);
      setErr(e);
      if (e) return;
      const url = URL.createObjectURL(f);
      const img = new Image();
      img.onload = () => onChange({ file: f, url, width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => setErr("This image could not be read.");
      img.src = url;
    },
    [onChange],
  );

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        aria-label="Choose image"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {value ? (
        <div className="overflow-hidden rounded-xl border border-border bg-surface/60">
          <div className="grid-lines grid place-items-center bg-background/60 p-3">
            <img src={value.url} alt={`Preview of ${value.file.name}`} className="max-h-80 w-auto rounded-md object-contain" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{value.file.name}</p>
              <p className="text-xs text-muted-foreground">
                {fmtSize(value.file.size)}
                {value.width ? ` · ${value.width} × ${value.height}px` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={disabled} onClick={() => input.current?.click()}>
                <RefreshCw className="h-4 w-4" />Replace
              </Button>
              <Button variant="ghost" size="sm" disabled={disabled} onClick={() => onChange(null)}>
                <X className="h-4 w-4" />Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <motion.button
          type="button"
          whileHover={{ scale: 1.005 }}
          disabled={disabled}
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            pick(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "grid-lines flex w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors",
            drag ? "border-primary bg-primary/10" : "border-border bg-surface/40 hover:border-primary/60",
          )}
        >
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary">
            <ImageUp className="h-7 w-7" />
          </span>
          <span>
            <span className="block text-base font-semibold">Drop a water-body image here</span>
            <span className="mt-1 block text-sm text-muted-foreground">or click to browse · JPG, JPEG, PNG, WEBP · up to {MAX_MB} MB</span>
          </span>
        </motion.button>
      )}
      {err && <p className="mt-2 text-sm text-destructive" role="alert">{err}</p>}
    </div>
  );
}
