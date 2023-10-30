'use client'

import { type Application } from '@/type'
import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '../ui/button'
import Link from 'next/link'
import { shortenUrl } from '@/lib/utils'
import { requestTypeColor, stateColor, stateMapping } from '@/lib/constants'

export const columns: Array<ColumnDef<Application>> = [
  {
    accessorKey: 'ID',
    header: 'ID',
  },
  {
    accessorKey: 'Client.Name',
    header: 'Data Owner Name',
  },
  {
    accessorKey: 'Client.Region',
    header: 'Data Owner Region',
  },
  {
    accessorKey: 'Client.Industry',
    header: 'Data Owner Industry',
  },
  {
    accessorKey: 'Lifecycle.State',
    header: 'Status',
    cell: ({ row }) => {
      const requestType = row.original['Allocation Requests'].find(
        (alloc) => alloc.Active,
      )?.['Request Type']

      const stateLabel =
        stateMapping[
          row.original.Lifecycle.State as keyof typeof stateMapping
        ] ?? row.original.Lifecycle.State

      return (
        <div className="flex items-center">
          <span
            className={`px-2 py-1 rounded text-xs ${
              stateColor[
                row.original.Lifecycle.State as keyof typeof stateColor
              ]
            }`}
          >
            {stateLabel}
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
        href={row.original.Client.Website}
        target="_blank"
        rel="noopener noreferrer"
      >
        {shortenUrl(row.original.Client.Website, 18, 8)}
      </a>
    ),
  },
  {
    id: 'detail',
    cell: ({ row }) => (
      <Button asChild className="flex w-1/2 mx-auto">
        <Link href={`/application/${row.original.ID}`}>Detail</Link>
      </Button>
    ),
  },
]
