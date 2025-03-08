import fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import { MessageController } from './message/message.controller'
import { DatabaseService } from './mongo/mongo.service'
import { MessageBundleProcessor } from './message/msg-batch.processor.service'
import { WSService } from './message/ws.service'

export class App {

  private app: FastifyInstance
  private messageController: MessageController
  private databaseService: DatabaseService
  private messageBundleProcessor: MessageBundleProcessor
  private webSocketServer: WSService

  constructor() {
    this.app = fastify({ logger: true })
    this.app.register((cors)) 
    this.databaseService = new DatabaseService()
    this.messageBundleProcessor = new MessageBundleProcessor(this.databaseService)
    this.messageController = new MessageController(this.messageBundleProcessor)
    this.webSocketServer = new WSService(this.databaseService)

    this.configureRoutes()
  }

  private configureRoutes(): void {
    this.app.post('/msg', (req, reply) => this.messageController.createMessage(req, reply))
    this.app.get('/msg', (req, reply) => this.messageController.getMessages(req, reply))
  }

  public async start(port: number): Promise<void> {
    await this.databaseService.connect()
    this.messageBundleProcessor.startBundleProcessing()

    this.webSocketServer.start(port)

    await this.app.listen({ port  })
    console.log(`Server is running on port ${port}`)
  }
}