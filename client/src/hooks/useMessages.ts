import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMessages, sendMessage, socket } from '../api/api'
import { Message } from '../api/types'
import { useEffect } from 'react'

export const useMessages = () => {
  const queryClient = useQueryClient()

  const { data: messages, isLoading, isError } = useQuery<Message[]>({
    queryKey: ['messages'],
    queryFn: getMessages,
  })

  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
  })

  useEffect(() => {
    
    const handleNewMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data)
      if (message.type === 'newMessage') {
        console.log(message.data)
        queryClient.setQueryData<Message[]>(['messages'], (oldMessages) => [
          message.data,
          ...(oldMessages || []),
        ])
      }
    }

    if (socket.readyState === WebSocket.OPEN) {
      socket.addEventListener('message', handleNewMessage)
    } else {
      socket.addEventListener('open', () => {
        socket.addEventListener('message', handleNewMessage)
      })
    }

    return () => {
      socket.removeEventListener('message', handleNewMessage)
    }
  }, [queryClient])

  return { messages, isLoading, isError, sendMessage: sendMessageMutation.mutate }
}