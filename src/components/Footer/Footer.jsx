import React from 'react';
import './Footer.css';

const Footer = () => (
    <footer className="app-footer glass">
        <div className="footer-content">
            <span>&copy; {new Date().getFullYear()} MuseoQuest. All rights reserved.</span>
            <span className="footer-links">
                <a href="/explore">Explore</a> | <a href="/home">Home</a> 
            </span>
        </div>
    </footer>
);

export default Footer;
