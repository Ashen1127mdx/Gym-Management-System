# FitZone Gym Management System

A dynamic, role-based web application developed using **React (TypeScript)** for the front-end and **Object-Oriented PHP** with a **MySQL** database for the back-end.

This system replaces manual gym processes with automated digital workflows for membership registration, billing, class scheduling, attendance tracking, pre-orders/bookings, and complaint resolution.

---

## 📂 Project Structure

```bash
fitzone---gym-management-system/
├── frontend/             # React (Vite + TypeScript + Tailwind)
│   ├── src/
│   │   ├── components/   # UI Components (Sidebar, Modals, etc.)
│   │   ├── context/      # GymContext handling state and REST API queries
│   │   ├── views/        # Dashboards and Views
│   │   └── types.ts      # TypeScript interfaces
│   └── package.json
│
└── backend/              # PHP REST API Backend
    ├── config/           # Database configuration
    ├── database/         # MySQL schema and seeder script
    ├── models/           # OOP models (inheritance & encapsulation)
    └── api/              # JSON endpoint controllers
```

---

## 🛠️ Installation & Setup

### 1. Database Setup (MySQL)
1. Start your local database engine (e.g., using **XAMPP / phpMyAdmin** or standalone MySQL).
2. Open phpMyAdmin or your MySQL client and run the SQL script found in `backend/database/fitzone_db.sql` to create the database schema and insert initial seeding records.

### 2. Backend Setup (PHP REST API)
You can run the PHP REST API using XAMPP or the PHP built-in server:
* **Option A (PHP Built-in Server)**:
  Navigate to the `backend/` directory in terminal and run:
  ```bash
  php -S localhost:8000
  ```
  *(The React application is pre-configured to query `http://localhost:8000`)*.
* **Option B (XAMPP / WampServer)**:
  Copy/move the `backend/` directory into your `htdocs` or public directory (e.g., `C:/xampp/htdocs/backend/`). Ensure the server is running on port `80` or update the `API_BASE` variable in `frontend/src/context/GymContext.tsx` if using a custom port.

### 3. Frontend Setup (React)
1. Open a terminal inside the `frontend/` directory.
2. Install the necessary packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the application in your browser at `http://localhost:3000`.

---

## 🔐 Credentials for Demo Access

Use the following login credentials to access different roles within the gym portal:

* **Super Admin**:
  * **Email**: `admin@fitzone.com`
  * **Password**: `Admin@123` (Simply click "Fill Credentials" on the login screen to autofill)

