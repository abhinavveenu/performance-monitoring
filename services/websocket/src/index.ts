import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.WS_PORT || 4500;
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers['authorization'];
  if (!token) return next(new Error('Unauthorized'));
  try {
    const payload = jwt.verify((token as string).replace('Bearer ', ''), JWT_SECRET) as any;
    (socket as any).projectKey = payload.projectKey;
    return next();
  } catch (e) {
    return next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  const projectKey = (socket as any).projectKey;
  socket.join(`project:${projectKey}`);
  socket.emit('connected', { projectKey });
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

server.listen(PORT, () => console.log(`WebSocket server listening on :${PORT}`));


