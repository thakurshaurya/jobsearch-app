# Jobsearch App

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A sleek, modern **Job Application Tracker** built with **Next.js 13**, **React**, **TypeScript**, and **Tailwind‑CSS** that helps you monitor your job hunt, see resume match scores, and bridge skill gaps.

---

## 📚 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [Environment Variables](#-environment-variables)
- [API Routes](#-api-routes)
- [Folder Structure](#-folder-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- **Dynamic dashboard**: Card & table view with animated transitions.
- **Resume scoring**: Real‑time match percentages and skill‑gap analysis.
- **Filter & sort**: Search by title, company, location; sort by recent, score, etc.
- **Status workflow**: Track status (`applied`, `interviewing`, `accepted`, `rejected`).
- **Responsive & premium UI**: Dark mode, glass‑morphism cards, micro‑animations.
- **Zero‑config API**: Built‑in Next.js API routes for CRUD operations.
- **Progressive loading**: Skeleton loaders while fetching data.

---

## 🎨 Demo

> *You can run the app locally (see Installation) and open <http://localhost:3000> to explore the UI.*

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 13 (app router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS (custom design system) |
| **Icons** | Lucide React |
| **Animations** | Framer Motion |
| **UI Components** | Custom React components |
| **API** | Next.js API routes (REST) |
| **Deployment** | Vercel (or any Node host) |

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/thakurshaurya/jobsearch-app.git
cd jobsearch-app

# Install dependencies
npm install

# Run the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 🚀 Usage

1. **Add your resume** – Visit `/upload` to upload or reset your resume.
2. **Search jobs** – Use the *Find More Jobs* button that leads to the curated job list.
3. **Track applications** – Add, edit status, or delete entries directly from the dashboard.
4. **Filter & sort** – Use the search bar, status chips, and sort dropdown.
5. **View modes** – Switch between *Card* (visual) and *Table* (compact) view.

---

## 🔑 Environment Variables

Create a `.env.local` file at the project root with any required variables (e.g., database connection strings). The current version uses the built‑in file‑based API, so no additional env vars are mandatory.

---

## 📡 API Routes

- `GET /api/applications` – Fetch all applications.
- `POST /api/applications` – Create a new application.
- `PATCH /api/applications` – Update an existing application's status.
- `DELETE /api/applications?id=...` – Remove an application.

All routes return JSON with `{ success: boolean, data?: ..., error?: string }`.

---

## 📂 Folder Structure

```
jobsearch-app/
├─ app/                 # Next.js app router pages
│   ├─ applications/    # Main dashboard page (page.tsx)
│   ├─ api/            # API route handlers
│   └─ ...
├─ public/              # Static assets (icons, images)
├─ src/                 # Re‑usable UI components & hooks (if any)
├─ lib/                 # Helper utilities (e.g., devicons)
├─ styles/              # Tailwind config & globals
├─ README.md            # <‑‑ you are reading this file
└─ package.json
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feat/awesome-feature`).
3. Commit your changes with clear messages.
4. Push the branch and open a Pull Request.
5. Ensure linting and TypeScript checks pass (`npm run lint && npm run build`).

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

*Made with ❤️ by **Shaurya Thakur** – happy job hunting!*
