# DigitalDock Backend API

Express.js + MongoDB backend for the DigitalDock digital product marketplace.

## 🏗️ Architecture

```
digitaldock-backend/
├── src/
│   ├── config/           # Configuration files
│   │   └── database.ts   # MongoDB connection
│   ├── models/           # Mongoose models
│   │   ├── User.ts       # User model (BUYER, SELLER, ADMIN)
│   │   ├── Product.ts    # Product model (10 categories)
│   │   ├── Purchase.ts   # Purchase/transaction model
│   │   └── Review.ts     # Product review model
│   ├── controllers/      # Business logic (to be created)
│   ├── routes/           # API routes (to be created)
│   ├── middleware/       # Express middleware
│   │   └── auth.ts       # JWT authentication
│   ├── utils/            # Utility functions
│   │   ├── jwt.ts        # JWT token utilities
│   │   └── password.ts   # Password hashing
│   └── server.ts         # Express server (to be created)
├── .env                  # Environment variables
├── package.json
└── tsconfig.json
```

## 📦 Tech Stack

- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Zod
- **Documentation:** Swagger/OpenAPI
- **Language:** TypeScript

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation
```bash
cd digitaldock-backend
npm install
```

### Environment Setup
Copy `.env` file and update with your values:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/digitaldock
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

## 📝 API Documentation

Once running, visit: `http://localhost:5000/api-docs`

## ✅ Completed Features

- [x] Project structure
- [x] MongoDB connection
- [x] Mongoose models (User, Product, Purchase, Review)
- [x] JWT authentication utilities
- [x] Password hashing (bcrypt)
- [x] Auth middleware

## 🔨 In Progress

- [ ] Express server setup
- [ ] Swagger documentation
- [ ] Auth routes (register, login, me)
- [ ] User management routes
- [ ] Product CRUD routes
- [ ] Purchase/payment routes
- [ ] Review routes

## 📊 Database Models

### User
- Email/password authentication
- OAuth support (Google, GitHub, Twitter)
- Roles: BUYER, SELLER, ADMIN
- Premium seller accounts
- Seller profiles (slug, social links, earnings)

### Product
- 10 categories (Notion, Figma, Resume, etc.)
- File management (main file + preview)
- Images (up to 5)
- Pricing (fixed or Pay What You Want)
- Rating & reviews
- Status (DRAFT, PUBLISHED, etc.)

### Purchase
- Stripe & PayPal support
- Platform fee tracking (10%)
- Download token system
- Refund support

### Review
- 1-5 star rating
- Comment/feedback
- Moderation (approval, flagging)

## 🔐 Authentication

JWT-based authentication with Bearer tokens:

```
Authorization: Bearer <your-jwt-token>
```

## 🌐 CORS

Configured to allow requests from:
- Frontend: `http://localhost:3000`

## 📈 Next Steps

1. Create Express server (`server.ts`)
2. Set up Swagger documentation
3. Build authentication controllers
4. Build authentication routes
5. Build product management
6. Add file upload (Cloudflare R2)
7. Integrate Stripe payments

## 🛡️ Security

- JWT tokens with expiration
- Password hashing with bcrypt (12 rounds)
- CORS protection
- Helmet security headers
- Rate limiting
- Input validation with Zod

## 📄 License

MIT
