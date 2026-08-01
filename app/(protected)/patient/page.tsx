import React from 'react'
import { UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'


async function patientDashboard() {
  const user = await currentUser();

  const data = null;

  if (user && !data) {
    redirect("/patient/registration")
  }
  return (
    <div>
      <UserButton />
      patientDashboard
    </div>
  )
}

export default patientDashboard