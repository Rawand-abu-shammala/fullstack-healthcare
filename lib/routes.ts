import type { Roles } from "@/types/globals";

export const routeAccess: Record<string, Roles[]> = {
  "/admin(.*)": ["ADMIN"],
  "/doctor(.*)": ["DOCTOR"],
  "/patient(.*)": ["PATIENT", "ADMIN", "DOCTOR"],

  "/record/users": ["ADMIN"],
  "/record/appointments(.*)": ["ADMIN", "DOCTOR", "NURSE", "PATIENT"],
  "/record/medical-records(.*)": ["ADMIN", "DOCTOR", "NURSE"],
  "/record/billing(.*)": ["ADMIN", "DOCTOR"],
  "/record/doctors(.*)": ["ADMIN", "DOCTOR"],
  "/record/patients": ["ADMIN", "DOCTOR", "NURSE"],
  "/record/staffs": ["ADMIN", "DOCTOR"],
};