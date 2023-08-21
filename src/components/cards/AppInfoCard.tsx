'use client'
import { useEffect, useState } from 'react'
import { useQueryClient } from 'react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { type Application } from '@/type'
import {
  postApplicationTrigger,
  postApplicationProposal,
  postApplicationApproval,
} from '@/lib/apiClient'

import { useSession } from 'next-auth/react'

interface ComponentProps {
  application: Application
}

const AppInfoCard: React.FC<ComponentProps> = ({ application }) => {
  const session = useSession()
  const queryClient = useQueryClient()
  const [isApiCalling, setApiCalling] = useState(false)
  const [buttonText, setButtonText] = useState('')

  useEffect(() => {
    if (isApiCalling) {
      setButtonText('Procesando...')
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

  console.log(application)

  const userName = session.data?.user?.name
  if (userName != null) {
    console.log(userName)
  }

  const requestId = application.info.datacap_allocations.find(
    (alloc) => alloc.request_information.is_active,
  )?.request_information.request_id

  const handleButtonClick = async (): Promise<void> => {
    setApiCalling(true)
    try {
      switch (application.info.application_lifecycle.state) {
        case 'GovernanceReview':
          if (userName != null) {
            await postApplicationTrigger(application.id, userName)
          } else {
            console.warn('Actor (GitHub id) is not provided.')
          }
          break
        case 'Proposal':
          if (requestId == null) throw new Error('Request ID is not provided.')
          await postApplicationProposal(application.id, requestId)
          break
        case 'Approval':
          if (requestId == null) throw new Error('Request ID is not provided.')
          await postApplicationApproval(application.id, requestId)
          break
        default:
          console.warn(
            'Unknown application lifecycle state:',
            application.info.application_lifecycle.state,
          )
      }
      await queryClient.invalidateQueries(['application'])
      await queryClient.refetchQueries(['application'])

      // Handle or display the 'result' if needed.
    } catch (error) {
      console.error('Error handling button click:', error)
    } finally {
      setApiCalling(false) // <-- Luego de completar la llamada a la API
    }
  }

  return (
    <div>
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
        </CardContent>
        {application.info.application_lifecycle.state !== 'Confirmed' && (
          <CardFooter className="flex">
            <Button
              className="w-full"
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
