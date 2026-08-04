import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server"
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="flex flex-col items-center justify-center h-screen p-6">
      <div className="flex-1 flex flex-col items-center justify-center">

      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-center">
          Welcome to <br />
          <span className="text-blue-700 text-5xl md:text-6xl">
            kinda HMS
          </span>
        </h1>
      </div>

      <div className="text-center max-w-xl flex flex-col items-center justify-center">
        <p className="mb-8">
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
          Cum quasi obcaecati id voluptates eius? Consectetur similique
          inventore vel repellendus, accusantium
        </p>

        <div className="flex gap-4">
          {userId ? (
            <>
            <Button>
            <Link href={"/dashboard"}>
               View Dashboard
            </Link>
            </Button>
            <UserButton/>
            </>
          ) : (
            <>
            <Button className="md:text-base font-light">
            <Link href="/sign-up">
                New Patient
            </Link>
            </Button>

              <Button
               variant="outline"
               className="md:text-base hover:text-blue-600"
               >
                <Link href="/sign-in">
                Login to account
                </Link>
                </Button>
            
            </>
          )}
        </div>
      </div>
    </div>
      <footer className="mt-8">
        <p className="text-center text-sm capitalize">
          &copy; 2026 kinda hospital Mangement system. all rights reserved
        </p>
      </footer>
    </div>
  );
}




