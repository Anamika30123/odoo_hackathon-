# Skill Swap Platform

A full-stack web application that enables users to exchange skills through a community-driven platform.

## Features

### User Authentication

* Secure registration and login system
* JWT-based authentication
* Profile photo upload capability
* Public/private profile settings

### Profile Management

* Complete user profiles with:

  * Skills offered and wanted
  * Location and availability information
  * Skill proficiency levels
  * Profile visibility controls

### Skill Exchange System

* Browse and search skills by category
* Add skills you can teach or want to learn
* Categorization and tagging system
* Dynamic skill suggestions

### Swap Functionality

* Send and receive swap requests
* Accept/reject incoming requests
* Track request status (pending, accepted, completed)
* Integrated messaging system

### Rating System

* Rate completed skill swaps
* Leave detailed feedback
* View user ratings and reviews
* Trust-building through community feedback

## Technology Stack

### Frontend

* React.js with Hooks
* React Router for navigation
* Context API for state management
* Axios for API communication
* CSS Modules for styling

### Backend

* Node.js with Express.js
* PostgreSQL database
* JWT for authentication
* Bcrypt for password hashing
* Multer for file uploads

### Development Tools

* Git for version control
* Postman for API testing
* ESLint for code quality
* Prettier for code formatting

## Installation Guide

### Prerequisites

* Node.js (v16 or higher)
* PostgreSQL (v12 or higher)
* npm (v8 or higher) or yarn

### Backend Setup

```bash
git clone https://github.com/Anamika30123/odoo_hackathon-.git
cd skill-swap-platform/backend
npm install
```

Create and configure `.env` file:

```env
DB_USER=your_db_username
DB_HOST=localhost
DB_NAME=skill_swap
DB_PASSWORD=your_db_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

Run database migrations:

```bash
psql -U your_db_username -d skill_swap -f ../database/schema.sql
```

Start the server:

```bash
npm run dev
```

### Frontend Setup

Navigate to frontend directory:

```bash
cd ../frontend
npm install
npm start
```

## API Endpoints

### Authentication

| Endpoint           | Method | Description       |
| ------------------ | ------ | ----------------- |
| /api/auth/register | POST   | Register new user |
| /api/auth/login    | POST   | User login        |

### Profile

| Endpoint           | Method | Description          |
| ------------------ | ------ | -------------------- |
| /api/profile       | GET    | Get user profile     |
| /api/profile       | PUT    | Update profile       |
| /api/profile/photo | POST   | Upload profile photo |

### Skills

| Endpoint                 | Method | Description               |
| ------------------------ | ------ | ------------------------- |
| /api/skills              | GET    | Get all skills            |
| /api/user/skills/offered | GET    | Get user's offered skills |
| /api/user/skills/wanted  | GET    | Get user's wanted skills  |

### Swaps

| Endpoint           | Method | Description              |
| ------------------ | ------ | ------------------------ |
| /api/swap-requests | GET    | Get user's swap requests |
| /api/swap-requests | POST   | Create new swap request  |

## Project Structure

```
skill-swap-platform/
├── backend/
│   ├── controllers/       # Business logic
│   ├── middleware/        # Auth middleware
│   ├── models/            # Database models
│   ├── routes/            # API endpoints
│   ├── server.js          # Server entry point
│   └── package.json
├── frontend/
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable UI
│   │   ├── pages/         # Route components
│   │   ├── services/      # API services
│   │   ├── App.js         # Root component
│   │   └── index.js       # Entry point
│   └── package.json
├── database/
│   └── schema.sql         # Database schema
└── README.md              # Project documentation
```

## Development

### Running the Application

Start backend server:

```bash
cd backend && npm run dev
```

Start frontend development server:

```bash
cd ../frontend && npm start
```

### Testing

Run backend tests:

```bash
cd backend && npm test
```

Run frontend tests:

```bash
cd frontend && npm test
```

## Deployment

### Production Build

Build frontend:

```bash
cd frontend && npm run build
```

Start production server:

```bash
cd ../backend && npm start
```

## License

MIT License - see LICENSE for details.

## Support

For issues or questions, please open an issue in the GitHub repository.
