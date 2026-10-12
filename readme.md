# NoteBunker — Backend

A RESTful API for a note-taking application built with Node.js, Express, TypeScript, and MongoDB. The API supports user authentication, personal note management, and administrative operations.

## Features

### Authentication and Security

- User registration and login.
- JWT-based authentication.
- Password hashing with bcrypt.
- Role-based authorization for administrative routes.
- Request validation using Zod.
- Protection against users accessing other users' notes through the regular notes API.

### Notes Management

- Create, retrieve, update, and delete notes.
- Associate notes with their owners.
- Retrieve notes belonging to the authenticated user.
- Paginated note retrieval.

### Admin API

- List users with pagination.
- Create user accounts.
- Update user details and roles.
- Delete user accounts, with protection against self-deletion.
- View notes across all users.
- Group users by interests using MongoDB aggregation.

### Database

- MongoDB with Mongoose.
- Schema-level validation and timestamps.
- Unique email index.
- Additional index on user creation timestamps.
- MongoDB aggregation pipelines for data processing.

## Tech Stack

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcrypt
- Zod

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

Clone the repository and enter the backend project directory:

```bash
git clone https://github.com/marufBS/secure-note-taking-api.git
cd <backend-project-directory>
npm install
```

### Environment Variables

Create a `.env` file in the backend project root. Configure it according to the variable names used by your application.

Example:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/note-bunker
JWT_SECRET=provide-a-good-jwt-secret
```

### Run the Development Server

```bash
npm run dev
```


### Build for Production

```bash
npm run build
npm start
```

## API Overview

All routes depend on the API prefix configured by the application.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a user |
| `POST` | `/auth/login` | Authenticate a user |
| `GET` | `/user/me` | Get the authenticated user's profile |
| `GET` | `/notes` | List the user's notes |
| `POST` | `/notes` | Create a note |
| `GET` | `/notes/:id` | Retrieve a note |
| `PATCH` | `/notes/:id` | Update a note |
| `DELETE` | `/notes/:id` | Delete a note |
| `GET` | `/admin/users` | List users with pagination |
| `POST` | `/admin/users` | Create a user |
| `PATCH` | `/admin/users/:id` | Update a user |
| `DELETE` | `/admin/users/:id` | Delete a user |
| `GET` | `/admin/notes` | List notes across users |
| `GET` | `/admin/users/by-interests` | Retrieve users grouped by interests |

Authenticated endpoints require a bearer token:

```http
Authorization: Bearer <your-jwt-token>
```

Administrative endpoints require authentication and the admin role.

## Pagination

List endpoints support pagination through query parameters:

```http
GET /admin/users?page=1&limit=10
```

- `page`: Page number, starting at `1`.
- `limit`: Number of records per page, up to `100` for the admin pagination schema.

Paginated responses include the returned records and pagination metadata.

## Project Structure

```text
src/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
└── ...
```

The application separates HTTP route handling, controllers, business logic, database models, and middleware.

## Security Considerations

- Store password hashes rather than plaintext passwords.
- Keep JWT secrets in environment variables.
- Validate incoming data before processing it.
- Enforce authentication and role-based access control.
- Apply ownership checks to personal note operations.
