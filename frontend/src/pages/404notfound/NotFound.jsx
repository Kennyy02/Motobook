import React from "react";
import "../../styles/404notfound/NotFound.css";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  const handleHome = (e) => {
    e.preventDefault();
    if (navigate) navigate("/");
    else window.location.href = "/";
  };

  return (
    <main className="nf-root" role="main">
      <div className="nf-card">
        <div className="nf-visual" aria-hidden="true">
          <span className="nf-404">404</span>
          <svg className="nf-bubble" viewBox="0 0 100 100" aria-hidden="true">
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="#e6eef8"
              strokeWidth="4"
            />
          </svg>
        </div>

        <div className="nf-content">
          <h1 className="nf-title">Page not found</h1>
          <p className="nf-text">
            We can’t find the page you’re looking for. It may have been moved or
            deleted.
          </p>

          <div className="nf-actions">
            <button className="nf-btn" onClick={handleHome}>
              Take me home
            </button>
            <a
              className="nf-link"
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleHome(e);
              }}
            >
              Or try searching
            </a>
          </div>

          <p className="nf-muted">
            If you typed the web address, check it for errors and try again.
          </p>
        </div>
      </div>
    </main>
  );
}
