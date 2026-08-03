# VoxIntel

> **AI-powered online polling and survey platform built with JavaScript, Node.js, Express.js and MongoDB.**

VoxIntel is a full-stack survey platform designed to help users create surveys, collect responses, view analytics and eventually generate AI-powered summaries, sentiment insights and recommendations.

The project is currently under active development. The frontend foundation, backend setup, MongoDB connection and authentication flow are implemented. The next major phase is the complete survey lifecycle: creating surveys, publishing them, collecting responses and generating analytics.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Project Goals](#project-goals)
- [Current Project Status](#current-project-status)
- [Implemented Features](#implemented-features)
- [Features Still Remaining](#features-still-remaining)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Database Design](#database-design)
- [Authentication Flow](#authentication-flow)
- [API Documentation](#api-documentation)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Testing the Current Features](#testing-the-current-features)
- [Security Decisions](#security-decisions)
- [Development Roadmap](#development-roadmap)
- [Known Limitations](#known-limitations)
- [Git Workflow](#git-workflow)
- [Learning Outcomes](#learning-outcomes)
- [Future Enhancements](#future-enhancements)
- [Author](#author)

---

## Project Overview

VoxIntel is an online poll and survey platform that will allow authenticated users to:

1. Register and log in.
2. Create surveys.
3. Add multiple question types.
4. Save surveys as drafts.
5. Publish surveys.
6. Share surveys with respondents.
7. Collect and store responses.
8. View survey-level and question-level analytics.
9. Generate AI-powered summaries and sentiment insights.

The project is being developed as a portfolio-grade full-stack application. The current frontend uses HTML, CSS and JavaScript. The backend uses Node.js, Express.js, MongoDB and Mongoose.

React is intentionally not being introduced yet. The current objective is to understand and complete the full request lifecycle using core JavaScript and a REST API before migrating to a frontend framework.

---

## Problem Statement

Traditional survey tools often allow users to collect responses but still require manual effort to interpret large amounts of feedback.

VoxIntel aims to solve this by combining:

- Survey creation
- Response collection
- Real-time analytics
- AI-assisted interpretation

The long-term vision is to transform raw responses into useful information such as:

- Common themes
- Sentiment distribution
- Important complaints
- Positive feedback patterns
- Suggested actions
- Automatic summaries

---

## Project Goals

### Technical goals

- Build a complete full-stack application.
- Understand frontend-to-backend communication.
- Design RESTful APIs.
- Implement secure user authentication.
- Model users, surveys, questions and responses in MongoDB.
- Apply authorization and ownership checks.
- Build reusable and maintainable project structure.
- Add testing, documentation and deployment.

### Product goals

- Allow users to create surveys quickly.
- Support multiple question types.
- Allow survey creators to manage their surveys.
- Allow respondents to submit answers easily.
- Display meaningful analytics.
- Add AI-powered feedback interpretation in a later phase.

---

## Current Project Status

### Overall completion estimate

**Approximately 35% complete for a functional portfolio-grade MVP.**

This percentage is based on product capability, not file count or visual appearance.

| Area | Estimated Completion | Current State |
|---|---:|---|
| Frontend UI and layout | 75% | Main screens and responsive layouts exist |
| Frontend JavaScript | 60% | Authentication connected; survey API integration pending |
| Backend foundation | 75% | Express, environment config, CORS and health endpoint exist |
| Authentication | 80% | Registration, login, JWT and protected routes work |
| Database layer | 25% | User model exists; survey and response models pending |
| Survey CRUD | 5% | Frontend builder exists; backend persistence pending |
| Response collection | 0% | Not implemented |
| Analytics | 5% | UI placeholders exist; real calculations pending |
| AI integration | 0% | Planned for a future phase |
| Testing | 10% | Manual testing performed; automated tests pending |
| Deployment | 5% | Local development only |

### Current milestone

The project has moved beyond a static frontend.

The following complete flow currently works:

```text
User opens signup/login page
→ frontend validates form
→ frontend sends API request
→ Express receives request
→ controller validates data
→ MongoDB stores or retrieves user
→ bcrypt hashes or compares password
→ JWT is generated
→ frontend stores token
→ authenticated user is redirected
→ protected pages verify the session
```

The next major milestone is:

```text
Create survey
→ save in MongoDB
→ list surveys
→ publish survey
→ collect responses
→ generate analytics
```

---

## Implemented Features

### 1. Landing Page

The landing page includes:

- VoxIntel branding
- Hero section
- Product description
- Call-to-action buttons
- Dashboard-style product preview
- Feature cards
- Pricing and supporting sections
- Footer
- Responsive navigation
- Mobile menu behaviour
- Visual animation support

The current landing page communicates the intended product vision even though some statistics and AI insights are currently demonstration data.

### 2. Authentication UI

The project contains dedicated login and signup pages with:

- Password visibility toggle
- Accessible form labels
- Client-side validation
- Inline validation messages
- API error messages
- Success states
- Loading states
- Redirect states

#### Signup validation

- Full name is required.
- Full name must contain at least two characters.
- Email is required.
- Email format is validated.
- Password is required.
- Password must contain at least eight characters.
- Confirm password is required.
- Password and confirmation must match.

#### Login validation

- Email is required.
- Email format is validated.
- Password is required.
- Password must contain at least eight characters.

Client-side validation improves user experience, but backend validation remains mandatory because browser validation can be bypassed.

### 3. Authentication Backend

Implemented endpoints:

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

Registration supports:

- Required-field validation
- Password confirmation
- Minimum password length
- Email normalization
- Duplicate email detection
- bcrypt password hashing
- MongoDB user creation
- JWT generation
- Safe response data
- Duplicate-key handling
- Mongoose validation handling

Login supports:

- Email normalization
- User lookup
- Hidden password-hash selection
- bcrypt password comparison
- Generic invalid-credentials response
- JWT generation
- Safe user response

The authentication middleware reads the bearer token, verifies the JWT, loads the user from MongoDB, assigns the user to `request.user`, and rejects invalid or expired sessions.

### 4. Authentication Session Handling

The frontend stores the JWT in:

```text
localStorage key: voxintelToken
```

After login or registration:

1. The JWT is saved.
2. The user is redirected to the dashboard.
3. Protected pages call `/api/auth/me`.
4. The backend validates the token.
5. Invalid sessions are removed.
6. Unauthenticated users are redirected to login.
7. Authenticated users are prevented from unnecessarily returning to login or signup.

Logout removes the token and redirects the user.

> This strategy is acceptable for the current learning phase. A later security improvement may migrate authentication to secure HttpOnly cookies.

### 5. Dashboard UI

The dashboard includes:

- Sidebar navigation
- Mobile sidebar behaviour
- User profile display
- Survey statistics cards
- Recent surveys panel
- Recent activity section
- Create Survey action
- My Surveys navigation
- Results navigation
- Logout option

Some values remain static and will later be replaced with backend data.

### 6. Survey Builder Frontend

The Create Survey page includes:

- Survey title
- Survey description
- Category selection
- Initial status selection
- Dynamic question creation
- Question removal
- Question renumbering
- Required-question toggle
- Save Draft button
- Publish Survey button

Supported question types:

```text
short-text
long-text
multiple-choice
rating
```

Multiple-choice questions support dynamic option addition and removal while preserving a minimum of two options.

The builder validates survey title, question text and multiple-choice options. It focuses the first invalid field and provides an accessible form-level message.

The builder currently validates data in the browser but does not yet save surveys to MongoDB.

### 7. Backend Foundation

The backend includes:

- Node.js project initialization
- Express application
- CommonJS modules
- Environment variables
- nodemon development server
- MongoDB connection
- JSON request parsing
- CORS configuration
- Health route
- Authentication routes
- Authentication controller
- User model
- JWT utility
- Authentication middleware

Current scripts:

```json
{
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### 8. Database Foundation

The current User model stores:

```text
fullName
email
passwordHash
createdAt
updatedAt
```

Rules include required fields, name length limits, normalized unique email, hidden password hash and automatic timestamps.

---

## Features Still Remaining

### 1. Survey Persistence

Required flow:

```text
User completes survey form
→ JavaScript validates fields
→ JavaScript builds survey JSON
→ POST /api/surveys
→ JWT middleware identifies user
→ controller validates business rules
→ Survey model validates schema
→ MongoDB saves survey
→ API returns saved survey
→ frontend displays success
```

### 2. Survey CRUD

Remaining operations:

- Create survey
- List current user's surveys
- Retrieve one survey
- Edit survey
- Save draft
- Publish survey
- Close survey
- Archive survey
- Delete survey
- Enforce survey ownership

Planned endpoints:

```http
POST   /api/surveys
GET    /api/surveys
GET    /api/surveys/:surveyId
PATCH  /api/surveys/:surveyId
DELETE /api/surveys/:surveyId
PATCH  /api/surveys/:surveyId/publish
PATCH  /api/surveys/:surveyId/close
```

### 3. Public Survey Participation

Still required:

- Public survey URL
- Published survey retrieval
- Dynamic question rendering
- Required-answer validation
- Answer submission
- Closed-survey rejection
- Submission confirmation

Planned endpoints:

```http
GET  /api/public/surveys/:surveyId
POST /api/public/surveys/:surveyId/responses
```

### 4. Response Storage

Planned Response model:

```text
survey
respondent
answers
submittedAt
```

Each answer should contain:

```text
questionId
value
```

### 5. Analytics

Real analytics still require:

- Total response count
- Completion rate
- Response trends
- Multiple-choice distribution
- Rating averages
- Text-response display
- Question-level analytics
- Dashboard summary

Planned endpoints:

```http
GET /api/surveys/:surveyId/responses
GET /api/surveys/:surveyId/analytics
GET /api/dashboard/summary
```

### 6. AI Integration

Future capabilities may include:

- Response summarization
- Sentiment classification
- Topic extraction
- Common-issue identification
- Recommended actions
- Question suggestions
- Low-quality response detection

---

## System Architecture

```text
Browser
│
├── HTML pages
├── CSS styles
└── JavaScript
      │
      │ fetch()
      ▼
Express REST API
│
├── Routes
├── Middleware
├── Controllers
├── Models
└── Utilities
      │
      ▼
MongoDB
```

Full request lifecycle:

```text
User action
→ frontend event listener
→ frontend validation
→ fetch request
→ Express route
→ middleware
→ controller
→ Mongoose model
→ MongoDB operation
→ JSON response
→ frontend response handling
→ DOM update
```

---

## Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| HTML5 | Page structure |
| CSS3 | Styling and responsive layouts |
| JavaScript | DOM behaviour, validation and API communication |
| DOM/BOM | Browser interaction |
| Font Awesome | Icons |
| AOS | Landing-page animations |
| Local Storage | Current JWT persistence |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API and HTTP server |
| MongoDB | NoSQL database |
| Mongoose | Schema modelling and database access |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT generation and verification |
| cors | Cross-origin frontend access |
| dotenv | Environment configuration |
| nodemon | Development restart |

---

## Repository Structure

```text
Website/
├── Frontend/
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   ├── dashboard.html
│   ├── create-survey.html
│   ├── my-surveys.html
│   ├── results.html
│   └── assets/
│       ├── css/
│       │   ├── variables.css
│       │   ├── global.css
│       │   ├── navbar.css
│       │   ├── hero.css
│       │   ├── buttons.css
│       │   ├── cards.css
│       │   ├── animation.css
│       │   ├── auth.css
│       │   ├── app-layout.css
│       │   ├── dashboard-page.css
│       │   ├── survey-builder.css
│       │   └── responsive.css
│       └── js/
│           ├── main.js
│           ├── animation.js
│           ├── auth.js
│           ├── app.js
│           ├── dashboard.js
│           ├── survey-builder.js
│           └── other page-specific scripts
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   └── authController.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   ├── models/
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── healthRoutes.js
│   │   ├── utils/
│   │   │   └── generateToken.js
│   │   └── app.js
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   └── .gitignore
└── README.md
```

The structure will evolve as survey, response, analytics, testing and deployment modules are added.

---

## Frontend Architecture

CSS files are separated by responsibility:

- `variables.css`: design tokens
- `global.css`: reset and shared styles
- `navbar.css`: navigation
- `hero.css`: hero section
- `buttons.css`: reusable buttons
- `cards.css`: cards and sections
- `auth.css`: authentication pages
- `app-layout.css`: dashboard shell
- `dashboard-page.css`: dashboard styles
- `survey-builder.css`: survey builder
- `responsive.css`: shared breakpoints

JavaScript files are page-oriented:

- `main.js`: landing-page behaviour
- `animation.js`: animation initialization
- `auth.js`: validation and auth API integration
- `app.js`: protected-page/session behaviour
- `dashboard.js`: dashboard rendering
- `survey-builder.js`: dynamic questions and validation

---

## Backend Architecture

### `server.js`

Responsible for loading configuration, connecting to MongoDB, starting the server and handling startup failure.

### `src/app.js`

Responsible for creating Express, configuring CORS, parsing JSON and mounting routes.

### Routes

Routes map endpoints to controllers and middleware.

### Middleware

Middleware runs before controllers. Authentication middleware verifies bearer tokens and attaches the authenticated user to the request.

### Controllers

Controllers process input, apply request-level logic, call models and return responses.

### Models

Mongoose models define validation and storage rules.

---

## Database Design

### Current User Model

```javascript
{
  fullName: String,
  email: String,
  passwordHash: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Planned Survey Model

```javascript
{
  creator: ObjectId,
  title: String,
  description: String,
  category: String,
  status: String,
  questions: [
    {
      text: String,
      type: String,
      required: Boolean,
      options: [String],
      order: Number
    }
  ],
  responseCount: Number,
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

Suggested statuses:

```text
draft
active
closed
archived
```

### Planned Response Model

```javascript
{
  survey: ObjectId,
  respondent: ObjectId | null,
  answers: [
    {
      questionId: ObjectId,
      value: Mixed
    }
  ],
  submittedAt: Date
}
```

---

## Authentication Flow

### Registration

```text
Registration data
→ frontend validation
→ POST /api/auth/register
→ backend validation
→ email normalization
→ duplicate check
→ bcrypt hashing
→ user creation
→ JWT generation
→ safe response
→ token storage
→ dashboard redirect
```

### Login

```text
Credentials
→ frontend validation
→ POST /api/auth/login
→ user lookup
→ bcrypt comparison
→ JWT generation
→ token storage
→ redirect
```

### Protected Page

```text
Protected page opens
→ token is read
→ GET /api/auth/me
→ bearer token is verified
→ user is loaded
→ access is allowed or rejected
```

---

## API Documentation

Local API URL:

```text
http://localhost:5000
```

### Health Check

```http
GET /api/health
```

Purpose: confirm that the backend is running.

### Register User

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "fullName": "Aryan Shrivastav",
  "email": "aryan@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

Success:

```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "<jwt-token>",
  "user": {
    "id": "<user-id>",
    "fullName": "Aryan Shrivastav",
    "email": "aryan@example.com",
    "createdAt": "<timestamp>"
  }
}
```

| Status | Meaning |
|---:|---|
| 201 | User registered |
| 400 | Invalid data |
| 409 | Duplicate email |
| 500 | Server error |

### Login User

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "aryan@example.com",
  "password": "password123"
}
```

| Status | Meaning |
|---:|---|
| 200 | Login successful |
| 400 | Missing credentials |
| 401 | Invalid credentials |
| 500 | Server error |

### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <jwt-token>
```

| Status | Meaning |
|---:|---|
| 200 | Current user returned |
| 401 | Token missing, invalid or expired |

---

## Local Development Setup

### Prerequisites

Install:

- Node.js
- npm
- Git
- MongoDB Community Server or MongoDB Atlas
- MongoDB Compass, optional
- Visual Studio Code
- Live Server, recommended
- Hoppscotch or Postman, recommended

### Clone Repository

```bash
git clone https://github.com/Kryakn/Website.git
cd Website
```

Verify:

```bash
git remote -v
git branch --show-current
git log -1 --oneline
```

Expected branch:

```text
main
```

### Install Backend Dependencies

From `Website/Backend`:

```bash
npm install
```

---

## Environment Variables

Create `Backend/.env` from `.env.example`.

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/voxintel
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
```

| Variable | Purpose |
|---|---|
| `PORT` | Express port |
| `MONGODB_URI` | MongoDB connection |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | Token lifetime |

Never commit `.env`.

---

## Running the Project

### Start MongoDB

For local MongoDB, ensure the service is running. MongoDB Compass can connect through:

```text
mongodb://127.0.0.1:27017
```

### Start Backend

From `Backend/`:

```bash
npm run dev
```

Expected result:

- Environment variables load.
- MongoDB connects.
- Express starts on port 5000.

### Start Frontend

Open `Frontend/index.html` using Live Server.

Recommended URL:

```text
http://127.0.0.1:5500/Frontend/index.html
```

---

## Testing the Current Features

### Health Endpoint

Open:

```text
http://localhost:5000/api/health
```

Expected: status `200` and a success response.

### Registration

Test:

- Valid registration
- Empty fields
- Invalid email
- Short password
- Password mismatch
- Duplicate email

Expected valid result:

- User is stored in MongoDB.
- JWT is stored in localStorage.
- Dashboard opens.

### Login

Test:

- Correct credentials
- Empty email
- Invalid email
- Empty password
- Wrong password
- Unknown email
- Backend offline

### Protected Page

1. Log in.
2. Open the dashboard.
3. Remove `voxintelToken`.
4. Refresh.

Expected: redirect to login.

### Logout

Expected:

- Token removed.
- Redirect performed.
- Protected page denied afterward.

---

## Security Decisions

### Password Hashing

```text
Plain password
→ bcrypt
→ passwordHash stored in MongoDB
```

### Hidden Password Hash

The schema uses `select: false` so password hashes are excluded from normal queries.

### Generic Login Errors

The API returns `Invalid email or password` for both unknown users and incorrect passwords.

### JWT Verification

The backend does not trust a user ID sent by the frontend.

```text
JWT signature
→ verified userId
→ database lookup
→ request.user
```

### Remaining Security Work

- Helmet
- Rate limiting
- Centralized errors
- Production CORS
- Stronger input validation
- Sanitization
- Cookie-based auth evaluation
- Automated security tests

---

## Development Roadmap

### Phase 1 — Frontend Foundation

- [x] Landing page
- [x] Authentication pages
- [x] Dashboard layout
- [x] Create Survey UI
- [x] My Surveys UI
- [x] Results UI
- [x] Responsive CSS
- [x] Dynamic question builder
- [x] Form validation
- [x] Protected-page handling

### Phase 2 — Backend and Authentication

- [x] Initialize Node project
- [x] Create Express application
- [x] Environment configuration
- [x] MongoDB connection
- [x] Health endpoint
- [x] User model
- [x] Registration
- [x] Login
- [x] JWT generation
- [x] Authentication middleware
- [x] `/api/auth/me`
- [x] Frontend auth integration
- [x] Session verification
- [x] Logout
- [ ] Centralized errors
- [ ] Rate limiting
- [ ] Security headers

### Phase 3 — Survey Domain

- [ ] Embedded Question schema
- [ ] Survey model
- [ ] Create survey API
- [ ] Save draft
- [ ] Publish survey
- [ ] List user surveys
- [ ] Retrieve survey
- [ ] Update survey
- [ ] Close survey
- [ ] Archive/delete
- [ ] Ownership checks
- [ ] Frontend integration

### Phase 4 — Responses

- [ ] Response model
- [ ] Public survey endpoint
- [ ] Survey-taking page
- [ ] Answer validation
- [ ] Response submission
- [ ] Inactive-survey protection
- [ ] Success state

### Phase 5 — Analytics

- [ ] Response totals
- [ ] Question analytics
- [ ] Choice distribution
- [ ] Rating averages
- [ ] Text responses
- [ ] Trend chart
- [ ] Dashboard summary
- [ ] Real results integration

### Phase 6 — Testing and Deployment

- [ ] Unit tests
- [ ] Integration tests
- [ ] Authorization tests
- [ ] Frontend regression tests
- [ ] MongoDB Atlas
- [ ] Backend deployment
- [ ] Frontend deployment
- [ ] Production configuration
- [ ] Accessibility audit

### Phase 7 — AI

- [ ] AI summaries
- [ ] Sentiment analysis
- [ ] Theme extraction
- [ ] Recommended actions
- [ ] Question assistance

---

## Known Limitations

- Surveys are not yet saved to MongoDB.
- Save Draft is not connected.
- Publish Survey currently validates only in the browser.
- My Surveys is not API-driven.
- Dashboard statistics are not fully dynamic.
- Public surveys are not implemented.
- Responses are not stored.
- Analytics are placeholder data.
- AI features are not implemented.
- API URLs are hardcoded for local development.
- JWT is stored in localStorage.
- Automated tests are not configured.
- Production deployment is incomplete.

---

## Git Workflow

Before work:

```bash
git status
git branch --show-current
git pull origin main
```

After one focused task:

```bash
git status
git diff
git add <specific-files>
git diff --staged
git commit -m "type(scope): clear description"
git push origin main
```

Good commit examples:

```text
feat(surveys): add Survey model with embedded questions
feat(surveys): implement authenticated survey creation
feat(frontend): connect survey builder to create API
feat(responses): add public response submission
feat(analytics): add question-level aggregation
fix(auth): reject expired protected-page sessions
docs(readme): document architecture and roadmap
```

Avoid:

```text
changes
updated files
work done
final
```

---

## Learning Outcomes

VoxIntel currently demonstrates:

- Semantic HTML
- Modular CSS
- Responsive design
- DOM manipulation
- Event listeners
- Event delegation
- Dynamic form controls
- Frontend validation
- Fetch API
- REST communication
- Express routing
- Controllers
- Middleware
- MongoDB
- Mongoose schemas
- Password hashing
- JWT authentication
- Protected routes
- CORS
- Environment variables
- Git/GitHub workflow
- Full-stack request lifecycle

---

## Future Enhancements

- React migration
- Refresh tokens
- HttpOnly cookies
- Role-based access control
- Team workspaces
- Survey templates
- Question banks
- Survey duplication
- Scheduled publishing
- QR-code sharing
- Email invitations
- Anonymous responses
- CSV/PDF export
- Advanced charts
- Real-time response updates
- AI survey generation
- AI summarization
- Sentiment analysis
- Multi-language surveys
- SaaS subscriptions

---

## Author

**Aryan Shrivastav**

B.Tech Computer Science and Technology student focused on software development, full-stack development, MERN, AI integration and data structures and algorithms.

Repository:

```text
https://github.com/Kryakn/Website
```

---

## Project Status Notice

VoxIntel is under active development.

The current version is an authentication-enabled full-stack foundation, not yet a completed survey SaaS product.

Immediate priority:

```text
Survey model
→ survey CRUD
→ frontend integration
→ response collection
→ analytics
→ deployment
→ AI integration
```
