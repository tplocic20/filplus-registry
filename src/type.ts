export interface Application {
  Version: number
  ID: string
  'Issue Number': string
  Client: Client
  Project: Record<string, unknown>
  Datacap: Datacap
  Lifecycle: Lifecycle
  'Allocation Requests': AllocationRequest[]
}

export interface Client {
  Name: string
  Region: string
  Industry: string
  Website: string
  'Social Media': string
  Role: string
}

export interface Datacap {
  Type: string
  'Data Type': string
  'Total Requested Amount': string
  'Single Size Dataset': string
  Replicas: number
  'Weekly Allocation': string
}

export interface Lifecycle {
  State: string
  'Validated At': string
  'Validated By': string
  Active: boolean
  'Updated At': string
  'Active Request ID': string | null
  'On Chain Address': string
  'Multisig Address': string
}

export interface AllocationRequest {
  ID: string
  'Request Type': 'First' | 'Refill'
  'Created At': string
  'Updated At': string
  Active: boolean
  'Allocation Amount': string
  Signers: Signer[]
}

export interface Signer {
  message_cid: string
  signing_address: string
  time_of_signature: string
  username: string
}

export interface IWallet {
  loadWallet: (networkIndex: number) => Promise<void>
  selectNetwork: (nodeIndex: number) => Promise<this>
  getAccounts: (nStart?: number) => Promise<string[]>
  sign: (filecoinMessage: any, indexAccount: number) => Promise<any>
  api: any
}

export interface ConfigLotusNode {
  name: string
  code: number
  url: string | undefined
  token: string | undefined
  notaryRepo: string
  notaryOwner: string
  rkhMultisig: string
  rkhtreshold: number
  largeClientRequestAssign: string[]
}

export interface API {
  actorAddress: (account: string) => Promise<string>
}

export interface ApiAllowanceResponse {
  error: string
  success: boolean
  data: string
}
