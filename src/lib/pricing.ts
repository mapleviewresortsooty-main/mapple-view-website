import { addDays, eachDayOfInterval, parseISO } from "date-fns";
import type { Room } from "@/lib/types";

type Priceable = Pick<Room, "price_per_night" | "weekend_price_per_night">;

/** Friday and Saturday nights bill at the weekend rate when one is set. */
export function nightlyRate(room: Priceable, night: Date): number {
  const dow = night.getDay();
  return (dow === 5 || dow === 6) && room.weekend_price_per_night > 0
    ? room.weekend_price_per_night
    : room.price_per_night;
}

export type StayQuote = {
  nights: number;
  regularNights: number;
  weekendNights: number;
  total: number;
};

export function stayQuote(
  room: Priceable,
  checkIn: string,
  checkOut: string
): StayQuote {
  if (!checkIn || !checkOut || checkOut <= checkIn) {
    return { nights: 0, regularNights: 0, weekendNights: 0, total: 0 };
  }
  const days = eachDayOfInterval({
    start: parseISO(checkIn),
    end: addDays(parseISO(checkOut), -1),
  });
  let regularNights = 0;
  let weekendNights = 0;
  let total = 0;
  for (const d of days) {
    const rate = nightlyRate(room, d);
    total += rate;
    if (rate !== room.price_per_night) weekendNights++;
    else regularNights++;
  }
  return { nights: days.length, regularNights, weekendNights, total };
}
