import { type Application } from '@/type'
import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { shortenUrl } from '@/lib/utils'
import { requestTypeColor, stateColor } from '@/lib/stylesConstants'

interface Props {
  application: Application
}

const HomePageCard: React.FC<Props> = ({ application }) => {
  const requestType = application.info.datacap_allocations.find(
    (alloc) => alloc.request_information.is_active,
  )?.request_information.request_type

  return (
    <Card>
      <CardHeader></CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <div className="flex items-center justify-between border-b border-gray-300 pb-2">
          <p className="text-gray-500">ID</p>
          <p className="font-medium leading-none">{application.id}</p>
        </div>
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
          <p className="text-gray-500">Status</p>
          <p className="font-medium leading-none">
            <span
              className={`px-2 py-1 rounded text-xs ${
                stateColor[
                  application.info.application_lifecycle
                    .state as keyof typeof stateColor
                ]
              }`}
            >
              {application.info.application_lifecycle.state}
            </span>
            {requestType !== undefined && (
              <span
                className={`ml-2 px-2 py-1 rounded text-xs ${
                  requestTypeColor[
                    requestType as keyof typeof requestTypeColor
                  ] ?? requestTypeColor.default
                }`}
              >
                {requestType}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-500">Website</p>
          <p className="font-medium leading-none">
            <a
              href={application.info.core_information.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {shortenUrl(application.info.core_information.website, 18, 8)}
            </a>
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
