const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const passport = require("passport")

const router = express.Router()

// REGISTER
router.post("/register", async (req,res)=>{

try{

const {name,email,password} = req.body

const existingUser = await User.findOne({email})

if(existingUser){
return res.status(400).json({message:"User already exists"})
}

const hashedPassword = await bcrypt.hash(password,10)

const user = new User({
name,
email,
password:hashedPassword
})

await user.save()

res.json({message:"User registered successfully"})

}catch(err){

console.error(err)
res.status(500).json({message:"Error registering user"})

}

})

// LOGIN
router.post("/login", async (req,res)=>{

try{

const {email,password} = req.body

const user = await User.findOne({email})

if(!user){
return res.status(400).json({message:"User not found"})
}

if(!user.password){
return res.status(400).json({message:"This account uses Google sign-in. Please login with Google."})
}

const isMatch = await bcrypt.compare(password,user.password)

if(!isMatch){
return res.status(400).json({message:"Invalid password"})
}

// Set session cookie for SSO
req.session.userId = user._id.toString()

const token = jwt.sign(
{ id:user._id, email:user.email, name:user.name },
process.env.JWT_SECRET,
{ expiresIn:"1d" }
)

res.json({
token,
user:{
name:user.name,
email:user.email
}
})

}catch(err){

console.error(err)
res.status(500).json({message:"Login failed"})

}

})

// GOOGLE LOGIN — initiates OAuth flow
router.get(
"/google",
(req, res, next) => {
    // Preserve redirect_uri through Google OAuth via state parameter
    const redirect_uri = req.query.redirect_uri || ""
    passport.authenticate("google", {
        scope: ["profile", "email"],
        state: redirect_uri
    })(req, res, next)
}
)

// GOOGLE CALLBACK — issues JWT and redirects to frontend with token + name
router.get(
"/google/callback",
passport.authenticate("google",{session:false, failureRedirect:`${process.env.FRONTEND_URL || "http://localhost:5173"}/?error=google_failed`}),
(req,res)=>{
    // Set session cookie for SSO
    req.session.userId = req.user._id.toString()

    const token = jwt.sign(
        { id:req.user._id, email:req.user.email, name:req.user.name },
        process.env.JWT_SECRET,
        { expiresIn:"1d" }
    )

    // If there was a redirect_uri from a client app, redirect there
    const redirect_uri = req.query.state
    if (redirect_uri && redirect_uri.startsWith("http")) {
        const separator = redirect_uri.includes("?") ? "&" : "?"
        return res.redirect(`${redirect_uri}${separator}token=${token}`)
    }

    // Default: redirect to Auth frontend dashboard
    const name = encodeURIComponent(req.user.name)
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard?token=${token}&name=${name}`)
}
)

// LOGOUT — clear session cookie
router.post("/logout", (req, res) => {
    req.session = null
    res.json({ message: "Logged out successfully" })
})

module.exports = router