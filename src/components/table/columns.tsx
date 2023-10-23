'use client'

import { type Application } from '@/type'
import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '../ui/button'
import Link from 'next/link'
import { shortenUrl } from '@/lib/utils'
import { requestTypeColor, stateColor } from '@/lib/stylesConstants'

export const columns: Array<ColumnDef<Application>> = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'info.core_information.data_owner_name',
    header: 'Data Owner Name',
  },
  {
    accessorKey: 'info.core_information.data_owner_region',
    header: 'Data Owner Region',
  },
  {
    accessorKey: 'info.core_information.data_owner_industry',
    header: 'Data Owner Industry',
  },
  {
    accessorKey: 'info.application_lifecycle.state',
    header: 'Status',
    cell: ({ row }) => {
      const requestType = row.original.info.datacap_allocations.find(
        (alloc) => alloc.request_information.is_active,
      )?.request_information.request_type

      return (
        <div className="flex items-center">
          <span
            className={`px-2 py-1 rounded text-xs ${
              stateColor[
                row.original.info.application_lifecycle
                  .state as keyof typeof stateColor
              ]
            }`}
          >
            {row.original.info.application_lifecycle.state}
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
        </div>
      )
    },
  },
  {
    accessorKey: 'info.core_information.website',
    header: 'Website',
    cell: ({ row }) => (
      <a
        href={row.original.info.core_information.website}
        target="_blank"
        rel="noopener noreferrer"
      >
        {shortenUrl(row.original.info.core_information.website, 18, 8)}
      </a>
    ),
  },
  {
    id: 'detail',
    cell: ({ row }) => (
      <Button asChild className="flex w-1/2 mx-auto">
        <Link href={`/application/${row.original.id}`}>Detail</Link>
      </Button>
    ),
  },
]
