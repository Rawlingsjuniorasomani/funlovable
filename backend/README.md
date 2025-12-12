# EduLearn Backend API

A Node.js/Express backend with PostgreSQL for the EduLearn e-learning platform.

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Setup

1. **Clone and install dependencies:**
```bash
cd backend
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Create PostgreSQL database:**
```sql
CREATE DATABASE elearning_db;
```

4. **Run migrations:**
```bash
npm run db:migrate
```

5. **Seed sample data:**
```bash
npm run db:seed
```

6. **Start the server:**
```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/onboarding/complete` - Complete onboarding

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `POST /api/users/:id/approve` - Approve user (admin)
- `POST /api/users/:id/reject` - Reject user (admin)
- `DELETE /api/users/:id` - Delete user (admin)
- `POST /api/users/:id/children` - Add child (parent)
- `GET /api/users/:id/children` - Get parent's children

### Subjects
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get subject with modules
- `POST /api/subjects` - Create subject (admin/teacher)
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject (admin)

### Modules
- `GET /api/modules/:id` - Get module with lessons
- `POST /api/modules` - Create module
- `PUT /api/modules/:id` - Update module
- `DELETE /api/modules/:id` - Delete module

### Lessons
- `GET /api/lessons/:id` - Get lesson
- `POST /api/lessons` - Create lesson
- `PUT /api/lessons/:id` - Update lesson
- `POST /api/lessons/:id/complete` - Mark lesson complete
- `DELETE /api/lessons/:id` - Delete lesson

### Quizzes
- `GET /api/quizzes/:id` - Get quiz with questions
- `POST /api/quizzes` - Create quiz
- `POST /api/quizzes/:id/submit` - Submit quiz attempt
- `GET /api/quizzes/:id/attempts` - Get user's attempts
- `DELETE /api/quizzes/:id` - Delete quiz

### Payments
- `POST /api/payments/initialize` - Initialize payment
- `POST /api/payments/verify/:reference` - Verify payment
- `GET /api/payments/history` - Get payment history
- `GET /api/payments/subscription` - Get active subscription

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `POST /api/notifications` - Create notification (admin)
- `POST /api/notifications/broadcast` - Broadcast to role (admin)

### Analytics
- `GET /api/analytics/admin` - Admin dashboard analytics
- `GET /api/analytics/teacher` - Teacher analytics
- `GET /api/analytics/student` - Student analytics
- `GET /api/analytics/parent` - Parent analytics

## Default Credentials

After seeding:
- **Admin:** admin@edulearn.com / admin123
- **Teacher:** teacher@edulearn.com / teacher123

## Deployment

### Heroku
```bash
heroku create
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
heroku run npm run db:migrate
heroku run npm run db:seed
```

### Railway
1. Create new project
2. Add PostgreSQL database
3. Deploy from GitHub
4. Set environment variables
5. Run migrations via Railway CLI

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Connecting Frontend

Update your frontend to use the API:

```typescript
// src/config/api.ts
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

Add to your `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

## License

MIT
