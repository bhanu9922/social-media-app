// Importing required modules
import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { v2 as cloudinary } from 'cloudinary';
import cors from 'cors';
import bodyParser from 'body-parser';

// Importing routes
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

// Importing socket and cron job
import { app, server } from './socket/socket.js';
import job from './cron/cron.js';

// Importing database connection
import connectDB from './config/db.js';

// Load environment variables
dotenv.config();

// Start cron job
job.start();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middlewares
app.use(express.json({ limit: '50mb' })); // To parse JSON data in the req.body
app.use(express.urlencoded({ extended: true })); // To parse form data in the req.body
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);

// Serve static assets if in production
const __dirname = path.resolve();
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '/frontend/dist')));

    // Serve React app
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
    });
}

// Example API route
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from server!' });
});

// Root URL route
app.get('/', (req, res) => {
    res.send('Welcome to the Fitness Tracker App');
});

// Connect to the database
connectDB();

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`));
