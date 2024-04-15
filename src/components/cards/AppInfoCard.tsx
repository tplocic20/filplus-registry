import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import AccountSelectionDialog from '@/components/ui/ledger-account-select' // Adjust the import path as needed
import { Modal } from '@/components/ui/modal'
import ProgressBar from '@/components/ui/progress-bar'
import { Spinner } from '@/components/ui/spinner'
import { config } from '@/config'
import useApplicationActions from '@/hooks/useApplicationActions'
import { useAllocator } from '@/lib/AllocatorProvider'
import { stateColor, stateMapping } from '@/lib/constants'
import { getAllowanceForAddress } from '@/lib/dmobApi'
import {
  anyToBytes,
  bytesToiB,
  calculateDatacap,
  getLastDatacapAllocation,
} from '@/lib/utils'
import { type Allocation, LDNActorType, type Application } from '@/type'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
interface ComponentProps {
  application: Application
  repo: string
  owner: string
  allocation?: Allocation
}

/**
 * Represents the information for a specific application.
 * Provides buttons to interact with the application.
 *
 * @component
 * @prop {Application} initialApplication - The initial data for the application.
 * @prop {string} repo - The repo containing the application.
 * @prop {string} owner - The owner of the repo containing the application.
 * @prop {UseSession} session - User session data.
 */
const AppInfoCard: React.FC<ComponentProps> = ({
  application: initialApplication,
  repo,
  owner,
  allocation,
}) => {
  const session = useSession()
  const { allocators } = useAllocator()
  const {
    application,
    isApiCalling,
    setApiCalling,
    mutationTrigger,
    mutationApproveChanges,
    mutationProposal,
    mutationApproval,
    walletError,
    initializeWallet,
    setActiveAccountIndex,
    accounts,
    message,
  } = useApplicationActions(initialApplication, repo, owner)
  const [buttonText, setButtonText] = useState('')
  const [modalMessage, setModalMessage] = useState<string | null>(null)
  const [error, setError] = useState<boolean>(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [isWalletConnecting, setIsWalletConnecting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isProgressBarLoading, setIsProgressBarLoading] = useState(true)
  const [currentActorType, setCurrentActorType] = useState<LDNActorType | ''>(
    '',
  )
  const [isSelectAccountModalOpen, setIsSelectAccountModalOpen] =
    useState(false)
  const [allocationType, setAllocationType] = useState<string>('')
  const [allocationAmount, setAllocationAmount] = useState<string>('')

  const router = useRouter()

  useEffect(() => {
    setModalMessage(message)
  }, [message])

  /**
   * Fetches the datacap allowance for the application in order to calculate the progress bar.
   */
  useEffect(() => {
    void (async (): Promise<void> => {
      const address = application.Lifecycle['On Chain Address']
      const response = await getAllowanceForAddress(address)

      if (response.success) {
        const allowance = parseFloat(response.data)
        const lastAllocation = getLastDatacapAllocation(application)
        if (lastAllocation === undefined) return

        const allocationAmount = anyToBytes(
          lastAllocation['Allocation Amount'] ?? '0',
        )
        const usedDatacap =
          allocationAmount < allowance ? 0 : allocationAmount - allowance
        const progressPercentage = (usedDatacap / allocationAmount) * 100
        console.log({
          allowance,
          allocationAmount,
          usedDatacap,
          progressPercentage,
        })

        setProgress(progressPercentage)
        setIsProgressBarLoading(false)
      } else {
        if (response.error === 'Address not found') {
          setIsProgressBarLoading(false)
          setProgress(100)
        } else {
          console.error(response.error)
        }
      }
    })()
  }, [application])

  useEffect(() => {
    if (
      !allocators ||
      session.data?.user?.githubUsername === null ||
      session.data?.user?.githubUsername === undefined ||
      session.data?.user?.githubUsername === ''
    ) {
      setCurrentActorType('')
      return
    }

    const ghUserName = session.data.user.githubUsername
    const currentAllocator = allocators.find((e) => e.repo === repo)
    if (
      currentAllocator?.verifiers_gh_handles.includes(ghUserName.toLowerCase())
    ) {
      setCurrentActorType(LDNActorType.Verifier)
    }
  }, [session.data?.user?.githubUsername, allocators])

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
      const currentAllocator = allocators.find((e) => e.repo === repo)
      if (!currentAllocator) return
      setIsWalletConnecting(true)
      const { multisig_address: multisigAddress } = currentAllocator
      const accounts = multisigAddress
        ? await initializeWallet(multisigAddress)
        : await initializeWallet()
      if (accounts.length) setIsSelectAccountModalOpen(true)
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
    if (currentActorType !== LDNActorType.Verifier) {
      setButtonText('')
      return
    }

    if (isApiCalling) {
      setButtonText('Processing...')
      return
    }

    switch (application.Lifecycle.State) {
      case 'Submitted':
        setButtonText('Complete verifier review')
        break

      case 'ChangesRequested':
        setButtonText('Approve changes')
        break

      case 'ReadyToSign':
        setButtonText('Propose')
        break

      case 'StartSignDatacap':
        setButtonText('Approve')
        break

      case 'Granted':
        setButtonText('')
        break

      default:
        setButtonText('')
    }
  }, [application.Lifecycle.State, isApiCalling, session, currentActorType])

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
    const requestId = application['Allocation Requests'].find(
      (alloc) => alloc.Active,
    )?.ID

    const userName = session.data?.user?.githubUsername

    try {
      switch (application.Lifecycle.State) {
        case 'Submitted':
          if (userName != null) {
            const validatedAllocationAmount = validateDatacap(
              allocationAmount,
              application.Datacap['Total Requested Amount'],
            )

            if (!validatedAllocationAmount) {
              setApiCalling(false)
              return
            }

            await mutationTrigger.mutateAsync({
              userName,
              allocationAmount: validatedAllocationAmount,
            })
          }
          break

        case 'ChangesRequested':
          if (userName != null) {
            await mutationApproveChanges.mutateAsync({
              userName,
            })
          }
          break

        case 'ReadyToSign':
          if (requestId != null && userName != null) {
            if (application['Allocation Requests'].length > 1) {
              var validatedAllocationAmount = validateDatacap(
                allocationAmount,
                application.Datacap['Total Requested Amount'],
              )
              if (!validatedAllocationAmount) {
                setApiCalling(false)
                return
              }
            }
            await mutationProposal.mutateAsync({
              requestId,
              userName,
              allocationAmount: validatedAllocationAmount,
            })
          }
          break
        case 'StartSignDatacap':
          if (requestId != null && userName != null) {
            const res = await mutationApproval.mutateAsync({
              requestId,
              userName,
            })
            if (res?.Lifecycle.State === 'Granted') {
              const lastDatacapAllocation = getLastDatacapAllocation(res)
              if (lastDatacapAllocation === undefined) {
                throw new Error('No datacap allocation found')
              }
              const queryParams = [
                `client=${encodeURIComponent(res?.Client.Name)}`,
                `messageCID=${encodeURIComponent(
                  lastDatacapAllocation.Signers[1]['Message CID'],
                )}`,
                `amount=${encodeURIComponent(
                  lastDatacapAllocation['Allocation Amount'],
                )}`,
                `notification=true`,
              ].join('&')

              router.push(`/?${queryParams}`)
            }
          }
          break
        default:
          throw new Error(
            `Invalid application state ${application.Lifecycle.State}`,
          )
      }
    } catch (error) {
      handleMutationError(error as Error)
    }
    setApiCalling(false)
  }

  const shouldShowAllocationAmountInput = (): boolean => {
    if (application.Lifecycle.State === 'Submitted') return true

    if (
      application.Lifecycle.State === 'ReadyToSign' &&
      application['Allocation Requests'].length > 1
    )
      return true

    return false
  }

  useEffect(() => {
    // if not the first allocation, prefill the amount with ssa bot suggested value
    if (
      application.Lifecycle.State === 'ReadyToSign' &&
      application['Allocation Requests'].length > 1
    ) {
      setAllocationType('manual');
      setAllocationAmount(
        application['Allocation Requests'].find((e) => e.Active)?.[
          'Allocation Amount'
        ] ?? '',
      )
    }
  }, [])

  const stateLabel =
    stateMapping[application.Lifecycle.State as keyof typeof stateMapping] ??
    application.Lifecycle.State
  const stateClass =
    stateColor[application.Lifecycle.State as keyof typeof stateColor] ??
    application.Lifecycle.State

  const lastAllocation = getLastDatacapAllocation(application)

  const getRowStyles = (index: number): string => {
    return index % 2 === 0
      ? 'bg-white' // Fondo blanco para filas pares
      : 'bg-gray-100' // Fondo gris claro para filas impares
  }

  const validateDatacap = (
    datacap: string,
    totalDatacap: string,
  ): string | undefined => {
    const bytes = anyToBytes(datacap)
    const totalBytes = anyToBytes(totalDatacap)

    if (bytes > totalBytes) {
      toast.error('Datacap exceeds the total requested amount')
      return
    }

    const isBinary = datacap.toLowerCase().includes('ib')
    const againToText = bytesToiB(bytes, isBinary)

    return againToText
  }

  return (
    <>
      <AccountSelectionDialog
        open={isSelectAccountModalOpen}
        accounts={accounts}
        onClose={() => {
          setIsSelectAccountModalOpen(false)
        }}
        onSelect={(value) => {
          setActiveAccountIndex(value)
          setWalletConnected(true)
        }}
      />
      <div className="flex items-center flex-col mb-6">
        <h2 className="text-3xl font-bold">Application Detail</h2>
        <a
          href={`${config.githubRepoUrl}/issues/${application['Issue Number']}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="text-muted-foreground">
            #{application['Issue Number']}
          </span>
        </a>
      </div>

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
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <CardHeader className="border-b pb-2 mb-4">
              <h2 className="text-xl font-bold">Client Info</h2>
            </CardHeader>

            <CardContent className="grid text-sm mb-4">
              {[
                ['Name', application.Client.Name],
                ['Region', application.Client.Region],
                ['Industry', application.Client.Industry],
                ['Website', application.Client.Website],
                ['Social', application.Client['Social Media']],
                ['Social Media Type', application.Client['Social Media Type']],
                ['Address', application.Lifecycle['On Chain Address']],
              ].map(([label, value], idx) => {
                const rowStyles = getRowStyles(idx)
                return (
                  <div
                    key={label}
                    className={`flex items-center p-2 justify-between ${rowStyles}`}
                  >
                    <p className="text-gray-600">{label}</p>
                    {label === 'Address' ? (
                      <a
                        href={`https://filfox.info/en/address/${value}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-gray-800"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="font-medium text-gray-800">{value}</p>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </div>
          <div className="flex-1">
            <CardHeader className="border-b pb-2 mb-4">
              <h2 className="text-xl font-bold">Datacap Info</h2>
            </CardHeader>

            <CardContent className="grid text-sm">
              {[
                ['Status', stateLabel],
                [
                  'Total Requested Amount',
                  application.Datacap['Total Requested Amount'],
                ],
                [
                  'Single Size Dataset',
                  application.Datacap['Single Size Dataset'],
                ],
                ['Replicas', application.Datacap.Replicas.toString()],
                ['Weekly Allocation', application.Datacap['Weekly Allocation']],
              ].map(([label, value], idx) => {
                const rowStyles = getRowStyles(idx)
                return (
                  <div
                    key={idx}
                    className={`flex items-center p-2 justify-between ${rowStyles}`}
                  >
                    <p className="text-gray-600">{label}</p>
                    {label === 'Status' ? (
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs ${stateClass}`}
                      >
                        {value}
                      </span>
                    ) : (
                      <p className="font-medium text-gray-800">{value}</p>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </div>
        </div>

        <CardContent>
          {lastAllocation !== undefined && (
            <ProgressBar
              progress={progress}
              label="Datacap used"
              isLoading={isProgressBarLoading}
            />
          )}
        </CardContent>

        {application?.Lifecycle?.State !== 'Granted' &&
          session?.data?.user?.name !== undefined && (
            <CardFooter className="flex flex-col items-end border-t pt-4 mt-4 justify-center gap-3">
              {shouldShowAllocationAmountInput() && (
                <div className="flex gap-3 items-center">
                  <FormControl>
                    <FormLabel id="demo-controlled-radio-buttons-group">
                      Allocation Amount Type
                    </FormLabel>
                    <RadioGroup
                      aria-labelledby="demo-controlled-radio-buttons-group"
                      value={allocationType}
                      onChange={(e) => {
                        if (e.target.value !== 'manual') {
                          setAllocationAmount('')
                        }
                        setAllocationType((e.target as HTMLInputElement).value)
                      }}
                    >
                      <FormControlLabel
                        value={
                          allocation?.allocation_amount_type
                            ? allocation.allocation_amount_type
                            : 'fixed'
                        }
                        control={<Radio />}
                        label={
                          allocation?.allocation_amount_type
                            ? allocation.allocation_amount_type
                                .charAt(0)
                                .toUpperCase() +
                              allocation.allocation_amount_type.slice(1)
                            : 'Fixed'
                        }
                      />
                      <FormControlLabel
                        value="manual"
                        control={<Radio />}
                        label="Manual"
                      />
                    </RadioGroup>
                  </FormControl>
                  <div>
                    {!allocationType ||
                    allocationType === 'percentage' ||
                    allocationType === 'fixed' ? (
                      <Box sx={{ width: 230 }}>
                        <FormControl fullWidth>
                          <InputLabel>Amount</InputLabel>
                          <Select
                            disabled={!allocationType}
                            value={allocationAmount}
                            label="Allocation Amount"
                            onChange={(e: SelectChangeEvent) => {
                              setAllocationAmount(e.target.value)
                            }}
                          >
                            {(allocation?.allocation_amount_type
                              ? allocation.allocation_amount_quantity_options
                              : ['1TiB', '5TiB', '50TiB', '100TiB', '1PiB']
                            ).map((e) => {
                              return (
                                <MenuItem
                                  key={e}
                                  value={
                                    allocationType === 'percentage'
                                      ? calculateDatacap(
                                          e,
                                          application.Datacap[
                                            'Total Requested Amount'
                                          ],
                                        )
                                      : e
                                  }
                                >
                                  {e}
                                  {allocationType === 'percentage'
                                    ? `% - ${calculateDatacap(
                                        e,
                                        application.Datacap[
                                          'Total Requested Amount'
                                        ],
                                      )}`
                                    : ''}
                                </MenuItem>
                              )
                            })}
                          </Select>
                        </FormControl>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          width: 230,
                        }}
                      >
                        <TextField
                          id="outlined-controlled"
                          label="Amount"
                          disabled={!allocationType}
                          value={allocationAmount}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>,
                          ) => {
                            setAllocationAmount(event.target.value)
                          }}
                        />
                      </Box>
                    )}
                  </div>
                </div>
              )}
              {buttonText &&
                (!walletConnected ||
                  ['Submitted', 'ChangesRequested'].includes(
                    application?.Lifecycle?.State,
                  )) && (
                  <Button
                    onClick={() => void handleButtonClick()}
                    disabled={
                      isApiCalling ||
                      (application.Lifecycle.State === 'Submitted' &&
                        !allocationAmount)
                    }
                    className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
                  >
                    {buttonText}
                  </Button>
                )}

              {!walletConnected &&
                currentActorType === LDNActorType.Verifier &&
                !['Submitted', 'ChangesRequested'].includes(
                  application?.Lifecycle?.State,
                ) && (
                  <Button
                    onClick={() => void handleConnectLedger()}
                    disabled={
                      isWalletConnecting ||
                      isApiCalling ||
                      ['Granted', 'Submitted'].includes(
                        application.Lifecycle.State,
                      )
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

export default AppInfoCard
