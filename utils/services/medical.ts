import { prisma } from "@/lib/db";
import { format } from "date-fns";

export const getVitalSignData = async (id: string) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const data = await prisma.vitalSigns.findMany({
    where: {
      patient_id: id,
      created_at: {
        gte: sevenDaysAgo,
      },
    },
    select: {
      created_at: true,
      systolic: true,
      diastolic: true,
      heartRate: true,
    },
    orderBy: {
      created_at: "asc",
    },
  });
  // 56 - 60
  const formatVitals = data?.map((record) => ({
    label: format(new Date(record.created_at), "MMM d"),
    systolic: record.systolic,
    diastolic: record.diastolic,
  }));

  const formattedData = data.map((record) => {
    const [parsedValue1, parsedValue2] = record.heartRate
      .split("-")
      .map((rate) => Number.parseInt(rate.trim(), 10));
    const value1 = Number.isFinite(parsedValue1) ? parsedValue1 : 0;

    return {
      label: format(new Date(record.created_at), "MMM d"),
      value1,
      value2: Number.isFinite(parsedValue2) ? parsedValue2 : value1,
    };
  });

  const totalSystolic = data?.reduce((sum, acc) => sum + acc.systolic, 0);
  const totalDiastolic = data?.reduce((sum, acc) => sum + acc.diastolic, 0);

  const totalValue1 = formattedData?.reduce((sum, acc) => sum + acc.value1, 0);
  const totalValue2 = formattedData?.reduce((sum, acc) => sum + acc.value2, 0);

  const count = data?.length;

  const averageSystolic = count ? totalSystolic / count : 0;
  const averageDiastolic = count ? totalDiastolic / count : 0;

  const averageValue1 = count ? totalValue1 / count : 0;
  const averageValue2 = count ? totalValue2 / count : 0;

  const average = `${averageSystolic.toFixed(2)}/${averageDiastolic.toFixed(
    2
  )} mmHg`;
  const averageHeartRate = `${averageValue1.toFixed(2)}-${averageValue2.toFixed(
    2
  )} bpm`;

  return {
    data: formatVitals,
    average,
    heartRateData: formattedData,
    averageHeartRate,
  };
};
