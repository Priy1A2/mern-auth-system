import { useState } from "react"
import axios from "axios"
import { Link, useSearchParams } from "react-router-dom"
import GoogleLoginButton from "../components/GoogleLoginButton"
import { API_URL } from "../utils/apiConfig"

function Login(){

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")
const [loading, setLoading] = useState(false)
const [error, setError] = useState("")
const [searchParams] = useSearchParams()

// SSO: check if a client app sent a redirect_uri
const redirectUri = searchParams.get("redirect_uri")

const handleLogin = async () => {

if(!email || !password){ setError("Please fill in all fields"); return }
setError("")
setLoading(true)

try{

const res = await axios.post(
`${API_URL}/auth/login`,
{email,password},
{ withCredentials: true }
)

localStorage.setItem("token", res.data.token)
localStorage.setItem("name", res.data.user.name)
localStorage.setItem("email", res.data.user.email)

// SSO: if a redirect_uri was provided, redirect back to the client app with the token
if(redirectUri){
const separator = redirectUri.includes("?") ? "&" : "?"
window.location.href = `${redirectUri}${separator}token=${res.data.token}`
return
}

// Default: go to auth server dashboard
window.location.href = "/dashboard"

}catch(err){

setError(err.response?.data?.message || "Login failed")
setLoading(false)

}

}

const handleKeyDown = (e) => {
if(e.key === "Enter") handleLogin()
}

// Build Google login URL with redirect_uri if present (for SSO)
const googleUrl = redirectUri
? `${API_URL}/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`
: `${API_URL}/auth/google`

return(
<div className="auth-wrapper">

  <div className="auth-card">
    <div className="auth-logo">🔐</div>
    <h2 className="auth-title">Sign in to Auth</h2>
    <p className="auth-subtitle">Enter your credentials to continue</p>

    {redirectUri && (
      <div className="sso-info">
        🔗 You'll be redirected back after signing in
      </div>
    )}

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

    <GoogleLoginButton url={googleUrl} />

    <p className="auth-footer">
      Don't have an account? <Link to={redirectUri ? `/register?redirect_uri=${encodeURIComponent(redirectUri)}` : "/register"}>Create one</Link>
    </p>
  </div>

</div>
)

}

export default Login