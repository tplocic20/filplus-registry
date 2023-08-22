// AppInfoCard.tsx

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { type Application } from '@/type'
import { useSession } from 'next-auth/react'
import useApplicationActions from '@/hooks/useApplicationActions'

interface ComponentProps {
  application: Application
}

/**
 * Represents an information card for a specific application.
 * Provides buttons to interact with the application.
 *
 * @component
 * @prop {Application} initialApplication - The initial data for the application.
 * @prop {UseSession} session - User session data.
 */
const AppInfoCard: React.FC<ComponentProps> = ({
  application: initialApplication,
}) => {
  const session = useSession()
  const {
    application,
    isApiCalling,
    setApiCalling,
    mutationTrigger,
    mutationProposal,
    mutationApproval,
  } = useApplicationActions(initialApplication)
  const [buttonText, setButtonText] = useState('')

  useEffect(() => {
    if (isApiCalling) {
      setButtonText('Processing...')
      return
    }

    switch (application.info.application_lifecycle.state) {
      case 'GovernanceReview':
        setButtonText('Trigger')
        break
      case 'Proposal':
        setButtonText('Propose')
        break
      case 'Approval':
        setButtonText('Approve')
        break
      case 'Confirmed':
        setButtonText('')
        break
      default:
        setButtonText('')
    }
  }, [application.info.application_lifecycle.state, isApiCalling])

  /**
   * Handles the button click event.
   * Depending on the application status, it triggers a respective API action.
   */
  const handleButtonClick = async (): Promise<void> => {
    setApiCalling(true)
    const requestId = application.info.datacap_allocations.find(
      (alloc) => alloc.request_information.is_active,
    )?.request_information.request_id

    const userName = session.data?.user?.name

    try {
      switch (application.info.application_lifecycle.state) {
        case 'GovernanceReview':
          if (userName != null) {
            mutationTrigger.mutate(userName)
          }
          break
        case 'Proposal':
          if (requestId != null) {
            mutationProposal.mutate(requestId)
          }
          break
        case 'Approval':
          if (requestId != null) {
            mutationApproval.mutate(requestId)
          }
          break
        default:
          console.warn('Unknown state')
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      {isApiCalling && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <Spinner />
        </div>
      )}
      <Card>
        <CardHeader></CardHeader>
        <CardContent className="grid gap-4 text-sm">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Data Owner Name</p>
            <p className="font-medium leading-none">
              {application.info.core_information.data_owner_name}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Data Owner Region</p>
            <p className="font-medium leading-none">
              {application.info.core_information.data_owner_region}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Data Owner Industry</p>
            <p className="font-medium leading-none">
              {application.info.core_information.data_owner_industry}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Website</p>
            <p className="font-medium leading-none">
              {application.info.core_information.website}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Social</p>
            <p className="font-medium leading-none">
              {application.info.core_information.social_media}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Status</p>
            <p className="font-medium leading-none">
              {application.info.application_lifecycle.state}
            </p>
          </div>
        </CardContent>
        {application.info.application_lifecycle.state !== 'Confirmed' && (
          <CardFooter className="flex">
            <Button
              onClick={() => void handleButtonClick()}
              disabled={isApiCalling}
            >
              {buttonText}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

export default AppInfoCard
