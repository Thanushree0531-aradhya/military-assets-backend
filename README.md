# Military Assets Management System - Backend

## Description
This is the backend for the Military Asset Management System.  
It handles management of bases, assets, purchases, transfers, assignments/expenditures, and user authentication.  
Role-based access is implemented for **Admin**, **Logistics Officer**, and other roles.


## Folder Structure

backend/
│
├── App.js # Main entry point of the backend
├── package.json # Node.js dependencies and scripts
├── package-lock.json
├── .env # Environment variables
├── README.md # Project documentation
├── db.js # Database connection setup
├── routes/ # API route handlers
│ ├── authRoutes.js # Authentication routes
│ ├── purchaseRoutes.js # Purchases routes
│ ├── transferRoutes.js # Transfers routes
│ ├── assignmentRoutes.js # Assignments/Expenditures routes
│ └── baseRoutes.js # Bases management routes
├── controllers/ # Controllers for handling logic
│ ├── authController.js
│ ├── purchaseController.js
│ ├── transferController.js
│ ├── assignmentController.js
│ └── baseController.js
├── middleware/ # Middleware functions
│ └── authMiddleware.js # Authentication & Authorization
├── models/ # Database models (if using ORM)
│ └── user.js
└── utils/ # Utility/helper functions
└── helpers.js


---

## Technology Stack

- **Language:** JavaScript (Node.js)  
- **Framework:** Express.js  
- **Database:** PostgreSQL  
- **Authentication:** JWT (JSON Web Tokens)  
- **Other Dependencies:** Axios, dotenv, bcrypt, cors, pg  




##
API Endpoints
Authentication

POST /auth/signup → Register a new user

POST /auth/login → Login and receive JWT token

Bases

GET /bases → Get all bases

POST /bases → Add a new base (Admin only)

Purchases

GET /purchases → Get all purchases

POST /purchases → Add a purchase (Admin/Logistics Officer)

Transfers

GET /transfers → Get all transfers

POST /transfers → Record a transfer (Logistics Officer)

Assignments / Expenditures

GET /assignments → Get all assignments/expenditures

POST /assignments → Record an assignment/expenditure



