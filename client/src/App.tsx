import React from 'react'
import { Container, Box, Typography } from '@mui/material'
import { useMessages } from './hooks/useMessages'
import { MessageList } from './components/MessageList'
import { MessageInput } from './components/MessageInput'
import { IMessage } from './api/types'

const App: React.FC = () => {
  const { messages, isLoading, isError, sendMessage } = useMessages()

  if (isLoading) return <Typography textAlign="center">Загрузка сообщений...</Typography>
  if (isError) return <Typography textAlign="center" color="error">Ошибка при загрузке сообщений</Typography>

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box sx={{ boxShadow: 3, borderRadius: 2, p: 3, bgcolor: 'background.paper' }}>
        <Typography variant="h4" textAlign="center" mb={2}>
          Messager
        </Typography>
        <MessageList messages={messages as IMessage[] || []} />
        <MessageInput onSendMessage={sendMessage} />
      </Box>
    </Container>
  )
}

export default App