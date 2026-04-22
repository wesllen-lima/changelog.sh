import { Hono } from 'hono'
import { config } from './config'
import { errorHandler } from './middleware/error'
import { corsMiddleware } from './middleware/cors'
import authRoutes from './routes/auth'
import projectRoutes from './routes/projects'
import entryRoutes from './routes/entries'
import apiKeyRoutes from './routes/api-keys'
import widgetRoutes from './routes/widget'
import staticRoutes from './routes/static'
import publicRoutes from './routes/public'

const app = new Hono()

app.use('/*', corsMiddleware)
app.onError(errorHandler)

app.route('/auth', authRoutes)
app.route('/api/projects', projectRoutes)
app.route('/api', entryRoutes)
app.route('/api', apiKeyRoutes)
app.route('/widget', widgetRoutes)
app.route('/', staticRoutes)
app.route('/', publicRoutes)

app.get('/', (c) => c.text('changelog.sh'))

export default { port: config.PORT, fetch: app.fetch }
