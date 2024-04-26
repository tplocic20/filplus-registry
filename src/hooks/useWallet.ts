import { useState, useCallback } from 'react'
import { LedgerWallet } from '@/lib/wallet/LedgerWallet'
import { BurnerWallet } from '@/lib/wallet/BurnerWallet'
import { config } from '../config'
import { type IWallet, type SendProposalProps } from '@/type'
import { anyToBytes } from '@/lib/utils'
import { newFromString } from '@glif/filecoin-address'
import { decodeFunctionData, encodeFunctionData, parseAbi } from 'viem'
import { type Hex } from 'viem/types/misc'

/**
 * Registry that maps wallet class names to their respective classes.
 */
const walletClassRegistry: Record<string, any> = {
  LedgerWallet: (
    networkIndex: number,
    setMessage: (message: string | null) => void,
    multisigAddress?: string,
  ) => new LedgerWallet(networkIndex, setMessage, multisigAddress),
  BurnerWallet: (
    networkIndex: number,
    setMessage: (message: string | null) => void,
  ) => new BurnerWallet(networkIndex, setMessage),
}

/**
 * Interface representing the state of the wallet.
 *
 * @interface WalletState
 */
interface WalletState {
  walletError: Error | null
  setActiveAccountIndex: (index: number) => void
  accounts: string[]
  activeAddress: string
  getProposalTx: (
    clientAddress: string,
    datacap: string,
    appMode: string,
  ) => Promise<string | boolean>
  sendProposal: (props: SendProposalProps) => Promise<string>
  sendApproval: (txHash: string) => Promise<string>
  sign: (message: string) => Promise<string>
  initializeWallet: (multisigAddress?: string) => Promise<string[]>
  message: string | null
  setMessage: (message: string | null) => void
  loadMoreAccounts: (number: number) => Promise<void>
}

/**
 * Custom hook for managing wallet state and interactions.
 *
 * @function useWallet
 * @returns {WalletState} - The current state of the wallet and associated actions.
 */
const useWallet = (): WalletState => {
  const [wallet, setWallet] = useState<IWallet | null>(null)
  const [walletError, setWalletError] = useState<Error | null>(null)
  const [accounts, setAccounts] = useState<string[]>([])
  const [multisigAddress, setMultisigAddress] = useState<string>('')
  const [activeAccountIndex, setActiveAccountIndexState] = useState<number>(0)
  const [message, setMessage] = useState<string | null>(null)

  /**
   * Sets the active account index.
   *
   * @param {number} index - The index of the account to set as active.
   */
  const setActiveAccountIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < accounts.length) {
        setActiveAccountIndexState(index)
      } else {
        console.error('Invalid account index')
      }
    },
    [accounts],
  )

  /**
   * Initializes and returns the active network index based on configuration.
   *
   * @returns {number} - The index of the active network.
   */
  const initNetworkIndex = useCallback(() => {
    const activeIndex = config.lotusNodes
      .map((node: any, index: number) => {
        return { name: node.name, index }
      })
      .filter((node: any) => config.networks.includes(node.name))

    return activeIndex[0].index
  }, [])

  /**
   * Initializes the wallet using the given class name.
   *
   * @param {string} WalletClass - The name of the wallet class to initialize.
   * @param {}
   * @returns {Promise<boolean>} - A promise that resolves when the wallet is initialized.
   */
  const initializeWallet = useCallback(
    async (multisigAddress?: string) => {
      setWalletError(null)
      setMessage('Initializing wallet...')

      try {
        const walletClass: string = config.walletClass
        let newWallet: Record<string, any>
        if (!multisigAddress) {
          const networkIndex = initNetworkIndex()
          newWallet = walletClassRegistry[walletClass](networkIndex, setMessage)
        } else {
          newWallet = walletClassRegistry[walletClass](
            0,
            setMessage,
            multisigAddress,
          )
        }
        await newWallet.loadWallet()
        const allAccounts = await newWallet.getAccounts()

        if (allAccounts.length > 0) {
          setActiveAccountIndexState(0)
          setAccounts(allAccounts)
        }
        setMessage(null)
        setWallet(newWallet as IWallet)
        setMultisigAddress(newWallet.lotusNode.rkhMultisig)
        return allAccounts
      } catch (err) {
        console.error('Error initializing wallet:', err)
        if (err instanceof Error) {
          setWalletError(err)
        } else {
          setWalletError(new Error('Unknown error'))
        }
        return false
      }
    },
    [initNetworkIndex],
  )

  /**
   * Load more accounts from the wallet.
   *
   * @param {number} number - The number of accounts to load.
   * @returns {Promise<void>} - A promise that resolves when the accounts are loaded.
   */
  const loadMoreAccounts = useCallback(
    async (number: number) => {
      if (wallet == null) throw new Error('No wallet initialized.')
      const newAccounts = await wallet.getAccounts(number)
      setAccounts([...accounts, ...newAccounts])
    },
    [wallet, accounts],
  )

  /**
   * Sign a message using the currently initialized wallet.
   *
   * @param {string} message - The message to be signed.
   * @returns {Promise<string>} - A promise that resolves with the signature.
   * @throws {Error} - Throws an error if no wallet is initialized or signing fails.
   */
  const sign = useCallback(
    async (message: string): Promise<string> => {
      if (wallet == null) throw new Error('No wallet initialized.')

      return await wallet.sign(message, activeAccountIndex)
    },
    [wallet, activeAccountIndex],
  )

  /**
   * Checks if a multisig wallet has a pending proposal for a given client and datacap.
   *
   * @param {string} multisigAddress - The address of the multisig wallet.
   * @param {string} clientAddress - The address of the client.
   * @param {number} datacap - The datacap to be allocated.
   * @returns {Promise<string>} - A promise that resolves with a boolean indicating if the multisig wallet has a pending proposal for the given client and datacap.
   * @throws {Error} - Throws an error if no wallet is initialized.
   */
  const getProposalTx = useCallback(
    async (
      clientAddress: string,
      datacap: string,
      appMode: string,
    ): Promise<string | boolean> => {
      if (wallet == null) throw new Error('No wallet initialized.')
      if (multisigAddress == null) throw new Error('Multisig address not set.')

      const bytesDatacap = Math.floor(anyToBytes(datacap))
      let pendingTxs
      try {
        pendingTxs = await wallet.api.pendingTransactions(multisigAddress)
      } catch (error) {
        throw new Error(
          'An error with the lotus node occurred. Please reload. If the problem persists, contact support.',
        )
      }
      let pendingForClient = null
      if (appMode !== 'v2') {
        pendingForClient = pendingTxs?.filter(
          (tx: any) =>
            tx?.parsed?.params?.address === clientAddress &&
            tx?.parsed?.params?.cap === BigInt(bytesDatacap),
        )
      } else {
        pendingForClient = pendingTxs?.filter((tx: any) => {
          const abi = parseAbi([
            'function addVerifiedClient(bytes clientAddress, uint256 amount)',
          ])

          const paramsHex: string = tx.parsed.params.toString('hex')
          const dataHex: Hex = `0x${paramsHex}`

          const decodedData = decodeFunctionData({ abi, data: dataHex })
          const [clientAddressData, amount] = decodedData.args
          const address = newFromString(clientAddress)
          const addressHex: Hex = `0x${Buffer.from(address.bytes).toString('hex')}`
          return (
            clientAddressData === addressHex && amount === BigInt(bytesDatacap)
          )
        })
      }
      return pendingForClient.length > 0 ? pendingForClient.at(-1) : false
    },
    [wallet, multisigAddress],
  )

  const sendProposalLegacy = useCallback(
    async (clientAddress: string, bytesDatacap: number) => {
      if (wallet == null) throw new Error('No wallet initialized.')

      return wallet.api.multisigVerifyClient(
        multisigAddress,
        clientAddress,
        BigInt(bytesDatacap),
        activeAccountIndex,
      )
    },
    [wallet, multisigAddress, activeAccountIndex],
  )

  const sendProposalV2 = useCallback(
    async (
      clientAddress: string,
      bytesDatacap: number,
      contractAddress: string,
    ) => {
      if (wallet == null) throw new Error('No wallet initialized.')

      const abi = parseAbi([
        'function addVerifiedClient(bytes clientAddress, uint256 amount)',
      ])

      const address = newFromString(clientAddress)
      const addressHex: Hex = `0x${Buffer.from(address.bytes).toString('hex')}`
      const calldataHex: Hex = encodeFunctionData({
        abi,
        args: [addressHex, BigInt(bytesDatacap)],
      })
      const calldata = Buffer.from(calldataHex.substring(2), 'hex')
      return wallet.api.multisigEvmInvoke(
        multisigAddress,
        contractAddress,
        calldata,
        activeAccountIndex,
        wallet,
      )
    },
    [wallet, multisigAddress, activeAccountIndex],
  )

  /**
   * Sends a proposal to a multisig wallet.
   *
   * @param {string} multisigAddress - The address of the multisig wallet.
   * @param {string} clientAddress - The address of the client.
   * @param {string} datacap - The datacap to be allocated.
   * @returns {Promise<string>} - A promise that resolves with the message CID.
   * @throws {Error} - Throws an error if no wallet is initialized.
   */
  const sendProposal = useCallback(
    async (props: SendProposalProps): Promise<string> => {
      if (wallet == null) throw new Error('No wallet initialized.')
      if (multisigAddress == null) throw new Error('Multisig address not set.')

      const { clientAddress, datacap, appMode, contractAddress } = props

      setMessage('Sending proposal...')

      const bytesDatacap = Math.floor(anyToBytes(datacap))
      const messageCID =
        appMode === 'v2'
          ? await sendProposalV2(clientAddress, bytesDatacap, contractAddress)
          : await sendProposalLegacy(clientAddress, bytesDatacap)

      setMessage(`Proposal sent correctly. CID: ${messageCID as string}`)

      return messageCID
    },
    [wallet, multisigAddress, sendProposalV2, sendProposalLegacy],
  )

  /**
   * Sends an approval to a multisig wallet.
   *
   * @param {string} multisigAddress - The address of the multisig wallet.
   * @param {string} txHash - The hash of the transaction to approve.
   * @returns {Promise<string>} - A promise that resolves with the message CID.
   * @throws {Error} - Throws an error if no wallet is initialized.
   */
  const sendApproval = useCallback(
    async (txHash: string): Promise<string> => {
      if (wallet == null) throw new Error('No wallet initialized.')
      if (multisigAddress == null) throw new Error('Multisig address not set.')

      setMessage('Sending approval...')

      const messageCID = await wallet.api.approvePending(
        multisigAddress,
        txHash,
        activeAccountIndex,
      )

      setMessage(`Approval sent correctly. CID: ${messageCID as string}`)

      return messageCID
    },
    [wallet, multisigAddress, activeAccountIndex],
  )

  const activeAddress = accounts[activeAccountIndex] ?? ''

  return {
    walletError,
    sign,
    activeAddress,
    getProposalTx,
    sendProposal,
    sendApproval,
    setActiveAccountIndex,
    initializeWallet,
    message,
    setMessage,
    accounts,
    loadMoreAccounts,
  }
}

export default useWallet
