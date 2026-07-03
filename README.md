# PrepPilot — GenAI-Powered Interview Preparation & Career Pipeline

PrepPilot is a modern, full-stack application designed to help job seekers prepare for interviews through AI-powered simulations, resume generation, and job suggestions. Built with a powerful Node.js backend and a sleek React frontend, it streamlines the entire career pipeline from preparation to application.

##  Features

-   **AI Interview Coach**: Dynamic interview simulations powered by Google Gemini AI.
-   **Automated Resume Generation**: Create professional, ATS-friendly resumes in PDF format using Puppeteer.
-   **Interview Intelligence**: Real-time feedback and evaluation on interview performance.
-   **Job Suggestions**: Tailored job recommendations based on skills and interview results.
-   **Premium Dashboard**: A minimalist, high-performance UI built with Framer Motion and Google Sans Code.
-   **State Management & Caching**: Robust session handling and rate limiting with Redis.

---

##  Tech Stack

### Frontend
-   **Framework**: NextJs
-   **Styling**: SCSS, Framer Motion (Animations)
-   **Icons**: Lucide React
-   **Navigation**: React Router

### Backend
-   **Server**: Node.js, Express.js
-   **AI Engine**: Google Generative AI (Gemini)
-   **Database**: MongoDB (Mongoose)
-   **Caching**: Redis
-   **PDF Engine**: Puppeteer (Headless Chrome)
-   **Validation**: Zod (Schema validation)

---

##  Project Structure

```text
├── Backend/          # Node.js + Express + Gemini AI Integration
│   ├── src/          # Application source code
│   ├── server.js     # Entry point
│   └── package.json  # Backend dependencies
├── Frontend/         # React + Vite + Framer Motion
│   ├── src/          # React components and logic
│   ├── index.html    # Frontend entry point
│   └── package.json  # Frontend dependencies
└── README.md         # Project documentation (this file)
```

---

##  Getting Started

### Prerequisites

-   Node.js (v18+)
-   MongoDB (Running instance or URI)
-   Redis (Running instance)
-   Google Gemini API Key

---

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/rajithakollapudi/PrepPilot.git
    cd PrepPilot
    ```

2.  **Setup the Backend**:
    ```bash
    cd Backend
    npm install
    # Create .env file with:
    # PORT=5000
    # MONGO_URI=your_mongodb_uri
    # GEMINI_API_KEY=your_api_key
    # REDIS_URL=your_redis_url
    npm run dev
    ```

3.  **Setup the Frontend**:
    ```bash
    cd ../Frontend
    npm install
    npm run dev
    ```

---

##  License

This project is licensed under the **ISC License**.



