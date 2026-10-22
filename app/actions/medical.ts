"use server";

import { DiagnosisFormData } from "@/components/dialogs/add-diagnosis";
import { prisma } from "@/lib/db";
import {
  DiagnosisSchema,
  PatientBillSchema,
  PaymentSchema,
} from "@/lib/schema";
import { auth } from "@clerk/nextjs/server";
import { checkRole } from "@/utils/roles";

const canManageBilling = async () =>
  (await checkRole("ADMIN")) || (await checkRole("DOCTOR"));

export const addDiagnosis = async (
  data: DiagnosisFormData,
  appointmentId: string
) => {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const isAuthorizedStaff =
      (await checkRole("ADMIN")) ||
      (await checkRole("DOCTOR")) ||
      (await checkRole("NURSE"));
    if (!isAuthorizedStaff) return { error: "Unauthorized" };

    const parsed = DiagnosisSchema.safeParse(data);
    const numericAppointmentId = Number(appointmentId);
    if (
      !parsed.success ||
      !Number.isSafeInteger(numericAppointmentId) ||
      numericAppointmentId <= 0
    ) {
      return { error: "Invalid diagnosis data" };
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: numericAppointmentId },
      select: { id: true, patient_id: true, doctor_id: true },
    });
    if (
      !appointment ||
      parsed.data.patient_id !== appointment.patient_id ||
      parsed.data.doctor_id !== appointment.doctor_id ||
      ((await checkRole("DOCTOR")) && appointment.doctor_id !== userId)
    ) {
      return { error: "Unauthorized" };
    }

    let medicalId = parsed.data.medical_id
      ? Number(parsed.data.medical_id)
      : undefined;
    if (medicalId) {
      const record = await prisma.medicalRecords.findFirst({
        where: {
          id: medicalId,
          appointment_id: appointment.id,
          patient_id: appointment.patient_id,
          doctor_id: appointment.doctor_id,
        },
        select: { id: true },
      });
      if (!record) return { error: "Invalid medical record" };
    } else {
      const record = await prisma.medicalRecords.create({
        data: {
          patient_id: appointment.patient_id,
          doctor_id: appointment.doctor_id,
          appointment_id: appointment.id,
        },
        select: { id: true },
      });
      medicalId = record.id;
    }

    const { medical_id: _medicalId, ...diagnosisData } = parsed.data;
    void _medicalId;
    await prisma.diagnosis.create({
      data: {
        ...diagnosisData,
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id,
        medical_id: medicalId,
      },
    });

    return {
      success: true,
      message: "Diagnosis added successfully",
      status: 201,
    };
  } catch (error) {
    console.error("Failed to add diagnosis", error);
    return { error: "Failed to add diagnosis" };
  }
};

export async function addNewBill(data: unknown) {
  try {
    const { userId } = await auth();
    if (!userId || !(await canManageBilling())) {
      return { success: false, msg: "You are not authorized to add a bill" };
    }

    const parsed = PatientBillSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, msg: "Invalid bill data" };
    }

    const appointmentId = Number(parsed.data.appointment_id);
    const serviceId = Number(parsed.data.service_id);
    const quantity = Number(parsed.data.quantity);
    const serviceDate = new Date(parsed.data.service_date);
    if (
      !Number.isSafeInteger(appointmentId) ||
      appointmentId <= 0 ||
      !Number.isSafeInteger(serviceId) ||
      serviceId <= 0 ||
      !Number.isSafeInteger(quantity) ||
      quantity <= 0 ||
      Number.isNaN(serviceDate.getTime())
    ) {
      return { success: false, msg: "Invalid bill data" };
    }

    const [appointment, service] = await Promise.all([
      prisma.appointment.findUnique({
        where: { id: appointmentId },
        select: { id: true, patient_id: true, doctor_id: true },
      }),
      prisma.services.findUnique({
        where: { id: serviceId },
        select: { id: true, price: true },
      }),
    ]);
    if (!appointment || !service) {
      return { success: false, msg: "Appointment or service not found" };
    }

    if ((await checkRole("DOCTOR")) && appointment.doctor_id !== userId) {
      return { success: false, msg: "Unauthorized" };
    }

    let payment = null;
    const requestedPaymentId = Number(parsed.data.bill_id);
    if (Number.isSafeInteger(requestedPaymentId) && requestedPaymentId > 0) {
      payment = await prisma.payment.findFirst({
        where: { id: requestedPaymentId, appointment_id: appointmentId },
        select: { id: true },
      });
      if (!payment) {
        return { success: false, msg: "Invalid appointment bill" };
      }
    } else {
      payment = await prisma.payment.findUnique({
        where: { appointment_id: appointmentId },
        select: { id: true },
      });
      if (!payment) {
        payment = await prisma.payment.create({
          data: {
            appointment_id: appointmentId,
            patient_id: appointment.patient_id,
            bill_date: new Date(),
            payment_date: new Date(),
            discount: 0,
            amount_paid: 0,
            total_amount: 0,
          },
          select: { id: true },
        });
      }
    }

    await prisma.patientBills.create({
      data: {
        bill_id: payment.id,
        service_id: service.id,
        service_date: serviceDate,
        quantity,
        unit_cost: service.price,
        total_cost: service.price * quantity,
      },
    });

    return {
      success: true,
      error: false,
      msg: "Bill added successfully",
    };
  } catch (error) {
    console.error("Failed to add bill", error);
    return { success: false, msg: "Internal Server Error" };
  }
}

export async function generateBill(data: unknown) {
  try {
    const { userId } = await auth();
    if (!userId || !(await canManageBilling())) {
      return { success: false, msg: "You are not authorized to generate a bill" };
    }

    const parsed = PaymentSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, msg: "Invalid bill data" };
    }

    const paymentId = Number(parsed.data.id);
    const discountPercentage = Number(parsed.data.discount);
    if (
      !Number.isSafeInteger(paymentId) ||
      paymentId <= 0 ||
      !Number.isFinite(discountPercentage) ||
      discountPercentage < 0 ||
      discountPercentage > 100
    ) {
      return { success: false, msg: "Invalid bill data" };
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: { id: true, appointment_id: true, appointment: { select: { doctor_id: true } } },
    });
    if (!payment) return { success: false, msg: "Bill not found" };
    if ((await checkRole("DOCTOR")) && payment.appointment.doctor_id !== userId) {
      return { success: false, msg: "Unauthorized" };
    }

    const billTotal = await prisma.patientBills.aggregate({
      where: { bill_id: payment.id },
      _sum: { total_cost: true },
    });
    const totalAmount = billTotal._sum.total_cost ?? 0;
    const discountAmount = (discountPercentage / 100) * totalAmount;

    await prisma.$transaction([
      prisma.payment.update({
        data: {
          bill_date: parsed.data.bill_date,
          discount: discountAmount,
          total_amount: totalAmount,
        },
        where: { id: payment.id },
      }),
      prisma.appointment.update({
        data: { status: "COMPLETED" },
        where: { id: payment.appointment_id },
      }),
    ]);

    return {
      success: true,
      error: false,
      msg: "Bill generated successfully",
    };
  } catch (error) {
    console.error("Failed to generate bill", error);
    return { success: false, msg: "Internal Server Error" };
  }
}