# 🤖 AI Resume Builder
 
A full-stack AI-powered resume generator with authentication, built with React, Express, Groq AI, and Supabase.
 
**Live Demo:** [https://ai-resume-builder-m7so.vercel.app](https://ai-resume-builder-m7so.vercel.app)
 
---
 
## ✨ Features
 
- 🔐 **Authentication** — Signup, Login, persistent session via Supabase
- 🤖 **AI Resume Generation** — Powered by LLaMA 3.3 70B via Groq API
- 📋 **Copy to Clipboard** — One-click copy of full resume
- 📥 **Download as .txt** — Download your resume instantly
- 🛡️ **Protected Routes** — Resume page only accessible when logged in
- ⚡ **Rate Limiting** — Prevents API abuse on backend
- 📱 **Responsive UI** — Works on mobile and desktop
---
 
## 🏗️ Project Architecture
 
```
User visits app
      ↓
Supabase Auth (Login / Signup)
      ↓
Resume Form (Protected Page)
      ↓
Express Backend → Groq AI (LLaMA 3.3 70B)
      ↓
Resume Generated (Summary + Experience + Cover Letter)
      ↓
Copy or Download .txt
```
 
---
 
## 📁 Folder Structure
 
```
AI-RESUME-BUILDER/
│
├── public/                     # Static assets
│
├── server/                     # Express backend
│   ├── server.js               # Main server file
│   └── package.json            # Backend dependencies
│
├── src/                        # React frontend
│   ├── pages/
│   │   ├── Login.jsx           # Login page
│   │   ├── Signup.jsx          # Signup page
│   │   └── Resume.jsx          # Main resume builder (protected)
│   ├── supabaseClient.js       # Supabase client setup
│   ├── App.jsx                 # Session manager + router
│   └── main.jsx                # React entry point
│
├── .env                        # Frontend env variables (never commit)
├── .gitignore                  # Git ignore rules
├── index.html                  # HTML entry point
├── package.json                # Frontend dependencies
└── vite.config.js              # Vite configuration
```
 
---
 
## 🛠️ Tech Stack
 
| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React + Vite | UI and routing |
| **Styling** | Tailwind CSS | Design and layout |
| **Auth** | Supabase | Signup, login, session management |
| **Backend** | Express.js | API server |
| **AI Model** | Groq (LLaMA 3.3 70B) | Resume generation |
| **Deployment (FE)** | Vercel | Frontend hosting |
| **Deployment (BE)** | Render | Backend hosting |
 
---
 
## ⚙️ Local Setup
 
### Prerequisites
- Node.js v18+
- npm
- Groq API Key → [console.groq.com](https://console.groq.com)
- Supabase Project → [supabase.com](https://supabase.com)
---
 
### 1. Clone the repository
 
```bash
git clone https://github.com/tfkanhaiya/ai-resume-builder.git
cd ai-resume-builder
```
 
---
 
### 2. Setup Frontend
 
Install dependencies:
```bash
npm install
```
 
Create `.env` in the root folder:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
 
Get these from: **Supabase Dashboard → Settings → API**
 
---
 
### 3. Setup Backend
 
```bash
cd server
npm install
```
 
Create `server/.env`:
```env
GROQ_API_KEY=your_groq_api_key
```
 
Get this from: [console.groq.com/keys](https://console.groq.com/keys)
 
---
 
### 4. Run the app
 
Open **two terminals:**
 
**Terminal 1 — Frontend:**
```bash
npm run dev
```
 
**Terminal 2 — Backend:**
```bash
cd server
node server.js
```
 
Frontend runs on: `http://localhost:5173`
Backend runs on: `http://localhost:5000`
 
---
 
## 🚀 Deployment
 
### Backend → Render
 
| Field | Value |
|---|---|
| Root Directory | `server` |
| Runtime | `Node` |
| Build Command | `npm install` |
| Start Command | `node server.js` |
 
Add environment variable:
```
GROQ_API_KEY = your_groq_api_key
```
 
---
 
### Frontend → Vercel
 
| Field | Value |
|---|---|
| Framework | `Vite` |
| Root Directory | `./` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
 
Add environment variables:
```
VITE_SUPABASE_URL = your_supabase_url
VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
```
 
---
 
### Supabase Auth Configuration
 
After deploying frontend, go to:
**Supabase Dashboard → Authentication → URL Configuration**
 
| Field | Value |
|---|---|
| Site URL | `https://your-app.vercel.app` |
| Redirect URLs | `https://your-app.vercel.app/**` |
 
---
 
## 🔑 Environment Variables
 
| Variable | Location | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Root `.env` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Root `.env` | Supabase anon/public key |
| `GROQ_API_KEY` | `server/.env` | Groq API key for AI model |
 
> ⚠️ **Never commit `.env` files to GitHub**
 
---
 
## 📡 API Reference
 
### `POST /generate`
 
Generates a professional resume using AI.
 
**Request body:**
```json
{
  "name": "John Doe",
  "role": "Senior Full-Stack Engineer",
  "skills": "React, Node.js, Python, AWS",
  "experience": "Senior Developer at Tech Corp (2020-2024)"
}
```
 
**Response:**
```json
{
  "result": {
    "summary": "Professional summary text...",
    "experience": [
      "Worked as Senior Developer at Tech Corp...",
      "Led a team of 5 engineers...",
      "..."
    ],
    "coverLetter": "Cover letter text..."
  }
}
```
 
### `GET /health`
 
Health check endpoint.
 
```json
{
  "status": "ok",
  "message": "Server healthy",
  "model": "llama-3.3-70b-versatile",
  "time": "2024-01-01T00:00:00.000Z"
}
```
 
---
 
## 🔮 Future Enhancements
 
- [ ] **Save Resumes** — Store generated resumes in Supabase database per user
- [ ] **Resume History** — Let users view and reload past generated resumes
- [ ] **PDF Download** — Download a beautifully styled PDF instead of plain `.txt`
- [ ] **Multiple Templates** — Choose from different resume layouts and styles
- [ ] **Google OAuth** — Sign in with Google via Supabase
- [ ] **Skills Suggestions** — AI-powered skill recommendations based on role
- [ ] **ATS Score** — Check how well your resume performs against ATS systems
- [ ] **LinkedIn Import** — Auto-fill form by importing LinkedIn profile data
- [ ] **Dark/Light Mode** — Toggle between themes
- [ ] **Multi-language Support** — Generate resumes in different languages
---
 
## 📄 License
 
MIT License — feel free to use, modify, and distribute.
 
---
 
## 🙋 Author
 
Built by [tfkanhaiya](https://github.com/tfkanhaiya)
