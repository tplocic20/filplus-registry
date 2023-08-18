import { type Application } from '@/type'
import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'

interface Props {
  application: Application
}

const HomePageCard: React.FC<Props> = ({ application }) => {
  return (
    <Card>
      <CardHeader></CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <div className="flex items-center justify-between border-b border-gray-300 pb-2">
          <p className="text-gray-500">Data Owner Name</p>
          <p className="font-medium leading-none">
            {application.info.core_information.data_owner_name}
          </p>
        </div>
        <div className="flex items-center justify-between border-b border-gray-300 pb-2">
          <p className="text-gray-500">Data Owner Region</p>
          <p className="font-medium leading-none">
            {application.info.core_information.data_owner_region}
          </p>
        </div>
        <div className="flex items-center justify-between border-b border-gray-300 pb-2">
          <p className="text-gray-500">Data Owner Industry</p>
          <p className="font-medium leading-none">
            {application.info.core_information.data_owner_industry}
          </p>
        </div>
        <div className="flex items-center justify-between border-b border-gray-300 pb-2">
          <p className="text-gray-500">State</p>
          <p className="font-medium leading-none">
            {application.info.application_lifecycle.state}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-500">Website</p>
          <p className="font-medium leading-none">
            {application.info.core_information.website}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex">
        <Button asChild className="w-full">
          <Link href={`/application/${application.id}`}>Detail</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default HomePageCard
