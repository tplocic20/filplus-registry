'use client'
import AppHistory from '@/components/AppHistory'
import AppInfo from '@/components/AppInfo'
import { getApplicationById } from '@/lib/apiClient'
import { useEffect } from 'react'
import { useQuery } from 'react-query'

interface ComponentProps {
  params: {
    id: string
  }
}

const ApplicationDetailPage: React.FC<ComponentProps> = ({
  params: { id },
}: {
  params: { id: string }
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['posts', id],
    queryFn: async () => await getApplicationById(id),
  })

  if (isLoading) return <div>Loading...</div>

  if (data != null)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 px-10 mt-10">
        <AppHistory datacapAllocations={data.info.datacap_allocations} />
        <AppInfo application={data} />
      </div>
    )
}

export default ApplicationDetailPage
