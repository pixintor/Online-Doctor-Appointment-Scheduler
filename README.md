## Features

- User authentication and JWT-based authorization
- Role-based access control (patient, doctor, receptionist, admin)
- Doctor profile management
- Input validation and error handling
- MongoDB integration with Mongoose
- Express.js REST API
- CORS support for cross-origin requests

## Technology Stack

- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- express-validator for input validation
- Morgan for HTTP request logging
- CORS for cross-origin resource sharing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
   git clone https://github.com/pixintor/Online-Doctor-Appointment-Scheduler.git

2. Install dependencies:
   npm install

3. Create a .env file in the root directory with the following variables:
   PORT=5000
   MONGO_URI=your-mongodb-connection-string
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d
   NODE_ENV=development

4. Start the server:
   npm run dev (development with nodemon)
   npm start (production)

## API Endpoints

### Authentication

Register a new user:
POST /api/auth/register
Content-Type: application/json

{
"firstName": "Abdulwahab",
"lastName": "Lawal",
"email": "abdulwahab@example.com",
"password": "password123",
"phone": "1234567890",
"role": "patient"
}

Login:
POST /api/auth/login
Content-Type: application/json

{
"email": "abdulwahab@example.com",
"password": "password123"
}

Response:
{
"success": true,
"message": "Login successful",
"token": "your-jwt-token",
"user": {
"id": "user-id",
"firstName": "Abdulwahab",
"lastName": "Lawal",
"email": "abdulwahab@example.com",
"phone": "1234567890",
"role": "patient"
}
}

### Doctor Profile

Create doctor profile:
POST /api/doctors/profile
Authorization: Bearer your-jwt-token
Content-Type: application/json

{
"specialization": "Cardiology",
"experience": 10,
"hospital": "City Hospital",
"availability": "Monday-Friday"
}

## User Roles

- patient: Regular user who can book appointments
- doctor: Medical professional who manages appointments
- receptionist: Administrative staff
- admin: System administrator with full access

## Error Handling

All API responses include a status code and message:

Error Response:
{
"success": false,
"message": "Error description",
"status": "fail"
}

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

Authorization: Bearer your-jwt-token

## Environment Variables

- PORT: Server port (default: 5000)
- MONGO_URI: MongoDB connection string
- JWT_SECRET: Secret key for JWT signing
- JWT_EXPIRES_IN: Token expiration time
- NODE_ENV: Environment (development/production)

## Development

Start development server with auto-reload:
npm run dev
