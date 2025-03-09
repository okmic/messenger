import { useQuery, useQueryClient } from '@tanstack/react-query'
import uuid from 'react-uuid'
import { getMessages } from '../api/api'
import { socketService } from '../api/ws'
import { IMessage } from '../api/types'
import { useEffect } from 'react'

const mergeMessages = (existingMessages: IMessage[], newMessages: IMessage[]) => {
  const updatedMessages = existingMessages.map((existingMessage) => {
    const updatedMessage = newMessages.find((msg) => msg._id === existingMessage._id)
    return updatedMessage && updatedMessage.text !== existingMessage.text
      ? { ...existingMessage, text: updatedMessage.text }
      : existingMessage
  })

  newMessages.forEach((newMessage) => {
    if (!existingMessages.some((msg) => msg._id === newMessage._id)) {
      updatedMessages.push(newMessage)
    }
  })

  const uniqueMessages = Array.from(new Map(updatedMessages.map((msg) => [msg._id, msg])).values())
  return uniqueMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

export const useMessages = () => {
  const queryClient = useQueryClient()

  const { data: messages, isLoading, isError } = useQuery<IMessage[]>({
    queryKey: ['messages'],
    queryFn: getMessages,
  })

  const handleIncomingMessages = (event: MessageEvent) => {
    const eventData: { type: 'messages'; messages: IMessage[] } = JSON.parse(event.data)
    if (eventData.type === 'messages') {
      queryClient.setQueryData<IMessage[]>(['messages'], (existingMessages) =>
        mergeMessages(eventData.messages || [], existingMessages || []),
      )
    }
  }

  useEffect(() => {
    socketService.initializeSocket(handleIncomingMessages)
    return () => socketService.closeSocket()
  }, [])

  const sendMessage = (text: string) => {
    const newMessage: IMessage = {
      _id: uuid(),
      text,
      createdAt: new Date(),
    }
    socketService.sendMessageViaSocket(newMessage)
    queryClient.setQueryData<IMessage[]>(['messages'], (existingMessages) =>
      mergeMessages([newMessage], existingMessages || []),
    )
  }

  return { messages, isLoading, isError, sendMessage }
}