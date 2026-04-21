import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import CredibilityMeter from "../CredibilityMeter/CredibilityMeter";
import VoteButtons from "../VoteButtons/VoteButtons";
import EvidenceComment from "../EvidenceComment/EvidenceComment";
import "./ClaimDetail.css";

function ClaimDetail({ claimId, user, onNavigate }) {
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchClaim = useCallback(async () => {
    try {
      const res = await fetch(`/api/claims/${claimId}`);
      if (!res.ok) {
        setError("Claim not found.");
        return;
      }
      const data = await res.json();
      setClaim(data);
    } catch {
      setError("Failed to load claim.");
    } finally {
      setLoading(false);
    }
  }, [claimId]);

  useEffect(() => {
    fetchClaim();
  }, [fetchClaim]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this claim?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/claims/${claimId}`, { method: "DELETE" });
      if (res.ok) {
        onNavigate("claims");
      } else {
        const data = await res.json();
        alert(data.error || "Delete failed.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setDeleting(false);
    }
  };

  const handleVoteComplete = (updated) => {
    setClaim(updated);
  };

  const handleEvidenceAdded = (updated) => {
    setClaim(updated);
  };

  const scrollToEvidence = () => {
    const el = document.getElementById("evidence-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  if (loading)
    return (
      <p className="loading-text" role="status">
        Loading claim...
      </p>
    );
  if (error)
    return (
      <p className="error-message" role="alert">
        {error}
      </p>
    );
  if (!claim) return null;

  const isOwner = user && claim.authorId === user._id;
  const currentVote = user ? claim.voters?.[user._id] || null : null;
  const evidenceCount = claim.evidence ? claim.evidence.length : 0;

  return (
    <article className="claim-detail-page" aria-label={`Claim: ${claim.title}`}>
      <button
        type="button"
        className="back-link"
        onClick={() => onNavigate("claims")}
        aria-label="Back to claims feed"
      >
        &larr; Back to Claims
      </button>

      <div className="card claim-detail-card">
        <header className="claim-detail-header">
          <button
            type="button"
            className="tag tag-channel clickable-tag"
            onClick={() => onNavigate("claims", { channelId: claim.channelId })}
            aria-label={`View all claims in ${claim.channelName} channel`}
          >
            {claim.channelName}
          </button>
          <span className="claim-detail-date">
            Submitted {new Date(claim.createdAt).toLocaleDateString()} by{" "}
            <strong>{claim.author}</strong>
          </span>
        </header>

        <h1 className="claim-detail-title">{claim.title}</h1>

        {claim.description && (
          <p className="claim-detail-desc">{claim.description}</p>
        )}

        {claim.sourceUrl && (
          <a
            href={claim.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="claim-source-link"
          >
            View Original Source
          </a>
        )}

        <CredibilityMeter
          score={claim.credibilityScore}
          factVotes={claim.factVotes}
          notVotes={claim.notVotes}
          totalVotes={claim.totalVotes}
        />

        {/* Usability fix: evidence count link visible without scrolling */}
        <button
          type="button"
          className="evidence-anchor-link"
          onClick={scrollToEvidence}
          aria-label={`View ${evidenceCount} evidence comments below`}
        >
          {evidenceCount} evidence comment{evidenceCount !== 1 ? "s" : ""}{" "}
          &darr;
        </button>

        <VoteButtons
          claimId={claim._id}
          user={user}
          currentVote={currentVote}
          onVoteComplete={handleVoteComplete}
        />

        {isOwner && (
          <div className="claim-owner-actions">
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => onNavigate("claim-form", { editingClaim: claim })}
            >
              Edit Claim
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Claim"}
            </button>
          </div>
        )}
      </div>

      <section id="evidence-section">
        <EvidenceComment
          claimId={claim._id}
          evidence={claim.evidence || []}
          user={user}
          onEvidenceAdded={handleEvidenceAdded}
        />
      </section>
    </article>
  );
}

ClaimDetail.propTypes = {
  claimId: PropTypes.string.isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }),
  onNavigate: PropTypes.func.isRequired,
};

ClaimDetail.defaultProps = {
  user: null,
};

export default ClaimDetail;
