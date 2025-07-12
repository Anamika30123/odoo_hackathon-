"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import "./Browse.css"

const Browse = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    skill: "",
    search: "",
    location: "",
  })
  const [selectedUser, setSelectedUser] = useState(null)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestData, setRequestData] = useState({
    requested_skill_id: "",
    offered_skill_id: "",
    message: "",
  })
  const [userSkills, setUserSkills] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [users, filters])

  const fetchData = async () => {
    try {
      const [usersRes, skillsRes, userSkillsRes] = await Promise.all([
        api.get("/users/browse"),
        api.get("/skills"),
        api.get("/user/skills/offered"),
      ])

      setUsers(usersRes.data)
      setSkills(skillsRes.data)
      setUserSkills(userSkillsRes.data)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...users]

    if (filters.skill) {
      filtered = filtered.filter(
        (user) =>
          user.offered_skills?.some((skill) => skill?.toLowerCase().includes(filters.skill.toLowerCase())) ||
          user.wanted_skills?.some((skill) => skill?.toLowerCase().includes(filters.skill.toLowerCase())),
      )
    }

    if (filters.search) {
      filtered = filtered.filter((user) => user.name.toLowerCase().includes(filters.search.toLowerCase()))
    }

    if (filters.location) {
      filtered = filtered.filter((user) => user.location?.toLowerCase().includes(filters.location.toLowerCase()))
    }

    setFilteredUsers(filtered)
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ skill: "", search: "", location: "" })
  }

  const openRequestModal = (targetUser) => {
    setSelectedUser(targetUser)
    setShowRequestModal(true)
    setRequestData({
      requested_skill_id: "",
      offered_skill_id: "",
      message: "",
    })
  }

  const closeRequestModal = () => {
    setShowRequestModal(false)
    setSelectedUser(null)
  }

  const handleSendRequest = async (e) => {
    e.preventDefault()

    try {
      await api.post("/swap-requests", {
        provider_id: selectedUser.id,
        requested_skill_id: requestData.requested_skill_id,
        offered_skill_id: requestData.offered_skill_id,
        message: requestData.message,
      })

      closeRequestModal()
      alert("Swap request sent successfully!")
    } catch (error) {
      console.error("Failed to send request:", error)
      alert("Failed to send request. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    )
  }

  return (
    <div className="browse-container">
      <div className="browse-header">
        <h1>Browse Skills & Users</h1>
        <p>Find people to swap skills with in our community</p>
      </div>

      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="skill-filter">Filter by Skill</label>
            <select
              id="skill-filter"
              value={filters.skill}
              onChange={(e) => handleFilterChange("skill", e.target.value)}
            >
              <option value="">All Skills</option>
              {skills.map((skill) => (
                <option key={skill.id} value={skill.name}>
                  {skill.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="search-filter">Search by Name</label>
            <input
              type="text"
              id="search-filter"
              placeholder="Enter user name..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="location-filter">Filter by Location</label>
            <input
              type="text"
              id="location-filter"
              placeholder="Enter location..."
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
            />
          </div>

          <div className="filter-actions">
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="results-section">
        <div className="results-header">
          <h2>Found {filteredUsers.length} users</h2>
        </div>

        <div className="users-grid">
          {filteredUsers.map((targetUser) => (
            <div key={targetUser.id} className="user-card">
              <div className="user-header">
                <div className="user-photo">
                  {targetUser.profile_photo ? (
                    <img src={`http://localhost:5000${targetUser.profile_photo}`} alt={targetUser.name} />
                  ) : (
                    <div className="photo-placeholder">{targetUser.name.charAt(0).toUpperCase()}</div>
                  )}
                </div>
                <div className="user-info">
                  <h3>{targetUser.name}</h3>
                  {targetUser.location && <p className="location">📍 {targetUser.location}</p>}
                  {targetUser.availability && <p className="availability">🕒 {targetUser.availability}</p>}
                </div>
              </div>

              <div className="skills-section">
                {targetUser.offered_skills && targetUser.offered_skills.length > 0 && (
                  <div className="skills-group">
                    <h4>Offers:</h4>
                    <div className="skills-tags">
                      {targetUser.offered_skills
                        .filter((skill) => skill)
                        .map((skill, index) => (
                          <span key={index} className="skill-tag offered">
                            {skill}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {targetUser.wanted_skills && targetUser.wanted_skills.length > 0 && (
                  <div className="skills-group">
                    <h4>Wants:</h4>
                    <div className="skills-tags">
                      {targetUser.wanted_skills
                        .filter((skill) => skill)
                        .map((skill, index) => (
                          <span key={index} className="skill-tag wanted">
                            {skill}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="user-actions">
                <button className="request-btn" onClick={() => openRequestModal(targetUser)}>
                  Send Swap Request
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="no-results">
            <h3>No users found</h3>
            <p>Try adjusting your filters or check back later for new members.</p>
          </div>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && selectedUser && (
        <div className="modal-overlay" onClick={closeRequestModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send Swap Request to {selectedUser.name}</h2>
              <button className="close-btn" onClick={closeRequestModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSendRequest} className="request-form">
              <div className="form-group">
                <label htmlFor="requested-skill">What skill do you want to learn?</label>
                <select
                  id="requested-skill"
                  value={requestData.requested_skill_id}
                  onChange={(e) => setRequestData({ ...requestData, requested_skill_id: e.target.value })}
                  required
                >
                  <option value="">Select a skill they offer</option>
                  {skills
                    .filter((skill) => selectedUser.offered_skills?.includes(skill.name))
                    .map((skill) => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="offered-skill">What skill will you teach in return?</label>
                <select
                  id="offered-skill"
                  value={requestData.offered_skill_id}
                  onChange={(e) => setRequestData({ ...requestData, offered_skill_id: e.target.value })}
                  required
                >
                  <option value="">Select a skill you offer</option>
                  {userSkills.map((skill) => (
                    <option key={skill.skill_id} value={skill.skill_id}>
                      {skill.skill_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message (Optional)</label>
                <textarea
                  id="message"
                  value={requestData.message}
                  onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
                  placeholder="Introduce yourself and explain why you'd like to swap skills..."
                  rows="4"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeRequestModal} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="send-btn">
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Browse
