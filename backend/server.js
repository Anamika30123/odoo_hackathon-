const express = require("express")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { Pool } = require("pg")
const multer = require("multer")
const path = require("path")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5000

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || "your_username",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "skill_swap",
  password: process.env.DB_PASSWORD || "your_password",
  port: process.env.DB_PORT || 5432,
})

// Middleware
app.use(cors())
app.use(express.json())
app.use("/uploads", express.static("uploads"))

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname))
  },
})

const upload = multer({ storage })

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  jwt.verify(token, process.env.JWT_SECRET || "your-secret-key", (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" })
    }
    req.user = user
    next()
  })
}

// Routes

// Auth routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, location, availability } = req.body

    // Check if user exists
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email])
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" })
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const result = await pool.query(
      "INSERT INTO users (name, email, password, location, availability) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, location, availability, is_public",
      [name, email, hashedPassword, location, availability],
    )

    const user = result.rows[0]
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "your-secret-key")

    res.status(201).json({ token, user })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email])
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    const user = result.rows[0]

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "your-secret-key")

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        location: user.location,
        profile_photo: user.profile_photo,
        availability: user.availability,
        is_public: user.is_public,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Profile routes
app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, location, profile_photo, availability, is_public FROM users WHERE id = $1",
      [req.user.userId],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Profile fetch error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.put("/api/profile", authenticateToken, async (req, res) => {
  try {
    const { name, location, availability, is_public } = req.body

    const result = await pool.query(
      "UPDATE users SET name = $1, location = $2, availability = $3, is_public = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, name, email, location, profile_photo, availability, is_public",
      [name, location, availability, is_public, req.user.userId],
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error("Profile update error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.post("/api/profile/photo", authenticateToken, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    const photoUrl = `/uploads/${req.file.filename}`

    await pool.query("UPDATE users SET profile_photo = $1 WHERE id = $2", [photoUrl, req.user.userId])

    res.json({ profile_photo: photoUrl })
  } catch (error) {
    console.error("Photo upload error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Skills routes
app.get("/api/skills", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM skills ORDER BY name")
    res.json(result.rows)
  } catch (error) {
    console.error("Skills fetch error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.post("/api/skills", authenticateToken, async (req, res) => {
  try {
    const { name, category } = req.body

    // Check if skill exists
    let skill = await pool.query("SELECT * FROM skills WHERE name = $1", [name])

    if (skill.rows.length === 0) {
      // Create new skill
      skill = await pool.query("INSERT INTO skills (name, category) VALUES ($1, $2) RETURNING *", [
        name,
        category || "Other",
      ])
    }

    res.json(skill.rows[0])
  } catch (error) {
    console.error("Skill creation error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// User skills routes
app.get("/api/user/skills/offered", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT uso.*, s.name as skill_name, s.category 
      FROM user_skills_offered uso 
      JOIN skills s ON uso.skill_id = s.id 
      WHERE uso.user_id = $1
    `,
      [req.user.userId],
    )

    res.json(result.rows)
  } catch (error) {
    console.error("Offered skills fetch error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.post("/api/user/skills/offered", authenticateToken, async (req, res) => {
  try {
    const { skill_id, proficiency_level, description } = req.body

    const result = await pool.query(
      "INSERT INTO user_skills_offered (user_id, skill_id, proficiency_level, description) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.user.userId, skill_id, proficiency_level, description],
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Add offered skill error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.get("/api/user/skills/wanted", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT usw.*, s.name as skill_name, s.category 
      FROM user_skills_wanted usw 
      JOIN skills s ON usw.skill_id = s.id 
      WHERE usw.user_id = $1
    `,
      [req.user.userId],
    )

    res.json(result.rows)
  } catch (error) {
    console.error("Wanted skills fetch error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.post("/api/user/skills/wanted", authenticateToken, async (req, res) => {
  try {
    const { skill_id, urgency_level, description } = req.body

    const result = await pool.query(
      "INSERT INTO user_skills_wanted (user_id, skill_id, urgency_level, description) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.user.userId, skill_id, urgency_level, description],
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Add wanted skill error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Browse users routes
app.get("/api/users/browse", authenticateToken, async (req, res) => {
  try {
    const { skill, search } = req.query
    let query = `
      SELECT DISTINCT u.id, u.name, u.location, u.profile_photo, u.availability,
             array_agg(DISTINCT s_offered.name) as offered_skills,
             array_agg(DISTINCT s_wanted.name) as wanted_skills
      FROM users u
      LEFT JOIN user_skills_offered uso ON u.id = uso.user_id
      LEFT JOIN skills s_offered ON uso.skill_id = s_offered.id
      LEFT JOIN user_skills_wanted usw ON u.id = usw.user_id
      LEFT JOIN skills s_wanted ON usw.skill_id = s_wanted.id
      WHERE u.is_public = true AND u.id != $1
    `

    const params = [req.user.userId]

    if (skill) {
      query += ` AND (s_offered.name ILIKE $${params.length + 1} OR s_wanted.name ILIKE $${params.length + 1})`
      params.push(`%${skill}%`)
    }

    if (search) {
      query += ` AND (u.name ILIKE $${params.length + 1} OR u.location ILIKE $${params.length + 1})`
      params.push(`%${search}%`)
    }

    query += ` GROUP BY u.id, u.name, u.location, u.profile_photo, u.availability ORDER BY u.name`

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error("Browse users error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Swap requests routes
app.get("/api/swap-requests", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT sr.*, 
             u_requester.name as requester_name,
             u_provider.name as provider_name,
             s_requested.name as requested_skill_name,
             s_offered.name as offered_skill_name
      FROM swap_requests sr
      JOIN users u_requester ON sr.requester_id = u_requester.id
      JOIN users u_provider ON sr.provider_id = u_provider.id
      LEFT JOIN skills s_requested ON sr.requested_skill_id = s_requested.id
      LEFT JOIN skills s_offered ON sr.offered_skill_id = s_offered.id
      WHERE sr.requester_id = $1 OR sr.provider_id = $1
      ORDER BY sr.created_at DESC
    `,
      [req.user.userId],
    )

    res.json(result.rows)
  } catch (error) {
    console.error("Swap requests fetch error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.post("/api/swap-requests", authenticateToken, async (req, res) => {
  try {
    const { provider_id, requested_skill_id, offered_skill_id, message } = req.body

    const result = await pool.query(
      "INSERT INTO swap_requests (requester_id, provider_id, requested_skill_id, offered_skill_id, message) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [req.user.userId, provider_id, requested_skill_id, offered_skill_id, message],
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Create swap request error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.put("/api/swap-requests/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const result = await pool.query(
      "UPDATE swap_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND (requester_id = $3 OR provider_id = $3) RETURNING *",
      [status, id, req.user.userId],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Swap request not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Update swap request error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.delete("/api/swap-requests/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query("DELETE FROM swap_requests WHERE id = $1 AND requester_id = $2 RETURNING *", [
      id,
      req.user.userId,
    ])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Swap request not found or unauthorized" })
    }

    res.json({ message: "Swap request deleted successfully" })
  } catch (error) {
    console.error("Delete swap request error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Ratings routes
app.post("/api/ratings", authenticateToken, async (req, res) => {
  try {
    const { swap_request_id, rated_id, rating, feedback } = req.body

    const result = await pool.query(
      "INSERT INTO ratings (swap_request_id, rater_id, rated_id, rating, feedback) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [swap_request_id, req.user.userId, rated_id, rating, feedback],
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Create rating error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.get("/api/ratings/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params

    const result = await pool.query(
      `
      SELECT r.*, u.name as rater_name
      FROM ratings r
      JOIN users u ON r.rater_id = u.id
      WHERE r.rated_id = $1
      ORDER BY r.created_at DESC
    `,
      [userId],
    )

    const avgResult = await pool.query(
      "SELECT AVG(rating) as average_rating, COUNT(*) as total_ratings FROM ratings WHERE rated_id = $1",
      [userId],
    )

    res.json({
      ratings: result.rows,
      average_rating: Number.parseFloat(avgResult.rows[0].average_rating) || 0,
      total_ratings: Number.parseInt(avgResult.rows[0].total_ratings) || 0,
    })
  } catch (error) {
    console.error("Fetch ratings error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
