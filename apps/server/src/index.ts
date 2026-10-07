import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'

const port = Number(process.env.PORT ?? 8788)
const server = createServer((request, response) => {
  response.setHeader('content-type', 'application/json')
  response.setHeader('access-control-allow-origin', process.env.APP_ORIGIN ?? 'http://localhost:5173')
  if (request.url === '/health') return response.end(JSON.stringify({ ok: true }))
  response.statusCode = 404
  response.end(JSON.stringify({ error: 'Not found' }))
})

const peers = new WebSocketServer({ server, path: '/ws' })
peers.on('connection', (socket) => {
  socket.on('message', (payload) => {
    // Real deployments authenticate the session before forwarding an event.
    for (const peer of peers.clients) if (peer.readyState === peer.OPEN) peer.send(payload.toString())
  })
})

server.listen(port, () => console.log(`Noxi Web server listening on :${port}`))
