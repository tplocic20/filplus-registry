export interface Application {
  id: string
  info: Info
  _type: string
}

export interface Info {
  core_information: CoreInformation
  application_lifecycle: ApplicationLifecycle
  datacap_allocations: DatacapAllocation[]
}

export interface ApplicationLifecycle {
  state: string
  validated_time: string
  initial_pr_number: number
  validated_by: string
  first_allocation_time: string
  is_active: boolean
  time_of_new_state: string
  current_allocation_id: string
}

export interface CoreInformation {
  data_owner_name: string
  data_owner_github_handle: string
  data_owner_region: string
  data_owner_industry: string
  data_owner_address: string
  requested_amount: string
  datacap_weekly_allocation: string
  website: string
  social_media: string
}

export interface DatacapAllocation {
  request_information: RequestInformation
  signers: Signer[]
}

export interface RequestInformation {
  actor: string
  id: string
  request_type: string
  client_address: string
  created_at: string
  is_active: boolean
  allocation_amount: string
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
