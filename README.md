# 🎵 Mood-Based Playlist Generator 🎶

A web application that detects a user's mood in real-time using facial recognition and generates music recommendations from **Spotify** and **YouTube** based on the detected mood.

---

## 🖼️ Demo

> Add a screenshot or GIF of your project running.

---

## 🚀 Features

- 🎥 Real-time facial recognition to detect mood.
- 🎼 Generate mood-based **Spotify playlists**.
- 📺 Suggest mood-related **YouTube videos**.
- 🔄 Automatic mood detection without manual intervention.
- 📦 Modern tech stack (React.js, Node.js, MongoDB).

---

## ⚙️ Tech Stack

- **Frontend**: React.js, Bootstrap CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Local)
- **AI**: TensorFlow.js, Face-API.js
- **APIs**: Spotify API, YouTube Data API v3

---

## 📁 Project Structure

```plaintext
mood-playlist-generator/
├── backend/          # Node.js backend
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes (Spotify & YouTube)
│   ├── server.js     # Server setup
│   └── .env          # Environment variables
├── frontend/         # React.js frontend
│   ├── src/
│   │   ├── components/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── App.css
│   └── public/models # AI detection models
└── README.md
```

---

## 🛠️ Installation & Setup

1. Clone the Repository
```
git clone https://github.com/your-username/mood-playlist-generator.git
cd mood-playlist-generator
```

2. Setup Backend (Node.js + Express)
```
cd backend
npm install
```
**Create .env file for backend**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/moodPlaylistDB
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
YOUTUBE_API_KEY=your_youtube_api_key
```
>⚠️ Make sure MongoDB is running locally.

**Run the Backend Server**
```
npm start
```

3. Setup Frontend (React.js)
```
cd ../frontend
npm install
```
**Download and Place Models for TensorFlow.js**
Download these models and place them in the public/models directory:
- tiny_face_detector_model-weights_manifest.json
- face_expression_model-weights_manifest.json
> You can download models from https://github.com/justadudewhohacks/face-api.js-models

4. Run the Frontend Server
```
npm start
```
The app should now be running at http://localhost:3000.

---

## 🔍 Usage Guide
1. lick Start Camera to enable real-time mood detection.
2. Your detected mood will automatically be shown.
3. Based on the mood, Spotify playlists and YouTube videos will be suggested.
4. Use Stop Camera to disable the webcam.

