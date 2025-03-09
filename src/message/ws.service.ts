import { WebSocketServer, WebSocket } from 'ws'
import { DatabaseService } from '../mongo/mongo.service'

export class WSService {
  private wss: WebSocketServer

  constructor(private databaseService: DatabaseService) {
    this.wss = new WebSocketServer({ port: 6969 })
  }

  public start(port: number): void {

    this.wss.on('connection', (ws: WebSocket) => {
      const changeStream = this.databaseService.getDb().collection('messages').watch()

      changeStream.on('change', (change) => {
        if (change.operationType === 'insert') {
          const message = change.fullDocument
          ws.send(JSON.stringify(message))
        }
      })

      ws.on('close', () => {
        changeStream.close()
      })
    })

    console.log(`WebSocket Server is running on port ${port}`)
  }
}