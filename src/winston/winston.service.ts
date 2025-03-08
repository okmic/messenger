import winston from 'winston'
import dotenv from "dotenv"
dotenv.config()

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
)

const prettyFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.prettyPrint(),
)

const transports = [
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production' ? jsonFormat : prettyFormat,
  }),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: jsonFormat,
  }),
  new winston.transports.File({
    filename: 'logs/success-msgs.log',
    format: jsonFormat,
  }),
]

export const logger = winston.createLogger({
  level: 'info',
  transports,
  defaultMeta: { service: 'msg-app' },
})