# SkillSwap - Peer-to-Peer Skill Exchange Platform

SkillSwap is a modern, responsive full-stack web application designed for users to exchange skills instead of money. It features intelligent matchmaking, REST API architecture, JWT authentication, scheduling calendars, real-time messaging, reviews, and a robust admin dashboard.

This project is fully designed and optimized to be suitable as a college major project.

---

## Technical Stack
* **Frontend**: React (Vite, Single-Page Application, HTML5, custom CSS design system, Lucide Icons)
* **Backend**: Java Spring Boot 3.x (Spring Web, Spring Data JPA, Spring Security, JWT Authentication)
* **Databases**:
  * **H2 (In-Memory)**: Default profile for immediate out-of-the-box demonstration and testing.
  * **MySQL**: Primary production database with full relational schema support.

---

## Project Structure
```
skillswap/
├── database/
│   ├── schema.sql           # MySQL Database Schema definitions
│   └── data.sql             # MySQL Seed Data for testing
├── backend/
│   ├── pom.xml              # Maven dependencies
│   ├── mvnw / mvnw.cmd      # Maven Wrapper (executes Maven without global install)
│   └── src/main/
│       ├── java/com/skillswap/   # Spring Boot Source Code
│       └── resources/
│           ├── application.properties       # Main config (sets profiles)
│           ├── application-h2.properties    # H2 DB config
│           ├── application-mysql.properties # MySQL DB config
│           ├── schema-h2.sql                # H2 DB Table definitions
│           └── data-h2.sql                  # H2 Seed Data
└── frontend/
    ├── package.json         # React dependencies
    ├── vite.config.js       # Vite configuration with proxy settings
    ├── index.html           # Main template
    └── src/                 # React Source Code
```

---

## Quick Start (Running the Application)

### 1. Run the Spring Boot Backend

The backend uses a Maven Wrapper script that automatically downloads and installs Maven locally inside the project. You do not need to install Maven globally!

Navigate to the `backend/` directory and run:

**On Windows (PowerShell/CMD):**
```bash
cd backend
.\mvnw.cmd spring-boot:run
```

**On macOS/Linux:**
```bash
cd backend
chmod +x mvnw
./mvnw spring-boot:run
```

By default, the backend starts in the **H2 profile** on `http://localhost:8080` and initializes an in-memory database with pre-configured seed data.
* You can access the H2 console at: `http://localhost:8080/h2-console`
  * **JDBC URL**: `jdbc:h2:mem:skillswapdb`
  * **Username**: `sa`
  * **Password**: `password`

#### Switching to MySQL:
1. Make sure MySQL is running on `localhost:3306` and credentials match those in `backend/src/main/resources/application-mysql.properties`.
2. Edit `backend/src/main/resources/application.properties` and change:
   ```properties
   spring.profiles.active=mysql
   ```
3. Run `.\mvnw.cmd spring-boot:run` again.

---

### 2. Run the React Frontend

The React frontend has a built-in high-fidelity **Mock Database Fallback**. 
* If the Spring Boot backend is **not running**, the frontend automatically runs in mock mode using `localStorage`!
* This allows you to demo and interact with all application screens (Profile editing, Search, Connecting, Scheduling, Chatting, and Admin Hub) immediately without even launching the backend!
* If the Spring Boot backend is **running**, the frontend automatically connects to the Spring Boot REST API.

Navigate to the `frontend/` directory, install dependencies, and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`. Open this URL in your web browser.

---

## Pre-configured Demo Accounts
Use these credentials to log in (for both mock and live mode):

### 1. User Account (Alex Johnson)
* **Email**: `alex@gmail.com`
* **Password**: `password`
* *Interests*: Teaches React/Python. Wants to learn Spanish/Guitar.

### 2. User Account (Sofia Martinez)
* **Email**: `sofia@gmail.com`
* **Password**: `password`
* *Interests*: Teaches Spanish/UI Design/Baking. Wants to learn React.

### 3. Administrator Account
* **Email**: `admin@skillswap.com`
* **Password**: `password`

---

## Core Features Implemented

1. **Intelligent Matchmaking**: Computes a compatibility percentage (0-100%) based on offered skills matching wanted skills, common categories, average ratings, and completed exchange counts.
2. **REST API Architecture**: Standard endpoints under `/api/auth`, `/api/users`, `/api/requests`, `/api/sessions`, `/api/chat`, and `/api/admin`.
3. **JWT Authentication**: Secured request headers with role-based access control checking `USER` and `ADMIN` authority levels.
4. **Dynamic Styling**: Clean, modern glassmorphism design with rounded cards, custom inputs, notification alerts, and full dark-mode support.
5. **Interactive Scheduling**: Create time slots, choose online/offline meeting modes, join meeting rooms, complete sessions, and submit reviews.
6. **Chat Room**: Contact list showing matching peers, message history, read receipts, emoji support, and file-sharing attachments.
7. **Admin Hub**: Real-time stats analytics dashboard showing platform metrics, popular skills bar charts, category distribution percentages, and user moderation.
