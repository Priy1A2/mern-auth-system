const express = require("express")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

const router = express.Router()

// ─── Allowed redirect URIs (whitelist) ────────────────────────────
const ALLOWED_REDIRECT_URIS = [
    "http://localhost:3001/callback",
    "http://localhost:3002/callback",
    "http://localhost:5173/dashboard",
    // LAN IP variants for cross-device testing
    "http://10.10.4.69:3001/callback",
    "http://10.10.4.69:3002/callback",
    "http://10.10.4.69:5173/dashboard",
]

function isAllowedRedirect(uri) {
    if (!uri) return false
    return ALLOWED_REDIRECT_URIS.some(allowed => uri.startsWith(allowed))
}

// ─── /sso/authorize ───────────────────────────────────────────────
// Client apps redirect here. If the user has an active session cookie,
// we issue a JWT and redirect back immediately (SSO). If not, we
// redirect to the Auth frontend login page with the redirect_uri so
// the user can authenticate first.
router.get("/authorize", (req, res) => {
    const { redirect_uri } = req.query

    if (!redirect_uri || !isAllowedRedirect(redirect_uri)) {
        return res.status(400).json({ message: "Invalid or missing redirect_uri" })
    }

    // Check if user has an active session (SSO check)
    if (req.session && req.session.userId) {
        // User is already logged in — generate JWT and redirect back
        User.findById(req.session.userId)
            .then(user => {
                if (!user) {
                    // Session references a user that no longer exists
                    req.session = null
                    const loginURL = `${process.env.FRONTEND_URL || "http://localhost:5173"}/?redirect_uri=${encodeURIComponent(redirect_uri)}`
                    return res.redirect(loginURL)
                }

                const token = jwt.sign(
                    { id: user._id, email: user.email, name: user.name },
                    process.env.JWT_SECRET,
                    { expiresIn: "1d" }
                )

                const separator = redirect_uri.includes("?") ? "&" : "?"
                return res.redirect(`${redirect_uri}${separator}token=${token}`)
            })
            .catch(() => {
                return res.status(500).json({ message: "Server error during SSO" })
            })
    } else {
        // Not logged in — redirect to Auth frontend login with redirect_uri
        const loginURL = `${process.env.FRONTEND_URL || "http://localhost:5173"}/?redirect_uri=${encodeURIComponent(redirect_uri)}`
        return res.redirect(loginURL)
    }
})

// ─── /sso/verify ─────────────────────────────────────────────────
// Client apps call this to verify a JWT and get user info
router.post("/verify", (req, res) => {
    const { token } = req.body

    if (!token) {
        return res.status(400).json({ message: "Token required" })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        return res.json({
            valid: true,
            user: {
                id: decoded.id,
                email: decoded.email,
                name: decoded.name,
            }
        })
    } catch (err) {
        return res.status(401).json({ valid: false, message: "Invalid or expired token" })
    }
})

// ─── /sso/logout ──────────────────────────────────────────────────
// Clears the session cookie (central logout)
router.get("/logout", (req, res) => {
    req.session = null
    const redirectTo = req.query.redirect_uri || process.env.FRONTEND_URL || "http://localhost:5173"
    return res.redirect(redirectTo)
})

module.exports = router
