import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import CredibilityMeter from "../CredibilityMeter/CredibilityMeter";
import "./ClaimList.css";

function ClaimList({ user, channelId, onNavigate }) {
  const [claims, setClaims] = useState([]);
  const [channels, setChannels] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedChannel, setSelectedChannel] = useState(channelId || "");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("credibility");
  const [loading, setLoading] = useState(true);

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", "20");
      params.set("sort", sort);
      if (selectedChannel) params.set("channelId", selectedChannel);
      if (search) params.set("search", search);

      const res = await fetch(`/api/claims?${params}`);
      const data = await res.json();
      setClaims(data.claims || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Fetch claims error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, selectedChannel, search, sort]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  useEffect(() => {
    fetch("/api/channels")
      .then((res) => res.json())
      .then((data) => setChannels(data))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchClaims();
  };

  return (
    <div className="claim-list-page">
      <div className="claim-list-header">
        <h1 className="page-title">Claims Feed</h1>
        {user && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              onNavigate("claim-form", { channelId: selectedChannel })
            }
          >
            + Submit Claim
          </button>
        )}
      </div>

      <div className="claim-filters card">
        <form onSubmit={handleSearch} className="filter-row">
          <input
            type="text"
            className="filter-search"
            placeholder="Search claims..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>
        <div className="filter-row">
          <select
            value={selectedChannel}
            onChange={(e) => {
              setSelectedChannel(e.target.value);
              setPage(1);
            }}
            className="filter-select"
          >
            <option value="">All Channels</option>
            {channels.map((ch) => (
              <option key={ch._id} value={ch._id}>
                {ch.name} ({ch.claimCount})
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="filter-select"
          >
            <option value="credibility">Sort by Credibility</option>
            <option value="newest">Sort by Newest</option>
          </select>
        </div>
      </div>

      <p className="claim-count">{total} claims found</p>

      {loading ? (
        <p className="loading-text">Loading claims...</p>
      ) : claims.length === 0 ? (
        <div className="card empty-state">
          <p>No claims found. Be the first to submit one!</p>
        </div>
      ) : (
        <div className="claims-grid">
          {claims.map((claim) => (
            <div
              key={claim._id}
              className="claim-card card"
              onClick={() =>
                onNavigate("claim-detail", { claimId: claim._id })
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  onNavigate("claim-detail", { claimId: claim._id });
              }}
            >
              <div className="claim-card-header">
                <span className="tag tag-channel">{claim.channelName}</span>
                <span className="claim-date">
                  {new Date(claim.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="claim-title">{claim.title}</h3>
              <CredibilityMeter
                score={claim.credibilityScore}
                factVotes={claim.factVotes}
                notVotes={claim.notVotes}
                totalVotes={claim.totalVotes}
              />
              <div className="claim-card-footer">
                <span className="claim-author">by {claim.author}</span>
                <span className="claim-evidence">
                  {claim.evidence ? claim.evidence.length : 0} evidence
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

ClaimList.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }),
  channelId: PropTypes.string,
  onNavigate: PropTypes.func.isRequired,
};

ClaimList.defaultProps = {
  user: null,
  channelId: null,
};

export default ClaimList;
