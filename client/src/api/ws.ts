import { WS_URL } from "../config"
import { IMessage } from "./types"

let socket: WebSocket | null = null

const initializeSocket = (onMessage: (event: MessageEvent) => void) => {
  socket = new WebSocket(WS_URL)

  socket.onopen = () => {
    console.log('WebSocket connected')
  }

  socket.onerror = (error) => {
    console.error('WebSocket error:', error)
    setTimeout(() => initializeSocket(onMessage), 5000)
  }

  socket.onclose = () => {
    console.log('WebSocket disconnected')
    setTimeout(() => initializeSocket(onMessage), 5000)
  }

  socket.onmessage = onMessage
}

const sendMessageViaSocket = (message: IMessage) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'sendMessage', data: message }))
  } else {
    console.error('WebSocket is not open')
  }
}

const closeSocket = () => {
  if (socket) {
    socket.close()
    socket = null
  }
}


export const socketService = {
  initializeSocket,
  sendMessageViaSocket,
  closeSocket,
}