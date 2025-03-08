import { App } from './app'
import { MAIN_PORT } from './config'

const app = new App()
app.start(MAIN_PORT)