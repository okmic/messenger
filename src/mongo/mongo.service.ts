import { MongoClient, Db } from 'mongodb'

export class DatabaseService {
  private uri: string = 'mongodb://localhost:27017'
  private dbName: string = 'messageApp'
  private client: MongoClient
  private db: Db

  constructor() {
    this.client =  new MongoClient(this.uri)
    this.db = this.client.db(this.dbName)
  }

  public async connect(): Promise<void> {
    this.db = this.client.db(this.dbName)
  }

  public getDb(): Db {
    return this.db
  }
}