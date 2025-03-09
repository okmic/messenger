import { FastifyRequest, FastifyReply } from 'fastify'
import { MessageBundleProcessor } from './msg-batch.processor.service'
import { v4 } from 'uuid'

export class MessageController {

  constructor(private messageBundleProcessor: MessageBundleProcessor) {}

  public createMessage(req: FastifyRequest, reply: FastifyReply): void {
    const { text } = req.body as { text: string }
    if (!text) {
      reply.status(400).send({ error: 'Text is required' })
      return
    }

    const message = {_id: v4(), text, createdAt: new Date()}
    this.messageBundleProcessor.addMessageToBundle(message)
    reply.status(201).send({ message: 'Message added to batch' })
  }

  public async getMessages(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const messages = await this.messageBundleProcessor.getMessages()
    reply.send(messages)
  }
  
}