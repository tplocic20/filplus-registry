'use client'
import { type Application } from '@/type'
import React from 'react'
import AppInfoCard from './cards/AppInfoCard'

interface ComponentProps {
  application: Application
}

const AppInfo: React.FC<ComponentProps> = ({ application }: ComponentProps) => {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-6">
        Application Info
      </h2>
      <AppInfoCard application={application} />
    </div>
  )
}

export default AppInfo
