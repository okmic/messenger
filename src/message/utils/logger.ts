export interface LogEntry {
    timestamp: Date
    event: string
    details: Record<string, any>
  }
  
  export class Logger {
    public static log(event: string, details: Record<string, any> = {}): void {
      const logEntry: LogEntry = {
        timestamp: new Date(),
        event,
        details,
      }
      console.log(JSON.stringify(logEntry, null, 2)) // Красивое форматирование JSON
    }
  
    public static error(event: string, error: Error, details: Record<string, any> = {}): void {
      const logEntry: LogEntry = {
        timestamp: new Date(),
        event,
        details: {
          ...details,
          error: error.message,
          stack: error.stack,
        },
      }
      console.error(JSON.stringify(logEntry, null, 2))
    }
  }