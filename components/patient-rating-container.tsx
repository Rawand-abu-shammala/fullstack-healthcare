import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import React from "react";
import RatingList from "./rating-list";

async function PatientRatingContainer({ id }: { id?: string }) {
     const { userId } = await auth();

  const data = await prisma.rating.findMany({
    take: 10,

    where: { patient_id: id ? id : userId! },
    include: { patient: { select: { last_name: true, first_name: true } } },
    orderBy: { created_at: "desc" },
  });

  if (!data) return null;

  return (
    <div>
      <RatingList data={data} />
    </div>
  )
}

export default PatientRatingContainer