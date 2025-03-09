import fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import { MessageController } from './message/message.controller'
import { DatabaseService } from './mongo/mongo.service'
import { MessageBundleProcessor } from './message/msg-batch.processor.service'
import { WSService } from './message/ws.service'
import { WebSocketServer } from 'ws'

export class App {

  private PORT: number
  private WS_PORT: number
  private app: FastifyInstance
  private messageController: MessageController
  private wsServer: WebSocketServer
  public  wsService: WSService
  private databaseService: DatabaseService
  private messageBundleProcessor: MessageBundleProcessor

  constructor(PORT: number, WS_PORT: number) {
    this.PORT = PORT
    this.WS_PORT = WS_PORT
    this.wsServer = new WebSocketServer({ port: this.WS_PORT })
    this.app = fastify({ logger: true })
    this.app.register((cors)) 
    this.databaseService = new DatabaseService()
    this.wsService = new WSService(this.databaseService, this.wsServer)
    this.messageBundleProcessor = new MessageBundleProcessor(this.databaseService, this.wsServer)
    this.messageController = new MessageController(this.messageBundleProcessor)

    this.configureRoutes()
  }

  private configureRoutes(): void {
    this.app.post('/msg', (req, reply) => this.messageController.createMessage(req, reply))
    this.app.get('/msg', (req, reply) => this.messageController.getMessages(req, reply))
  }

  public async start(): Promise<void> {
    await this.databaseService.connect()
    this.messageBundleProcessor.startBundleProcessing()

    this.wsService.start()

    await this.app.listen({ port: this.PORT })
    console.log(`Server is running on port ${this.PORT}`)
  }
}