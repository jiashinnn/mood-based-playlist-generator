// server.js

require('dotenv').config(); // Load .env variables from a .env file
const express = require('express'); //express: A minimal, flexible web framework for Node.js.
const mongoose = require('mongoose'); //mongoose: A library for interacting with MongoDB using a schema-based approach.
const cors = require('cors'); //cors: Allows cross-origin resource sharing (helps frontend talk to backend).
const axios = require('axios'); //axios: A promise-based HTTP client for the browser and Node.js.

const app = express();

// Enable CORS for all requests
app.use(cors());

// Allow Express to parse JSON request bodies
app.use(express.json());

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected locally"))
.catch((err) => console.error("MongoDB connection error:", err));

let accessToken = "";
let tokenExpiryTime = 0;

// Function to get Spotify Access Token
const getSpotifyAccessToken = async () => {
  const authOptions = {
    method: 'POST',
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(
        process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
      ).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: 'grant_type=client_credentials',
  };

  try {
    const response = await axios(authOptions);
    accessToken = response.data.access_token;
    tokenExpiryTime = Date.now() + response.data.expires_in * 1000;
    console.log('Spotify Access Token:', accessToken);
  } catch (error) {
    console.error('Error getting Spotify token:', error.response?.data || error.message);
  }
};

// ✅ Middleware to Refresh Token Automatically if Expired
const ensureSpotifyToken = async (req, res, next) => {
  if (!accessToken || Date.now() > tokenExpiryTime) {
    console.log('Refreshing Spotify Token...');
    await getSpotifyAccessToken();
  }
  next();
};

// ✅ API Route to Fetch Playlists Based on Mood
app.get('/api/playlist', ensureSpotifyToken, async (req, res) => {
  const mood = req.query.mood || 'happy';

  try {
    const response = await axios.get(`https://api.spotify.com/v1/search`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        q: mood,
        type: 'playlist',
        limit: 5,
      },
    });

    // ✅ Log the full response for debugging
    //console.log('Spotify API Response:', JSON.stringify(response.data, null, 2));

    const playlists = response.data.playlists.items
      .filter((item) => item && item.name && item.external_urls && item.external_urls.spotify)
      .map((item) => ({
        name: item.name,
        url: item.external_urls.spotify,
        image: item.images?.[0]?.url || 'https://via.placeholder.com/150',
      }));

    res.json(playlists);
  } catch (error) {
    console.error('Error fetching playlist:');
    console.error('Status:', error.response?.status);
    console.error('Headers:', JSON.stringify(error.response?.headers, null, 2));
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Message:', error.message);
    res.status(500).json({ error: 'Failed to fetch playlist.' });
  }
});



// ✅ Test Route
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
});

// ✅ Fetch YouTube videos based on mood
app.get('/api/youtube', async (req, res) => {
  const mood = req.query.mood || 'happy';
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

  try {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
      params: {
        key: YOUTUBE_API_KEY,
        q: `${mood} music`,
        part: 'snippet',
        maxResults: 5,
        type: 'video',
      },
    });

    // ✅ Extract relevant video data
    const videos = response.data.items.map((item) => ({
      title: item.snippet.title,
      videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails.medium.url,
    }));

    res.json(videos);
  } catch (error) {
    console.error('❌ Error fetching YouTube videos:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch YouTube videos.' });
  }
});
