# 🃏 Bluff Arena

The ultimate multiplayer bluffing card game — built with the **MERN stack** and **Socket.io** for real-time gameplay.

---

## 📁 Project Structure

```
bluff-arena/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   └── Home.jsx
│   │   ├── App.jsx
│   │   ├── socket.js
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/          # Express + Socket.io backend
│   ├── config/
│   │   └── db.js
│   ├── routes/
│   │   └── health.js
│   ├── index.js
│   ├── .env
│   └── package.json
└── README.md
```

---

## ⚙️ Prerequisites

- **Node.js** v18+ and **npm**
- **MongoDB** running locally (default: `mongodb://127.0.0.1:27017/bluff-arena`)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/madhumithadasarathy/bluff_arena.git
cd bluff-arena
```

### 2. Install dependencies

**Server:**

```bash
cd server
npm install
```

**Client:**

```bash
cd client
npm install
```

### 3. Configure environment variables

Create / edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/bluff-arena
CLIENT_URL=http://localhost:5173
```

### 4. Run the server

```bash
cd server
npm run dev        # uses nodemon for hot-reload
# or
npm start          # production mode
```

The server will start on **http://localhost:5000**.  
Health check → **http://localhost:5000/api/health**

### 5. Run the client

```bash
cd client
npm run dev
```

The client will start on **http://localhost:5173**.

---

## 🛠 Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | React, Vite, Tailwind CSS, React Router |
| Backend  | Node.js, Express                    |
| Realtime | Socket.io                           |
| Database | MongoDB + Mongoose                  |

---

## 📡 API Endpoints

| Method | Endpoint       | Description         |
| ------ | -------------- | ------------------- |
| GET    | `/api/health`  | Server health check |

---

## 🔌 Socket Events

| Event        | Direction       | Description                    |
| ------------ | --------------- | ------------------------------ |
| `connection` | Client → Server | Logged when a client connects  |
| `disconnect` | Client → Server | Logged when a client disconnects |

---

## 📝 License

ISC
