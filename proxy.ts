import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { routeAccess } from "./lib/routes";
import type { Roles } from "./types/globals";

const matchers = Object.entries(routeAccess).map(([route, allowedRoles]) => ({
  matcher: createRouteMatcher([route]),
  allowedRoles,
}));

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const url = new URL(req.url);

  const matchingRoute = matchers.find(({ matcher }) => matcher(req));

  if (!matchingRoute) {
    return NextResponse.next();
  }

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", url.origin));
  }

  const role = (sessionClaims?.metadata?.role ?? "PATIENT")
    .toString()
    .toUpperCase() as Roles;

  if (!matchingRoute.allowedRoles.includes(role)) {
    return NextResponse.redirect(
      new URL(`/${role.toLowerCase()}`, url.origin)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};


