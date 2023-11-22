'use client'
import { type AllocationRequest } from '@/type'
import AppHistoryCard from './cards/AppHistoryCard'
import moment from 'moment'

interface ComponentProps {
  datacapAllocations: AllocationRequest[]
  actor: string
}

const AppHistory: React.FC<ComponentProps> = ({
  datacapAllocations,
  actor,
}: ComponentProps) => {
  const sortedAllocations = [...datacapAllocations].sort((a, b) => {
    return moment(b['Created At']).valueOf() - moment(a['Created At']).valueOf()
  })

  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight mb-6">
        Application History
      </h2>
      <div className="grid gap-4 w-full select-none">
        {sortedAllocations.length === 0 ? (
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            No allocation yet.
          </div>
        ) : (
          sortedAllocations.map((allocation) => (
            <AppHistoryCard
              key={allocation.ID}
              allocation={allocation}
              actor={actor}
            />
          ))
        )}
      </div>
    </>
  )
}

export default AppHistory
