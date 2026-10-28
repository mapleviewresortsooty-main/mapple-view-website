"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Icon from "@/components/ui/Icon";

type SectionDef = {
  key: string;
  label: string;
  page: string;
  max?: number;
  hint?: string;
};

export type ManagedRoom = {
  id: string;
  name: string;
  is_active: number;
  images: string[];
};

type SaveState = "idle" | "saving" | "saved" | "error";

/** Best-effort R2 cleanup — only for images this site uploaded. */
function discardUploadedFile(url: string) {
  if (!url.startsWith("/uploads/")) return;
  fetch("/api/admin/upload", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  }).catch(() => {});
}

function EditorCard({
  title,
  badges,
  hint,
  images,
  single,
  state,
  error,
  uploading,
  uploadLabel,
  actions,
  onMove,
  onRemove,
  onUpload,
}: {
  title: string;
  badges?: ReactNode;
  hint?: string;
  images: string[];
  single?: boolean;
  state: SaveState;
  error?: string;
  uploading?: boolean;
  uploadLabel: string;
  actions?: ReactNode;
  onMove: (index: number, dir: -1 | 1) => void;
  onRemove: (index: number) => void;
  onUpload: (file: File) => void;
}) {
  return (
    <section className="rounded-2xl border border-petrol-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-sans text-base font-semibold text-ink">{title}</h2>
            {badges}
            {state === "saving" && <span className="text-xs text-ink/50">Saving…</span>}
            {state === "saved" && <span className="text-xs text-green-700">Saved</span>}
          </div>
          {hint && <p className="mt-1 text-xs text-ink/50">{hint}</p>}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <label
            className={`label-caps inline-flex cursor-pointer items-center gap-1.5 bg-ink px-3 py-2 text-stone hover:bg-charcoal-light ${
              uploading ? "pointer-events-none opacity-60" : ""
            }`}
          >
            <Icon name="upload" className="text-sm" />
            {uploading ? "Uploading…" : uploadLabel}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>

      {images.length === 0 && (
        <p className="mt-4 rounded-lg border border-dashed border-petrol-300 px-3 py-6 text-center text-xs text-ink/50">
          No photos yet — the site shows a placeholder until one is added.
        </p>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-petrol-50"
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-charcoal/80 px-1.5 py-1 text-stone">
              {!single ? (
                <>
                  <button
                    type="button"
                    aria-label="Move earlier"
                    disabled={i === 0}
                    onClick={() => onMove(i, -1)}
                    className="flex h-8 w-8 items-center justify-center rounded transition hover:bg-stone/20 disabled:opacity-30"
                  >
                    <Icon name="chevron_left" className="text-base" />
                  </button>
                  <span className="text-xs tabular-nums">{i + 1}</span>
                  <button
                    type="button"
                    aria-label="Move later"
                    disabled={i === images.length - 1}
                    onClick={() => onMove(i, 1)}
                    className="flex h-8 w-8 items-center justify-center rounded transition hover:bg-stone/20 disabled:opacity-30"
                  >
                    <Icon name="chevron_right" className="text-base" />
                  </button>
                </>
              ) : (
                <span className="px-2 text-xs">Current photo</span>
              )}
            </div>
            <button
              type="button"
              aria-label="Remove image"
              onClick={() => onRemove(i)}
              className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-charcoal/80 text-stone transition hover:bg-red-700"
            >
              <Icon name="close" className="text-base" />
            </button>
          </div>
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </section>
  );
}

export default function SiteImagesManager({
  sections,
  initial,
  fallbacks,
  overridden: initialOverridden,
  rooms,
}: {
  sections: readonly SectionDef[];
  initial: Record<string, string[]>;
  fallbacks: Record<string, string[]>;
  overridden: string[];
  rooms: ManagedRoom[];
}) {
  // `lists` always mirrors what the site actually shows per section. Room
  // image lists live under a `room:<id>` key so they share the same state.
  const [lists, setLists] = useState<Record<string, string[]>>(() => ({
    ...initial,
    ...Object.fromEntries(rooms.map((r) => [`room:${r.id}`, r.images])),
  }));
  const [overridden, setOverridden] = useState<Set<string>>(
    new Set(initialOverridden)
  );
  const [status, setStatus] = useState<Record<string, SaveState>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function persist(key: string, images: string[]) {
    setStatus((s) => ({ ...s, [key]: "saving" }));
    try {
      const res = key.startsWith("room:")
        ? await fetch(`/api/admin/rooms/${key.slice(5)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ images }),
          })
        : await fetch("/api/admin/site-images", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ section: key, images }),
          });
      setStatus((s) => ({ ...s, [key]: res.ok ? "saved" : "error" }));
      if (!res.ok) {
        setErrors((e) => ({ ...e, [key]: "Save failed — try again." }));
      }
    } catch {
      setStatus((s) => ({ ...s, [key]: "error" }));
      setErrors((e) => ({ ...e, [key]: "Network error — try again." }));
    }
  }

  function update(key: string, next: string[]) {
    setLists((l) => ({ ...l, [key]: next }));
    if (!key.startsWith("room:")) {
      setOverridden((o) => new Set(o).add(key));
    }
    void persist(key, next);
  }

  /** Site sections only: drop the override so the section returns to defaults. */
  async function revert(key: string, discarded: string[]) {
    setStatus((s) => ({ ...s, [key]: "saving" }));
    try {
      const res = await fetch(
        `/api/admin/site-images?section=${encodeURIComponent(key)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      setLists((l) => ({ ...l, [key]: fallbacks[key] }));
      setOverridden((o) => {
        const n = new Set(o);
        n.delete(key);
        return n;
      });
      setStatus((s) => ({ ...s, [key]: "saved" }));
      discarded.forEach(discardUploadedFile);
    } catch {
      setStatus((s) => ({ ...s, [key]: "error" }));
      setErrors((e) => ({ ...e, [key]: "Could not reset — try again." }));
    }
  }

  function move(key: string, index: number, dir: -1 | 1) {
    const list = [...(lists[key] ?? [])];
    const j = index + dir;
    if (j < 0 || j >= list.length) return;
    [list[index], list[j]] = [list[j], list[index]];
    update(key, list);
  }

  function remove(key: string, index: number) {
    const list = lists[key] ?? [];
    const src = list[index];
    const last = list.length <= 1;
    const isRoom = key.startsWith("room:");
    if (
      !window.confirm(
        last
          ? isRoom
            ? "This is the room's last photo — it will show a placeholder until you add one. Continue?"
            : "This is the last image — removing it restores the built-in photo. Continue?"
          : "Remove this image?"
      )
    ) {
      return;
    }
    if (last && !isRoom) {
      void revert(key, [src]);
    } else {
      update(
        key,
        list.filter((_, i) => i !== index)
      );
      discardUploadedFile(src);
    }
  }

  async function upload(key: string, max: number | undefined, file: File) {
    setUploading((u) => ({ ...u, [key]: true }));
    setErrors((e) => ({ ...e, [key]: "" }));
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as { error?: string; url?: string };
      if (!res.ok || !data.url) {
        setErrors((e) => ({ ...e, [key]: data.error || "Upload failed" }));
        return;
      }
      const current = lists[key] ?? [];
      update(key, max === 1 ? [data.url] : [...current, data.url]);
      if (max === 1 && current[0]?.startsWith("/uploads/")) {
        discardUploadedFile(current[0]);
      }
    } catch {
      setErrors((e) => ({ ...e, [key]: "Upload failed. Please try again." }));
    } finally {
      setUploading((u) => ({ ...u, [key]: false }));
    }
  }

  return (
    <div className="space-y-8">
      {sections.map((section) => {
        const key = section.key;
        const images = lists[key] ?? [];
        const single = section.max === 1;
        const isCustom = overridden.has(key);

        return (
          <EditorCard
            key={key}
            title={section.label}
            badges={
              <span
                className={`label-caps px-2 py-0.5 ${
                  isCustom ? "bg-petrol-500 text-stone" : "bg-petrol-50 text-ink-soft"
                }`}
              >
                {isCustom ? "Custom" : "Default"}
              </span>
            }
            hint={`${section.page} · ${section.hint}`}
            images={images}
            single={single}
            state={status[key] ?? "idle"}
            error={errors[key]}
            uploading={uploading[key]}
            uploadLabel={single ? "Replace photo" : "Add photo"}
            actions={
              isCustom ? (
                <button
                  type="button"
                  onClick={() => void revert(key, images)}
                  className="label-caps border border-line px-3 py-2 text-ink hover:bg-petrol-50"
                >
                  Reset
                </button>
              ) : undefined
            }
            onMove={(i, dir) => move(key, i, dir)}
            onRemove={(i) => remove(key, i)}
            onUpload={(file) => void upload(key, section.max, file)}
          />
        );
      })}

      {rooms.length > 0 && (
        <div className="pt-4">
          <h2 className="font-sans text-lg font-semibold text-ink">Rooms</h2>
          <p className="mt-1 text-xs text-ink/50">
            The first photo is the cover shown in listings. These are the same
            images managed under Admin → Rooms.
          </p>
        </div>
      )}
      {rooms.map((room) => {
        const key = `room:${room.id}`;
        const images = lists[key] ?? [];
        return (
          <EditorCard
            key={room.id}
            title={room.name}
            badges={
              !room.is_active ? (
                <span className="label-caps bg-line/60 px-2 py-0.5 text-ink-soft">
                  Hidden
                </span>
              ) : undefined
            }
            images={images}
            state={status[key] ?? "idle"}
            error={errors[key]}
            uploading={uploading[key]}
            uploadLabel="Add photo"
            onMove={(i, dir) => move(key, i, dir)}
            onRemove={(i) => remove(key, i)}
            onUpload={(file) => void upload(key, undefined, file)}
          />
        );
      })}
    </div>
  );
}
