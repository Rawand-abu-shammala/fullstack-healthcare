import React from 'react'
import NewPatient from '@/components/new-patient'
import { auth } from '@clerk/nextjs/server'

async function Registration() {
    const { userId } = await auth()
    const data = null
  return (
    <div className='py-6 px-3 fex justify-center'>
        <NewPatient data={data} type={!data ? "create" : "update"} />
        newPatient
    </div>
  )
}

export default Registration