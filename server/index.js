import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import aiRoutes from './routes/ai.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })
dotenv.config()

const app = express()
const port = Number(process.env.SERVER_PORT || 8787)

app.set('trust proxy', 1)

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
  })
)

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false, limit: '1mb' }))

app.use(
  '/api/ai',
  rateLimit({
    windowMs: 60 * 1000,
    limit: Number(process.env.RATE_LIMIT_PER_MINUTE || 40),
    standardHeaders: true,
    legacyHeaders: false,
  })
)

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.use('/api/ai', aiRoutes)

app.use((error, req, res, next) => {
  const status = error?.status || 500
  res.status(status).json({
    error: error?.message || 'Unexpected server error',
  })
})

app.listen(port, () => {
  console.log(`AI proxy server running on http://localhost:${port}`)
})
