'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type AllocationRequest } from '@/type'
import { requestTypeColor, allocationActiveColor } from '@/lib/constants'
import { Separator } from '../ui/separator'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

interface ComponentProps {
  allocation: AllocationRequest
  actor: string
}

const AppHistoryCard: React.FC<ComponentProps> = ({ allocation, actor }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = (): void => {
    setIsExpanded(!isExpanded)
  }

  return (
    <Card className="bg-gray-50 p-4 rounded-lg shadow-lg">
      <CardHeader
        className={`pb-2 mb-4 flex justify-between w-full cursor-pointer ${
          isExpanded ? 'border-b' : ''
        }`}
        onClick={toggleExpanded}
      >
        <div className="flex justify-between w-full">
          <div>
            <CardTitle className="text-md font-medium">
              Allocation Amount:{' '}
              <span className="bg-gray-200 rounded-md px-2 py-1 text-xs">
                {allocation['Allocation Amount']}
              </span>
              <span
                className={`ml-2 px-2 py-1 rounded text-xs ${
                  requestTypeColor[
                    allocation['Request Type'] as keyof typeof requestTypeColor
                  ] ?? requestTypeColor.default
                }`}
              >
                {allocation['Request Type'] === 'First'
                  ? 'Initial'
                  : allocation['Request Type']}
              </span>
              {allocation.Active ? (
                <span
                  className={`ml-2 px-2 py-1 rounded text-xs ${allocationActiveColor.active}`}
                >
                  Active
                </span>
              ) : (
                <span
                  className={`ml-2 px-2 py-1 rounded text-xs ${allocationActiveColor.inactive}`}
                >
                  Granted
                </span>
              )}
            </CardTitle>
            {allocation['Request Type'] === 'First' && (
              <a
                href={`https://github.com/${actor}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                @{actor}
              </a>
            )}
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 text-sm mr-2">
              {new Date(allocation['Created At']).toLocaleString(undefined, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="flex flex-col space-y-2 my-2">
            <div className="flex items-center justify-between text-sm">
              <div className="text-sm text-muted-foreground">Triggered by</div>
              <div>
                <a
                  href={`https://github.com/${actor}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  @{actor}
                </a>
              </div>
            </div>
          </div>

          {allocation.Signers.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-sm text-muted-foreground">
                    Proposed by -{' '}
                    <span className="text-xs text-gray-400">
                      {new Date(
                        allocation.Signers[0].time_of_signature,
                      ).toLocaleString(undefined, {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                  <div>
                    <a
                      href={`https://github.com/${allocation.Signers[0].username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      @{allocation.Signers[0].username}
                    </a>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">Address</div>
                  <div>
                    <a
                      href={`https://filfox.info/en/address/${allocation.Signers[0].signing_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {allocation.Signers[0].signing_address}
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}

          {allocation.Signers.length > 1 && (
            <>
              <Separator className="my-4" />
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-sm text-muted-foreground">
                    Approved by -{' '}
                    <span className="text-xs text-gray-400">
                      {new Date(
                        allocation.Signers[1].time_of_signature,
                      ).toLocaleString(undefined, {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                  <div>
                    <a
                      href={`https://github.com/${allocation.Signers[1].username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      @{allocation.Signers[1].username}
                    </a>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">Address</div>
                  <div>
                    <a
                      href={`https://filfox.info/en/address/${allocation.Signers[1].signing_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {allocation.Signers[1].signing_address}
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default AppHistoryCard
