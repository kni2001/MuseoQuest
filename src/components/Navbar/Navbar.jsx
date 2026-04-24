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
    Check,
    User,
    Upload,
    Eye,
    Camera
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
    const [userPhoto, setUserPhoto] = React.useState(null);
    const [showPhotoModal, setShowPhotoModal] = React.useState(false);
    const [showCamera, setShowCamera] = React.useState(false);
    const [showNoPhotoToast, setShowNoPhotoToast] = React.useState(false);
    const noPhotoToastTimeoutRef = React.useRef(null);
    const profileRef = React.useRef(null);
    const editInputRef = React.useRef(null);
    const fileInputRef = React.useRef(null);
    const videoRef = React.useRef(null);
    const canvasRef = React.useRef(null);

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
                let profileImg = null;
                try {
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        name = name || data.fullName || '';
                        
                        if (data.profileImage) {
                            profileImg = data.profileImage;
                        }
                    }
                } catch (e) {
                    console.error('Failed to fetch user profile:', e);
                }
                
                setUserName(name || user.email || 'Visitor');
                setEditNameValue(name || user.email || 'Visitor');
                
                if (profileImg) {
                    setUserPhoto(profileImg);
                    localStorage.setItem('userProfilePhoto', profileImg);
                }

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

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUserPhoto(event.target.result);
                localStorage.setItem('userProfilePhoto', event.target.result);
                setShowPhotoModal(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCameraStart = () => {
        setShowCamera(true);
        setTimeout(() => {
            if (videoRef.current) {
                navigator.mediaDevices
                    .getUserMedia({ video: { facingMode: 'user' } })
                    .then((stream) => {
                        videoRef.current.srcObject = stream;
                        videoRef.current.play();
                    })
                    .catch((error) => {
                        console.error('Error accessing camera:', error);
                        alert('Unable to access camera');
                    });
            }
        }, 100);
    };

    const handleTakePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0);

            const photoData = canvasRef.current.toDataURL('image/jpeg');
            setUserPhoto(photoData);
            localStorage.setItem('userProfilePhoto', photoData);

            // Stop camera stream
            if (videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach((track) => {
                    track.stop();
                });
            }

            setShowCamera(false);
            setShowPhotoModal(false);
        }
    };

    const handleViewPhoto = () => {
        if (userPhoto) {
            setShowPhotoModal(true);
        } else {
            setShowNoPhotoToast(true);
            if (noPhotoToastTimeoutRef.current) {
                window.clearTimeout(noPhotoToastTimeoutRef.current);
            }
            noPhotoToastTimeoutRef.current = window.setTimeout(() => {
                setShowNoPhotoToast(false);
            }, 2000);
        }
    };

    const handleRemovePhoto = () => {
        setUserPhoto(null);
        localStorage.removeItem('userProfilePhoto');
    };

    const handleAddPhoto = () => {
        fileInputRef.current?.click();
    };

    const handleCameraCancel = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach((track) => {
                track.stop();
            });
        }
        setShowCamera(false);
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

    React.useEffect(() => {
        const savedPhoto = localStorage.getItem('userProfilePhoto');
        if (savedPhoto) {
            setUserPhoto(savedPhoto);
        }
    }, []);

    React.useEffect(() => {
        return () => {
            if (noPhotoToastTimeoutRef.current) {
                window.clearTimeout(noPhotoToastTimeoutRef.current);
            }
        };
    }, []);

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
                    <div className="profile-avatar-circle">
                        {userPhoto ? (
                            <img src={userPhoto} alt="User Icon" />
                        ) : (
                            <User size={18} className="profile-default-icon" />
                        )}
                    </div>
                    <div className="profile-info">
                        <span className="profile-name">{userName}</span>
                        <div className="profile-rank">
                            <span className="rank-level">Lv. {userLevel}</span>
                            <div className="mini-xp-bar">
                                <div className="mini-xp-fill" style={{ width: `${Math.min((userLevel / 5) * 100, 100)}%` }}></div>
                            </div>
                        </div>
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
                                    <div className="dropdown-profile-picture" onClick={handleViewPhoto}>
                                        {userPhoto ? (
                                            <img src={userPhoto} alt="Profile" />
                                        ) : (
                                            <div className="default-profile-icon">
                                                <User size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="profile-actions-menu">
                                        <button
                                            className="profile-action-btn"
                                            onClick={handleAddPhoto}
                                        >
                                            <Upload size={16} />
                                            <span>Add Photo</span>
                                        </button>
                                        <button
                                            className="profile-action-btn"
                                            onClick={handleCameraStart}
                                        >
                                            <Camera size={16} />
                                            <span>Take Photo</span>
                                        </button>
                                        <button
                                            className="profile-action-btn"
                                            onClick={handleViewPhoto}
                                        >
                                            <Eye size={16} />
                                            <span>View Photo</span>
                                        </button>
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

            <AnimatePresence>
                {showNoPhotoToast && (
                    <motion.div
                        className="no-photo-toast"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        No profile photo yet.
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Camera Modal */}
            <AnimatePresence>
                {showCamera && (
                    <motion.div
                        className="camera-modal-overlay"
                        onClick={handleCameraCancel}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="camera-modal"
                            onClick={(e) => e.stopPropagation()}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <div className="camera-header">
                                <h3>Take a Photo</h3>
                                <button
                                    className="camera-close-btn"
                                    onClick={handleCameraCancel}
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <video
                                ref={videoRef}
                                className="camera-video"
                                playsInline
                            ></video>
                            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                            <div className="camera-actions">
                                <button
                                    className="camera-btn cancel-btn"
                                    onClick={handleCameraCancel}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="camera-btn capture-btn"
                                    onClick={handleTakePhoto}
                                >
                                    <Camera size={20} />
                                    Capture
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Photo View Modal */}
            <AnimatePresence>
                {showPhotoModal && (
                    <motion.div
                        className="photo-modal-overlay"
                        onClick={() => {
                            setShowPhotoModal(false);
                            setShowNoPhotoToast(false);
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="photo-modal"
                            onClick={(e) => e.stopPropagation()}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <div className="photo-modal-header">
                                <h3>Profile Photo</h3>
                                <button
                                    className="photo-modal-close-btn"
                                    onClick={() => {
                                        setShowPhotoModal(false);
                                        setShowNoPhotoToast(false);
                                    }}
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            {userPhoto ? (
                                <>
                                    <img
                                        src={userPhoto}
                                        alt="Profile"
                                        className="photo-modal-image"
                                    />
                                    <div className="photo-modal-actions">
                                        <button
                                            className="photo-modal-btn remove-btn"
                                            onClick={handleRemovePhoto}
                                        >
                                            Remove Photo
                                        </button>
                                        <button
                                            className="photo-modal-btn close-btn"
                                            onClick={() => {
                                                setShowPhotoModal(false);
                                            }}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </>
                            ) : null}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
                onClick={(e) => { e.target.value = null; }}
            />
        </nav>
    );
};

export default Navbar;
