import { useState } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import GoogleLoginButton from "../components/GoogleLoginButton"
import Spline from "@splinetool/react-spline"

function Login(){

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")
const [loading, setLoading] = useState(false)
const [error, setError] = useState("")

const handleLogin = async () => {

if(!email || !password){ setError("Please fill in all fields"); return }
setError("")
setLoading(true)

try{

const res = await axios.post(
"http://localhost:5000/auth/login",
{email,password}
)

localStorage.setItem("token", res.data.token)
localStorage.setItem("name", res.data.user.name)

// Hard redirect — ensures ProtectedRoute re-reads localStorage on fresh render
window.location.href = "/dashboard"

}catch(err){

setError(err.response?.data?.message || "Login failed")
setLoading(false)

}

}

const handleKeyDown = (e) => {
if(e.key === "Enter") handleLogin()
}

return(
<div className="auth-wrapper">

  {/* Dimmed Spline background on login */}
  <div className="spline-bg spline-dim">
    <Spline scene="https://prod.spline.design/gLAZvU44dEmvkTdY/scene.splinecode" />
  </div>

  {/* Login card */}
  <div className="auth-card">
    <div className="auth-logo">🔐</div>
    <h2 className="auth-title">Welcome Back</h2>
    <p className="auth-subtitle">Sign in to your account</p>

    {error && <div className="auth-error">{error}</div>}

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
        placeholder="••••••••"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>

    <button className="primary-btn" onClick={handleLogin} disabled={loading}>
      {loading ? "Signing in…" : "Sign In"}
    </button>

    <div className="divider"><span>or</span></div>

    <GoogleLoginButton />

    <p className="auth-footer">
      Don't have an account? <Link to="/register">Create one</Link>
    </p>
  </div>

</div>
)

}

export default Login