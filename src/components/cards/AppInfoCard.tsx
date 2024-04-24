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
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
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
import { set } from 'date-fns'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { redirect } from 'next/navigation'

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
    mutationDecline,
    mutationRequestInfo,
    mutationTrigger,
    mutationApproveChanges,
    mutationProposal,
    mutationApproval,
    walletError,
    initializeWallet,
    setActiveAccountIndex,
    accounts,
    message,
    loadMoreAccounts,
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

  const [additionalInfoConfig, setAdditionalInfoConfig] = useState<{
    message: string
    isDialogOpen: boolean
  }>({
    message: '',
    isDialogOpen: false,
  })

  const [allocationAmountConfig, setAllocationAmountConfig] = useState<{
    amount: string
    allocationType: string
    isDialogOpen: boolean
  }>({
    amount: '',
    allocationType: '',
    isDialogOpen: false,
  })

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
  }, [session.data?.user?.githubUsername, allocators, repo])

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

      if (accounts.length) {
        setIsSelectAccountModalOpen(true)
        setIsWalletConnecting(false)
        return
      }

      const { multisig_address: multisigAddress } = currentAllocator
      const newAccounts = multisigAddress
        ? await initializeWallet(multisigAddress)
        : await initializeWallet()
      if (newAccounts.length) setIsSelectAccountModalOpen(true)
      setIsWalletConnecting(false)
      return
    } catch (error) {
      console.error('Error initializing ledger:', error)
    }
    setIsWalletConnecting(false)
    setWalletConnected(false)
  }

  /**
   * Handles Load more accounts event. This function is called when the user clicks the Load more button.
   */
  const handleLoadMore = async (): Promise<void> => {
    await loadMoreAccounts(5)
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
      case 'AdditionalInfoRequired':
      case 'AdditionalInfoSubmitted':
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
    let validatedAllocationAmount

    try {
      switch (application.Lifecycle.State) {
        case 'Submitted':
        case 'AdditionalInfoRequired':
        case 'AdditionalInfoSubmitted':
          if (userName != null) {
            setAllocationAmountConfig((prev) => {
              return {
                ...prev,
                amount: '',
                isDialogOpen: true,
              }
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
              setAllocationAmountConfig((prev) => {
                return {
                  ...prev,
                  isDialogOpen: true,
                }
              })
            } else {
              await mutationProposal.mutateAsync({
                requestId,
                userName,
              })
            }
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

  const declineApplication = async (): Promise<void> => {
    setApiCalling(true)
    const userName = session.data?.user?.githubUsername
    if (!userName) return
    try {
      await mutationDecline.mutateAsync({
        userName,
      })
    } catch (error) {
      handleMutationError(error as Error)
    }
    router.push(`/`)
  }

  const handleAdditionalInfoClose = async (
    shouldSubmit: boolean,
  ): Promise<void> => {
    if (!shouldSubmit) {
      setAdditionalInfoConfig({
        isDialogOpen: false,
        message: '',
      })
      return
    }

    if (!additionalInfoConfig.message) {
      toast.error('Please provide a message')
      return
    }
    setApiCalling(true)
    const userName = session.data?.user?.githubUsername
    if (!userName) return
    try {
      await mutationRequestInfo.mutateAsync({
        userName,
        additionalInfoMessage: additionalInfoConfig.message,
      })
    } catch (error) {
      handleMutationError(error as Error)
    }
    setApiCalling(false)
    setAdditionalInfoConfig({
      isDialogOpen: false,
      message: '',
    })
  }

  const handleAllocationAmountClose = async (
    shouldSubmit: boolean,
  ): Promise<void> => {
    if (!shouldSubmit) {
      setAllocationAmountConfig((prev) => ({
        ...prev,
        isDialogOpen: false,
        amount: '',
      }))
      return
    }
    setApiCalling(true);
    const userName = session.data?.user?.githubUsername
    if (!userName) return
    const validatedAllocationAmount = validateAndReturnDatacap(
      allocationAmountConfig.amount,
      application.Datacap['Total Requested Amount'],
    )

    if (!validatedAllocationAmount) {
      setApiCalling(false)
      return
    }

    if (application.Lifecycle.State === 'ReadyToSign') {
      const requestId = application['Allocation Requests'].find(
        (alloc) => alloc.Active,
      )?.ID
      if (!requestId) return;

      setAllocationAmountConfig((prev) => ({
        ...prev,
        isDialogOpen: false,
      }))

      await mutationProposal.mutateAsync({
        requestId,
        userName,
        allocationAmount: validatedAllocationAmount,
      })
    } else {
      await mutationTrigger.mutateAsync({
        userName,
        allocationAmount: validatedAllocationAmount,
      })
    }


    setApiCalling(false);
  }

  useEffect(() => {
    // if not the first allocation, prefill the amount with ssa bot suggested value
    if (
      application.Lifecycle.State === 'ReadyToSign' &&
      application['Allocation Requests'].length > 1
    ) {
      setAllocationAmountConfig((prev) => ({
        allocationType: 'manual',
        amount:
          application['Allocation Requests'].find((e) => e.Active)?.[
            'Allocation Amount'
          ] ?? '',
        isDialogOpen: false,
      }))
    }
  }, [application])

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

  const validateAndReturnDatacap = (
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
        onLoadMore={async () => {
          await handleLoadMore()
        }}
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

        {LDNActorType.Verifier === currentActorType ? (
          <div>
            {application?.Lifecycle?.State !== 'Granted' &&
              session?.data?.user?.name !== undefined && (
                <CardFooter className="flex flex-col items-end border-t pt-4 pb-2 mt-4 justify-center gap-3">
                  {buttonText &&
                    (walletConnected ||
                      [
                        'Submitted',
                        'AdditionalInfoRequired',
                        'AdditionalInfoSubmitted',
                        'ChangesRequested',
                      ].includes(application?.Lifecycle?.State)) && (
                        <div className="flex justify-end gap-2 pb-4">
                        {[
                          'Submitted',
                          'AdditionalInfoRequired',
                          'AdditionalInfoSubmitted',
                        ].includes(application?.Lifecycle?.State) && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() =>
                                setAdditionalInfoConfig({
                                  isDialogOpen: true,
                                  message: '',
                                })
                              }
                              disabled={isApiCalling}
                              style={{
                                width: "200px"
                              }}
                              className="bg-yellow-400 text-black rounded-lg px-4 py-2 hover:bg-yellow-500"
                            >
                              Request Additional Info
                            </Button>
                            <Button
                              onClick={() => void declineApplication()}
                              disabled={isApiCalling}
                              style={{
                                width: "200px"
                              }}
                              className="bg-red-400 text-white rounded-lg px-4 py-2 hover:bg-red-600"
                            >
                              Decline Application
                            </Button>
                            
                          </div>
                        )}
                        <Button
                            onClick={() => void handleButtonClick()}
                            disabled={isApiCalling}
                            style={{
                              width: "200px"
                            }}
                            className="bg-blue-400 text-white rounded-lg px-4 py-2 hover:bg-blue-500"
                          >
                            {buttonText}
                          </Button>
                      </div>
                    )}

                  {!walletConnected &&
                    currentActorType === LDNActorType.Verifier &&
                    ![
                      'Submitted',
                      'ChangesRequested',
                      'AdditionalInfoRequired',
                      'AdditionalInfoSubmitted',
                    ].includes(application?.Lifecycle?.State) && (
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
          </div>
        ) : (
          <CardFooter className="px-6 flex justify-end items-center w-full font-semibold text-xl italic">
            You must be a verifier in order to perform actions on the
            application.
          </CardFooter>
        )}
      </Card>
      <Dialog
        open={additionalInfoConfig.isDialogOpen}
        onClose={() => handleAdditionalInfoClose(false)}
        fullWidth
      >
        <DialogTitle>This message will be posted in the issue</DialogTitle>
        <DialogContent
          style={{
            paddingTop: '8px',
          }}
        >
          {(isApiCalling || isWalletConnecting) && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
              <Spinner />
            </div>
          )}
          <TextField
            fullWidth
            multiline
            minRows={6}
            id="outlined-controlled"
            label="Request additional information using this message..."
            value={additionalInfoConfig.message}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setAdditionalInfoConfig((prev) => {
                return {
                  ...prev,
                  message: event.target.value,
                }
              })
            }}
          />
        </DialogContent>
        <DialogActions
          style={{
            padding: '0 24px 20px 24px',
          }}
        >
          <Button
            disabled={isApiCalling}
            onClick={() => handleAdditionalInfoClose(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={isApiCalling}
            onClick={() => handleAdditionalInfoClose(true)}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={allocationAmountConfig.isDialogOpen}
        onClose={() => handleAllocationAmountClose(false)}
        fullWidth
      >
        <DialogTitle 
        // className='flex justify-center'
        >Fill DataCap Amount for current allocation</DialogTitle>
        <DialogContent
          style={{
            paddingTop: '8px',
          }}
        >
          {(isApiCalling || isWalletConnecting) && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
              <Spinner />
            </div>
          )}
          <div className="flex gap-3 items-center">
            <FormControl>
              <FormLabel id="demo-controlled-radio-buttons-group">
                Allocation Amount Type
              </FormLabel>
              <RadioGroup
                aria-labelledby="demo-controlled-radio-buttons-group"
                value={allocationAmountConfig.allocationType}
                onChange={(e) => {
                  if (e.target.value !== 'manual') {
                    setAllocationAmountConfig({
                      ...allocationAmountConfig,
                      amount: '',
                    })
                  }
                  setAllocationAmountConfig((prev) => ({
                    ...prev,
                    allocationType: (e.target as HTMLInputElement).value,
                  }))
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
              {!allocationAmountConfig.allocationType ||
              allocationAmountConfig.allocationType === 'percentage' ||
              allocationAmountConfig.allocationType === 'fixed' ? (
                <Box sx={{ width: 230 }}>
                  <FormControl fullWidth>
                    <InputLabel>Amount</InputLabel>
                    <Select
                      disabled={!allocationAmountConfig.allocationType}
                      value={allocationAmountConfig.amount}
                      label="Allocation Amount"
                      onChange={(e: SelectChangeEvent) => {
                        setAllocationAmountConfig((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
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
                              allocationAmountConfig.allocationType === 'percentage'
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
                            {allocationAmountConfig.allocationType === 'percentage'
                              ? `% - ${calculateDatacap(
                                  e,
                                  application.Datacap['Total Requested Amount'],
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
                    disabled={!allocationAmountConfig.allocationType}
                    value={allocationAmountConfig.amount}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setAllocationAmountConfig((prev) => ({
                        ...prev,
                        amount: event.target.value
                      }))
                    }}
                  />
                </Box>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions
          style={{
            padding: '0 24px 20px 24px',
          }}
        >
          <Button
            disabled={isApiCalling}
            onClick={() => handleAllocationAmountClose(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={isApiCalling || !allocationAmountConfig.amount}
            onClick={() => handleAllocationAmountClose(true)}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AppInfoCard
