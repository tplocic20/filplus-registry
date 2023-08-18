'use client'

import { type Application } from '@/type'
import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '../ui/button'
import Link from 'next/link'

export const columns: Array<ColumnDef<Application>> = [
  {
    accessorKey: 'info.core_information.data_owner_name',
    header: 'Data Owner Name',
  },
  {
    accessorKey: 'info.core_information.data_owner_industry',
    header: 'Data Owner Industry',
  },
  {
    accessorKey: 'info.core_information.data_owner_region',
    header: 'Data Owner Region',
  },
  {
    accessorKey: 'info.core_information.website',
    header: 'Website',
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
