import React from "react";
import PropTypes from "prop-types";
import "./Navbar.css";

function Navbar({ user, onLogout, onNavigate }) {
  return (
    <header className="navbar" role="banner">
      <nav className="navbar-inner" aria-label="Main navigation">
        <button
          type="button"
          className="navbar-brand"
          onClick={() => onNavigate("claims")}
          aria-label="FactOrNot home"
        >
          <span className="navbar-logo" aria-hidden="true">
            &#x2713;
          </span>
          FactOrNot
        </button>

        <div className="navbar-links" role="menubar">
          <button
            type="button"
            className="navbar-link"
            onClick={() => onNavigate("claims")}
            role="menuitem"
          >
            Claims
          </button>
          <button
            type="button"
            className="navbar-link"
            onClick={() => onNavigate("channels")}
            role="menuitem"
          >
            Channels
          </button>
        </div>

        <div className="navbar-auth">
          {user ? (
            <>
              <span
                className="navbar-user"
                aria-label={`Logged in as ${user.username}`}
              >
                Hi, {user.username}
              </span>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={onLogout}
                aria-label="Log out"
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
      </nav>
    </header>
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
