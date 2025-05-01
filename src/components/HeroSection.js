import React from 'react';
import './HeroSection.css';

const HeroSection = ({ onExploreClick }) => {
  return (
    <div className="hero-container">
      <div className="hero-content">
        <h1 className="hero-title">Threat Intelligence Platform</h1>
        <p className="hero-description">
          Experience live data flows from honeypot traps and threat intelligence APIs—all in one intuitive dashboard. 
        </p>
        <button className="hero-button" onClick={onExploreClick}>
          Explore Dashboard
        </button>
      </div>
      <div className="hero-image">
        <img 
          src="https://i.pinimg.com/736x/fc/77/05/fc77054ec673c13d7777bf1ba588bac2.jpg" 
          alt="Threat Intelligence" 
          className="hero-img"
        />
      </div>
    </div>
  );
};

export default HeroSection; 