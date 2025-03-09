import { WebSocketServer, WebSocket } from 'ws'
import { DatabaseService } from '../mongo/mongo.service'
import { MessageBundleProcessor } from './msg-batch.processor.service'
import { v4 } from 'uuid'
import { logger } from '../winston/winston.service'

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

      try {
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

          try {
            const message: {
              type: 'sendMessage',

              data: {
                _id?: string
                text: string
                createdAt?: string
              }
            } = JSON.parse(data)
            console.log(message)
            if (message.type === 'sendMessage' && message.data.text) {
              this.messageBundleProcessor.addMessageToBundle({
                _id: message.data._id || undefined,
                createdAt: (message.data.createdAt && new Date(message.data.createdAt)) || new Date(),
                text: message.data.text,
              })
            }
          } catch (e) {
            console.log(e)
            logger.error(e)
          }

        })


        ws.on('close', () => {
          try {
            msgDb.watch().close()
            ws.removeAllListeners('message')
          } catch (e) {
            logger.error(e)
          }
        })
      } catch (e) {
        logger.error(e)
      }
    })

  }
}