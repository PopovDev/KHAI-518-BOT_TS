const PORT = parseInt(process.env.PORT) || 3000

const BOT_TOKEN = process.env.BOT_TOKEN 
const MONGO_STRING = process.env.MONGO_STRING 

const WEBHOOK_DOMAIN = process.env.WEBHOOK_DOMAIN
const WEBHOOK_PATH = "/webhook"

const USE_WEBHOOK = process.env.USE_WEBHOOK === "true" || false

export { PORT, BOT_TOKEN, MONGO_STRING, WEBHOOK_DOMAIN, WEBHOOK_PATH, USE_WEBHOOK }