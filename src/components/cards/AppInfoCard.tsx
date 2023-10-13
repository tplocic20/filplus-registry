import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Modal } from '@/components/ui/modal'
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
    walletError,
    initializeWallet,
    message,
  } = useApplicationActions(initialApplication)
  const [buttonText, setButtonText] = useState('')
  const [modalMessage, setModalMessage] = useState<string | null>(null)
  const [error, setError] = useState<boolean>(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [isWalletConnecting, setIsWalletConnecting] = useState(false)

  useEffect(() => {
    setModalMessage(message)
  }, [message])

  const handleMutationError = (error: Error): void => {
    let message = error.message
    if (error.message.includes('Locked device')) {
      message = 'Please unlock your ledger device.'
    }
    if (error.message.includes('already approved')) {
      message = 'You have already approved this request.'
    }
    setModalMessage(message)
    setError(true)
    if (
      error.message.includes('DisconnectedDeviceDuringOperation') ||
      error.message.includes('Locked device')
    ) {
      setWalletConnected(false)
    }
  }

  /**
   * Handles the connect ledger button click event.
   *
   * @returns {Promise<void>} - Returns a promise that resolves when the wallet is connected.
   */
  const handleConnectLedger = async (): Promise<void> => {
    try {
      setIsWalletConnecting(true)
      const ret = await initializeWallet()
      if (ret) setWalletConnected(true)
      setIsWalletConnecting(false)
      return
    } catch (error) {
      console.error('Error initializing ledger:', error)
    }
    setIsWalletConnecting(false)
    setWalletConnected(false)
  }

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
  }, [application.info.application_lifecycle.state, isApiCalling, session])

  useEffect(() => {
    if (walletError != null) {
      setError(true)
      setModalMessage(walletError.message)
    }
  }, [walletError])

  /**
   * Handles the modal close event.
   */
  const handleCloseModal = (): void => {
    setError(false)
    setModalMessage(null)
  }

  /**
   * Handles the button click event.
   * Depending on the application status, it triggers a respective API action.
   */
  const handleButtonClick = async (): Promise<void> => {
    setApiCalling(true)
    const requestId = application.info.datacap_allocations.find(
      (alloc) => alloc.request_information.is_active,
    )?.request_information.request_id

    const userName = session.data?.user?.githubUsername

    try {
      switch (application.info.application_lifecycle.state) {
        case 'GovernanceReview':
          if (userName != null) {
            await mutationTrigger.mutateAsync(userName)
          }
          break
        case 'Proposal':
          if (requestId != null && userName != null) {
            await mutationProposal.mutateAsync({ requestId, userName })
          }
          break
        case 'Approval':
          if (requestId != null && userName != null) {
            await mutationApproval.mutateAsync({ requestId, userName })
          }
          break
        default:
          console.warn('Unknown state')
      }
    } catch (error) {
      handleMutationError(error as Error)
    }
    setApiCalling(false)
  }

  return (
    <div>
      {modalMessage != null && (
        <Modal
          message={modalMessage}
          onClose={handleCloseModal}
          error={error}
        />
      )}
      {(isApiCalling || isWalletConnecting) && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <Spinner />
        </div>
      )}
      <Card>
        <CardHeader></CardHeader>
        <CardContent className="grid gap-4 text-sm">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">ID</p>
            <p className="font-medium leading-none">{application.id}</p>
          </div>
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
        {application.info.application_lifecycle.state !== 'Confirmed' &&
          session?.data?.user?.name !== undefined && (
            <CardFooter className="flex">
              {(walletConnected ||
                application.info.application_lifecycle.state ===
                  'GovernanceReview') && (
                <Button
                  onClick={() => void handleButtonClick()}
                  disabled={isApiCalling}
                >
                  {buttonText}
                </Button>
              )}

              {!walletConnected &&
                application.info.application_lifecycle.state !==
                  'GovernanceReview' && (
                  <Button
                    onClick={() => void handleConnectLedger()}
                    disabled={
                      isWalletConnecting ||
                      isApiCalling ||
                      application.info.application_lifecycle.state ===
                        'Confirmed' ||
                      application.info.application_lifecycle.state ===
                        'GovernanceReview'
                    }
                  >
                    Connect Ledger
                  </Button>
                )}
            </CardFooter>
          )}
      </Card>
    </div>
  )
}

export default AppInfoCard
