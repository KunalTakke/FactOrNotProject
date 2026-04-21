import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../ClaimForm/ClaimForm.css";

const CATEGORIES = [
  "General",
  "Politics",
  "Health",
  "Technology",
  "Science",
  "Finance",
  "Entertainment",
  "Sports",
  "Education",
  "Environment",
  "Lifestyle",
];

function ChannelForm({ user, editingChannel, onNavigate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isEditing = Boolean(editingChannel);

  useEffect(() => {
    if (editingChannel) {
      setName(editingChannel.name || "");
      setDescription(editingChannel.description || "");
      setCategory(editingChannel.category || "General");
    }
  }, [editingChannel]);

  if (!user) {
    return (
      <div className="card">
        <p>Please login to create a channel.</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onNavigate("login")}
        >
          Login
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Channel name is required.");
      return;
    }

    setSubmitting(true);
    try {
      const url = isEditing
        ? `/api/channels/${editingChannel._id}`
        : "/api/channels";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, category }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save channel.");
        return;
      }

      onNavigate("channels");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className="claim-form-page"
      aria-label={isEditing ? "Edit channel" : "Create channel"}
    >
      <button
        type="button"
        className="back-link"
        onClick={() => onNavigate("channels")}
        aria-label="Back to channels"
      >
        &larr; Back to Channels
      </button>

      <div className="card">
        <h1 className="page-title">
          {isEditing ? "Edit Channel" : "Create New Channel"}
        </h1>
        <p className="form-subtitle">
          {isEditing
            ? "Update the channel details."
            : "Create a topic channel for organizing claims by category."}
        </p>

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          aria-label={isEditing ? "Edit channel form" : "Create channel form"}
        >
          <div className="form-group">
            <label htmlFor="ch-name">
              Channel Name{" "}
              <span className="required" aria-label="required">
                *
              </span>
            </label>
            <input
              id="ch-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Climate Science"
              maxLength={100}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ch-desc">Description</label>
            <textarea
              id="ch-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What kind of claims belong in this channel?"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="ch-category">Category</label>
            <select
              id="ch-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting
              ? "Saving..."
              : isEditing
                ? "Update Channel"
                : "Create Channel"}
          </button>
        </form>
      </div>
    </section>
  );
}

ChannelForm.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }),
  editingChannel: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    name: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
  }),
  onNavigate: PropTypes.func.isRequired,
};

ChannelForm.defaultProps = {
  user: null,
  editingChannel: null,
};

export default ChannelForm;
