<p align="center">
  <img src="https://img.shields.io/badge/MERN-Full_Stack-0d9488?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/React_19-Vite_8-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Razorpay-Payments-0C2451?style=for-the-badge&logo=razorpay&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-Real_Time-010101?style=for-the-badge&logo=socketdotio&logoColor=white" />
</p>

<h1 align="center">🏡 RoamHaven</h1>

<p align="center">
  <strong>A full-stack vacation rental platform for discovering, booking, and managing unique stays — built with the MERN stack.</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-live-demo">Live Demo</a>
</p>

---

## 📋 Overview

**RoamHaven** is a production-ready, full-stack vacation rental platform where guests can discover and book unique stays, hosts can list and manage their properties, and admins can oversee the entire ecosystem. The platform features real-time messaging, integrated payments, email notifications, and a modern, responsive UI.

---

## ✨ Features

### 🧑‍💻 Guest Features
- **Browse & Search** — Explore listings with location details, ratings, photo galleries, and interactive maps
- **Smart Booking System** — Select dates, choose guest count, and submit booking requests with server-side price validation
- **Razorpay Payments** — Secure online payments with signature verification for confirmed bookings
- **Favourites** — Save and manage favorite stays for future trips
- **Reviews & Ratings** — Leave ratings and written reviews for properties after your stay
- **Real-time Chat** — Message hosts directly about listings via Socket.io live chat
- **Booking Management** — Track booking status (pending → approved → paid) and cancel bookings
- **Email Notifications** — Receive email confirmations for booking approvals, rejections, and payments

### 🏠 Host Features
- **Property Management** — Add, edit, and delete listings with multi-photo uploads via Cloudinary
- **Interactive Map Pins** — Set property coordinates for Leaflet map display
- **Booking Approvals** — Review and approve/reject guest booking requests with date-conflict detection
- **Host Dashboard** — Analytics overview with total listings, average price, ratings, revenue, and location breakdown
- **Revenue Tracking** — Monitor income from confirmed bookings
- **Live Messaging** — Respond to guest inquiries in real-time

### 🔐 Admin Features
- **Admin Dashboard** — Platform-wide statistics (users, homes, bookings, total revenue)
- **User Management** — View and monitor all registered users
- **Listing Oversight** — Browse all property listings across the platform
- **Booking Overview** — Monitor all bookings system-wide

### 🔧 Platform Features
- **Firebase Authentication** — Email/password signup & login with session persistence
- **Forgot Password** — Firebase-powered password reset flow
- **Role-Based Access** — Three distinct user roles (Guest, Host, Admin) with protected routes
- **Responsive Design** — Mobile-first UI built with Tailwind CSS v4
- **Real-time Notifications** — Global toast alerts for incoming messages via Socket.io
- **SEO Optimized** — Meta tags, semantic HTML, and proper heading hierarchy

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI library with hooks and context API |
| **Vite 8** | Lightning-fast build tool and dev server |
| **Tailwind CSS v4** | Utility-first CSS framework |
| **React Router v7** | Client-side routing with protected routes |
| **Firebase SDK** | Client-side authentication |
| **Axios** | HTTP client with token interceptor |
| **Socket.io Client** | Real-time bidirectional communication |
| **Leaflet / React-Leaflet** | Interactive maps for property locations |
| **React DatePicker** | Date selection for bookings |
| **React Hot Toast** | Elegant toast notifications |
| **date-fns** | Date utility functions |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web framework and REST API |
| **MongoDB + Mongoose** | Database and ODM |
| **Firebase Admin SDK** | Server-side token verification |
| **Socket.io** | Real-time messaging engine |
| **Cloudinary + Multer** | Image upload and cloud storage |
| **Razorpay** | Payment gateway integration |
| **Nodemailer** | Transactional email notifications |
| **bcryptjs** | Password hashing |
| **jsonwebtoken** | JWT token utilities |
| **express-validator** | Request validation middleware |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React + Vite)                   │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────────┐  │
│  │  Pages   │  │Components│  │  Context   │  │  API (Axios)  │  │
│  │  (20)    │  │  (5)     │  │Auth+Socket │  │Token Intercept│  │
│  └──────────┘  └──────────┘  └───────────┘  └───────┬───────┘  │
└──────────────────────────────────────────────────────┼──────────┘
                                                       │
                    Firebase Auth (ID Token)            │
                         ┌─────────┐                   │
                         │Firebase │◄──────────────────┘
                         │  Auth   │     REST API + WebSocket
                         └────┬────┘           │
                              │                │
┌─────────────────────────────┼────────────────┼──────────────────┐
│                     SERVER (Express + Node)   │                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────────┐  │
│  │  Routes  │  │Controllers│ │ Middleware │  │  Socket.io    │  │
│  │  (8)     │  │  (8)     │  │Auth+Admin │  │  (Live Chat)  │  │
│  └──────────┘  └──────────┘  └───────────┘  └───────────────┘  │
│        │              │             │                            │
│  ┌─────┴──────────────┴─────────────┴──────────────────────┐    │
│  │                    Services Layer                        │    │
│  │  Cloudinary │ Razorpay │ Nodemailer │ Firebase Admin     │    │
│  └──────────────────────┬──────────────────────────────────┘    │
└─────────────────────────┼───────────────────────────────────────┘
                          │
                    ┌─────┴─────┐
                    │  MongoDB  │
                    │  Atlas    │
                    └───────────┘
```

---

## 🔄 Booking Status Workflow

```
Guest sends request        Host reviews
      │                        │
      ▼                        ▼
  ┌────────┐    ┌──────────────────────────┐    ┌────────────────┐
  │Pending │───▶│ Approved (Pending Payment)│───▶│ Paid & Confirmed│
  └────────┘    └──────────────────────────┘    └────────────────┘
      │                        │
      ▼                        ▼
  ┌──────────┐          ┌──────────┐
  │Cancelled │          │ Rejected │
  └──────────┘          └──────────┘
```

---

## 🌐 Live Demo

🔗 **Live App**: [roam-haven-drab.vercel.app](https://roam-haven-drab.vercel.app/)

---

## 📄 License

© 2026 RoamHaven. All rights reserved. This project and its source code are proprietary. Unauthorized copying, modification, or distribution is strictly prohibited.

---

<p align="center">
  Built with ❤️ using the MERN Stack
</p>

