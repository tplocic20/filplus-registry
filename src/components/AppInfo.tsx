import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Modal } from '@/components/ui/modal'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { type Application } from '@/type'
import { useSession } from 'next-auth/react'
import useApplicationActions from '@/hooks/useApplicationActions'
import { useRouter } from 'next/navigation'
import { getLastDatacapAllocation, anyToBytes } from '@/lib/utils'
import { config } from '@/config'
import { getAllowanceForAddress } from '@/lib/dmobApi'
import ProgressBar from '@/components/ui/progress-bar'
import { stateMapping } from '@/lib/constants'

interface ComponentProps {
  application: Application
}

/**
 * Represents the information for a specific application.
 * Provides buttons to interact with the application.
 *
 * @component
 * @prop {Application} initialApplication - The initial data for the application.
 * @prop {UseSession} session - User session data.
 */
const AppInfo: React.FC<ComponentProps> = ({
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
  const [progress, setProgress] = useState(0)
  const [isProgressBarLoading, setIsProgressBarLoading] = useState(true)

  const router = useRouter()

  useEffect(() => {
    setModalMessage(message)
  }, [message])

  /**
   * Fetches the datacap allowance for the application in order to calculate the progress bar.
   */
  useEffect(() => {
    const fetchDatacap = async (): Promise<void> => {
      const address = application.info.core_information.data_owner_address
      const response = await getAllowanceForAddress(address)
      if (response.success) {
        const allowance = parseFloat(response.data)
        const allocationAmount = anyToBytes(
          application.info.datacap_allocations[0].request_information
            .allocation_amount,
        )
        const usedDatacap = allocationAmount - allowance
        console.log({ allowance, allocationAmount, usedDatacap })
        const progressPercentage = (usedDatacap / allocationAmount) * 100
        setProgress(progressPercentage)
        setIsProgressBarLoading(false)
      } else {
        console.error(response.error)
      }
    }

    void fetchDatacap()
  }, [application])

  /**
   * Handles the mutation error event.
   *
   * @param {Error} error - The error object.
   */
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

  /**
   * Handles the application status change event.
   */
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

  /**
   * Handles the wallet error event.
   */
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
    )?.request_information.id

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
            const res = await mutationApproval.mutateAsync({
              requestId,
              userName,
            })
            if (res?.info.application_lifecycle.state === 'Confirmed') {
              const lastDatacapAllocation = getLastDatacapAllocation(res)
              if (lastDatacapAllocation === undefined) {
                throw new Error('No datacap allocation found')
              }
              const queryParams = [
                `client=${encodeURIComponent(
                  res?.info.core_information.data_owner_name,
                )}`,
                `messageCID=${encodeURIComponent(
                  lastDatacapAllocation.signers[1].message_cid,
                )}`,
                `amount=${encodeURIComponent(
                  lastDatacapAllocation.request_information.allocation_amount,
                )}`,
                `notification=true`,
              ].join('&')

              router.push(`/?${queryParams}`)
            }
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

  const stateLabel =
    stateMapping[
      application.info.application_lifecycle.state as keyof typeof stateMapping
    ] ?? application.info.application_lifecycle.state

  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight mb-6">
        Application Detail
      </h2>
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
      <Card className="bg-gray-50 p-4 rounded-lg shadow-lg">
        <CardHeader className="border-b pb-2 mb-4">
          <a
            href={`${config.githubRepoUrl}/issues/${application.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl font-bold "
          >
            {application.info.core_information.data_owner_name}{' '}
            <span className="text-muted-foreground">#{application.id}</span>
          </a>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm">
          {[
            ['Region', application.info.core_information.data_owner_region],
            ['Industry', application.info.core_information.data_owner_industry],
            ['Website', application.info.core_information.website],
            ['Social', application.info.core_information.social_media],
            ['Status', stateLabel],
          ].map(([label, value], idx) => (
            <div key={idx} className="flex items-center justify-between">
              <p className="text-gray-600">{label}</p>
              <p className="font-medium text-gray-800">{value}</p>
            </div>
          ))}
          <ProgressBar
            progress={progress}
            label="Datacap used"
            isLoading={isProgressBarLoading}
          />
        </CardContent>
        {application.info.application_lifecycle.state !== 'Confirmed' &&
          session?.data?.user?.name !== undefined && (
            <CardFooter className="flex justify-end border-t pt-4 mt-4">
              {(walletConnected ||
                application.info.application_lifecycle.state ===
                  'GovernanceReview') && (
                <Button
                  onClick={() => void handleButtonClick()}
                  disabled={isApiCalling}
                  className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
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
                    className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
                  >
                    Connect Ledger
                  </Button>
                )}
            </CardFooter>
          )}
      </Card>
    </>
  )
}

export default AppInfo
