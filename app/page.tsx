import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Activity, ArrowUpRight, CalendarDays, ClipboardList, UsersRound } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f9f7] text-[#1c302c]">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-3" aria-label="kinda HMS home">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#155c52] text-white">
            <Activity aria-hidden="true" className="size-5" />
          </span>
          <span className="text-lg font-semibold tracking-normal">kinda HMS</span>
        </Link>
        <div className="hidden items-center gap-2 text-sm text-[#63726e] sm:flex">
          <span className="size-2 rounded-full bg-[#71a995]" />
          Healthcare management
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-153px)] w-full max-w-7xl items-center gap-12 px-5 pb-16 pt-10 sm:px-8 md:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:px-12">
        <section className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#dce7e1] bg-white/80 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#356b5e]">
            <Activity aria-hidden="true" className="size-4" />
            A clearer view of care operations
          </div>
          <h1 className="max-w-xl text-4xl font-semibold leading-[1.12] tracking-normal sm:text-5xl lg:text-6xl">
            Healthcare work, <span className="text-[#277564]">thoughtfully organized.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#61716c] sm:text-lg sm:leading-8">
            kinda HMS brings patient workflows and day-to-day hospital operations into one organized workspace.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            {userId ? (
              <>
                <Button
                  render={<Link href="/dashboard" />}
                  nativeButton={false}
                  className="h-12 w-full rounded-xl bg-[#155c52] px-5 text-sm text-white hover:bg-[#104b43] sm:w-auto"
                >
                  View Dashboard
                  <ArrowUpRight aria-hidden="true" className="ml-1 size-4" />
                </Button>
                <UserButton />
              </>
            ) : (
              <>
                <Button
                  render={<Link href="/sign-up" />}
                  nativeButton={false}
                  className="h-12 w-full rounded-xl bg-[#155c52] px-5 text-sm text-white hover:bg-[#104b43] sm:w-auto"
                >
                  New Patient
                  <ArrowUpRight aria-hidden="true" className="ml-1 size-4" />
                </Button>
                <Button
                  render={<Link href="/sign-in" />}
                  nativeButton={false}
                  variant="outline"
                  className="h-12 w-full rounded-xl border-[#d8e1dc] bg-white px-5 text-sm text-[#29413b] hover:bg-[#eff4f0] sm:w-auto"
                >
                  Login to account
                </Button>
              </>
            )}
          </div>
        </section>

        <section aria-label="Healthcare workflow overview" className="relative mx-auto w-full max-w-xl">
          <div className="absolute -right-8 -top-8 size-36 rounded-full bg-[#dcebe1] blur-2xl" />
          <div className="absolute -bottom-10 -left-8 size-40 rounded-full bg-[#f0e9d8] blur-2xl" />
          <div className="relative rounded-2xl border border-[#e1e9e4] bg-white p-5 shadow-[0_24px_70px_-40px_rgba(28,48,44,0.35)] sm:p-7">
            <div className="flex items-center justify-between border-b border-[#edf1ee] pb-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#80908a]">Workspace</p>
                <h2 className="mt-1 text-lg font-semibold">Care, in clear view</h2>
              </div>
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#eaf3ed] text-[#277564]">
                <Activity aria-hidden="true" className="size-5" />
              </span>
            </div>

            <div className="divide-y divide-[#edf1ee]">
              <div className="flex items-center gap-4 py-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#eef5f1] text-[#277564]">
                  <CalendarDays aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">Appointments</h3>
                  <p className="mt-1 text-sm leading-5 text-[#788680]">Coordinate schedules and visits</p>
                </div>
              </div>
              <div className="flex items-center gap-4 py-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#f7f1e5] text-[#92713b]">
                  <ClipboardList aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">Patient records</h3>
                  <p className="mt-1 text-sm leading-5 text-[#788680]">Keep essential details organized</p>
                </div>
              </div>
              <div className="flex items-center gap-4 py-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#f7eeec] text-[#a45e52]">
                  <UsersRound aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">Care teams</h3>
                  <p className="mt-1 text-sm leading-5 text-[#788680]">Support connected daily workflows</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-[#f5f8f5] px-4 py-3.5">
              <span className="size-2 rounded-full bg-[#71a995]" />
              <p className="text-sm text-[#53645e]">One organized place for healthcare operations</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-7xl flex-col gap-2 border-t border-[#e5ebe7] px-5 py-5 text-center text-xs text-[#7c8984] sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:text-left lg:px-12">
        <p>kinda HMS <span aria-hidden="true">·</span> Healthcare management</p>
        <p>&copy; 2026 kinda Hospital Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}




