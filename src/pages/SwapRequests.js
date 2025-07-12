"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import "./SwapRequests.css"

const SwapRequests = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [rating, setRating] = useState({
    rating: 5,
    feedback: "",
  })

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await api.get("/swap-requests")
      setRequests(response.data)
    } catch (error) {
      console.error("Failed to fetch requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await api.put(`/swap-requests/${requestId}`, { status: newStatus })
      fetchRequests()
    } catch (error) {
      console.error("Failed to update request:", error)
      alert("Failed to update request. Please try again.")
    }
  }

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to delete this request?")) {
      return
    }

    try {
      await api.delete(`/swap-requests/${requestId}`)
      fetchRequests()
    } catch (error) {
      console.error("Failed to delete request:", error)
      alert("Failed to delete request. Please try again.")
    }
  }

  const openRatingModal = (request) => {
    setSelectedRequest(request)
    setShowRatingModal(true)
    setRating({ rating: 5, feedback: "" })
  }

  const closeRatingModal = () => {
    setShowRatingModal(false)
    setSelectedRequest(null)
  }

  const handleSubmitRating = async (e) => {
    e.preventDefault()

    try {
      const ratedUserId =
        selectedRequest.requester_id === user.id ? selectedRequest.provider_id : selectedRequest.requester_id

      await api.post("/ratings", {
        swap_request_id: selectedRequest.id,
        rated_id: ratedUserId,
        rating: rating.rating,
        feedback: rating.feedback,
      })

      // Update request status to completed
      await handleStatusUpdate(selectedRequest.id, "completed")
      closeRatingModal()
      alert("Rating submitted successfully!")
    } catch (error) {
      console.error("Failed to submit rating:", error)
      alert("Failed to submit rating. Please try again.")
    }
  }

  const getFilteredRequests = () => {
    switch (activeTab) {
      case "sent":
        return requests.filter((req) => req.requester_id === user.id)
      case "received":
        return requests.filter((req) => req.provider_id === user.id)
      case "pending":
        return requests.filter((req) => req.status === "pending")
      case "completed":
        return requests.filter((req) => req.status === "completed")
      default:
        return requests
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "⏳"
      case "accepted":
        return "✅"
      case "rejected":
        return "❌"
      case "completed":
        return "🎉"
      case "cancelled":
        return "🚫"
      default:
        return "📋"
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading swap requests...</p>
      </div>
    )
  }

  const filteredRequests = getFilteredRequests()

  return (
    <div className="requests-container">
      <div className="requests-header">
        <h1>Swap Requests</h1>
        <p>Manage your skill swap requests and track their progress</p>
      </div>

      <div className="requests-tabs">
        <button className={`tab-btn ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
          All ({requests.length})
        </button>
        <button className={`tab-btn ${activeTab === "sent" ? "active" : ""}`} onClick={() => setActiveTab("sent")}>
          Sent ({requests.filter((req) => req.requester_id === user.id).length})
        </button>
        <button
          className={`tab-btn ${activeTab === "received" ? "active" : ""}`}
          onClick={() => setActiveTab("received")}
        >
          Received ({requests.filter((req) => req.provider_id === user.id).length})
        </button>
        <button
          className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending ({requests.filter((req) => req.status === "pending").length})
        </button>
        <button
          className={`tab-btn ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          Completed ({requests.filter((req) => req.status === "completed").length})
        </button>
      </div>

      <div className="requests-list">
        {filteredRequests.length === 0 ? (
          <div className="no-requests">
            <h3>No requests found</h3>
            <p>
              {activeTab === "sent" && "You haven't sent any swap requests yet."}
              {activeTab === "received" && "You haven't received any swap requests yet."}
              {activeTab === "pending" && "No pending requests at the moment."}
              {activeTab === "completed" && "No completed swaps yet."}
              {activeTab === "all" && "No swap requests found. Start by browsing users and sending requests!"}
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <div className="request-type">
                  <span className="type-badge">{request.requester_id === user.id ? "Sent" : "Received"}</span>
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(request.status) }}>
                    {getStatusIcon(request.status)} {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                <span className="request-date">{new Date(request.created_at).toLocaleDateString()}</span>
              </div>

              <div className="request-content">
                <div className="request-details">
                  <h3>
                    {request.requester_id === user.id
                      ? `Request to ${request.provider_name}`
                      : `Request from ${request.requester_name}`}
                  </h3>

                  <div className="skills-exchange">
                    <div className="skill-item">
                      <span className="skill-label">Requested:</span>
                      <span className="skill-name">{request.requested_skill_name}</span>
                    </div>
                    {request.offered_skill_name && (
                      <div className="skill-item">
                        <span className="skill-label">Offered in return:</span>
                        <span className="skill-name">{request.offered_skill_name}</span>
                      </div>
                    )}
                  </div>

                  {request.message && (
                    <div className="request-message">
                      <h4>Message:</h4>
                      <p>"{request.message}"</p>
                    </div>
                  )}
                </div>

                <div className="request-actions">
                  {request.provider_id === user.id && request.status === "pending" && (
                    <>
                      <button className="action-btn accept" onClick={() => handleStatusUpdate(request.id, "accepted")}>
                        Accept
                      </button>
                      <button className="action-btn reject" onClick={() => handleStatusUpdate(request.id, "rejected")}>
                        Reject
                      </button>
                    </>
                  )}

                  {request.requester_id === user.id && request.status === "pending" && (
                    <button className="action-btn cancel" onClick={() => handleDeleteRequest(request.id)}>
                      Cancel Request
                    </button>
                  )}

                  {request.status === "accepted" && (
                    <button className="action-btn complete" onClick={() => openRatingModal(request)}>
                      Mark as Completed & Rate
                    </button>
                  )}

                  {(request.status === "rejected" || request.status === "cancelled") &&
                    request.requester_id === user.id && (
                      <button className="action-btn delete" onClick={() => handleDeleteRequest(request.id)}>
                        Delete
                      </button>
                    )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedRequest && (
        <div className="modal-overlay" onClick={closeRatingModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Rate Your Experience</h2>
              <button className="close-btn" onClick={closeRatingModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitRating} className="rating-form">
              <div className="rating-section">
                <p>
                  How was your experience with{" "}
                  <strong>
                    {selectedRequest.requester_id === user.id
                      ? selectedRequest.provider_name
                      : selectedRequest.requester_name}
                  </strong>
                  ?
                </p>

                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star ${star <= rating.rating ? "active" : ""}`}
                      onClick={() => setRating({ ...rating, rating: star })}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="feedback">Feedback (Optional)</label>
                <textarea
                  id="feedback"
                  value={rating.feedback}
                  onChange={(e) => setRating({ ...rating, feedback: e.target.value })}
                  placeholder="Share your experience with this skill swap..."
                  rows="4"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeRatingModal} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Submit Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SwapRequests
