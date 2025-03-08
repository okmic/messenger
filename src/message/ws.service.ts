import { WebSocketServer, WebSocket } from 'ws'
import { DatabaseService } from '../mongo/mongo.service'

export class WSService {
  private wss: WebSocketServer

  constructor(private databaseService: DatabaseService) {
    this.wss = new WebSocketServer({ port: 6969 })
  }

  public start(port: number): void {

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New WebSocket connection')

      const changeStream = this.databaseService.getDb().collection('messages').watch()

      changeStream.on('change', (change) => {
        if (change.operationType === 'insert') {
          const message = change.fullDocument
          ws.send(JSON.stringify(message))
        }
      })

      ws.on('close', () => {
        console.log('WebSocket connection closed')
        changeStream.close()
      })
    })

    console.log(`WebSocket Server is running on port ${port}`)
  }
}