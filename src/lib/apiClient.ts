import { type Application } from '@/type'
import axios from 'axios'

/**
 * Axios client instance with a predefined base URL for making API requests.
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

/**
 * Get all applications
 *
 * @returns {Application[] | undefined}
 */
export const getAllApplications = async (): Promise<
  Application[] | undefined
> => {
  try {
    const { data } = await apiClient.get('application')
    return data
  } catch (error) {
    console.error(error)
  }
}

/**
 * Retrieves an application based on its ID.
 *
 * @param id - The ID of the application to retrieve.
 * @returns A promise that resolves with the application data or undefined if there's an error.
 */
export const getApplicationById = async (
  id: string,
): Promise<Application | undefined> => {
  try {
    const { data } = await apiClient.get(`application/${id}`)
    return data
  } catch (error) {
    console.error(error)
  }
}

/**
 * Triggers a LDN application based on its ID.
 *
 * @param id - The ID of the application to trigger.
 * @returns A promise that resolves with the application data after the trigger or undefined if there's an error.
 */
export const postApplicationTrigger = async (
  id: string,
  actor: string,
): Promise<Application | undefined> => {
  try {
    const { data } = await apiClient.post(`application/${id}/trigger`, {
      actor,
    })
    return data
  } catch (error) {
    console.error(error)
  }
}

/**
 * Proposes a LDN application based on its ID.
 *
 * @param id - The ID of the application to propose.
 * @returns A promise that resolves with the application data after the trigger or undefined if there's an error.
 */
export const postApplicationProposal = async (
  id: string,
  requestId: string,
): Promise<Application | undefined> => {
  try {
    const { data } = await apiClient.post(`application/${id}/propose`, {
      request_id: requestId,
      signer: {
        signing_address: 'signing_address_here',
        time_of_signature: 'time_of_signature_here',
        message_cid: 'message_cid_here',
      },
    })
    return data
  } catch (error) {
    console.error(error)
  }
}

/**
 * Approves a LDN application based on its ID.
 *
 * @param id - The ID of the application to approve.
 * @returns A promise that resolves with the application data after the trigger or undefined if there's an error.
 */
export const postApplicationApproval = async (
  id: string,
  requestId: string,
): Promise<Application | undefined> => {
  try {
    const { data } = await apiClient.post(`application/${id}/approve`, {
      request_id: requestId,
      signer: {
        signing_address: 'signing_address_here',
        time_of_signature: 'time_of_signature_here',
        message_cid: 'message_cid_here',
      },
    })
    return data
  } catch (error) {
    console.error(error)
  }
}
