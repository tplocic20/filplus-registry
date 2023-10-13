import { type Application } from '@/type'
import axios from 'axios'
import { getCurrentDate } from './utils'

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
    const { data } = await apiClient.get('application/active')
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
    return data.length > 0 ? data[0] : undefined
  } catch (error) {
    console.error(error)
  }
}

/**
 * Triggers a LDN application based on its ID.
 *
 * @param id - The ID of the application to trigger.
 * @param actor - The actor that triggers the application.
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
 * @param requestId - The id of the request to send.
 * @returns A promise that resolves with the application data after the trigger or undefined if there's an error.
 */
export const postApplicationProposal = async (
  id: string,
  requestId: string,
  userName: string,
  address: string,
  signature: string,
): Promise<Application | undefined> => {
  try {
    const { data } = await apiClient.post(`application/${id}/propose`, {
      request_id: requestId,
      signer: {
        signing_address: address,
        // Datetime in format YYYY-MM-DDTHH:MM:SSZ
        time_of_signature: getCurrentDate(),
        message_cid: signature,
        signer: userName,
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
 * @param requestId - The id of the request to send.
 * @returns A promise that resolves with the application data after the trigger or undefined if there's an error.
 */
export const postApplicationApproval = async (
  id: string,
  requestId: string,
  userName: string,
  address: string,
  signature: string,
): Promise<Application | undefined> => {
  try {
    const { data } = await apiClient.post(`application/${id}/approve`, {
      request_id: requestId,
      signer: {
        signing_address: address,
        time_of_signature: getCurrentDate(),
        message_cid: signature,
        signer: userName,
      },
    })
    return data
  } catch (error) {
    console.error(error)
  }
}
