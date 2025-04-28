import React from 'react';
import './About.css';

const About = () => {
  const developers = [
    {
      name: 'Kanishak Sharma',
      github: 'https://github.com/Kanishak-xd'
    },
    {
      name: 'Karma Tshering Yangden',
      github: 'https://github.com/ktyangden'
    },
    {  
    name: 'Suhana Mishra',
      github: 'https://github.com/suhaxa4'
    }
  ];

  return (
    <div className="about-container">
      <section className="about-section">
        <h2 className="about-title">About Our Website</h2>
        <div className="about-content">
          <p>
            This website is designed to provide comprehensive threat intelligence and analysis. 
            Our platform aggregates and analyzes data from various sources to give you real-time 
            insights into potential security threats and vulnerabilities.
          </p>
          <p>
            The dashboard provides visual representations of attack patterns and trends, 
            while our API integration allows for seamless data access and integration with 
            your existing security infrastructure.
          </p>
        </div>
      </section>

      <section className="developers-section">
        <h2 className="about-title">Our Team</h2>
        <div className="developers-grid">
          {developers.map((developer, index) => (
            <div key={index} className="developer-card">
              <h3>{developer.name}</h3>
              <a 
                href={developer.github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="github-link"
              >
                GitHub Profile
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About; 