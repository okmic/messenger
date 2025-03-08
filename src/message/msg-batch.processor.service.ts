import { DatabaseService } from '../mongo/mongo.service'
import { logger } from '../winston/winston.service'

interface Message {
  text: string
  createdAt: Date
}

export class MessageBundleProcessor {
  private messageBundle: Message[] = []
  private timeout: NodeJS.Timeout | null = null
  private totalMessagesProcessed: number = 0
  private totalBundlesSent: number = 0

  constructor(private databaseService: DatabaseService) {}

  public addMessageToBundle(message: Message): void {
    this.messageBundle.push(message)
    this.totalMessagesProcessed++

    if (this.messageBundle.length >= 10) {
      this.flushBundle()
    } else if (!this.timeout) {
      this.timeout = setTimeout(() => this.flushBundle(), 1000)
    }
  }

  private async flushBundle(): Promise<void> {
    if (this.messageBundle.length > 0) {
      try {
        const collection = this.databaseService.getDb().collection<Message>('messages')
        await collection.insertMany(this.messageBundle)

        this.totalBundlesSent++

        logger.info('Bundle saved to MongoDB', {
          bundleSize: this.messageBundle.length,
          totalBundlesSent: this.totalBundlesSent,
          totalMessagesProcessed: this.totalMessagesProcessed,
        })
      } catch (error) {
        logger.error('Failed to save bundle to MongoDB', {
          bundleSize: this.messageBundle.length,
          error: (error as Error).message,
          stack: (error as Error).stack,
        })
      } finally {
        this.messageBundle = []
      }
    }

    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }
  }

  public async getMessages(): Promise<Message[]> {
    try {
      const collection = this.databaseService.getDb().collection<Message>('messages')
      const messages = await collection.find().toArray()


      return messages
    } catch (error) {
      logger.error('Failed to fetch messages from MongoDB', {
        error: (error as Error).message,
        stack: (error as Error).stack,
      })
      return []
    }
  }


  public startBundleProcessing(): void {
    const shutdownHandler = async (signal: string) => {
      logger.info('Server shutdown initiated', { signal })
      await this.flushBundle()

      process.exit(0)
    }

    process.on('SIGINT', () => shutdownHandler('SIGINT'))
    process.on('SIGTERM', () => shutdownHandler('SIGTERM'))
  }
}