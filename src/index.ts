import { App } from './app'
import { MAIN_PORT, MAIN_WS_PORT } from './config'

const app = new App(MAIN_PORT, MAIN_WS_PORT)
app.start()