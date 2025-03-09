import { MongoClient, Db, MongoClientOptions } from 'mongodb'
import { logger } from '../winston/winston.service'

export class DatabaseService {
  //ох и провозился я с репликациями, признаюсь честно, моя машинка очень долга сопротивлялась их устанавливать
  private uri: string = 'mongodb://127.0.0.1:27017/?replicaSet=rs0'
  private dbName: string = 'messageApp'
  private client: MongoClient
  private db: Db | null = null

  constructor() {
    const options: MongoClientOptions = {
      maxPoolSize: 10 
    }

    this.client = new MongoClient(this.uri, options)
  }

  public async connect(): Promise<void> {
    try {
      await this.client.connect()
      this.db = this.client.db(this.dbName)
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  public getDb(): Db {
    if (!this.db) {
      throw new Error('Error connection')
    }
    return this.db
  }

  public async close(): Promise<void> {
    if (this.client) {
      await this.client.close()
    }
  }
}