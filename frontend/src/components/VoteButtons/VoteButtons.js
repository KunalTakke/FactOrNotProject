import React, { useState } from "react";
import PropTypes from "prop-types";
import "./VoteButtons.css";

function VoteButtons({ claimId, user, currentVote, onVoteComplete }) {
  const [voting, setVoting] = useState(false);

  const handleVote = async (vote) => {
    if (!user) {
      alert("Please login to vote.");
      return;
    }
    setVoting(true);
    try {
      const res = await fetch(`/api/claims/${claimId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote }),
      });
      if (res.ok) {
        const updated = await res.json();
        onVoteComplete(updated);
      }
    } catch (err) {
      console.error("Vote error:", err);
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="vote-buttons">
      <button
        type="button"
        className={`vote-btn vote-fact ${currentVote === "fact" ? "active" : ""}`}
        onClick={() => handleVote("fact")}
        disabled={voting}
        title="Vote Fact"
      >
        &#x2713; Fact
      </button>
      <button
        type="button"
        className={`vote-btn vote-not ${currentVote === "not" ? "active" : ""}`}
        onClick={() => handleVote("not")}
        disabled={voting}
        title="Vote Not"
      >
        &#x2717; Not
      </button>
    </div>
  );
}

VoteButtons.propTypes = {
  claimId: PropTypes.string.isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }),
  currentVote: PropTypes.string,
  onVoteComplete: PropTypes.func.isRequired,
};

VoteButtons.defaultProps = {
  user: null,
  currentVote: null,
};

export default VoteButtons;
