import { List, ListItem, ListItemText, Typography } from '@mui/material'
import { IMessage } from '../api/types'
import { useEffect, useRef } from 'react'

interface MessageListProps {
  messages: IMessage[]
}

export const MessageList = ({ messages }: MessageListProps) => {
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages])

  if (messages.length === 0) {
    return <Typography textAlign="center">Нет сообщений</Typography>
  }

  return (
    <List
      ref={listRef}
      sx={{
        maxHeight: '400px',
        overflowY: 'auto',
        mb: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
        p: 2,
      }}
    >
      {messages.map((message) => (
        <ListItem
          key={message._id}
          sx={{
            bgcolor: 'grey.100',
            mb: 1,
            borderRadius: 1,
            boxShadow: 1,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 2,
            },
          }}
        >
          <ListItemText
            primary={message.text}
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: 'medium',
              color: 'text.primary',
            }}
          />
        </ListItem>
      ))}
    </List>
  )
}