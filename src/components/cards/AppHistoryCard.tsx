'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { type DatacapAllocation } from '@/type'

interface ComponentProps {
  allocation: DatacapAllocation
}

const AppHistoryCard: React.FC<ComponentProps> = ({ allocation }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-md font-medium">Allocation Amount</CardTitle>
        <span className="bg-green-400 p-0.5 px-1 text-sm">
          {allocation.request_information.allocation_amount}
        </span>
      </CardHeader>

      <CardContent>
        <Separator className="my-2" />
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="text-sm text-muted-foreground">Triggered by</div>
            <div>
              <a
                href={`https://github.com/${allocation.request_information.actor}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                @{allocation.request_information.actor}
              </a>
            </div>
          </div>
        </div>

        {allocation.signers.length > 0 && (
          <>
            <Separator className="my-2" />
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="text-sm text-muted-foreground">Proposed by</div>
                <div>@{allocation.signers[0].username}</div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground">signer address</div>
                <div>
                  <div>{allocation.signers[0].signing_address}</div>
                </div>
              </div>
            </div>
          </>
        )}

        {allocation.signers.length > 1 && (
          <>
            <Separator className="my-2" />
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="text-sm text-muted-foreground">Approved by</div>
                <div>@{allocation.signers[0].username}</div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground">signer address</div>
                <div>
                  <div>{allocation.signers[1].signing_address}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default AppHistoryCard
