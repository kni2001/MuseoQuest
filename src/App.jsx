import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './components/Auth/LoginPage'
import SignUpPage from './components/Auth/SignUpPage'
import HomePage from './pages/Home/HomePage'
import ExplorePage from './pages/Explore/ExplorePage'
import PlayPage from './pages/Play/PlayPage'
import AdminDashboard from './pages/Admin/AdminDashboard'
import ScrollToTop from "./components/ScrollToTop"; // you already imported it

function App() {
  return (
    <Router>
      {/* Add ScrollToTop here, right inside Router */}
      <ScrollToTop />

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/explore/:id" element={<ExplorePage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
