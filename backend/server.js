const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieSession = require('cookie-session');
require('dotenv').config();
const passport = require('passport');
require('./config/passport');

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────
// Allow Auth frontend + Client App B + Client App C
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3001',
    'http://localhost:3002',
    // LAN IP origins for cross-device testing
    'http://10.10.4.69:5173',
    'http://10.10.4.69:3001',
    'http://10.10.4.69:3002',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(express.json());

// ─── Session (cookie-based, enables SSO) ──────────────────────────
app.use(cookieSession({
    name: 'sso_session',
    keys: [process.env.SESSION_SECRET || 'fallback_session_key'],
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // Set to true in production with HTTPS
}));

app.use(passport.initialize());

app.get('/', (req, res) => {
    res.send('Auth API running');
});

app.use("/auth", require('./routes/authRoutes'));
app.use("/sso", require('./routes/ssoRoutes'));

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server started on port ${PORT} (accessible on all interfaces)`));