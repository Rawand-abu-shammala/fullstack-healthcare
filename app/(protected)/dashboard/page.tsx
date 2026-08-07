import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardRedirectPage() {
  const { sessionClaims } = await auth();
  const role = sessionClaims?.metadata?.role?.toUpperCase();

  if (!role) {
    redirect("/sign-in");
  }

  switch (role) {
    case "ADMIN":
      redirect("/admin");
    case "DOCTOR":
      redirect("/doctor");
    case "PATIENT":
      redirect("/patient");
    case "NURSE":
    case "LAB TECHNICIAN":
      redirect("/record/appointments");
    default:
      redirect("/");
  }
}
