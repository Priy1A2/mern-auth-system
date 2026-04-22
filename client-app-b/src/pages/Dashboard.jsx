import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { SSO_CONFIG } from "../ssoConfig"

function Dashboard() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("sso_token")
    const storedUser = localStorage.getItem("sso_user")

    if (!token || !storedUser) {
      navigate("/", { replace: true })
      return
    }

    try {
      setUser(JSON.parse(storedUser))
    } catch {
      navigate("/", { replace: true })
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem("sso_token")
    localStorage.removeItem("sso_user")
    window.location.href = "/"
  }

  if (!user) return null

  return (
    <div className="page-wrapper">
      <div className="app-header">
        <span className="app-name">📦 {SSO_CONFIG.APP_NAME}</span>
        <span className="header-badge">SSO Authenticated</span>
      </div>

      <div className="card">
        <div className="badge-success">You're logged in ✓</div>
        <h1 className="heading-lg">Welcome, {user.name || "User"} 👋</h1>
        <div className="email-badge">{user.email}</div>
        <p className="text-muted">You are authenticated via SSO on {SSO_CONFIG.APP_NAME}</p>
        <button className="btn-outline" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default Dashboard
