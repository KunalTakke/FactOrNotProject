import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar/Navbar";
import ClaimList from "./components/ClaimList/ClaimList";
import ClaimDetail from "./components/ClaimDetail/ClaimDetail";
import ClaimForm from "./components/ClaimForm/ClaimForm";
import ChannelList from "./components/ChannelList/ChannelList";
import ChannelForm from "./components/ChannelForm/ChannelForm";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("claims");
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [editingClaim, setEditingClaim] = useState(null);
  const [editingChannel, setEditingChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data._id) setUser(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = useCallback((userData) => {
    setUser(userData);
    setPage("claims");
  }, []);

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setPage("claims");
  }, []);

  const navigateTo = useCallback((newPage, options = {}) => {
    setPage(newPage);
    setSelectedClaimId(options.claimId || null);
    setSelectedChannelId(options.channelId || null);
    setEditingClaim(options.editingClaim || null);
    setEditingChannel(options.editingChannel || null);
  }, []);

  if (loading) {
    return (
      <div
        className="app-loading"
        role="status"
        aria-label="Loading application"
      >
        <h2>Loading FactOrNot...</h2>
      </div>
    );
  }

  const renderPage = () => {
    switch (page) {
      case "login":
        return (
          <Login onLogin={handleLogin} onNavigate={() => setPage("register")} />
        );
      case "register":
        return (
          <Register
            onRegister={handleLogin}
            onNavigate={() => setPage("login")}
          />
        );
      case "claim-detail":
        return (
          <ClaimDetail
            claimId={selectedClaimId}
            user={user}
            onNavigate={navigateTo}
          />
        );
      case "claim-form":
        return (
          <ClaimForm
            user={user}
            editingClaim={editingClaim}
            preselectedChannelId={selectedChannelId}
            onNavigate={navigateTo}
          />
        );
      case "channels":
        return <ChannelList user={user} onNavigate={navigateTo} />;
      case "channel-form":
        return (
          <ChannelForm
            user={user}
            editingChannel={editingChannel}
            onNavigate={navigateTo}
          />
        );
      case "claims":
      default:
        return (
          <ClaimList
            user={user}
            channelId={selectedChannelId}
            onNavigate={navigateTo}
          />
        );
    }
  };

  return (
    <div className="app">
      {/* Skip to content link for keyboard accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <Navbar user={user} onLogout={handleLogout} onNavigate={navigateTo} />
      <main id="main-content" className="app-main">
        {renderPage()}
      </main>
      <footer className="app-footer">
        <p>
          FactOrNot &copy; 2025 &mdash; Crowdsourced Truth in a World of Noise
        </p>
      </footer>
    </div>
  );
}

export default App;
