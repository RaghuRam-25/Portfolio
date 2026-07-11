require('dotenv').config();

const compression = require('compression');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const http = require('http');
const mongoose = require('mongoose');
const path = require('path');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const { Server } = require('socket.io');

const errorHandler = require('./middleware/errorMiddleware');
const requestLogger = require('./middleware/requestLogger');
const sanitizeRequest = require('./middleware/sanitizeMiddleware');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const messageRoutes = require('./routes/messageRoutes');
const profileRoutes = require('./routes/profileRoutes');
const summaryRoutes = require('./routes/summaryRoutes');
const userRoutes = require('./routes/userRoutes');
const skillRoutes = require('./routes/skillRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const educationRoutes = require('./routes/educationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const publicRoutes = require('./routes/publicRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const docsRoutes = require('./routes/docsRoutes');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error('[FATAL] MONGO_URI is required.');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET is required.');
  process.exit(1);
}

if (!process.env.SESSION_SECRET) {
  console.error('[FATAL] SESSION_SECRET is required.');
  process.exit(1);
}

const allowedOrigins = [
  process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const io = new Server(server, {
  cors: corsOptions,
});

app.set('io', io);
app.set('trust proxy', 1);

io.on('connection', (socket) => {
  socket.on('user:connect', async (userId) => {
    try {
      if (!userId) return;
      socket.join(userId);
      const ChatSession = require('./models/ChatSession');
      const chatSession = await ChatSession.findOne({ user: userId })
        .populate('user', 'name email avatarUrl role')
        .populate('messages.sender', 'name avatarUrl role');
      socket.emit('server:chat_history', chatSession || { messages: [] });
    } catch {
      socket.emit('server:chat_history', { messages: [] });
    }
  });

  socket.on('admin:connect', async (adminId) => {
    try {
      if (!adminId) return;
      socket.join('admins');
      const ChatSession = require('./models/ChatSession');
      const sessions = await ChatSession.find({ isArchived: false })
        .sort({ lastMessageAt: -1 })
        .populate('user', 'name email avatarUrl role')
        .populate('messages.sender', 'name avatarUrl role');
      socket.emit('server:all_sessions', sessions);
    } catch {
      socket.emit('server:all_sessions', []);
    }
  });

  socket.on('user:send_message', async ({ userId, message }) => {
    try {
      if (!userId || !message?.trim()) return;
      const ChatSession = require('./models/ChatSession');
      const chatSession = await ChatSession.findOneAndUpdate(
        { user: userId },
        {
          $push: { messages: { sender: userId, message: message.trim() } },
          $set: { lastMessageAt: new Date(), adminHasUnread: true, isArchived: false },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      )
        .populate('user', 'name email avatarUrl role')
        .populate('messages.sender', 'name avatarUrl role');

      const newMessage = chatSession.messages[chatSession.messages.length - 1];
      io.to(userId).emit('server:new_message', newMessage);
      io.to('admins').emit('server:session_updated', chatSession);
    } catch (error) {
      console.error('Socket user message failed:', error.message);
    }
  });

  socket.on('admin:send_message', async ({ adminId, userId, message }) => {
    try {
      if (!adminId || !userId || !message?.trim()) return;
      const ChatSession = require('./models/ChatSession');
      const chatSession = await ChatSession.findOneAndUpdate(
        { user: userId },
        {
          $push: { messages: { sender: adminId, message: message.trim() } },
          $set: { lastMessageAt: new Date(), userHasUnread: true, isArchived: false },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      )
        .populate('user', 'name email avatarUrl role')
        .populate('messages.sender', 'name avatarUrl role');

      const newMessage = chatSession.messages[chatSession.messages.length - 1];
      io.to(userId).emit('server:new_message', newMessage);
      io.to('admins').emit('server:session_updated', chatSession);
    } catch (error) {
      console.error('Socket admin message failed:', error.message);
    }
  });

  socket.on('admin:mark_read', async (sessionId) => {
    try {
      const ChatSession = require('./models/ChatSession');
      await ChatSession.findByIdAndUpdate(sessionId, { adminHasUnread: false });
    } catch (error) {
      console.error('Socket mark read failed:', error.message);
    }
  });
});

const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_MAX) || 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
});

app.use(requestLogger);
app.use(compression());
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(sanitizeRequest);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const passport = require('./config/passport');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (_req, res) => res.json({ success: true, message: 'Portfolio API running' }));
app.get('/api/health', (_req, res) => res.json({ success: true, status: 'ok', uptime: process.uptime() }));
app.use('/api/docs', docsRoutes);
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
    server.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Mongoose will try to reconnect.');
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  server.close(() => process.exit(0));
});

connectDB();
