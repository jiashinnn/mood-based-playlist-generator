import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [mood, setMood] = useState('');
  const [playlist, setPlaylist] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceExpressionNet.loadFromUri('/models');
    };
    loadModels();
  }, []);

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          detectMoodRealTime();
        };
        setIsCameraOn(true);
      })
      .catch((err) => {
        console.error('Error accessing webcam:', err);
        alert('Error accessing webcam. Please allow camera access and ensure no other app is using it.');
      });
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
    setMood('');
    setPlaylist([]);
    setVideos([]);
  };

  const detectMoodRealTime = () => {
    setInterval(async () => {
      if (videoRef.current) {
        const detections = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        if (detections) {
          const maxMood = Object.entries(detections.expressions).reduce((max, curr) =>
            curr[1] > max[1] ? curr : max
          );
          if (mood !== maxMood[0]) {
            setMood(maxMood[0]);
            fetchData(maxMood[0]);
          }
        }
      }
    }, 2000);
  };

  // Fetch Spotify and YouTube data
  const fetchData = (currentMood) => {
    // Fetch Spotify Playlists
    fetch(`/api/playlist?mood=${currentMood}`)
      .then((res) => res.json())
      .then((data) => setPlaylist(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Spotify API Error:', err));

    // Fetch YouTube Videos
    fetch(`/api/youtube?mood=${currentMood}`)
      .then((res) => res.json())
      .then((data) => {
        // Ensure data is an array or default to empty array
        setVideos(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('YouTube API Error:', err);
        setVideos([]); // Set as empty array if there's an error
      });
  };


  return (
    <div className="container mt-5 text-center">
      <h1 className="mb-4">🎵 Mood-Based Playlist Generator</h1>

      {/* Camera Controls */}
      <div className="mb-4">
        <button className="btn btn-primary me-2" onClick={startCamera} disabled={isCameraOn}>Start Camera</button>
        <button className="btn btn-danger" onClick={stopCamera} disabled={!isCameraOn}>Stop Camera</button>
      </div>

      {/* Webcam */}
      <div className="d-flex justify-content-center mb-4">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          width="400"
          height="300"
          style={{
            border: '2px solid #007bff',
            borderRadius: '10px',
            backgroundColor: '#000'
          }}
        />
      </div>

      <h3 className="mb-4">Detected Mood: <span style={{ color: '#007bff' }}>{mood}</span></h3>

      {/* Spotify Playlists */}
      <h2>🎶 Spotify Playlists</h2>
      <div className="row">
        {playlist.map((item, index) => (
          <div className="col-md-4 mb-4" key={index}>
            <div className="card h-100">
              <img src={item.image} className="card-img-top" alt={item.name} style={{ height: '200px', objectFit: 'cover' }} />
              <div className="card-body">
                <h5 className="card-title">{item.name}</h5>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-success">
                  Open on Spotify
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* YouTube Videos */}
      <h2>📺 YouTube Videos</h2>
      <div className="row">
        {Array.isArray(videos) && videos.length > 0 ? (
          videos.map((video, index) => (
            <div className="col-md-4 mb-4" key={index}>
              <div className="card h-100">
                <img
                  src={video.thumbnail}
                  className="card-img-top"
                  alt={video.title}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className="card-body">
                  <h5 className="card-title">{video.title}</h5>
                  <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-danger">
                    Watch on YouTube
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No YouTube videos found for this mood.</p>
        )}
      </div>
    </div>
  );
}

export default App;
