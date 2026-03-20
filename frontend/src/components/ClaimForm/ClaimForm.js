import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./ClaimForm.css";

function ClaimForm({ user, editingClaim, preselectedChannelId, onNavigate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [channelId, setChannelId] = useState(preselectedChannelId || "");
  const [channels, setChannels] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isEditing = Boolean(editingClaim);

  useEffect(() => {
    fetch("/api/channels")
      .then((res) => res.json())
      .then((data) => setChannels(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (editingClaim) {
      setTitle(editingClaim.title || "");
      setDescription(editingClaim.description || "");
      setSourceUrl(editingClaim.sourceUrl || "");
      setChannelId(editingClaim.channelId || "");
    }
  }, [editingClaim]);

  if (!user) {
    return (
      <div className="card">
        <p>Please login to submit a claim.</p>
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

    if (!title.trim()) {
      setError("Claim title is required.");
      return;
    }
    if (!channelId) {
      setError("Please select a channel.");
      return;
    }

    setSubmitting(true);
    try {
      const url = isEditing ? `/api/claims/${editingClaim._id}` : "/api/claims";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, sourceUrl, channelId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save claim.");
        return;
      }

      onNavigate("claim-detail", { claimId: data._id });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="claim-form-page">
      <button
        type="button"
        className="back-link"
        onClick={() => onNavigate("claims")}
      >
        &larr; Back to Claims
      </button>

      <div className="card">
        <h2 className="page-title">
          {isEditing ? "Edit Claim" : "Submit a Claim"}
        </h2>
        <p className="form-subtitle">
          {isEditing
            ? "Update the details of your claim."
            : "Submit a claim, headline, or statement for the community to verify."}
        </p>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="claim-title">
              Claim / Headline <span className="required">*</span>
            </label>
            <input
              id="claim-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI will replace 40% of jobs within the next decade"
              maxLength={300}
            />
          </div>

          <div className="form-group">
            <label htmlFor="claim-desc">Description (optional)</label>
            <textarea
              id="claim-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context or additional details about this claim..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="claim-source">Source URL (optional)</label>
            <input
              id="claim-source"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          {!isEditing && (
            <div className="form-group">
              <label htmlFor="claim-channel">
                Channel <span className="required">*</span>
              </label>
              <select
                id="claim-channel"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
              >
                <option value="">Select a channel...</option>
                {channels.map((ch) => (
                  <option key={ch._id} value={ch._id}>
                    {ch.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting
              ? "Saving..."
              : isEditing
                ? "Update Claim"
                : "Submit Claim"}
          </button>
        </form>
      </div>
    </div>
  );
}

ClaimForm.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }),
  editingClaim: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    sourceUrl: PropTypes.string,
    channelId: PropTypes.string,
  }),
  preselectedChannelId: PropTypes.string,
  onNavigate: PropTypes.func.isRequired,
};

ClaimForm.defaultProps = {
  user: null,
  editingClaim: null,
  preselectedChannelId: null,
};

export default ClaimForm;
