import { Compass, Sparkles, Monitor, Headphones, Bot, QrCode, Gamepad2, Mail, Phone, MapPin, Send } from 'lucide-react';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { auth, db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();
    const aboutRef = React.useRef(null);
    const contactRef = React.useRef(null);
    const location = useLocation();

    // contact form state
    const [contactName, setContactName] = React.useState('');
    const [contactEmail, setContactEmail] = React.useState('');
    const [contactSubject, setContactSubject] = React.useState('');
    const [contactMessage, setContactMessage] = React.useState('');
    const [contactStatus, setContactStatus] = React.useState('');

    // AI search state
    const [aiQuery, setAiQuery] = React.useState('');

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setContactStatus('sending');
        try {
            await addDoc(collection(db, 'messages'), {
                name: contactName,
                email: contactEmail,
                subject: contactSubject,
                message: contactMessage,
                createdAt: serverTimestamp()
            });
            setContactStatus('sent');
            setContactName('');
            setContactEmail('');
            setContactSubject('');
            setContactMessage('');
        } catch (err) {
            console.error('Message send failed', err);
            setContactStatus('error');
        }
    };

    const handleAskAI = (query) => {
        console.log('handleAskAI called with query:', query);
        console.log('window.botpressWebChat:', window.botpressWebChat);
        console.log('window.botpress:', window.botpress);
        console.log('window.bp:', window.bp);
        if (query.trim()) {
            let chat = window.botpress || window.botpressWebChat || window.bp;
            if (chat) {
                console.log('Found chat object:', chat);
                if (typeof chat.open === 'function') {
                    chat.open();
                    console.log('Opened chat');
                }
                if (typeof chat.sendMessage === 'function') {
                    // Try string first for older versions
                    try {
                        chat.sendMessage(query);
                        console.log('Sent message as string');
                    } catch (e) {
                        console.log('Failed string, trying object');
                        try {
                            chat.sendMessage({ type: 'text', text: query });
                            console.log('Sent message as object');
                        } catch (e2) {
                            console.log('Failed both ways', e2);
                        }
                    }
                } else {
                    console.log('No sendMessage method');
                }
                setAiQuery('');
            } else {
                console.log('No chat object found');
                alert('Botpress chat not loaded yet. Please try again in a moment.');
            }
        }
    };

    // scroll to section when hash changes (or on initial load)
    React.useEffect(() => {
        const hash = location.hash.slice(1);
        if (hash === 'about' && aboutRef.current) {
            setTimeout(() => {
                aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else if (hash === 'contact' && contactRef.current) {
            setTimeout(() => {
                contactRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [location.hash]);

    // Handle smooth scrolling when hash changes or component mounts
    React.useEffect(() => {
        const hash = window.location.hash.slice(1); // Remove # from hash
        
        if (hash === 'about' && aboutRef.current) {
            setTimeout(() => {
                aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else if (hash === 'contact' && contactRef.current) {
            setTimeout(() => {
                contactRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, []);


    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 12
            }
        }
    };

    return (
        <div className="home-container">
            {/* Top Navigation Bar */}
            <Navbar />

            {/* Main Content Area */}
            <main className="home-content">
                <header className="home-header">
                    <div className="welcome-section">
                        <h1>Hello to the Heritage, Visitor</h1>
                        <p>Explore the timeless corridors of history and art.</p>
                        
                        <button
                            className="start-explore-btn"
                            onClick={() => {
                                navigate('/explore');
                                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
                            }}
                        >
                            <Compass size={20} />
                            <span>Start Explore</span>
                        </button>
                        <div className="ai-search-container">
                            <div className="ai-search-inner">
                                <input
                                    type="text"
                                    className="ai-search-input"
                                    placeholder="Ask from AI..."
                                    value={aiQuery}
                                    onChange={(e) => setAiQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAskAI(aiQuery)}
                                />
                                <button className="ai-search-btn" onClick={() => handleAskAI(aiQuery)}>
                                    <Bot size={20} />
                                    <span>Search</span>
                                </button>
                            </div>
                        </div>

                    </div>
                </header>

                <section className="focus-section">
                    <motion.div
                        className="section-title"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2>Our Heritage Focus</h2>
                        <p>Bridging tradition with tomorrow's technology.</p>
                    </motion.div>

                    <motion.div
                        className="focus-grid"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        {[
                            { title: 'Digital Experience', icon: <Monitor size={32} />, desc: 'Immersive virtual galleries and high-definition artifact viewing.' },
                            { title: 'Audio Guidance', icon: <Headphones size={32} />, desc: 'Personalized narration that brings history to life in your ears.' },
                            { title: 'AI Chat Bot', icon: <Bot size={32} />, desc: 'Instant support and deep historical insights powered by AI.' },
                            { title: 'QR Scan System', icon: <QrCode size={32} />, desc: 'Scan and learn instantly with our seamless artifact identification.' },
                            { title: 'Gamification', icon: <Gamepad2 size={32} />, desc: 'Earn achievements and level up as you explore the museum.' }
                        ].map((focus, i) => (
                            <motion.div
                                key={i}
                                className="focus-card glass-card"
                                variants={itemVariants}
                                whileHover={{
                                    scale: 1.05,
                                    boxShadow: '0 20px 40px rgba(197, 160, 89, 0.2)',
                                    borderColor: 'var(--primary)'
                                }}
                            >
                                <motion.div
                                    className="focus-icon-wrapper"
                                    whileHover={{ rotate: 15, scale: 1.1 }}
                                >
                                    {focus.icon}
                                </motion.div>
                                <h3>{focus.title}</h3>
                                <p>{focus.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                <section id="about" ref={aboutRef} className="about-section">
                    <div className="about-container-inner glass-card">
                        <div className="about-content-wrapper">
                            <motion.div
                                className="about-text"
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <span className="about-badge">Our Legacy</span>
                                <h2>Preserving History, <br /><span className="text-highlight">Powering Discovery</span></h2>
                                <p>
                                    Founded on the principle that heritage should be accessible to all,
                                    MuseoQuest bridges the gap between ancient wonders and modern exploration.
                                </p>
                                <div className="mission-grid">
                                    <div className="mission-item">
                                        <h4>Education</h4>
                                        <p>Transforming static exhibits into interactive learning journeys.</p>
                                    </div>
                                    <div className="mission-item">
                                        <h4>Innovation</h4>
                                        <p>Leveraging AI and Digital Twinning to immortalize artifacts.</p>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                className="about-visual"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <div className="visual-circle">
                                    <Sparkles size={80} className="floating-sparkle" />
                                </div>
                                <div className="decorative-lines"></div>
                            </motion.div>
                        </div>
                    </div>
                </section>


                {/* Contact Section */}
                <section id="contact" ref={contactRef} className="contact-section">
                    <div className="section-title centered">
                        <h2>Get in Touch</h2>
                        <p>We'd love to hear from you. Send us a message or visit us in person.</p>
                    </div>

                    <div className="contact-grid">
                        <motion.div
                            className="contact-info-cards"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="info-card glass-card">
                                <div className="info-icon"><Mail size={24} /></div>
                                <div className="info-text">
                                    <h4>Email Us</h4>
                                    <p>support@museoquest.com</p>
                                </div>
                            </div>
                            <div className="info-card glass-card">
                                <div className="info-icon"><Phone size={24} /></div>
                                <div className="info-text">
                                    <h4>Call Us</h4>
                                    <p>+1 (555) 123-4567</p>
                                </div>
                            </div>
                            <div className="info-card glass-card">
                                <div className="info-icon"><MapPin size={24} /></div>
                                <div className="info-text">
                                    <h4>Visit Us</h4>
                                    <p>123 Heritage Lane, Museum District</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="contact-form-container glass-card"
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <form className="contact-form" onSubmit={handleContactSubmit}>
                                {contactStatus === 'sending' && <div className="form-status">Sending...</div>}
                                {contactStatus === 'sent' && <div className="form-status success">Message sent!</div>}
                                {contactStatus === 'error' && <div className="form-status error">Failed to send, please try again.</div>}
                                <div className="form-row">
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            placeholder="Your Name"
                                            value={contactName}
                                            onChange={(e) => setContactName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <input
                                            type="email"
                                            placeholder="Your Email"
                                            value={contactEmail}
                                            onChange={(e) => setContactEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        placeholder="Subject"
                                        value={contactSubject}
                                        onChange={(e) => setContactSubject(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <textarea
                                        placeholder="Your Message"
                                        rows="5"
                                        value={contactMessage}
                                        onChange={(e) => setContactMessage(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                                <button type="submit" className="send-btn">
                                    <span>Send Message</span>
                                    <Send size={18} />
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </section>
            </main>

            <Footer />

            {/* Background Blobs */}
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>
        </div>
    );
};

export default HomePage;
