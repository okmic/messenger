import { List, ListItem, ListItemText, Typography } from '@mui/material'
import { IMessage } from '../api/types'


interface MessageListProps {
  messages: IMessage[]
}

export const MessageList = ({ messages }: MessageListProps) => {

  if (messages.length === 0) {
    return <Typography textAlign="center">Нет сообщений</Typography>
  }

  return (
    <List sx={{ maxHeight: '400px', overflowY: 'auto', mb: 2 }}>
      {messages.map((message) => (
        <ListItem key={message._id} sx={{ bgcolor: 'grey.100', mb: 1, borderRadius: 1 }}>
          <ListItemText primary={message.text} />
        </ListItem>
      ))}
    </List>
  )
}