'use client'
import AppHistory from '@/components/AppHistory'
import AppInfo from '@/components/AppInfo'
import { getApplicationById } from '@/lib/apiClient'
import { useQuery } from 'react-query'
import { Spinner } from '@/components/ui/spinner'

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

  if (isLoading)
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20">
        <Spinner />
      </div>
    )

  if (data != null)
    return (
      <div className="p-10">
        <div className="mb-10">
          <AppInfo application={data} />
        </div>
        <div>
          <AppHistory datacapAllocations={data.info.datacap_allocations} />
        </div>
      </div>
    )
}

export default ApplicationDetailPage
