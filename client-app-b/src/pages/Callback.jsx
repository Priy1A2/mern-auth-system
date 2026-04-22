import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { SSO_CONFIG } from "../ssoConfig"

function Callback() {
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")

    if (!token) {
      setError("No token received from Auth Server")
      return
    }

    // Verify the token with the Auth Server
    axios
      .post(`${SSO_CONFIG.AUTH_SERVER_URL}/sso/verify`, { token })
      .then((res) => {
        if (res.data.valid) {
          // Store token and user info
          localStorage.setItem("sso_token", token)
          localStorage.setItem("sso_user", JSON.stringify(res.data.user))
          // Redirect to dashboard
          navigate("/dashboard", { replace: true })
        } else {
          setError("Token verification failed")
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Token verification failed")
      })
  }, [navigate])

  if (error) {
    return (
      <div className="error-wrapper">
        <div className="error-icon">⚠️</div>
        <p className="error-text">{error}</p>
        <button className="btn-primary" onClick={() => (window.location.href = "/")}>
          Back to Login
        </button>
      </div>
    )
  }

  return (
    <div className="loading-wrapper">
      <div className="spinner"></div>
      <p className="loading-text">Logging you in…</p>
    </div>
  )
}

export default Callback
