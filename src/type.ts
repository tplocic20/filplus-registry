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
  first_allocation_time: string
  initial_pr_number: number
  is_active: boolean
  state: string
  time_of_new_state: string
  validated_by: string
  validated_time: string
}

export interface CoreInformation {
  data_owner_industry: string
  data_owner_name: string
  data_owner_region: string
  social_media: string
  website: string
}

export interface DatacapAllocation {
  request_information: RequestInformation
  signers: Signer[]
}

export interface RequestInformation {
  actor: string
  allocation_amount: string
  client_address: string
  created_at: string
  is_active: boolean
  request_id: string
  request_type: string
  uuid: string
}

export interface Signer {
  message_cid: string
  signing_address: string
  time_of_signature: string
}
