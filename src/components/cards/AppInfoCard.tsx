'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { type CoreInformation } from '@/type'
import React from 'react'

interface ComponentProps {
  coreInformation: CoreInformation
}

const AppInfoCard: React.FC<ComponentProps> = ({ coreInformation }) => {
  return (
    <div>
      <Card>
        <CardHeader></CardHeader>
        <CardContent className="grid gap-4 text-sm">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Data Owner Name</p>
            <p className="font-medium leading-none">
              {coreInformation.data_owner_name}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Data Owner Region</p>
            <p className="font-medium leading-none">
              {coreInformation.data_owner_region}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Data Owner Industry</p>
            <p className="font-medium leading-none">
              {coreInformation.data_owner_industry}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Website</p>
            <p className="font-medium leading-none">
              {coreInformation.website}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Social</p>
            <p className="font-medium leading-none">
              {coreInformation.social_media}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex">
          <Button className="w-full">Approve</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default AppInfoCard
