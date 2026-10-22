import { prisma } from "@/lib/db";

export async function getAllStaff({
  page,
  limit,
  search,
}: {
  page: number | string;
  limit?: number | string;
  search?: string;
}) {
  try {
    const PAGE_NUMBER = Number(page) <= 0 ? 1 : Number(page);
    const LIMIT = Number(limit) || 10;

    const SKIP = (PAGE_NUMBER - 1) * LIMIT;
    const searchTerm = search?.trim();
    const where = searchTerm
      ? {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" as const } },
            { phone: { contains: searchTerm, mode: "insensitive" as const } },
            { email: { contains: searchTerm, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [staff, totalRecords] = await Promise.all([
      prisma.staff.findMany({
        where,

        skip: SKIP,
        take: LIMIT,
      }),
      prisma.staff.count({ where }),
    ]);

    const totalPages = Math.ceil(totalRecords / LIMIT);

    return {
      success: true,
      data: staff,
      totalRecords,
      totalPages,
      currentPage: PAGE_NUMBER,
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}
