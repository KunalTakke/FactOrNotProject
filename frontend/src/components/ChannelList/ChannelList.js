import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./ChannelList.css";

function ChannelList({ user, onNavigate }) {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/channels")
      .then((res) => res.json())
      .then((data) => {
        setChannels(data);
      })
      .catch((err) => console.error("Fetch channels error:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (channelId) => {
    if (
      !window.confirm(
        "Delete this channel? All claims inside it will also be deleted."
      )
    )
      return;

    try {
      const res = await fetch(`/api/channels/${channelId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setChannels((prev) => prev.filter((ch) => ch._id !== channelId));
      } else {
        const data = await res.json();
        alert(data.error || "Delete failed.");
      }
    } catch {
      alert("Network error.");
    }
  };

  const CATEGORY_COLORS = {
    Politics: "#e74c3c",
    Health: "#2ecc71",
    Technology: "#3498db",
    Science: "#9b59b6",
    Finance: "#f39c12",
    Entertainment: "#e91e63",
    Sports: "#ff5722",
    Education: "#00bcd4",
    Environment: "#4caf50",
    Lifestyle: "#ff9800",
    General: "#607d8b",
  };

  if (loading)
    return (
      <p className="loading-text" role="status">
        Loading channels...
      </p>
    );

  return (
    <section className="channel-list-page" aria-label="Topic channels">
      <div className="channel-list-header">
        <h1 className="page-title">Topic Channels</h1>
        {user && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNavigate("channel-form")}
          >
            + Create Channel
          </button>
        )}
      </div>

      <p className="channel-subtitle">
        Browse claims by topic. Click a channel to see its claims.
      </p>

      {channels.length === 0 ? (
        <div className="card empty-state">
          <p>No channels yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="channels-grid">
          {channels.map((ch) => {
            const color =
              CATEGORY_COLORS[ch.category] || CATEGORY_COLORS.General;
            const isOwner = user && ch.authorId === user._id;

            return (
              <article
                key={ch._id}
                className="channel-card card"
                aria-label={`${ch.name} channel, ${ch.claimCount} claims`}
              >
                <button
                  type="button"
                  className="channel-card-clickable"
                  onClick={() =>
                    onNavigate("claims", { channelId: ch._id.toString() })
                  }
                  aria-label={`Browse claims in ${ch.name} channel`}
                >
                  <div className="channel-card-top">
                    <span
                      className="channel-icon"
                      style={{ backgroundColor: color }}
                      aria-hidden="true"
                    >
                      {ch.name.charAt(0)}
                    </span>
                    <div>
                      <h2 className="channel-name">{ch.name}</h2>
                      <span className="channel-category" style={{ color }}>
                        {ch.category}
                      </span>
                    </div>
                  </div>
                  <p className="channel-desc">
                    {ch.description || "No description provided."}
                  </p>
                  <div className="channel-meta">
                    <span className="channel-claims-count">
                      {ch.claimCount} claims
                    </span>
                    <span className="channel-author">by {ch.author}</span>
                  </div>
                </button>

                {isOwner && (
                  <div className="channel-actions">
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() =>
                        onNavigate("channel-form", { editingChannel: ch })
                      }
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(ch._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

ChannelList.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }),
  onNavigate: PropTypes.func.isRequired,
};

ChannelList.defaultProps = {
  user: null,
};

export default ChannelList;
