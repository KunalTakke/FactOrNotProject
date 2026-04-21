import React from "react";
import PropTypes from "prop-types";
import "./CredibilityMeter.css";

function CredibilityMeter({ score, factVotes, notVotes, totalVotes }) {
  const getColor = (s) => {
    if (s >= 70) return "#06d6a0";
    if (s >= 40) return "#ffd166";
    return "#ef476f";
  };

  const getLabel = (s) => {
    if (s >= 70) return "Likely Fact";
    if (s >= 40) return "Contested";
    return "Likely False";
  };

  return (
    <div
      className="credibility-meter"
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Credibility score: ${score}%, ${getLabel(score)}`}
    >
      <div className="credibility-header">
        <span className="credibility-label" style={{ color: getColor(score) }}>
          {getLabel(score)}
        </span>
        <span
          className="credibility-score"
          style={{ color: getColor(score) }}
          aria-live="polite"
        >
          {score}%
        </span>
      </div>
      <div
        className="credibility-bar"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${score}% credibility`}
      >
        <div
          className="credibility-fill"
          style={{
            width: `${score}%`,
            backgroundColor: getColor(score),
          }}
        />
      </div>
      <div className="credibility-stats">
        <span className="stat-fact">{factVotes} Fact</span>
        <span className="stat-total">{totalVotes} votes</span>
        <span className="stat-not">{notVotes} Not</span>
      </div>
    </div>
  );
}

CredibilityMeter.propTypes = {
  score: PropTypes.number.isRequired,
  factVotes: PropTypes.number.isRequired,
  notVotes: PropTypes.number.isRequired,
  totalVotes: PropTypes.number.isRequired,
};

export default CredibilityMeter;
