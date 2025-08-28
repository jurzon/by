# API Documentation

## ?? Base URL
- **Development**: `http://localhost:5000/api/v1`
- **Staging**: `https://api-staging.byapp.com/api/v1`
- **Production**: `https://api.byapp.com/api/v1`

## ?? Authentication

### Overview
The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

---

## ?? User Management

### Get Current User Profile
```http
GET /users/me
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "firstName": "John",
    "lastName": "Doe",
    "profileImage": "url_to_image",
    "totalGoals": 5,
    "completedGoals": 3,
    "totalStaked": 150.00,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Update User Profile
```http
PUT /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "profileImage": "base64_or_url"
}
```

---

## ?? Goals Management

### Create Goal
```http
POST /goals
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Exercise Daily",
  "description": "Complete 30 minutes of exercise every day",
  "category": "FITNESS",
  "goalType": "HABIT",
  "targetValue": 30,
  "targetUnit": "DAYS",
  "stakeAmount": 50.00,
  "dailyStakeAmount": 1.67,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-31T23:59:59Z",
  "reminderTime": "07:00"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "goal_uuid",
    "title": "Exercise Daily",
    "description": "Complete 30 minutes of exercise every day",
    "category": "FITNESS",
    "status": "ACTIVE",
    "currentValue": 0,
    "targetValue": 30,
    "progressPercentage": 0,
    "stakeAmount": 50.00,
    "dailyStakeAmount": 1.67,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get User Goals
```http
GET /goals?status=ACTIVE&category=FITNESS&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: ACTIVE, COMPLETED, FAILED, PAUSED
- `category`: FITNESS, LEARNING, HABITS, FINANCE, etc.
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)

### Get Goal Details
```http
GET /goals/{goalId}
Authorization: Bearer <token>
```

### Update Goal
```http
PUT /goals/{goalId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Goal Title",
  "description": "Updated description",
  "reminderTime": "08:00"
}
```

### Delete Goal
```http
DELETE /goals/{goalId}
Authorization: Bearer <token>
```

---

## ?? Progress Tracking

### Submit Progress (Simplified Check-in)
```http
POST /goals/{goalId}/checkin
Authorization: Bearer <token>
Content-Type: application/json

{
  "completed": true,
  "notes": "Great workout today!", // Optional
  "checkInTime": "2024-01-01T19:00:00Z"
}
```

**Response Options:**
```json
// Success check-in
{
  "success": true,
  "data": {
    "id": "checkin_uuid",
    "goalId": "goal_uuid",
    "completed": true,
    "notes": "Great workout today!",
    "checkInTime": "2024-01-01T19:00:00Z",
    "streakCount": 7
  }
}

// Failed check-in with immediate payment
{
  "success": true,
  "data": {
    "id": "checkin_uuid",
    "goalId": "goal_uuid", 
    "completed": false,
    "paymentProcessed": true,
    "amountCharged": 1.67,
    "checkInTime": "2024-01-01T19:00:00Z",
    "message": "Don't worry - tomorrow is a fresh start!"
  }
}
```

### Get Progress History (Simplified)
```http
GET /goals/{goalId}/checkins?page=1&limit=30
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "checkin_uuid",
      "date": "2024-01-01",
      "completed": true,
      "notes": "Great workout!",
      "streakCount": 7
    },
    {
      "id": "checkin_uuid2", 
      "date": "2024-01-02",
      "completed": false,
      "paymentProcessed": true,
      "amountCharged": 1.67
    }
  ],
  "meta": {
    "totalDays": 30,
    "successfulDays": 28,
    "failedDays": 2,
    "currentStreak": 5,
    "totalPaid": 3.34
  }
}
```

---

## ?? Payment Management

### Add Payment Method
```http
POST /payments/methods
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "CREDIT_CARD",
  "stripePaymentMethodId": "pm_stripe_id",
  "isDefault": true
}
```

### Get Payment Methods
```http
GET /payments/methods
Authorization: Bearer <token>
```

### Process Stake Payment
```http
POST /payments/stakes
Authorization: Bearer <token>
Content-Type: application/json

{
  "goalId": "goal_uuid",
  "amount": 50.00,
  "paymentMethodId": "pm_id"
}
```

### Get Payment History
```http
GET /payments/history?type=STAKE&status=COMPLETED&page=1&limit=10
Authorization: Bearer <token>
```

---

## ?? Community Features

### Get Community Feed
```http
GET /community/feed?page=1&limit=20
Authorization: Bearer <token>
```

### Share Progress Update
```http
POST /community/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "goalId": "goal_uuid",
  "progressId": "progress_uuid",
  "message": "Great workout today!",
  "isPublic": true
}
```

### Find Accountability Buddy
```http
POST /community/buddy-requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "goalCategory": "FITNESS",
  "message": "Looking for a workout buddy!"
}
```

---

## ?? Analytics & Insights

### Get User Statistics
```http
GET /analytics/user-stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalGoals": 15,
    "activeGoals": 3,
    "completedGoals": 10,
    "failedGoals": 2,
    "successRate": 83.3,
    "totalStaked": 500.00,
    "totalEarned": 350.00,
    "currentStreak": 7,
    "longestStreak": 15,
    "favoriteCategory": "FITNESS"
  }
}
```

### Get Goal Analytics
```http
GET /analytics/goals/{goalId}
Authorization: Bearer <token>
```

---

## ?? Admin Endpoints

### Get All Users (Admin Only)
```http
GET /admin/users?page=1&limit=50&status=ACTIVE
Authorization: Bearer <admin_token>
```

### Get System Statistics (Admin Only)
```http
GET /admin/stats
Authorization: Bearer <admin_token>
```

### Verify Goal Progress (Admin Only)
```http
POST /admin/verify-progress/{progressId}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "verified": true,
  "notes": "Verification notes"
}
```

---

## ?? Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

---

## ?? Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `PAYMENT_REQUIRED` | 402 | Payment method required |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## ?? Rate Limiting

- **Authentication endpoints**: 5 requests per minute per IP
- **General API**: 100 requests per minute per user
- **File uploads**: 10 requests per minute per user
- **Admin endpoints**: 1000 requests per minute per admin

---

## ?? Webhooks

### Stripe Payment Webhooks
```http
POST /webhooks/stripe
Content-Type: application/json
Stripe-Signature: <signature>

{
  "type": "payment_intent.succeeded",
  "data": {
    // Stripe event data
  }
}
```

### Goal Deadline Notifications
The system automatically processes goal deadlines and sends appropriate notifications.

---

## ?? Security Considerations

1. **HTTPS Only**: All API communication must use HTTPS
2. **Input Validation**: All inputs are validated and sanitized
3. **Rate Limiting**: Prevents abuse and ensures fair usage
4. **JWT Expiration**: Access tokens expire in 15 minutes
5. **Refresh Tokens**: Valid for 30 days, securely stored
6. **Payment Security**: PCI-compliant payment processing
7. **File Upload Limits**: Maximum 10MB per file, specific MIME types allowed

---

## ?? API Versioning

The API uses URL versioning:
- Current version: `v1`
- Deprecated versions will be supported for 6 months
- New versions will be announced 30 days in advance

---

## ??? SDKs and Tools

### Postman Collection
Import our Postman collection for easy API testing:
[Download Postman Collection](./postman/BY-API.postman_collection.json)

### OpenAPI Specification
Full OpenAPI 3.0 specification available at:
`/api/v1/swagger.json`

### Interactive Documentation
Swagger UI available at:
`/api/v1/docs`