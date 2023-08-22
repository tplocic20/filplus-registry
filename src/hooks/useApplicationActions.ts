// hooks/useApplicationActions.ts

import { useState } from 'react'
import {
  useQueryClient,
  useMutation,
  type UseMutationResult,
} from 'react-query'
import {
  postApplicationTrigger,
  postApplicationProposal,
  postApplicationApproval,
} from '@/lib/apiClient'
import { type Application } from '@/type'

interface ApplicationActions {
  application: Application
  isApiCalling: boolean
  setApiCalling: React.Dispatch<React.SetStateAction<boolean>>
  mutationTrigger: UseMutationResult<
    Application | undefined,
    unknown,
    string,
    unknown
  >
  mutationProposal: UseMutationResult<
    Application | undefined,
    unknown,
    string,
    unknown
  >
  mutationApproval: UseMutationResult<
    Application | undefined,
    unknown,
    string,
    unknown
  >
}

const useApplicationActions = (
  initialApplication: Application,
): ApplicationActions => {
  const queryClient = useQueryClient()
  const [isApiCalling, setApiCalling] = useState(false)
  const [application, setApplication] =
    useState<Application>(initialApplication)

  const updateCache = (apiResponse: Application | null): void => {
    if (apiResponse == null) return
    setApplication(apiResponse)

    queryClient.setQueryData(
      ['application'],
      (oldData: Application[] | undefined) => {
        if (oldData == null) return []
        const indexToUpdate = oldData?.findIndex(
          (app) => app.id === apiResponse?.id,
        )
        if (apiResponse != null && indexToUpdate !== -1) {
          oldData[indexToUpdate] = apiResponse
        }
        return [...oldData]
      },
    )

    queryClient.setQueryData(['posts', initialApplication.id], () => {
      return apiResponse
    })
  }

  const mutationTrigger = useMutation<
    Application | undefined,
    unknown,
    string,
    unknown
  >(
    async (userName: string) =>
      await postApplicationTrigger(initialApplication.id, userName),
    {
      onSuccess: (data) => {
        setApiCalling(false)
        if (data != null) updateCache(data)
      },
      onError: () => {
        setApiCalling(false)
      },
    },
  )

  const mutationProposal = useMutation<
    Application | undefined,
    unknown,
    string,
    unknown
  >(
    async (requestId: string) =>
      await postApplicationProposal(initialApplication.id, requestId),
    {
      onSuccess: (data) => {
        setApiCalling(false)
        if (data != null) updateCache(data)
      },
      onError: () => {
        setApiCalling(false)
      },
    },
  )

  const mutationApproval = useMutation<
    Application | undefined,
    unknown,
    string,
    unknown
  >(
    async (requestId: string) =>
      await postApplicationApproval(initialApplication.id, requestId),
    {
      onSuccess: (data) => {
        setApiCalling(false)
        if (data != null) updateCache(data)
      },
      onError: () => {
        setApiCalling(false)
      },
    },
  )

  return {
    application,
    isApiCalling,
    setApiCalling,
    mutationTrigger,
    mutationProposal,
    mutationApproval,
  }
}

export default useApplicationActions
