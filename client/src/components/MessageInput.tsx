import { useState } from 'react'
import { Box, TextField, Button } from '@mui/material'

interface MessageInputProps {
  onSendMessage: (text: string) => void
}

export const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState('')

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage)
      setNewMessage('')
    }
  }

  return (
    <Box display="flex" gap={2}>
      <TextField
        fullWidth
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        placeholder="Введите сообщение..."
      />
      <Button variant="contained" onClick={handleSendMessage}>
        Отправить
      </Button>
    </Box>
  )
}