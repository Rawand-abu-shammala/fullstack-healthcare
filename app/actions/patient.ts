"use server";

import { prisma } from "@/lib/db";
import { PatientFormSchema } from "@/lib/schema";
import { checkRole } from "@/utils/roles";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function updatePatient(data: unknown, pid: string) {
  try {
    const { userId } = await auth();
    const isAdmin = await checkRole("ADMIN");
    if (!userId || (userId !== pid && !isAdmin)) {
      return { success: false, error: true, msg: "Unauthorized" };
    }

    const validated = PatientFormSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: true,
        msg: "Provide all required fields",
      };
    }

    const patientData = validated.data;
    const client = await clerkClient();
    await client.users.updateUser(pid, {
      firstName: patientData.first_name,
      lastName: patientData.last_name,
    });

    await prisma.patient.update({
      data: patientData,
      where: { id: pid },
    });

    return {
      success: true,
      error: false,
      msg: "Patient info updated successfully",
    };
  } catch (error) {
    console.error("Failed to update patient", error);
    return { success: false, error: true, msg: "Unable to update patient" };
  }
}

export async function createNewPatient(data: unknown, pid: string) {
  try {
    const { userId } = await auth();
    const isAdmin = await checkRole("ADMIN");
    const isPatient = await checkRole("PATIENT");
    if (
      !userId ||
      (pid === "new-patient" ? !isAdmin : pid !== userId ? !isAdmin : !isAdmin && !isPatient)
    ) {
      return { success: false, error: true, msg: "Unauthorized" };
    }

    const validated = PatientFormSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: true,
        msg: "Provide all required fields",
      };
    }

    const patientData = validated.data;
    const client = await clerkClient();
    let patientId = pid;

    if (pid === "new-patient") {
      const user = await client.users.createUser({
        emailAddress: [patientData.email],
        password: patientData.phone,
        firstName: patientData.first_name,
        lastName: patientData.last_name,
        publicMetadata: { role: "patient" },
      });
      patientId = user.id;
    } else {
      await client.users.updateUser(pid, {
        publicMetadata: { role: "patient" },
      });
    }

    await prisma.patient.create({
      data: {
        ...patientData,
        id: patientId,
      },
    });

    return {
      success: true,
      error: false,
      msg: "Patient created successfully",
    };
  } catch (error) {
    console.error("Failed to create patient", error);
    return { success: false, error: true, msg: "Unable to create patient" };
  }
}