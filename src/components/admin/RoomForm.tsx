"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Room } from "@/lib/types";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function RoomForm({ room }: { room?: Room }) {
  const router = useRouter();
  const isEdit = Boolean(room);

  const [name, setName] = useState(room?.name ?? "");
  const [slug, setSlug] = useState(room?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [summary, setSummary] = useState(room?.summary ?? "");
  const [description, setDescription] = useState(room?.description ?? "");
  const [price, setPrice] = useState(room?.price_per_night ?? 0);
  const [maxGuests, setMaxGuests] = useState(room?.max_guests ?? 2);
  const [bedType, setBedType] = useState(room?.bed_type ?? "");
  const [sizeSqft, setSizeSqft] = useState(room?.size_sqft ?? 0);
  const [amenities, setAmenities] = useState(
    (room?.amenities ?? []).join("\n")
  );
  const [images, setImages] = useState<string[]>(room?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as { error?: string; url?: string };
      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }
      setImages((prev) => [...prev, data.url!]);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      name,
      slug,
      summary,
      description,
      pricePerNight: price,
      maxGuests,
      bedType,
      sizeSqft,
      amenities: amenities.split("\n").map((a) => a.trim()).filter(Boolean),
      images,
    };

    try {
      const res = await fetch(
        isEdit ? `/api/admin/rooms/${room!.id}` : "/api/admin/rooms",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setSubmitting(false);
        return;
      }
      router.push("/admin/rooms");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <div>
        <label className="text-xs font-medium text-ink/60">Room Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-petrol-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-ink/60">Slug (URL)</label>
        <input
          type="text"
          required
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm font-mono focus:border-petrol-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-ink/60">Short Summary</label>
        <input
          type="text"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-petrol-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-ink/60">Full Description</label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-petrol-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className="text-xs font-medium text-ink/60">Price/Night (₹)</label>
          <input
            type="number"
            required
            min={0}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-petrol-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ink/60">Max Guests</label>
          <input
            type="number"
            required
            min={1}
            value={maxGuests}
            onChange={(e) => setMaxGuests(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-petrol-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ink/60">Bed Type</label>
          <input
            type="text"
            value={bedType}
            onChange={(e) => setBedType(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-petrol-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ink/60">Size (sq ft)</label>
          <input
            type="number"
            min={0}
            value={sizeSqft}
            onChange={(e) => setSizeSqft(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-petrol-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-ink/60">
          Amenities (one per line)
        </label>
        <textarea
          rows={4}
          value={amenities}
          onChange={(e) => setAmenities(e.target.value)}
          placeholder={"Free Wi-Fi\nMountain View\nAir Conditioning"}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-petrol-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-ink/60">Room Images</label>
        <div className="mt-2 flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={img} className="relative h-24 w-24 overflow-hidden rounded-lg border border-petrol-100">
              <Image src={img} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute right-1 top-1 rounded-full bg-red-600 px-1.5 py-0.5 text-xs text-white"
              >
                ×
              </button>
            </div>
          ))}
          <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border border-dashed border-petrol-300 text-xs text-ink/50 hover:bg-petrol-50">
            {uploading ? "Uploading…" : "+ Add"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-stone hover:bg-charcoal-light disabled:opacity-60"
        >
          {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create Room"}
        </button>
      </div>
    </form>
  );
}
