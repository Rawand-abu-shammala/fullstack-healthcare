import Image from "next/image";
import React from "react";

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex">
      <div className="w-full md:w-1/2 min-h-screen flex items-center justify-center bg-gray-100 px-4">
        {children}
      </div>

      <div className="hidden md:block relative w-1/2 min-h-screen overflow-hidden">
        <Image
          src="https://images.pexels.com/photos/6129437/pexels-photo-6129437.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="Doctors"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-8">
          <h1 className="text-4xl 2xl:text-5xl font-bold text-white">
            Kinda HMS
          </h1>
          <p className="mt-2 text-blue-300 text-base">
            You are welcome
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
