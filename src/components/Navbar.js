"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import "./Navbar.css"

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  if (!user) {
    return (
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            SkillSwap
          </Link>
          <div className="nav-menu">
            <Link to="/login" className={`nav-link ${location.pathname === "/login" ? "active" : ""}`}>
              Login
            </Link>
            <Link to="/register" className={`nav-link ${location.pathname === "/register" ? "active" : ""}`}>
              Register
            </Link>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          SkillSwap
        </Link>

        <div className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
          <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`} onClick={closeMenu}>
            Home
          </Link>
          <Link
            to="/browse"
            className={`nav-link ${location.pathname === "/browse" ? "active" : ""}`}
            onClick={closeMenu}
          >
            Browse
          </Link>
          <Link
            to="/swap-requests"
            className={`nav-link ${location.pathname === "/swap-requests" ? "active" : ""}`}
            onClick={closeMenu}
          >
            Requests
          </Link>
          <Link
            to="/profile"
            className={`nav-link ${location.pathname === "/profile" ? "active" : ""}`}
            onClick={closeMenu}
          >
            Profile
          </Link>
          <button className="nav-link logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="nav-toggle" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
