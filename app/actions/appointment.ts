"use server";

import { VitalSignsFormData } from "@/components/dialogs/add-vital-signs";
import { prisma } from "@/lib/db";
import { AppointmentSchema, VitalSignsSchema } from "@/lib/schema";
import { auth } from "@clerk/nextjs/server";
import { AppointmentStatus } from "@/lib/generated/prisma/browser";
import { checkRole } from "@/utils/roles";

export async function createNewAppointment(data: unknown) {
  try {
    const { userId } = await auth();
    if (!userId || !(await checkRole("PATIENT"))) {
      return { success: false, msg: "Unauthorized" };
    }

    const validatedData = AppointmentSchema.safeParse(data);
    if (!validatedData.success) {
      return { success: false, msg: "Invalid data" };
    }

    const appointmentDate = new Date(validatedData.data.appointment_date);
    if (Number.isNaN(appointmentDate.getTime())) {
      return { success: false, msg: "Invalid appointment date" };
    }

    await prisma.appointment.create({
      data: {
        patient_id: userId,
        doctor_id: validatedData.data.doctor_id,
        time: validatedData.data.time,
        type: validatedData.data.type,
        appointment_date: appointmentDate,
        note: validatedData.data.note,
      },
    });

    return {
      success: true,
      message: "Appointment booked successfully",
    };
  } catch (error) {
    console.error("Failed to create appointment", error);
    return { success: false, msg: "Internal Server Error" };
  }
}

export async function appointmentAction(
  id: string | number,
  status: AppointmentStatus,
  reason: string
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: true, msg: "Unauthorized" };
    }

    const appointmentId = Number(id);
    if (!Number.isSafeInteger(appointmentId) || appointmentId <= 0) {
      return { success: false, error: true, msg: "Invalid appointment" };
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { id: true, patient_id: true, doctor_id: true, status: true },
    });
    if (!appointment) {
      return { success: false, error: true, msg: "Appointment not found" };
    }

    const isAdmin = await checkRole("ADMIN");
    const isDoctor = await checkRole("DOCTOR");
    const isPatient = await checkRole("PATIENT");
    const canManage =
      isAdmin || (isDoctor && appointment.doctor_id === userId);
    const canCancelOwnPending =
      isPatient &&
      appointment.patient_id === userId &&
      appointment.status === "PENDING" &&
      status === "CANCELLED";

    if (!canManage && !canCancelOwnPending) {
      return { success: false, error: true, msg: "Unauthorized" };
    }
    if (!Object.values(AppointmentStatus).includes(status)) {
      return { success: false, error: true, msg: "Invalid appointment status" };
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status, reason },
    });

    return {
      success: true,
      error: false,
      msg: `Appointment ${status.toLowerCase()} successfully`,
    };
  } catch (error) {
    console.error("Failed to update appointment", error);
    return { success: false, error: true, msg: "Internal Server Error" };
  }
}

export async function addVitalSigns(
  data: VitalSignsFormData,
  appointmentId: string,
  doctorId: string
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, msg: "Unauthorized" };
    }

    const isAuthorizedStaff =
      (await checkRole("ADMIN")) ||
      (await checkRole("DOCTOR")) ||
      (await checkRole("NURSE"));
    if (!isAuthorizedStaff) {
      return { success: false, msg: "Unauthorized" };
    }

    const validatedData = VitalSignsSchema.parse(data);
    const appointment = await prisma.appointment.findUnique({
      where: { id: Number(appointmentId) },
      select: { id: true, patient_id: true, doctor_id: true },
    });
    if (
      !appointment ||
      appointment.patient_id !== validatedData.patient_id ||
      appointment.doctor_id !== doctorId ||
      ((await checkRole("DOCTOR")) && appointment.doctor_id !== userId)
    ) {
      return { success: false, msg: "Unauthorized" };
    }

    let medicalId = validatedData.medical_id
      ? Number(validatedData.medical_id)
      : undefined;

    if (medicalId) {
      const medicalRecord = await prisma.medicalRecords.findFirst({
        where: {
          id: medicalId,
          appointment_id: appointment.id,
          patient_id: appointment.patient_id,
          doctor_id: appointment.doctor_id,
        },
        select: { id: true },
      });
      if (!medicalRecord) {
        return { success: false, msg: "Invalid medical record" };
      }
    } else {
      const medicalRecord = await prisma.medicalRecords.create({
        data: {
          patient_id: appointment.patient_id,
          appointment_id: appointment.id,
          doctor_id: appointment.doctor_id,
        },
        select: { id: true },
      });
      medicalId = medicalRecord.id;
    }

    const { medical_id, ...vitalData } = validatedData;
    void medical_id;
    await prisma.vitalSigns.create({
      data: {
        ...vitalData,
        patient_id: appointment.patient_id,
        medical_id: medicalId,
      },
    });

    return {
      success: true,
      msg: "Vital signs added successfully",
    };
  } catch (error) {
    console.error("Failed to add vital signs", error);
    return { success: false, msg: "Internal Server Error" };
  }
}