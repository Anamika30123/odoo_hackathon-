"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import "./Profile.css"

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    location: user?.location || "",
    availability: user?.availability || "",
    is_public: user?.is_public || true,
  })

  // Skills state
  const [skills, setSkills] = useState([])
  const [offeredSkills, setOfferedSkills] = useState([])
  const [wantedSkills, setWantedSkills] = useState([])
  const [newSkill, setNewSkill] = useState({
    skill_id: "",
    type: "offered",
    proficiency_level: "intermediate",
    urgency_level: "medium",
    description: "",
  })

  useEffect(() => {
    fetchSkills()
    fetchUserSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      const response = await api.get("/skills")
      setSkills(response.data)
    } catch (error) {
      console.error("Failed to fetch skills:", error)
    }
  }

  const fetchUserSkills = async () => {
    try {
      const [offeredRes, wantedRes] = await Promise.all([
        api.get("/user/skills/offered"),
        api.get("/user/skills/wanted"),
      ])
      setOfferedSkills(offeredRes.data)
      setWantedSkills(wantedRes.data)
    } catch (error) {
      console.error("Failed to fetch user skills:", error)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const response = await api.put("/profile", profileData)
      updateUser(response.data)
      setMessage("Profile updated successfully!")
    } catch (error) {
      setMessage("Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("photo", file)

    try {
      const response = await api.post("/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      updateUser({ ...user, profile_photo: response.data.profile_photo })
      setMessage("Profile photo updated successfully!")
    } catch (error) {
      setMessage("Failed to upload photo. Please try again.")
    }
  }

  const handleAddSkill = async (e) => {
    e.preventDefault()
    if (!newSkill.skill_id) return

    try {
      const endpoint = newSkill.type === "offered" ? "/user/skills/offered" : "/user/skills/wanted"
      const payload = {
        skill_id: newSkill.skill_id,
        description: newSkill.description,
        ...(newSkill.type === "offered"
          ? { proficiency_level: newSkill.proficiency_level }
          : { urgency_level: newSkill.urgency_level }),
      }

      await api.post(endpoint, payload)
      fetchUserSkills()
      setNewSkill({
        skill_id: "",
        type: "offered",
        proficiency_level: "intermediate",
        urgency_level: "medium",
        description: "",
      })
      setMessage("Skill added successfully!")
    } catch (error) {
      setMessage("Failed to add skill. Please try again.")
    }
  }

  const handleRemoveSkill = async (skillId, type) => {
    try {
      const endpoint = type === "offered" ? `/user/skills/offered/${skillId}` : `/user/skills/wanted/${skillId}`
      await api.delete(endpoint)
      fetchUserSkills()
      setMessage("Skill removed successfully!")
    } catch (error) {
      setMessage("Failed to remove skill. Please try again.")
    }
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-photo-section">
          <div className="profile-photo">
            {user?.profile_photo ? (
              <img src={`http://localhost:5000${user.profile_photo}`} alt="Profile" />
            ) : (
              <div className="photo-placeholder">
                <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
              </div>
            )}
          </div>
          <label htmlFor="photo-upload" className="photo-upload-btn">
            📷 Change Photo
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            style={{ display: "none" }}
          />
        </div>
        <div className="profile-info">
          <h1>{user?.name}</h1>
          <p>{user?.location}</p>
          <div className="profile-stats">
            <span>{offeredSkills.length} Skills Offered</span>
            <span>{wantedSkills.length} Skills Wanted</span>
          </div>
        </div>
      </div>

      {message && <div className={`message ${message.includes("success") ? "success" : "error"}`}>{message}</div>}

      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile Settings
        </button>
        <button className={`tab-btn ${activeTab === "skills" ? "active" : ""}`} onClick={() => setActiveTab("skills")}>
          Manage Skills
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "profile" && (
          <div className="profile-settings">
            <h2>Profile Settings</h2>
            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  placeholder="e.g., New York, NY"
                />
              </div>

              <div className="form-group">
                <label htmlFor="availability">Availability</label>
                <textarea
                  id="availability"
                  value={profileData.availability}
                  onChange={(e) => setProfileData({ ...profileData, availability: e.target.value })}
                  placeholder="e.g., Weekends, Evenings after 6 PM"
                  rows="3"
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={profileData.is_public}
                    onChange={(e) => setProfileData({ ...profileData, is_public: e.target.checked })}
                  />
                  <span className="checkmark"></span>
                  Make my profile public (others can find and contact me)
                </label>
              </div>

              <button type="submit" className="update-btn" disabled={loading}>
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "skills" && (
          <div className="skills-management">
            <h2>Manage Your Skills</h2>

            <div className="add-skill-section">
              <h3>Add New Skill</h3>
              <form onSubmit={handleAddSkill} className="add-skill-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="skill-select">Skill</label>
                    <select
                      id="skill-select"
                      value={newSkill.skill_id}
                      onChange={(e) => setNewSkill({ ...newSkill, skill_id: e.target.value })}
                      required
                    >
                      <option value="">Select a skill</option>
                      {skills.map((skill) => (
                        <option key={skill.id} value={skill.id}>
                          {skill.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="skill-type">Type</label>
                    <select
                      id="skill-type"
                      value={newSkill.type}
                      onChange={(e) => setNewSkill({ ...newSkill, type: e.target.value })}
                    >
                      <option value="offered">I can teach this</option>
                      <option value="wanted">I want to learn this</option>
                    </select>
                  </div>

                  {newSkill.type === "offered" ? (
                    <div className="form-group">
                      <label htmlFor="proficiency">Proficiency Level</label>
                      <select
                        id="proficiency"
                        value={newSkill.proficiency_level}
                        onChange={(e) => setNewSkill({ ...newSkill, proficiency_level: e.target.value })}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                  ) : (
                    <div className="form-group">
                      <label htmlFor="urgency">Urgency Level</label>
                      <select
                        id="urgency"
                        value={newSkill.urgency_level}
                        onChange={(e) => setNewSkill({ ...newSkill, urgency_level: e.target.value })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="skill-description">Description (Optional)</label>
                  <textarea
                    id="skill-description"
                    value={newSkill.description}
                    onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                    placeholder="Add any additional details about this skill..."
                    rows="2"
                  />
                </div>

                <button type="submit" className="add-skill-btn">
                  Add Skill
                </button>
              </form>
            </div>

            <div className="skills-lists">
              <div className="skills-section">
                <h3>Skills I Offer ({offeredSkills.length})</h3>
                <div className="skills-grid">
                  {offeredSkills.map((skill) => (
                    <div key={skill.id} className="skill-card offered">
                      <div className="skill-header">
                        <h4>{skill.skill_name}</h4>
                        <button className="remove-btn" onClick={() => handleRemoveSkill(skill.id, "offered")}>
                          ×
                        </button>
                      </div>
                      <div className="skill-details">
                        <span className="skill-level">{skill.proficiency_level}</span>
                        {skill.description && <p>{skill.description}</p>}
                      </div>
                    </div>
                  ))}
                  {offeredSkills.length === 0 && (
                    <p className="no-skills">No skills offered yet. Add some skills you can teach!</p>
                  )}
                </div>
              </div>

              <div className="skills-section">
                <h3>Skills I Want ({wantedSkills.length})</h3>
                <div className="skills-grid">
                  {wantedSkills.map((skill) => (
                    <div key={skill.id} className="skill-card wanted">
                      <div className="skill-header">
                        <h4>{skill.skill_name}</h4>
                        <button className="remove-btn" onClick={() => handleRemoveSkill(skill.id, "wanted")}>
                          ×
                        </button>
                      </div>
                      <div className="skill-details">
                        <span className="skill-level">{skill.urgency_level} priority</span>
                        {skill.description && <p>{skill.description}</p>}
                      </div>
                    </div>
                  ))}
                  {wantedSkills.length === 0 && (
                    <p className="no-skills">No skills wanted yet. Add some skills you'd like to learn!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
