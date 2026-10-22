"use server";

import { ReviewFormValues, reviewSchema } from "@/components/dialogs/review-form";
import { prisma } from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { checkRole } from "@/utils/roles";

export async function deleteDataById(
  id: string,
  deleteType: "doctor" | "staff" | "patient" | "payment" | "bill"
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: "Unauthorized", status: 401 };
    }

    const isAdmin = await checkRole("ADMIN");
    const isDoctor = await checkRole("DOCTOR");
    if (!isAdmin && !(deleteType === "bill" && isDoctor)) {
      return { success: false, message: "Unauthorized", status: 403 };
    }
    if (deleteType === "bill" && !isAdmin) {
      const bill = await prisma.patientBills.findUnique({
        where: { id: Number(id) },
        select: { payment: { select: { appointment: { select: { doctor_id: true } } } } },
      });
      if (!bill || bill.payment.appointment.doctor_id !== userId) {
        return { success: false, message: "Unauthorized", status: 403 };
      }
    }

    switch (deleteType) {
      case "doctor":
        await prisma.doctor.delete({ where: { id } });
        break;
      case "staff":
        await prisma.staff.delete({ where: { id } });
        break;
      case "patient":
        await prisma.patient.delete({ where: { id } });
        break;
      case "payment":
        await prisma.payment.delete({ where: { id: Number(id) } });
        break;
      case "bill":
        await prisma.$transaction(async (tx) => {
          const bill = await tx.patientBills.delete({
            where: { id: Number(id) },
            select: { bill_id: true },
          });
          const billTotal = await tx.patientBills.aggregate({
            where: { bill_id: bill.bill_id },
            _sum: { total_cost: true },
          });
          await tx.payment.update({
            where: { id: bill.bill_id },
            data: { total_amount: billTotal._sum.total_cost ?? 0 },
          });
        });
        break;
    }

    if (deleteType === "staff" || deleteType === "patient" || deleteType === "doctor") {
      const client = await clerkClient();
      await client.users.deleteUser(id);
    }

    return {
      success: true,
      message: "Data deleted successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Failed to delete record", error);
    return {
      success: false,
      message: "Internal Server Error",
      status: 500,
    };
  }
}

export async function createReview(values: ReviewFormValues) {
  try {
    const { userId } = await auth();
    if (!userId || !(await checkRole("PATIENT"))) {
      return { success: false, message: "Unauthorized", status: 401 };
    }

    const validatedFields = reviewSchema.parse(values);
    if (validatedFields.patient_id !== userId) {
      return { success: false, message: "Unauthorized", status: 403 };
    }

    await prisma.rating.create({ data: validatedFields });

    return {
      success: true,
      message: "Review created successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Failed to create review", error);
    return {
      success: false,
      message: "Internal Server Error",
      status: 500,
    };
  }
}
