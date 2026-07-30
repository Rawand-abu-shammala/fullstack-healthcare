import type { Roles } from "@/types/globals";

export const routeAccess: Record<string, Roles[]> = {
  "/admin(.*)": ["ADMIN"],
  "/doctor(.*)": ["DOCTOR"],
  "/patient(.*)": ["PATIENT", "ADMIN", "DOCTOR"],

  "/record/users": ["ADMIN"],
  "/record/doctors(.*)": ["ADMIN", "DOCTOR"],
  "/record/doctors": ["ADMIN", "DOCTOR"],
  "/record/patients": ["ADMIN", "DOCTOR"],
  "/record/staffs": ["ADMIN", "DOCTOR"],
};



