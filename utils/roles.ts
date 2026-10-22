import type { Roles } from "@/types/globals";
import { auth } from "@clerk/nextjs/server";

export const checkRole = async (role: Roles) => {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata?.role?.toString().toUpperCase() === role;
};

export const getRole = async (): Promise<Roles> => {
  const { sessionClaims } = await auth();

  return (
    sessionClaims?.metadata?.role ?? "PATIENT"
  ).toString().toUpperCase() as Roles;
};