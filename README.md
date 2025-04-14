# 🛒 E-Commerce Backend API

This is a fully functional and modular backend API for an E-Commerce platform, built using **Node.js**, **Express.js**, and **MongoDB**. It includes essential features like secure user authentication, OTP-based email verification, password reset, and password change mechanisms.

---

## 🚀 Features

### 🧑‍💻 User Authentication & Security
- ✅ User registration with OTP email verification
- 🔁 Resend verification OTP (expires in 5 minutes)
- 🔐 Secure login with hashed passwords
- 🔄 Password reset via OTP (email-based flow)
- 🔒 Change password using current password (for authenticated users)

### 📧 Email Functionality
- ✉️ OTP delivery using Nodemailer via Gmail SMTP
- 🕐 OTP expires automatically after 5 minutes (secure time-based flow)

### 🛍️ Core eCommerce Features
- 🧾 Product management (add, update, delete)
- 🗂️ Category & subcategory management
- 🧢 Brand and variant support
- 🛒 Cart and checkout logic
- 📦 Order placement and tracking
- 👤 Admin APIs for dashboard management
- 📤 Product image upload via Cloudinary

### ⚙️ Project Structure & Tech
- 🧱 Modular and layered folder structure
- 🌐 RESTful API design with clean routes
- ✅ Custom middleware for validation, auth, and error handling
- 🔐 Role-based access (admin, user)
- 📦 MongoDB with Mongoose ORM
- 🧪 Ready for integration with frontend (Flutter/Reactjs/Nextjs)
---

## 📁 Project Structure

---

## 🧪 API Endpoints

### 🔐 Authentication & User

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register a new user |
| POST | `/login` | Login with email and password |
| POST | `/email/verify-otp` | Verify registration OTP |
| POST | `/email/resend/verify-otp` | Resend verification OTP |
| POST | `/password/reset/send-otp` | Send password reset OTP |
| POST | `/password/reset/verify-otp` | Reset password using OTP |
| POST | `/password/change/:id` | Change password with old password |
| GET  | `/auth/me` | Get logged-in user profile |
| PUT  | `/auth/update/:id` | Update user profile |
| DELETE | `/auth/delete/:id` | Delete user account |

### 🛍️ Product

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/product/add` | Add a new product |
| GET | `/product/all` | Get all products |
| GET | `/product/:id` | Get product by ID |
| PUT | `/product/update/:id` | Update product by ID |
| DELETE | `/product/delete/:id` | Delete product by ID |

### 🗂️ Category & Subcategory

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/category/add` | Add a new category |
| GET | `/category/all` | Get all categories |
| POST | `/subcategory/add` | Add a new subcategory |
| GET | `/subcategory/all` | Get all subcategories |
| GET | `/subcategory/by-category/:id` | Get subcategories by category ID |

### 👕 Brand & Variant

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/brand/add` | Add a new brand |
| GET | `/brand/all` | Get all brands |
| POST | `/variant/add` | Add a new variant |
| GET | `/variant/all` | Get all variants |

### 🛒 Cart

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/cart/add` | Add item to cart |
| GET | `/cart/user/:userId` | Get cart items for a user |
| PUT | `/cart/update/:itemId` | Update cart item quantity |
| DELETE | `/cart/remove/:itemId` | Remove item from cart |
| DELETE | `/cart/clear/:userId` | Clear all cart items for a user |

### 📦 Order

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/order/create` | Create a new order |
| GET | `/order/user/:userId` | Get user’s orders |
| GET | `/order/:id` | Get single order by ID |
| PUT | `/order/update-status/:id` | Update order status |
| DELETE | `/order/cancel/:id` | Cancel an order |

### ⚙️ Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stats` | Get dashboard stats |
| GET | `/admin/users` | Get all users |
| PUT | `/admin/user/block/:id` | Block a user |
| PUT | `/admin/user/unblock/:id` | Unblock a user |

### ☁️ Image Upload (Cloudinary)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload/image` | Upload image to Cloudinary |
| DELETE | `/upload/delete/:publicId` | Delete image from Cloudinary |

---

## ⚙️ Setup Instructions

### 1. Clone the Repository


### 2. Install Dependencies

```bash 
npm install
```


### 3. Create .env File

```bash
PORT=5000
MONGODB_URI=your_mongo_connection
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
JWT_SECRET=your_jwt_secret

```
Use Gmail App Password for EMAIL_PASS if using Gmail.

### 4. Start the Server
```bash
npm run dev
```

The API will be running at: http://localhost:5000

---