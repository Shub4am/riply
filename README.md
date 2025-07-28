# RIPLY App (Backend and Mobile Frontend)

---
## App Screenshots:
<img  width="200" height="768"  alt="Image" src="https://github.com/user-attachments/assets/be92b089-6c0f-4e2c-9462-32ced0a4f637" />
<img width="200" height="768" alt="Image" src="https://github.com/user-attachments/assets/a7380798-df96-4198-bad7-64b564d4c129" />
<img width="200" height="768" alt="Image" src="https://github.com/user-attachments/assets/a63f781e-7742-4cbe-9d76-c6d1ac66c179" />
<img width="200" height="768" alt="Image" src="https://github.com/user-attachments/assets/0620599e-5a9f-4d24-8f63-70db48118808" />
<img width="200" height="768" alt="Image" src="https://github.com/user-attachments/assets/f2591f6e-a99f-4dd0-9b02-2fa3c0f77ec1" />

---

## Backend (Node.js, Express, PostgreSQL with Drizzle ORM, Zod)

### Project Initialization
1. **Setup project with TypeScript and Node.js**
   - Initialized `tsconfig.json`
   - Installed essential dev dependencies (e.g., ts-node, typescript, nodemon)

2. **Express Server Setup**
   - Configured Express app in `server.ts`
   - Setup CORS and JSON parsing middleware
   - Configured environment variables with `dotenv`

3. **Database Setup**
   - Chose **Neon** as PostgreSQL provider
   - Used **Drizzle ORM** for schema management and migrations
   - Defined models: `users`, `challenges`

4. **Authentication**
   - Setup routes: `/api/auth/signup`, `/api/auth/login`
   - Implemented JWT-based token system
   - Hashed passwords using `bcrypt`
   - Middleware to protect routes by verifying JWT

5. **Challenges API**
   - Routes under `/api/challenges`
   - Endpoints:
     - `POST /create`: Create challenge (protected)
     - `GET /`: List all challenges with pagination support
     - `GET /mine`: Fetch challenges user has joined
     - `POST /join/:id`: Join challenge by ID
     - `DELETE /leave/:id`: Leave challenge by ID

6. **Image Upload**
   - Integrated Cloudinary
   - Backend expects base64 string from frontend
   - Stores returned Cloudinary URL in `image` column

7. **Zod Input Validation**
   - Defined validators for all request payloads in `challengeValidator.ts`
   - Used `safeParse` for error-safe validation in controllers
   - Errors returned in consistent format to frontend

8. **Cron Jobs (Optional)**
   - Setup basic cron job (e.g., for scheduled challenge cleanup)

9. **Security Measures**
   - JWT Auth middleware protects routes
   - Zod ensures all inputs are validated
---

## Mobile App (Expo + React Native + Zustand)

### Project Setup
1. **Initialized Expo project** in `/mobile` folder
   - Set up folder structure using `expo-router`

2. **Navigation**
   - Used `expo-router` with `(auth)` and `(tabs)` layouts
   - Tabs: `Home`, `Active`, and `Create`.

3. **State Management**
   - Zustand store for:
     - `authStore` for JWT and user
     - `challengeStore` to manage challenge state across tabs (joined/left)

4. **Auth Flow**
   - `signup.tsx` and `login.tsx` screens under `(auth)`
   - Calls backend `/api/auth/*` routes
   - Stores token in `AsyncStorage`

5. **Home Screen**
   - Lists all public challenges using FlatList
   - Infinite scroll + pull-to-refresh
   - Join/Leave actions with challengeStore updates

6. **Active Screen**
   - Shows challenges user has joined
   - Real-time sync using challengeStore
   - Leave challenge updates both active and home tabs

7. **Image Upload**
   - Images uploaded from mobile as base64
   - Cloudinary used in backend to save and return image URL

8. **UI Components**
   - Custom `ChallengeCard` with title, description, image, and join/leave buttons
   - Responsive styling and loading indicators

9. **Error Handling + UX**
   - Toast or alert for join/leave feedback
   - Loading spinners on API calls

10. **Validation Feedback**
   - Errors from Zod shown in form screens (e.g. `title is required`)
