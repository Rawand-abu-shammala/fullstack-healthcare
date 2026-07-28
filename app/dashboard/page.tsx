import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-3xl font-bold">
        Healthcare Dashboard
      </h1>

      <p className="mt-4">
        Welcome! Your account is protected by Clerk.
      </p>

      <div className="mt-6">
        <UserButton />
      </div>
    </main>
  );
}