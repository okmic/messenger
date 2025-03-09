import { Message } from './types'

const API_URL = 'http://localhost:1369'
const WS_URL = 'ws://localhost:6969'

export const getMessages = async (): Promise<Message[]> => {
  const response = await fetch(`${API_URL}/msg`)
  if (!response.ok) {
    throw new Error('Ошибка при загрузке сообщений')
  }
  return response.json()
}

export const sendMessage = async (text: string): Promise<void> => {
  const response = await fetch(`${API_URL}/msg`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  })
  if (!response.ok) {
    throw new Error('Ошибка при отправке сообщения')
  }
}

export const socket = new WebSocket(WS_URL)