import { API_URL, WS_URL } from '../config'
import { IMessage } from './types'


export const getMessages = async (): Promise<IMessage[]> => {
  const response = await fetch(`${API_URL}/msg`)
  if (!response.ok) {
    throw new Error('Ошибка при загрузке сообщений')
  }
  return response.json()
}


export const socket = new WebSocket(WS_URL)