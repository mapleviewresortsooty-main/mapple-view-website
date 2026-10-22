import { cache } from "react";
import { RoomModel, SettingsModel } from "@/lib/models";

/** Dedupes settings fetches within a single request (navbar + page + footer). */
export const getSiteSettings = cache(() => SettingsModel.get());

/** Active rooms only — for the public site. */
export const getActiveRooms = cache(() => RoomModel.all());

/** All rooms including inactive — for admin-style listings that need them. */
export const getAllRooms = cache(() => RoomModel.all(true));
