import React from 'react';
import './HeroSection.css';

const HeroSection = ({ onExploreClick }) => {
  return (
    <div className="hero-container">
      <div className="hero-content">
        <h1 className="hero-title">Threat Intelligence Platform</h1>
        <p className="hero-description">
          Experience live data flows from honeypot traps and threat intelligence APIs—all in one intuitive dashboard
        </p>
        <button className="hero-button" onClick={onExploreClick}>
          Explore Dashboard
        </button>
      </div>
      <div className="hero-image">
        <img 
          src="/hero-image.png" 
          alt="Threat Intelligence Dashboard" 
          className="hero-img"
        />
      </div>
    </div>
  );
};

export default HeroSection; 