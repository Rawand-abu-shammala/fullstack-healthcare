import { UserButton, Show } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Healthcare System</h1>

      <Show when="signed-out">
        <p>You are not signed in</p>

        <Link href="/sign-in">
          Sign In
        </Link>
      </Show>

      <Show when="signed-in">
        <p>You are signed in</p>
        <UserButton />
      </Show>
    </main>
  );
}
