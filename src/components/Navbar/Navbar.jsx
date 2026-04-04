import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    Compass,
    Award,
    Settings,
    LogOut,
    ChevronRight,
    Sparkles,
    Menu,
    X,
    Monitor,
    Headphones,
    Bot,
    QrCode,
    Gamepad2,
    Mail,
    Phone,
    MapPin,
    Send,
    Sun,
    Moon,
    Edit2,
    Check
} from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { getUserProgress } from '../../lib/userScoring';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentHash = location.hash;
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const [userName, setUserName] = React.useState('Visitor');
    const [isEditingName, setIsEditingName] = React.useState(false);
    const [editNameValue, setEditNameValue] = React.useState('Visitor');
    const [theme, setTheme] = React.useState(
        () => localStorage.getItem('appTheme') || 'dark'
    );
    const [avatarGender, setAvatarGender] = React.useState(
        () => localStorage.getItem('userAvatarGender') || 'male'
    );
    const [userLevel, setUserLevel] = React.useState(1);
    const [userScore, setUserScore] = React.useState(0);
    const profileRef = React.useRef(null);
    const editInputRef = React.useRef(null);

    React.useEffect(() => {
        if (theme === 'light') {
            document.documentElement.classList.add('light-theme');
        } else {
            document.documentElement.classList.remove('light-theme');
        }
        localStorage.setItem('appTheme', theme);
    }, [theme]);

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
    };

    const getAvatarUrl = (gender) => {
        const seed = gender === 'female' ? 'female_avatar' : 'male_avatar';
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    };

    React.useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                let name = user.displayName;
                if (!name) {
                    try {
                        const docRef = doc(db, 'users', user.uid);
                        const docSnap = await getDoc(docRef);
                        if (docSnap.exists()) {
                            name = docSnap.data().fullName || '';
                        }
                    } catch (e) {
                        console.error('Failed to fetch user profile:', e);
                    }
                }
                setUserName(name || user.email || 'Visitor');
                setEditNameValue(name || user.email || 'Visitor');

                // Fetch user game progress
                try {
                    const progress = await getUserProgress(user.uid);
                    setUserLevel(typeof progress.level === 'number' ? progress.level : 1);
                    setUserScore(progress.totalScore || 0);
                } catch (error) {
                    console.error('Failed to fetch user progress:', error);
                }
            }
        });
        return unsubscribe;
    }, []);

    // listen for manual resets or external progress updates
    React.useEffect(() => {
        const handleProgressUpdate = (e) => {
            const progress = e.detail;
            setUserLevel(typeof progress.level === 'number' ? progress.level : 1);
            setUserScore(progress.totalScore || 0);
        };
        window.addEventListener('progressUpdated', handleProgressUpdate);
        return () => {
            window.removeEventListener('progressUpdated', handleProgressUpdate);
        };
    }, []);

    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (isProfileOpen && profileRef.current && !profileRef.current.contains(e.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isProfileOpen]);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleAvatarGenderChange = () => {
        const newGender = avatarGender === 'male' ? 'female' : 'male';
        localStorage.setItem('userAvatarGender', newGender);
        setAvatarGender(newGender);
    };

    const handleSaveName = async () => {
        const user = auth.currentUser;
        if (!user || !editNameValue.trim()) return;

        try {
            await updateProfile(user, { displayName: editNameValue.trim() });
            await updateDoc(doc(db, 'users', user.uid), {
                fullName: editNameValue.trim()
            });
            setUserName(editNameValue.trim());
            setIsEditingName(false);
        } catch (error) {
            console.error('Error updating name:', error);
        }
    };

    React.useEffect(() => {
        if (location.hash) {
            const element = document.querySelector(location.hash);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [location]);

    React.useEffect(() => {
        if (isEditingName && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [isEditingName]);

    const goHome = () => {
        navigate('/home'); // remove #about or #contact

        setTimeout(() => {
            window.scrollTo({ top: 1, behavior: 'smooth' });
        }, 50);
    };

    const navClass = (path, hash = '') => {
        if (hash) {
            return location.pathname === path && location.hash === hash
                ? 'nav-link active'
                : 'nav-link';
        }

        // Treat /explore and /explore/:id as the same top-level section.
        if (path === '/explore') {
            return location.pathname.startsWith('/explore') && !location.hash
                ? 'nav-link active'
                : 'nav-link';
        }

        return location.pathname === path && !location.hash
            ? 'nav-link active'
            : 'nav-link';
    };

    return (
        <nav className="home-navbar glass">
            <div className="nav-left">
                <div className="nav-logo" onClick={goHome} style={{ cursor: 'pointer' }}>
                    <Sparkles className="logo-sparkle" />
                    <span>MuseoQuest</span>
                </div>
            </div>

            <div className="nav-center">
                <div className={navClass('/home')} onClick={goHome}>Home</div>
                <div className={navClass('/explore')} onClick={() => {
                    navigate('/explore');
                    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
                }}>Explore</div>
                <div className={navClass('/play')} onClick={() => navigate('/play')}>Play</div>
                <div className={navClass('/home', '#about')} onClick={() => navigate('/home#about')}>About</div>
                <div className={navClass('/home', '#contact')} onClick={() => navigate('/home#contact')}>Contact</div>
            </div>

            <div className="nav-right">
                <div className="profile-container" ref={profileRef} onClick={() => setIsProfileOpen(!isProfileOpen)}>
                    <div className="profile-info">
                        <span className="profile-name">{userName}</span>
                        <div className="profile-rank">
                            <span className="rank-level">Lv. {userLevel}</span>
                            <div className="mini-xp-bar">
                                <div className="mini-xp-fill" style={{ width: `${Math.min((userLevel / 5) * 100, 100)}%` }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="profile-avatar-circle">
                        <img
                            src={getAvatarUrl(avatarGender)}
                            alt="Profile"
                        />
                    </div>
                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                className="profile-dropdown-card glass"
                                onClick={(e) => e.stopPropagation()}
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                                <div className="dropdown-greeting">
                                    <div className="greeting-text">Hi {userName}</div>
                                </div>
                                <div className="dropdown-profile-section">
                                    <div
                                        className="dropdown-profile-picture"
                                        onClick={handleAvatarGenderChange}
                                        title="Click to change avatar"
                                    >
                                        <img
                                            src={getAvatarUrl(avatarGender)}
                                            alt="Profile"
                                        />
                                        <div className="profile-picture-overlay">Change</div>
                                    </div>
                                </div>
                                <div className="profile-name-section">
                                    {isEditingName ? (
                                        <div className="name-edit-group">
                                            <input
                                                ref={editInputRef}
                                                type="text"
                                                value={editNameValue}
                                                onChange={(e) => setEditNameValue(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveName();
                                                    if (e.key === 'Escape') setIsEditingName(false);
                                                }}
                                                className="name-input"
                                            />
                                            <button
                                                className="name-save-btn"
                                                onClick={handleSaveName}
                                            >
                                                Save
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="name-display">
                                            <span className="display-name">{userName}</span>
                                            <button
                                                className="name-edit-btn"
                                                onClick={() => setIsEditingName(true)}
                                                title="Edit Name"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="dropdown-divider"></div>
                                <div className="theme-selector-modern">
                                    <span className="theme-label">Theme</span>
                                    <div className="theme-options">
                                        <button
                                            className={`theme-icon-btn ${theme === 'dark' ? 'active' : ''}`}
                                            onClick={() => handleThemeChange('dark')}
                                            title="Dark Mode"
                                        >
                                            <Moon size={16} />
                                        </button>
                                        <button
                                            className={`theme-icon-btn ${theme === 'light' ? 'active' : ''}`}
                                            onClick={() => handleThemeChange('light')}
                                            title="Light Mode"
                                        >
                                            <Sun size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="dropdown-divider"></div>
                                <div className="dropdown-action-item danger" onClick={handleLogout}>
                                    <LogOut size={16} /> <span>Logout</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
                <div className="mobile-nav-links">
                    <div className={location.pathname === '/home' ? 'mobile-nav-link active' : 'mobile-nav-link'} onClick={() => { goHome(); setIsMenuOpen(false); }}>
                        Home
                    </div>
                    <div className={location.pathname === '/explore' ? 'mobile-nav-link active' : 'mobile-nav-link'} onClick={() => { navigate('/explore'); setIsMenuOpen(false); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50); }}>
                        Explore
                    </div>
                    <div className={location.pathname === '/play' ? 'mobile-nav-link active' : 'mobile-nav-link'} onClick={() => { navigate('/play'); setIsMenuOpen(false); }}>Play</div>
                    <div className="mobile-nav-link" onClick={() => { navigate('/home#about'); setIsMenuOpen(false); }}>
                        About
                    </div>
                    <div className="mobile-nav-link" onClick={() => { navigate('/home#contact'); setIsMenuOpen(false); }}>
                        Contact
                    </div>
                    <div className="mobile-nav-link logout" onClick={handleLogout}>
                        Logout
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
