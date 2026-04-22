import { useEffect, useState } from "react"
import { API_URL } from "../utils/apiConfig"

function Dashboard(){

const [name,setName] = useState("")
const [email,setEmail] = useState("")

useEffect(()=>{

// Read query params from Google OAuth redirect (token & name)
const params = new URLSearchParams(window.location.search)
const tokenFromURL = params.get("token")
const nameFromURL = params.get("name")

if(tokenFromURL){
localStorage.setItem("token", tokenFromURL)
localStorage.setItem("name", decodeURIComponent(nameFromURL || ""))
// Clean the URL without reloading
window.history.replaceState({}, document.title, "/dashboard")
}

const storedName = localStorage.getItem("name")
const storedEmail = localStorage.getItem("email")
if(storedName){ setName(storedName) }
if(storedEmail){ setEmail(storedEmail) }

},[])

const handleLogout = async () => {
try {
  // Clear session cookie on Auth Server
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include"
  })
} catch(e) {
  // Logout even if request fails
}

localStorage.removeItem("token")
localStorage.removeItem("name")
localStorage.removeItem("email")
// Hard redirect back to login
window.location.href = "/"
}

return(
<div className="dashboard-wrapper">

  <div className="dashboard-content">
    <div className="dashboard-card">
      <div className="welcome-badge">You're logged in ✓</div>
      <h1 className="dashboard-heading">Hello, {name || "User"} 👋</h1>
      {email && <div className="dashboard-email">{email}</div>}
      <p className="dashboard-sub">Welcome back! You've successfully authenticated.</p>
      <button className="logout-btn" onClick={handleLogout}>
        Sign Out
      </button>
    </div>
  </div>

</div>
)

}

export default Dashboard