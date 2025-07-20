# Techit

## Project Description
TechIt is a full-stack technology store application built with modern technologies. The application allows customers to browse technology products, add to favorites and shopping cart, and enables administrators to manage the entire system.

## Technologies Used
Frontend (React)

React 18 with TypeScript
Redux Toolkit for state management
React Router for navigation
Bootstrap 5 + Custom CSS
Formik + Yup for forms and validation
Axios for server communication
React Toastify for notifications
Font Awesome for icons

Backend (Node.js)

Node.js with Express.js
MongoDB with Mongoose ODM
JWT for user authentication
bcrypt for password encryption
Joi for validation
express-rate-limit for attack prevention
Morgan for logging
CORS for Cross-Origin support

📁 Project Structure
techit/
├── techit-client/          # Frontend React Application
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── interfaces/    # TypeScript definitions
│   │   ├── services/      # API services
│   │   ├── store/         # Redux store and state
│   │   ├── styles/        # Custom styles
│   │   ├── utils/         # Utility functions
│   │   └── hooks/         # Custom React hooks
│   └── package.json
├── techit-server/         # Backend Node.js Application
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middlewares/      # Middleware functions
│   ├── .env             # Environment variables
│   └── package.json
└── README.md
🎯 Core Functionality
👤 Users

Registration and Login with secure authentication
Personal Profile with editing capabilities
Auto Logout after 4 hours of inactivity
Advanced Permissions (regular user/admin)

🛍️ Shopping

Product Browsing with search and filtering
Detailed Product Pages with images and descriptions
Shopping Cart with quantity management
Favorites for saving interesting products
Product Availability System

⚙️ Management (Admins Only)

Product Management - add, edit, delete
User Management - view, change permissions, delete
Favorites Statistics - reports and analytics

🔒 Security

Rate Limiting for attack prevention
JWT Tokens for authentication
Password Encryption with bcrypt
Comprehensive Data Validation

📋 System Requirements
Software Requirements

Node.js version 16 and above
MongoDB version 4.4 and above
npm or yarn

Browser Support

Chrome 90+
Firefox 88+
Safari 14+
Edge 90+

### Installation and Setup
1. Clone the Project
bashgit clone https://github.com/dorin-gim/techit
cd techit

2. Install Dependencies - Backend
bashcd techit-server
npm install

3. Configure Environment Variables
Create a .env file in the techit-server directory:
envNODE_ENV=development
PORT=8000
DB=mongodb://localhost:27017/techit-1801
JWTKEY="secret"

4. Run the Server
bash# Development mode with nodemon
npm run dev


# Production mode
npm start
Server will run on: http://localhost:8001
5. Install Dependencies - Frontend
bashcd ../techit-client
npm install
6. Configure Environment Variables - Client
Create a .env file in the techit-client directory:
envREACT_APP_API=http://localhost:8001/api
7. Run the Application
bashnpm start
Application will run on: http://localhost:3000

🔌 API Documentation
Authentication Endpoints
POST /api/users/register     # Register new user
POST /api/users/login        # User login
GET  /api/users/profile      # User profile
Products Endpoints
GET    /api/products         # Get all products
GET    /api/products/:id     # Get specific product
POST   /api/products         # Add product (admin)
PUT    /api/products/:id     # Update product (admin)
DELETE /api/products/:id     # Delete product (admin)
Cart Endpoints
GET    /api/carts           # Get shopping cart
PATCH  /api/carts           # Add product to cart
PUT    /api/carts/:productId # Update quantity
DELETE /api/carts/:productId # Remove product from cart
DELETE /api/carts           # Clear cart
Favorites Endpoints
GET    /api/favorites       # Get favorites
POST   /api/favorites       # Add to favorites
DELETE /api/favorites/:id   # Remove from favorites
GET    /api/favorites/stats # Statistics (admin)

👥 User Types
🟢 Regular User

Browse products and search
Add to shopping cart and favorites
View and edit personal profile
Manage personal shopping cart

🔴 System Administrator
All regular user functions plus:

Add, edit, and delete products
Manage users and change permissions
View favorites statistics
Access to advanced admin panel

📱 Device Support
The application is fully responsive for different devices:

Desktop - Full experience with all features
Tablet - Optimized for tablets with convenient navigation
Mobile - Interface adapted for smartphones

🌐 Language and Accessibility Support

Hebrew as primary language (RTL Support)
Full Accessibility with screen reader support
Complete Keyboard Navigation
High Contrast for users with visual impairments

🔐 Security and Performance
Security Measures

Password encryption with bcrypt
JWT tokens with expiration
Rate limiting for attack prevention
Strict validation of all data
Properly configured CORS

Performance

Lazy loading for components
API request caching
Automatic image compression
Bundle optimization

🧪 Testing
bash# Run Frontend tests
cd techit-client
npm test

# Run Backend tests
cd techit-server
npm test
🚀 Production Deployment
Frontend (Netlify/Vercel)
bashcd techit-client
npm run build
# Upload the build/ directory to deployment service
Backend (Heroku/DigitalOcean)
bashcd techit-server
# Set environment variables in deployment service
# Upload code to server
🤝 Contributing to the Project

Fork the project
Create a new branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request


📞 Contact
Developer Details:

👤 Name: Dorin Gimpel Gal
📧 Email: doringim1@gmail.com
🔗 GitHub: https://github.com/dorin-gim

