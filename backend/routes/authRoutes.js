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

const token = jwt.sign(
{ id:user._id },
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
passport.authenticate("google",{scope:["profile","email"]})
)

// GOOGLE CALLBACK — issues JWT and redirects to frontend with token + name
router.get(
"/google/callback",
passport.authenticate("google",{session:false, failureRedirect:"http://localhost:5173/?error=google_failed"}),
(req,res)=>{
const token = jwt.sign(
{ id:req.user._id },
process.env.JWT_SECRET,
{ expiresIn:"1d" }
)
const name = encodeURIComponent(req.user.name)
res.redirect(`http://localhost:5173/dashboard?token=${token}&name=${name}`)
}
)

module.exports = router