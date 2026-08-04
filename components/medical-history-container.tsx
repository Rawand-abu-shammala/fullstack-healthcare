import { prisma } from "@/lib/db";
import React from "react";
import { MedicalHistory } from "./medical-history";

interface DataProps {
  id?: number | string;
  patientId: string;
}

export async function MedicalHistoryContainer ({ id, patientId }: DataProps) {
  const data = await prisma.medicalRecords.findMany({
    where: { patient_id: patientId },
    include: {
      diagnosis: { include: { doctor: true } },
      lab_test: true,
    },

    orderBy: { created_at: "desc" },
  });
  return (
    <>
      <MedicalHistory data={data} isShowProfile={false} />
    </>
  );
};
