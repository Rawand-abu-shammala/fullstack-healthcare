"use server";

import { prisma } from "@/lib/db";
import {
  DoctorSchema,
  ServicesSchema,
  StaffSchema,
  WorkingDaysSchema,
} from "@/lib/schema";
import { generateRandomColor } from "@/utils";
import { checkRole } from "@/utils/roles";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function createNewStaff(data: any) {
  try {
    const { userId } = await auth();
    if (!userId || !(await checkRole("ADMIN"))) {
      return { success: false, msg: "Unauthorized" };
    }

    const values = StaffSchema.safeParse(data);
    if (!values.success) {
      return {
        success: false,
        errors: true,
        message: "Please provide all required info",
      };
    }

    const validatedValues = values.data;
    const [firstName, ...lastNameParts] = validatedValues.name.split(/\s+/);
    const client = await clerkClient();
    const user = await client.users.createUser({
      emailAddress: [validatedValues.email],
      password: validatedValues.password,
      firstName,
      lastName: lastNameParts.join(" "),
      publicMetadata: { role: validatedValues.role.toLowerCase() },
    });

    delete validatedValues.password;
    await prisma.staff.create({
      data: {
        ...validatedValues,
        colorCode: generateRandomColor(),
        id: user.id,
        status: "ACTIVE",
      },
    });

    return {
      success: true,
      message: "Staff added successfully",
      error: false,
    };
  } catch (error) {
    console.error("Failed to create staff member", error);
    return { error: true, success: false, message: "Something went wrong" };
  }
}

export async function createNewDoctor(data: any) {
  try {
    const { userId } = await auth();
    if (!userId || !(await checkRole("ADMIN"))) {
      return { success: false, msg: "Unauthorized" };
    }

    const values = DoctorSchema.safeParse(data);
    const workingDaysValues = WorkingDaysSchema.safeParse(data?.work_schedule);
    if (!values.success || !workingDaysValues.success) {
      return {
        success: false,
        errors: true,
        message: "Please provide all required info",
      };
    }

    const validatedValues = values.data;
    const workingDayData = workingDaysValues.data ?? [];
    const [firstName, ...lastNameParts] = validatedValues.name.split(/\s+/);
    const client = await clerkClient();
    const user = await client.users.createUser({
      emailAddress: [validatedValues.email],
      password: validatedValues.password,
      firstName,
      lastName: lastNameParts.join(" "),
      publicMetadata: { role: "doctor" },
    });

    delete validatedValues.password;
    const doctor = await prisma.doctor.create({
      data: {
        ...validatedValues,
        id: user.id,
      },
    });

    await Promise.all(
      workingDayData.map((day) =>
        prisma.workingDays.create({
          data: { ...day, doctor_id: doctor.id },
        })
      )
    );

    return {
      success: true,
      message: "Doctor added successfully",
      error: false,
    };
  } catch (error) {
    console.error("Failed to create doctor", error);
    return { error: true, success: false, message: "Something went wrong" };
  }
}

export async function addNewService(data: any) {
  try {
    const { userId } = await auth();
    if (!userId || !(await checkRole("ADMIN"))) {
      return { success: false, msg: "Unauthorized" };
    }

    const validated = ServicesSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, msg: "Invalid service data" };
    }

    const price = Number(validated.data.price);
    if (!Number.isFinite(price) || price < 0) {
      return { success: false, msg: "Invalid service price" };
    }

    await prisma.services.create({
      data: { ...validated.data, price },
    });

    return {
      success: true,
      error: false,
      msg: "Service added successfully",
    };
  } catch (error) {
    console.error("Failed to create service", error);
    return { success: false, msg: "Internal Server Error" };
  }
}