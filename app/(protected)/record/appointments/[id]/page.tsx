import { AppointmentDetails } from "@/components/appointment/appointment-details";
import AppointmentQuickLinks from "@/components/appointment/appointment-quick-links";
import { BillsContainer } from "@/components/appointment/bills-container";
import ChartContainer from "@/components/appointment/chart-container";
import { DiagnosisContainer } from "@/components/appointment/diagnosis-container";
import { PatientDetailsCard } from "@/components/appointment/patient-details-card";
import { PaymentsContainer } from "@/components/appointment/payment-container";
import { VitalSigns } from "@/components/appointment/vital-signs";
import { MedicalHistoryContainer } from "@/components/medical-history-container";
import { getAppointmentWithMedicalRecordsById } from "@/utils/services/appointment";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { getRole } from "@/utils/roles";

const AppointmentDetailsPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const { id } = await params;
  const search = await searchParams;
  const cat = (search?.cat as string) || "charts";
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data } = await getAppointmentWithMedicalRecordsById(Number(id));
  if (!data) {
    return (
      <div className="p-6">
        <p className="text-center text-gray-500">Appointment not found.</p>
      </div>
    );
  }

  const role = await getRole();
  if (
    (role === "PATIENT" && data.patient_id !== userId) ||
    (role === "DOCTOR" && data.doctor_id !== userId)
  ) {
    notFound();
  }

  return (
    <div className="flex p-6 flex-col-reverse lg:flex-row w-full min-h-screen gap-10">
      <div className="w-full lg:w-[65%] flex flex-col gap-6">
        {cat === "charts" && <ChartContainer id={data.patient_id} />}
        {cat === "appointments" && (
          <>
            <AppointmentDetails
              id={data.id}
              appointment_date={data.appointment_date}
              time={data.time}
              notes={data.note}
            />
            <VitalSigns
              id={id}
              patientId={data.patient_id}
              doctorId={data.doctor_id}
            />
          </>
        )}
        {cat === "diagnosis" && (
          <DiagnosisContainer
            id={id}
            patientId={data.patient_id}
            doctorId={data.doctor_id}
          />
        )}
        {cat === "medical-history" && (
          <MedicalHistoryContainer patientId={data.patient_id} />
        )}
        {cat === "billing" && <BillsContainer id={id} />}
        {cat === "payments" && (
          <PaymentsContainer patientId={data.patient_id} />
        )}
      </div>
      <div className="flex-1 space-y-6">
        <AppointmentQuickLinks staffId={String(data.doctor_id)} />
        <PatientDetailsCard data={data.patient} />
      </div>
    </div>
  );
};

export default AppointmentDetailsPage;