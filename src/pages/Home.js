"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import "./Home.css"

const Home = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    offeredSkills: 0,
    wantedSkills: 0,
    pendingRequests: 0,
    completedSwaps: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [offeredRes, wantedRes, requestsRes] = await Promise.all([
        api.get("/user/skills/offered"),
        api.get("/user/skills/wanted"),
        api.get("/swap-requests"),
      ])

      const requests = requestsRes.data
      const pendingRequests = requests.filter((req) => req.status === "pending").length
      const completedSwaps = requests.filter((req) => req.status === "completed").length

      setStats({
        offeredSkills: offeredRes.data.length,
        wantedSkills: wantedRes.data.length,
        pendingRequests,
        completedSwaps,
      })

      // Get recent activity (last 5 requests)
      setRecentActivity(requests.slice(0, 5))
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f39c12"
      case "accepted":
        return "#27ae60"
      case "rejected":
        return "#e74c3c"
      case "completed":
        return "#2ecc71"
      case "cancelled":
        return "#95a5a6"
      default:
        return "#3498db"
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="home-container">
      <div className="welcome-section">
        <h1>Welcome back, {user?.name}! 👋</h1>
        <p>Ready to swap some skills today?</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>{stats.offeredSkills}</h3>
            <p>Skills Offered</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-content">
            <h3>{stats.wantedSkills}</h3>
            <p>Skills Wanted</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingRequests}</h3>
            <p>Pending Requests</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completedSwaps}</h3>
            <p>Completed Swaps</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/browse" className="action-btn primary">
            <span className="btn-icon">🔍</span>
            Browse Skills
          </Link>
          <Link to="/profile" className="action-btn secondary">
            <span className="btn-icon">👤</span>
            Update Profile
          </Link>
          <Link to="/swap-requests" className="action-btn tertiary">
            <span className="btn-icon">📋</span>
            View Requests
          </Link>
        </div>
      </div>

      {recentActivity.length > 0 && (
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-content">
                  <div className="activity-header">
                    <span className="activity-type">
                      {activity.requester_id === user.id ? "Sent" : "Received"} Request
                    </span>
                    <span className="activity-status" style={{ color: getStatusColor(activity.status) }}>
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </span>
                  </div>
                  <p className="activity-description">
                    {activity.requester_id === user.id
                      ? `You requested ${activity.requested_skill_name} from ${activity.provider_name}`
                      : `${activity.requester_name} requested ${activity.requested_skill_name} from you`}
                  </p>
                  <span className="activity-date">{new Date(activity.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tips-section">
        <h2>💡 Tips for Success</h2>
        <div className="tips-grid">
          <div className="tip-card">
            <h4>Complete Your Profile</h4>
            <p>Add skills you offer and want to attract the right swap partners.</p>
          </div>
          <div className="tip-card">
            <h4>Be Responsive</h4>
            <p>Quick responses to swap requests lead to more successful exchanges.</p>
          </div>
          <div className="tip-card">
            <h4>Leave Feedback</h4>
            <p>Rate your swap partners to build trust in the community.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
