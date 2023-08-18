'use client'
import { type CoreInformation } from '@/type'
import React from 'react'
import AppInfoCard from './cards/AppInfoCard'

interface ComponentProps {
  coreInformation: CoreInformation
}

const AppInfo: React.FC<ComponentProps> = ({
  coreInformation,
}: ComponentProps) => {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-6">
        Application Info
      </h2>
      <AppInfoCard coreInformation={coreInformation} />
    </div>
  )
}

export default AppInfo
