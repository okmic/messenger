import { useQuery, useQueryClient } from '@tanstack/react-query'
import uuid from "react-uuid"
import { getMessages, socket } from '../api/api'
import { IMessage } from '../api/types'
import { useEffect } from 'react'


const updateMessages = (oldMessages: IMessage[], newMessages: IMessage[]) => {
  const updatedMessages = oldMessages.map(oldMessage => {
    const newMessage = newMessages.find(msg => msg._id === oldMessage._id)
    return newMessage && newMessage.text !== oldMessage.text
      ? { ...oldMessage, text: newMessage.text }
      : oldMessage
  })

  newMessages.forEach(newMessage => {
    if (!oldMessages.some(oldMessage => oldMessage._id === newMessage._id)) {
      updatedMessages.push(newMessage)
    }
  })

  const uniqueMessagesMap = new Map()

  updatedMessages.forEach(message => {
    uniqueMessagesMap.set(message._id, message)
  })
  
  console.log(updatedMessages)

  return Array.from(uniqueMessagesMap.values()).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

export const useMessages = () => {
  const queryClient = useQueryClient()

  const { data: messages, isLoading, isError } = useQuery<IMessage[]>({
    queryKey: ['messages'],
    queryFn: getMessages,
  })

  const sendMessage = (message: string) => {
    if (socket.readyState === WebSocket.OPEN) {
      const newMessage: IMessage = {
        _id: uuid(),
        text: message,
        createdAt: new Date(),
      }
      socket.send(JSON.stringify({ type: 'sendMessage', data: newMessage }))

      queryClient.setQueryData<IMessage[]>(['messages'], (oldMessages) => {
        return [
        ...updateMessages(
        [newMessage], 
        (oldMessages || []))
      ]
      })
    } else {
      console.error('WebSocket is not open')
    }
  }

  useEffect(() => {
    
    const onNewMessages = (event: MessageEvent) => {

      const eventData: {type: "messages", messages: IMessage[]} = JSON.parse(event.data)

      if (eventData.type === 'messages') {
        queryClient.setQueryData<IMessage[]>(['messages'], (oldMessages) => {
          return [
          ...updateMessages(
          (eventData.messages || []), 
          (oldMessages || []))]
        })
      }

    }

    if (socket.readyState === WebSocket.OPEN) {
      socket.addEventListener('message', onNewMessages)
    } else {
      socket.addEventListener('open', () => {
        socket.addEventListener('message', onNewMessages)
      })
    }

    return () => {
      socket.removeEventListener('message', onNewMessages)
    }
  }, [queryClient])

  return { messages, isLoading, isError, sendMessage }
}