# 🃏 Bluff Arena

A multiplayer bluffing card game built with the MERN stack and Socket.io.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express, Socket.io
- **Database:** MongoDB + Mongoose

## Project Structure

```
bluff-arena/
├── client/        # React frontend
├── server/        # Express backend
└── README.md
```

## Getting Started

### Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### Set up environment variables

Create `server/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
```

### Run the app

```bash
# Terminal 1 — server
cd server
npm run dev

# Terminal 2 — client
cd client
npm run dev
```

## License

ISC
