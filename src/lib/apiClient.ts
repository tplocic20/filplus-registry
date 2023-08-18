import { type Application } from '@/type'
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: 'https://fp-core.6omfj573u6naa.us-east-2.cs.amazonlightsail.com/',
})

// get all applications
export const getAllApplications = async (): Promise<
  Application[] | undefined
> => {
  try {
    const { data } = await apiClient.get('application')
    return data
  } catch (error) {
    console.log(error)
  }
}

// get all applications
export const getApplicationById = async (
  id: string,
): Promise<Application | undefined> => {
  try {
    const { data } = await apiClient.get(`application/${id}`)
    return data
  } catch (error) {
    console.log(error)
  }
}
