import { type ApiAllowanceResponse } from '@/type'
import { config } from '@/config'

/**
 * Get the allowance for an address from the API.
 *
 * @param {string} address - The address to get the allowance for.
 * @returns {Promise<ApiAllowanceResponse>} ApiAllowanceResponse - The response from the API.
 */
export const getAllowanceForAddress = async (
  address: string,
): Promise<ApiAllowanceResponse> => {
  try {
    const response = await fetch(
      `${config.dmobApiUrl}/getAllowanceForAddress/${address}`,
      {
        headers: {
          'x-api-key': config.dmobApiKey,
        },
      },
    )

    const data = await response.json()

    return {
      data: data.allowance,
      error: '',
      success: true,
    }
  } catch (error: unknown) {
    const errMessage = `Error accessing Dmob API /getAllowanceForAddress: ${
      (error as Error).message
    }`
    return {
      data: '',
      error: errMessage,
      success: false,
    }
  }
}
