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
    <section className="claim-list-page" aria-label="Claims feed">
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

      {/* Search and filter controls */}
      <section
        className="claim-filters card"
        aria-label="Search and filter claims"
      >
        <form onSubmit={handleSearch} className="filter-row" role="search">
          <label htmlFor="claim-search" className="visually-hidden">
            Search claims
          </label>
          <input
            id="claim-search"
            type="text"
            className="filter-search"
            placeholder="Search claims..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search claims by keyword"
          />
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>
        <div className="filter-row">
          <label htmlFor="channel-filter" className="visually-hidden">
            Filter by channel
          </label>
          <select
            id="channel-filter"
            value={selectedChannel}
            onChange={(e) => {
              setSelectedChannel(e.target.value);
              setPage(1);
            }}
            className="filter-select"
            aria-label="Filter by channel"
          >
            <option value="">All Channels</option>
            {channels.map((ch) => (
              <option key={ch._id} value={ch._id}>
                {ch.name} ({ch.claimCount})
              </option>
            ))}
          </select>
          <label htmlFor="sort-select" className="visually-hidden">
            Sort claims
          </label>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="filter-select"
            aria-label="Sort claims"
          >
            <option value="credibility">Highest Credibility</option>
            <option value="newest">Newest First</option>
            <option value="contested">Most Contested</option>
          </select>
        </div>
      </section>

      <p className="claim-count" aria-live="polite">
        {total} claims found
      </p>

      {loading ? (
        <p className="loading-text" role="status">
          Loading claims...
        </p>
      ) : claims.length === 0 ? (
        <div className="card empty-state">
          <p>No claims found. Be the first to submit one!</p>
        </div>
      ) : (
        <div className="claims-grid" role="feed" aria-label="Claims list">
          {claims.map((claim) => (
            <article
              key={claim._id}
              className="claim-card card"
              aria-label={`Claim: ${claim.title}`}
            >
              <button
                type="button"
                className="claim-card-button"
                onClick={() =>
                  onNavigate("claim-detail", { claimId: claim._id })
                }
                aria-label={`View claim: ${claim.title}, credibility ${claim.credibilityScore}%`}
              >
                <div className="claim-card-header">
                  <span className="tag tag-channel">{claim.channelName}</span>
                  <span className="claim-date">
                    {new Date(claim.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="claim-title">{claim.title}</h2>
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
              </button>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="pagination" aria-label="Claims pagination">
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="pagination-info" aria-current="page">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Next page"
          >
            Next
          </button>
        </nav>
      )}
    </section>
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
