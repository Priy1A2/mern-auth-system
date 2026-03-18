import { useEffect, useState } from "react"
import Spline from "@splinetool/react-spline"

function Dashboard(){

const [name,setName] = useState("")

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
if(storedName){ setName(storedName) }

},[])

const handleLogout = () => {
localStorage.removeItem("token")
localStorage.removeItem("name")
// Hard redirect back to login
window.location.href = "/"
}

return(
<div className="dashboard-wrapper">

  {/* Full-opacity Spline Background */}
  <div className="spline-bg spline-full">
    <Spline scene="https://prod.spline.design/gLAZvU44dEmvkTdY/scene.splinecode" />
  </div>

  {/* Content overlay */}
  <div className="dashboard-content">
    <div className="dashboard-card">
      <div className="welcome-badge">You're logged in ✓</div>
      <h1 className="dashboard-heading">Hello, {name || "User"} 👋</h1>
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