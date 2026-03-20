import React from "react";
import PropTypes from "prop-types";
import "./Navbar.css";

function Navbar({ user, onLogout, onNavigate }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <button
          type="button"
          className="navbar-brand"
          onClick={() => onNavigate("claims")}
        >
          <span className="navbar-logo">&#x2713;</span> FactOrNot
        </button>

        <div className="navbar-links">
          <button
            type="button"
            className="navbar-link"
            onClick={() => onNavigate("claims")}
          >
            Claims
          </button>
          <button
            type="button"
            className="navbar-link"
            onClick={() => onNavigate("channels")}
          >
            Channels
          </button>
        </div>

        <div className="navbar-auth">
          {user ? (
            <>
              <span className="navbar-user">Hi, {user.username}</span>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={onLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => onNavigate("login")}
              >
                Login
              </button>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => onNavigate("register")}
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }),
  onLogout: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

Navbar.defaultProps = {
  user: null,
};

export default Navbar;
