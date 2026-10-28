"use client";

import { useEffect, useMemo, useState } from "react";
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
  dirty,
  uploading,
  uploadLabel,
  actions,
  onMove,
  onRemove,
  onUpload,
  onSave,
  onDiscard,
}: {
  title: string;
  badges?: ReactNode;
  hint?: string;
  images: string[];
  single?: boolean;
  state: SaveState;
  error?: string;
  dirty: boolean;
  uploading?: boolean;
  uploadLabel: string;
  actions?: ReactNode;
  onMove: (index: number, dir: -1 | 1) => void;
  onRemove: (index: number) => void;
  onUpload: (file: File) => void;
  onSave: () => void;
  onDiscard: () => void;
}) {
  return (
    <section className="rounded-2xl border border-petrol-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-sans text-base font-semibold text-ink">{title}</h2>
            {badges}
            {dirty && (
              <span className="label-caps bg-amber-100 px-2 py-0.5 text-amber-800">
                Unsaved
              </span>
            )}
            {state === "saving" && <span className="text-xs text-ink/50">Saving…</span>}
            {!dirty && state === "saved" && (
              <span className="text-xs text-green-700">Saved</span>
            )}
          </div>
          {hint && <p className="mt-1 text-xs text-ink/50">{hint}</p>}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {dirty && (
            <button
              type="button"
              onClick={onDiscard}
              className="label-caps border border-line px-3 py-2 text-ink/70 hover:bg-petrol-50"
            >
              Discard
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={!dirty || state === "saving"}
            className={`label-caps px-4 py-2 transition ${
              dirty
                ? "bg-petrol-500 text-stone hover:bg-petrol-600"
                : "cursor-default border border-line text-ink/40"
            }`}
          >
            {dirty ? "Save changes" : "Saved"}
          </button>
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
  // `lists` = working copy shown on the cards; `saved` = last persisted copy.
  // Room lists live under a `room:<id>` key so they share the same state.
  const initialLists = useMemo<Record<string, string[]>>(
    () => ({
      ...initial,
      ...Object.fromEntries(rooms.map((r) => [`room:${r.id}`, r.images])),
    }),
    [initial, rooms]
  );
  const [lists, setLists] = useState(initialLists);
  const [saved, setSaved] = useState(initialLists);
  const [overridden, setOverridden] = useState<Set<string>>(
    new Set(initialOverridden)
  );
  const [status, setStatus] = useState<Record<string, SaveState>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dirtyKeys = useMemo(
    () =>
      Object.keys(lists).filter(
        (k) => JSON.stringify(lists[k]) !== JSON.stringify(saved[k])
      ),
    [lists, saved]
  );
  const isDirty = (key: string) => dirtyKeys.includes(key);

  // Warn before leaving the page with unsaved changes.
  useEffect(() => {
    if (dirtyKeys.length === 0) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirtyKeys.length]);

  /** Persist one key's current working list. Returns whether it succeeded. */
  async function save(key: string): Promise<boolean> {
    const images = lists[key] ?? [];
    const isRoom = key.startsWith("room:");
    setStatus((s) => ({ ...s, [key]: "saving" }));
    try {
      const res = isRoom
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
      if (!res.ok) {
        setStatus((s) => ({ ...s, [key]: "error" }));
        setErrors((e) => ({ ...e, [key]: "Save failed — try again." }));
        return false;
      }
      // An emptied site section falls back to its built-in photos — mirror
      // that in the working copy so the card matches what the site shows.
      const effective = !isRoom && images.length === 0 ? (fallbacks[key] ?? []) : images;
      setSaved((s) => ({ ...s, [key]: effective }));
      setLists((l) => ({ ...l, [key]: effective }));
      if (!isRoom) {
        setOverridden((o) => {
          const n = new Set(o);
          if (images.length === 0) n.delete(key);
          else n.add(key);
          return n;
        });
      }
      setStatus((s) => ({ ...s, [key]: "saved" }));
      return true;
    } catch {
      setStatus((s) => ({ ...s, [key]: "error" }));
      setErrors((e) => ({ ...e, [key]: "Network error — try again." }));
      return false;
    }
  }

  function update(key: string, next: string[]) {
    setLists((l) => ({ ...l, [key]: next }));
    setStatus((s) => ({ ...s, [key]: "idle" }));
  }

  function discard(key: string) {
    const current = lists[key] ?? [];
    const reverted = saved[key] ?? [];
    // Remove uploaded files that never got saved into the list.
    current
      .filter((src) => !reverted.includes(src))
      .forEach(discardUploadedFile);
    setLists((l) => ({ ...l, [key]: reverted }));
    setStatus((s) => ({ ...s, [key]: "idle" }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  /** Site sections only: drop the override so the section returns to defaults. */
  async function revert(key: string) {
    const current = lists[key] ?? [];
    if (
      isDirty(key) &&
      !window.confirm("Discard unsaved changes and restore the built-in photos?")
    ) {
      return;
    }
    setStatus((s) => ({ ...s, [key]: "saving" }));
    try {
      const res = await fetch(
        `/api/admin/site-images?section=${encodeURIComponent(key)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      const fb = fallbacks[key] ?? [];
      setLists((l) => ({ ...l, [key]: fb }));
      setSaved((s) => ({ ...s, [key]: fb }));
      setOverridden((o) => {
        const n = new Set(o);
        n.delete(key);
        return n;
      });
      setStatus((s) => ({ ...s, [key]: "saved" }));
      current.filter((src) => !fb.includes(src)).forEach(discardUploadedFile);
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
            : "This is the last image — the section will show its built-in photo after you save. Continue?"
          : "Remove this image? It is only deleted once you save."
      )
    ) {
      return;
    }
    update(
      key,
      list.filter((_, i) => i !== index)
    );
    // If the file was never saved into this list, it isn't referenced anymore.
    if (!(saved[key] ?? []).includes(src)) discardUploadedFile(src);
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
      const replaced = max === 1 ? current : [];
      update(key, [...replaced, data.url]);
      // A single-slot replace drops the previous photo — if it was an
      // upload that isn't referenced in the saved list either, bin it.
      if (max === 1 && current[0] && !(saved[key] ?? []).includes(current[0])) {
        discardUploadedFile(current[0]);
      }
    } catch {
      setErrors((e) => ({ ...e, [key]: "Upload failed. Please try again." }));
    } finally {
      setUploading((u) => ({ ...u, [key]: false }));
    }
  }

  async function saveAll() {
    for (const key of dirtyKeys) {
      await save(key);
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
            dirty={isDirty(key)}
            uploading={uploading[key]}
            uploadLabel={single ? "Replace photo" : "Add photo"}
            actions={
              isCustom ? (
                <button
                  type="button"
                  onClick={() => void revert(key)}
                  className="label-caps border border-line px-3 py-2 text-ink hover:bg-petrol-50"
                >
                  Reset
                </button>
              ) : undefined
            }
            onMove={(i, dir) => move(key, i, dir)}
            onRemove={(i) => remove(key, i)}
            onUpload={(file) => void upload(key, section.max, file)}
            onSave={() => void save(key)}
            onDiscard={() => discard(key)}
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
            dirty={isDirty(key)}
            uploading={uploading[key]}
            uploadLabel="Add photo"
            onMove={(i, dir) => move(key, i, dir)}
            onRemove={(i) => remove(key, i)}
            onUpload={(file) => void upload(key, undefined, file)}
            onSave={() => void save(key)}
            onDiscard={() => discard(key)}
          />
        );
      })}

      {dirtyKeys.length > 0 && (
        <div className="sticky bottom-4 z-40 mx-auto flex w-fit items-center gap-3 rounded-full border border-line bg-charcoal px-5 py-3 text-stone shadow-2xl">
          <span className="text-xs">
            {dirtyKeys.length} section{dirtyKeys.length === 1 ? "" : "s"} with
            unsaved changes
          </span>
          <button
            type="button"
            onClick={() => void saveAll()}
            className="label-caps bg-petrol-500 px-4 py-2 text-stone transition hover:bg-petrol-600"
          >
            Save all
          </button>
        </div>
      )}
    </div>
  );
}
