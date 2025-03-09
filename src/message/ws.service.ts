import { WebSocketServer, WebSocket } from 'ws'
import { DatabaseService } from '../mongo/mongo.service'
import { MessageBundleProcessor } from './msg-batch.processor.service'
import { v4 } from 'uuid'

export class WSService {
  private wss: WebSocketServer
  private messageBundleProcessor: MessageBundleProcessor

  constructor(private databaseService: DatabaseService, wss: WebSocketServer) {
    this.wss = wss
    this.messageBundleProcessor = new MessageBundleProcessor(databaseService, this.wss)
    this.messageBundleProcessor.startBundleProcessing()
  }

  public start(): void {

    this.wss.on('connection', (ws: WebSocket) => {
      const msgDb = this.databaseService.getDb().collection('messages')

      msgDb.watch().on('change', async (change) => {
        if (change.operationType === 'insert') {
          const messages = await msgDb
            .find()
            .toArray()

          ws.send(JSON.stringify({ type: 'messages', messages }))
        }
      })

      ws.on('message', (data: string) => {

        const message: {
          type: 'sendMessage',

          data: {
               _id?: string
               text: string
               createdAt?: string
             }
          } = JSON.parse(data)

        if (message.type === 'sendMessage' && message.data.text) {
          this.messageBundleProcessor.addMessageToBundle({
            _id: message.data._id || undefined,
            createdAt: (message.data.createdAt && new Date(message.data.createdAt)) || new Date(),
            text: message.data.text,
          })
        }
      })


      ws.on('close', () => {
        msgDb.watch().close()
        ws.removeAllListeners('message')
      })
    })
  }
}