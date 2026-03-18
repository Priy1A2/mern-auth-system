import { useState } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import Spline from "@splinetool/react-spline"

function Register(){

const [name,setName] = useState("")
const [email,setEmail] = useState("")
const [password,setPassword] = useState("")
const [loading, setLoading] = useState(false)
const [error, setError] = useState("")

const handleRegister = async () => {

if(!name || !email || !password){ setError("Please fill in all fields"); return }
if(password.length < 8){ setError("Password must be at least 8 characters"); return }
setError("")
setLoading(true)

try{

// Step 1: register
await axios.post(
"http://localhost:5000/auth/register",
{name,email,password}
)

// Step 2: auto-login so user lands directly on dashboard
const res = await axios.post(
"http://localhost:5000/auth/login",
{email,password}
)

localStorage.setItem("token", res.data.token)
localStorage.setItem("name", res.data.user.name)

// Hard redirect so ProtectedRoute re-reads localStorage cleanly
window.location.href = "/dashboard"

}catch(err){

setError(err.response?.data?.message || "Registration failed")
setLoading(false)

}

}

const handleKeyDown = (e) => {
if(e.key === "Enter") handleRegister()
}

return(
<div className="auth-wrapper">

  {/* Dimmed Spline background on register */}
  <div className="spline-bg spline-dim">
    <Spline scene="https://prod.spline.design/gLAZvU44dEmvkTdY/scene.splinecode" />
  </div>

  <div className="auth-card">
    <div className="auth-logo">✨</div>
    <h2 className="auth-title">Create Account</h2>
    <p className="auth-subtitle">Join us today, it's free</p>

    {error && <div className="auth-error">{error}</div>}

    <div className="input-group">
      <label>Full Name</label>
      <input
        placeholder="John Doe"
        value={name}
        onChange={(e)=>setName(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>

    <div className="input-group">
      <label>Email</label>
      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>

    <div className="input-group">
      <label>Password</label>
      <input
        type="password"
        placeholder="Min. 8 characters"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>

    <button className="primary-btn" onClick={handleRegister} disabled={loading}>
      {loading ? "Creating account…" : "Create Account"}
    </button>

    <p className="auth-footer">
      Already have an account? <Link to="/">Sign in</Link>
    </p>
  </div>

</div>
)

}

export default Register