import React, { useState } from "react";
import PropTypes from "prop-types";
import "./EvidenceComment.css";

function EvidenceComment({ claimId, evidence, user, onEvidenceAdded }) {
  const [showForm, setShowForm] = useState(false);
  const [comment, setComment] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [supports, setSupports] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError("Comment is required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/claims/${claimId}/evidence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment, sourceUrl, supports }),
      });
      if (res.ok) {
        const updated = await res.json();
        onEvidenceAdded(updated);
        setComment("");
        setSourceUrl("");
        setSupports(true);
        setShowForm(false);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add evidence.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="evidence-section" aria-label="Evidence and comments">
      <div className="evidence-header">
        <h2>Evidence &amp; Comments ({evidence.length})</h2>
        {user && (
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => setShowForm(!showForm)}
            aria-expanded={showForm}
            aria-controls="evidence-form"
          >
            {showForm ? "Cancel" : "+ Add Evidence"}
          </button>
        )}
      </div>

      {showForm && (
        <div id="evidence-form" className="evidence-form card">
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} aria-label="Submit evidence">
            <div className="form-group">
              <label htmlFor="ev-comment">Your Analysis</label>
              <textarea
                id="ev-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your evidence or reasoning..."
                rows={3}
              />
            </div>
            <div className="form-group">
              <label htmlFor="ev-source">Source URL (optional)</label>
              <input
                id="ev-source"
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="ev-supports">Verdict</label>
              <select
                id="ev-supports"
                value={supports ? "true" : "false"}
                onChange={(e) => setSupports(e.target.value === "true")}
              >
                <option value="true">Supports the claim (Fact)</option>
                <option value="false">Debunks the claim (Not)</option>
              </select>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Evidence"}
            </button>
          </form>
        </div>
      )}

      <div className="evidence-list" aria-label="Evidence comments list">
        {evidence.length === 0 && (
          <p className="evidence-empty">
            No evidence submitted yet. Be the first to contribute!
          </p>
        )}
        {evidence.map((ev) => (
          <article
            key={ev._id}
            className={`evidence-item ${ev.supports ? "supports" : "debunks"}`}
            aria-label={`Evidence by ${ev.author}, ${ev.supports ? "supports" : "debunks"} the claim`}
          >
            <div className="evidence-item-header">
              <span
                className={`evidence-badge ${ev.supports ? "badge-fact" : "badge-not"}`}
              >
                {ev.supports ? "Supports" : "Debunks"}
              </span>
              <span className="evidence-author">{ev.author}</span>
              <time className="evidence-date" dateTime={ev.createdAt}>
                {new Date(ev.createdAt).toLocaleDateString()}
              </time>
            </div>
            <p className="evidence-text">{ev.comment}</p>
            {ev.sourceUrl && (
              <a
                href={ev.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="evidence-source"
              >
                View Source
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

EvidenceComment.propTypes = {
  claimId: PropTypes.string.isRequired,
  evidence: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
      comment: PropTypes.string.isRequired,
      sourceUrl: PropTypes.string,
      supports: PropTypes.bool.isRequired,
      author: PropTypes.string.isRequired,
      createdAt: PropTypes.string,
    })
  ).isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }),
  onEvidenceAdded: PropTypes.func.isRequired,
};

EvidenceComment.defaultProps = {
  user: null,
};

export default EvidenceComment;
