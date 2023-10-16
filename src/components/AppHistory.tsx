'use client'
import { type DatacapAllocation } from '@/type'
import AppHistoryCard from './cards/AppHistoryCard'
import moment from 'moment'

interface ComponentProps {
  datacapAllocations: DatacapAllocation[]
}

const AppHistory: React.FC<ComponentProps> = ({
  datacapAllocations,
}: ComponentProps) => {
  const sortedAllocations = [...datacapAllocations].sort((a, b) => {
    return (
      moment(b.request_information.created_at).valueOf() -
      moment(a.request_information.created_at).valueOf()
    )
  })

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-6">
        Application History
      </h2>
      <div className="grid gap-4 max-w-xl">
        {sortedAllocations.length === 0 ? (
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            No allocation yet.
          </div>
        ) : (
          sortedAllocations.map((allocation) => (
            <AppHistoryCard
              key={allocation.request_information.id}
              allocation={allocation}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default AppHistory
