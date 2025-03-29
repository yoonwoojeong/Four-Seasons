const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join', (room) => {
    socket.join(room);
  });

  socket.on('message', (data) => {
    io.to(data.room).emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Routes will be added here
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/calendar', require('./routes/calendar'));

// Add a simple route for the root path
app.get('/', (req, res) => {
  res.send('API server is running!');
});

// Force using a random available port regardless of .env setting
const PORT = 0;
server.listen(PORT, () => {
  const address = server.address();
  const serverPort = address.port;
  console.log(`Server running on port ${serverPort}`);
  console.log(`Access your API at http://localhost:${serverPort}`);
  console.log(`Access your API endpoints at http://localhost:${serverPort}/api/posts, etc.`);
}); 