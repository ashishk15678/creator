# Creator Dashboard

A web application that allows creators to manage their profile, earn credits, and interact with content through a personalized feed.

## Features

- User Authentication with JWT
- Role-based Access Control (User/Admin)
- Credit Points System
- Social Media Feed Integration
- Profile Management
- Admin Panel
- Modern and Minimalist UI

## Tech Stack

- Backend:

  - Node.js with Express
  - TypeScript
  - MongoDB with Mongoose
  - JWT Authentication
  - Express Validator
  - CORS and Security Middleware

- Frontend:
  - React with TypeScript
  - Redux Toolkit for State Management
  - Material-UI Components
  - React Router for Navigation
  - Axios for API Calls

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas URI)
- npm or yarn package manager

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/creator-dash.git
cd creator-dash
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/creator-dash
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Running the Application

1. Start the backend server:

```bash
cd backend
npm run dev
```

2. Start the frontend development server:

```bash
cd frontend
npm start
```

3. Access the application:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### Users

- GET `/api/users/profile` - Get user profile
- PUT `/api/users/profile` - Update user profile
- GET `/api/users/credits` - Get user credits

### Feed

- GET `/api/feed` - Get personalized feed
- POST `/api/feed/save/:postId` - Save a post
- DELETE `/api/feed/save/:postId` - Unsave a post
- POST `/api/feed/share/:postId` - Share a post
- POST `/api/feed/report/:postId` - Report a post

### Admin

- GET `/api/users/all` - Get all users (admin only)
- PUT `/api/users/credits/:userId` - Update user credits (admin only)

## Credit System

Users can earn credits by:

- Completing their profile (+5 credits)
- Daily login (+1 credit)
- Saving posts (+1 credit)
- Sharing content (+2 credits)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Material-UI for the beautiful components
- Redux Toolkit for state management
- Express.js for the backend framework
- MongoDB for the database
