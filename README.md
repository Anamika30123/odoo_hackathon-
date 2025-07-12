# Skill Swap Platform

A full-stack web application that enables users to exchange skills through a community-driven platform. Built with React.js frontend, Node.js backend, and PostgreSQL database.

## Features

### User Authentication
- User registration and login
- JWT-based authentication
- Profile photo upload
- Public/private profile settings

### Profile Management
- Complete user profiles with skills offered and wanted
- Location and availability information
- Skill proficiency and urgency levels
- Profile visibility controls

### Skill Management
- Browse and search skills by category
- Add skills you can teach or want to learn
- Skill categorization and tagging
- Dynamic skill suggestions

### Swap System
- Send swap requests to other users
- Accept/reject incoming requests
- Track request status (pending, accepted, rejected, completed)
- Message system for communication

### Rating & Feedback
- Rate completed skill swaps
- Leave feedback for other users
- View user ratings and reviews
- Build trust through community feedback

### Browse & Search
- Find users by skills, location, or name
- Filter and search functionality
- View detailed user profiles
- Responsive grid layout

## Technology Stack

### Frontend
- **React.js** - User interface framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styling with responsive design
- **Context API** - State management

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling

### Database
- **PostgreSQL** - Primary database
- Structured schema with relationships
- Indexes for performance optimization

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

### Database Setup

1. Install PostgreSQL and create a database:
\`\`\`sql
CREATE DATABASE skill_swap;
\`\`\`

2. Update the database configuration in `backend/.env`:
\`\`\`env
DB_USER=your_username
DB_HOST=localhost
DB_NAME=skill_swap
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
\`\`\`

3. Run the database schema:
\`\`\`bash
psql -U your_username -d skill_swap -f database/schema.sql
\`\`\`

### Backend Setup

1. Navigate to the backend directory:
\`\`\`bash
cd backend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create uploads directory:
\`\`\`bash
mkdir uploads
\`\`\`

4. Start the server:
\`\`\`bash
npm run dev
\`\`\`

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the project root directory:
\`\`\`bash
cd ..
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the React development server:
\`\`\`bash
npm start
\`\`\`

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile/photo` - Upload profile photo

### Skills
- `GET /api/skills` - Get all available skills
- `POST /api/skills` - Create new skill
- `GET /api/user/skills/offered` - Get user's offered skills
- `POST /api/user/skills/offered` - Add offered skill
- `GET /api/user/skills/wanted` - Get user's wanted skills
- `POST /api/user/skills/wanted` - Add wanted skill

### Users
- `GET /api/users/browse` - Browse public users with filters

### Swap Requests
- `GET /api/swap-requests` - Get user's swap requests
- `POST /api/swap-requests` - Create swap request
- `PUT /api/swap-requests/:id` - Update request status
- `DELETE /api/swap-requests/:id` - Delete swap request

### Ratings
- `POST /api/ratings` - Submit rating and feedback
- `GET /api/ratings/user/:userId` - Get user's ratings

## Project Structure

\`\`\`
skill-swap-platform/
├── backend/
│   ├── server.js              # Main server file
│   ├── package.json           # Backend dependencies
│   ├── .env                   # Environment variables
│   └── uploads/               # File upload directory
├── database/
│   └── schema.sql             # Database schema
├── src/
│   ├── components/
│   │   └── Navbar.js          # Navigation component
│   ├── contexts/
│   │   └── AuthContext.js     # Authentication context
│   ├── pages/
│   │   ├── Home.js            # Dashboard page
│   │   ├── Login.js           # Login page
│   │   ├── Register.js        # Registration page
│   │   ├── Profile.js         # Profile management
│   │   ├── Browse.js          # Browse users
│   │   └── SwapRequests.js    # Manage requests
│   ├── services/
│   │   └── api.js             # API service layer
│   ├── App.js                 # Main app component
│   ├── App.css                # Global styles
│   └── index.js               # App entry point
├── package.json               # Frontend dependencies
└── README.md                  # Project documentation
\`\`\`

## Features in Detail

### User Dashboard
- Overview of user statistics
- Recent activity feed
- Quick action buttons
- Responsive design for mobile

### Skill Management
- Add/remove skills with descriptions
- Proficiency levels for offered skills
- Urgency levels for wanted skills
- Visual skill cards with categories

### Request System
- Intuitive request creation flow
- Real-time status updates
- Message system for communication
- Request history and tracking

### Rating System
- 5-star rating system
- Written feedback support
- Average rating calculation
- Trust building through reviews

## Mobile Responsiveness

The application is fully responsive and optimized for:
- Desktop computers (1200px+)
- Tablets (768px - 1199px)
- Mobile phones (320px - 767px)

Key responsive features:
- Collapsible navigation menu
- Flexible grid layouts
- Touch-friendly buttons
- Optimized modal dialogs

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- File upload restrictions
- SQL injection prevention

## Performance Optimizations

- Lazy loading of components
- Optimized database queries
- Image compression for uploads
- Efficient state management
- Minimal re-renders

## Future Enhancements

- Real-time messaging system
- Video call integration
- Skill verification system
- Advanced search filters
- Mobile app development
- Social media integration
- Notification system
- Admin dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository.
