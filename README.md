# 🚀 ReqGit

> A Version Control and Team Collaboration Platform for Software Requirements Specification (SRS) Documents.

ReqGit is a web-based platform that helps software development teams manage, version, and collaborate on Software Requirements Specification (SRS) documents. Instead of overwriting files, ReqGit maintains a complete version history, making it easy to track changes, restore previous versions, and collaborate securely within project workspaces.

---

## 📖 Overview

During the Software Development Life Cycle (SDLC), SRS documents are updated frequently. Traditional file-sharing methods such as email or cloud storage often create problems like:

- Confusion over the latest version
- Loss of previous document versions
- Poor collaboration
- No role-based access control
- Difficulty tracking document changes

ReqGit solves these problems by providing a Git-inspired version control system specifically designed for SRS document management.

---

## ✨ Features

### 🔐 Authentication

- Secure User Registration
- User Login
- Forgot Password Interface
- Input Validation
- Password Encryption

---

### 🏢 Workspace Management

- Create multiple workspaces/projects
- Invite team members
- Manage project teams
- Real-time workspace overview

---

### 👥 Role-Based Access Control (RBAC)

Assign different permissions to team members:

- 👑 Admin
- ✏️ Editor
- 👀 Viewer

Admins can:

- Invite users
- Remove users
- Assign roles
- Manage workspace permissions

---

### 📂 Document Repository

Upload and organize SRS documents in one place.

Supported file types:

- PDF
- DOCX
- Markdown (.md)

Features include:

- Drag & Drop Upload
- File Metadata
- Upload History
- Status Tracking

---

### 📜 Version Control System

The core feature of ReqGit.

Every document update creates a new version instead of replacing the old file.

Track:

- Version Number
- Commit Message
- Upload Date
- Author
- Change History

Users can restore previous versions whenever needed.

---

### 📊 Dashboard

A personalized dashboard provides:

- Recent activities
- Assigned workspaces
- Team updates
- Quick navigation

---

## 🛠 Tech Stack

### Frontend

- React.js
- React Router DOM
- Tailwind CSS

### Backend

- Core PHP (OOP)
- REST API
- PDO

### Database

- MySQL

---

## 🏗 System Architecture

```
                React Frontend
                       │
                       │ REST API
                       ▼
                PHP Backend
                       │
                       ▼
                 MySQL Database
```

---

## 📂 Project Structure

```
ReqGit
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── layouts/
│   └── assets/
│
├── backend/
│   ├── api/
│   ├── controllers/
│   ├── models/
│   ├── config/
│   └── middleware/
│
├── database/
│
└── README.md
```

---

## 🗄 Database Design

Main database tables:

| Table | Description |
|--------|-------------|
| Users | Stores user accounts |
| Workspaces | Project workspaces |
| Workspace Members | User roles inside workspaces |
| Documents | Uploaded document metadata |
| Document Versions | Stores complete version history |

---

## 🔄 Workflow

1. Register/Login
2. Create Workspace
3. Invite Team Members
4. Assign Roles
5. Upload SRS Documents
6. Create New Document Versions
7. View Version Timeline
8. Restore Previous Versions

---

## 🔒 Security Features

- Password Hashing
- SQL Injection Protection
- Prepared Statements
- Role-Based Authorization
- Secure REST APIs

---

## 📱 Responsive Design

The application is fully responsive and works on:

- Desktop
- Laptop
- Tablet
- Mobile

---

## 🧪 Testing

The project has been tested for:

- UI/UX Testing
- Functional Testing
- Authentication Testing
- Workspace Management Testing
- File Upload Testing
- Version Control Testing
- Database Integrity Testing
- Responsive Design Testing

---

## 💡 Use Cases

- Software Engineering Teams
- Students
- QA Teams
- Business Analysts
- Project Managers
- Software Houses
- Freelance Development Teams

---

## 🚀 Future Improvements

- GitHub Integration
- Microsoft Azure DevOps Integration
- Document Comparison
- Inline Comments
- Real-time Collaboration
- Email Notifications
- Activity Logs
- Search & Filter
- Document Approval Workflow
- AI-powered Change Summary

---

## ⚡ Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/ReqGit.git
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

Move the backend folder to your local PHP server (XAMPP/WAMP/Laragon).

Configure your database in:

```
config/database.php
```

Start Apache & MySQL and access the project from your browser.

---

## 🎯 Why ReqGit?

- Eliminates document confusion
- Preserves complete document history
- Improves team collaboration
- Secure workspace management
- Git-inspired version tracking for SRS documents
- Easy-to-use modern interface

---

## 👨‍💻 Authors

- **Muhammad Zain Tariq**
- **Abdullah Saleem**

---

## 📄 License

This project is licensed under the MIT License.

---

## ⭐ Support

If you found this project useful, please consider giving it a ⭐ on GitHub.

Your support helps the project grow and motivates future improvements.
