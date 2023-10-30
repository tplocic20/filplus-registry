import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import ByteConverter from '@wtfcode/byte-converter'
import { type UnitNames } from '@wtfcode/byte-converter/dist/types'
import { type Application, type AllocationRequest } from '@/type'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export const getCurrentDate = (): string => {
  const now = new Date()

  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')
  const hours = String(now.getUTCHours()).padStart(2, '0')
  const minutes = String(now.getUTCMinutes()).padStart(2, '0')
  const seconds = String(now.getUTCSeconds()).padStart(2, '0')

  const milliseconds = String(now.getUTCMilliseconds()).padStart(3, '0')
  const nanoseconds = '000000'

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}${nanoseconds} UTC`
}

export const anyToBytes = (inputDatacap: string): number => {
  const formatDc = inputDatacap
    .replace(/[t]/g, 'T')
    .replace(/[b]/g, 'B')
    .replace(/[p]/g, 'P')
    .replace(/[I]/g, 'i')
    .replace(/\s*/g, '')
  const ext = formatDc.replace(/[0-9.]/g, '') as UnitNames
  const datacap = formatDc.replace(/[^0-9.]/g, '')
  const bytes = ByteConverter.convert(
    ByteConverter.value(parseFloat(datacap), ext),
    'B',
  )
  return bytes.value
}

export const getLastDatacapAllocation = (
  application: Application,
): AllocationRequest | undefined => {
  if (application.Lifecycle['Active Request ID'] === null) {
    return undefined
  }
  const lastAllocation = application['Allocation Requests'].find(
    (allocation: AllocationRequest) =>
      allocation.ID === application.Lifecycle['Active Request ID'],
  )

  if (
    lastAllocation === undefined ||
    lastAllocation.Active ||
    lastAllocation.Signers.length !== 2
  ) {
    return undefined
  }

  return lastAllocation
}

export const shortenUrl = (
  url: string,
  first: number,
  last: number,
): string => {
  if (url.length <= first + last) {
    return url
  }

  const start = url.slice(0, first)
  const end = url.slice(-last)

  return `${start}[...]${end}`
}
