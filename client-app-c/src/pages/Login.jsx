import { SSO_CONFIG } from "../ssoConfig"

function Login() {
  const handleLogin = () => {
    // Redirect to Auth Server's SSO authorize endpoint
    const authorizeUrl = `${SSO_CONFIG.AUTH_SERVER_URL}/sso/authorize?redirect_uri=${encodeURIComponent(SSO_CONFIG.CALLBACK_URL)}`
    window.location.href = authorizeUrl
  }

  return (
    <div className="page-wrapper">
      <div className="card">
        <div style={{ fontSize: "2.4rem" }}>🔒</div>
        <h1 className="heading-lg">{SSO_CONFIG.APP_NAME}</h1>
        <p className="text-muted">Sign in with your Auth account to continue</p>
        <button className="btn-primary" onClick={handleLogin} style={{ marginTop: "8px" }}>
          Sign in with SSO
        </button>
      </div>
    </div>
  )
}

export default Login
