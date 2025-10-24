import { z } from "zod";

export const AmenityTypeEnum = z.enum([
  "CHANGING_ROOM",
  "LOCKER",
  "PARKING",
  "CAFETERIA",
  "STEAM_ROOM",
  "SAUNA",
  "MASSAGE_ROOM",
  "EQUIPMENT_RENTAL",
  "FIRST_AID",
  "WIFI",
  "AIR_CONDITIONING",
  "LIGHTING",
  "SOUND_SYSTEM",
  "LIVE_STREAMING",
  "REFEREE_ROOM",
  "VIP_SEATING",
  "OTHER",
]);


export const FacilityTypeEnum = z.enum([
  "FIELD",
  "COURT",
  "POOL",
  "ARENA",
  "ROOM",
  "TRACK",
  "OTHER",
]);

export type AmenityType = z.infer<typeof AmenityTypeEnum>;
export type FacilityType = z.infer<typeof FacilityTypeEnum>;
