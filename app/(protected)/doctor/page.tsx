import React from 'react'
import { checkRole } from "@/utils/roles";
import { redirect } from "next/navigation";

async function DoctorDashboard () {
    const isDoctor =await checkRole('DOCTOR');

    if (!isDoctor) {
        redirect("/dashboard");
    }

  return (
    <div>DoctorDashboard</div>
  )
}

export default DoctorDashboard