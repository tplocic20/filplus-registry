'use client'
import { type DatacapAllocation } from '@/type'
import AppHistoryCard from './cards/AppHistoryCard'

interface ComponentProps {
  datacapAllocations: DatacapAllocation[]
}

const AppHistory: React.FC<ComponentProps> = ({
  datacapAllocations,
}: ComponentProps) => {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-6">
        Application History
      </h2>
      <div className="grid gap-4 max-w-xl">
        {datacapAllocations.length === 0 ? (
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            No allocation yet.
          </div>
        ) : (
          datacapAllocations.map((allocation) => (
            <AppHistoryCard
              key={allocation.request_information.uuid}
              allocation={allocation}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default AppHistory
