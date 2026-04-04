import { BookOpen, LogOut, Mail, MessageSquare, Reply, User, Moon, Sun, Users, Trash2, CheckCircle2 } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './AdminDashboard.css';
import { auth, db, storage } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, getDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Footer from '../../components/Footer/Footer';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = React.useState([]);
    const [loggedInUsers, setLoggedInUsers] = React.useState([]);
    const [adminName, setAdminName] = React.useState('Admin');
    const [adminProfileImage, setAdminProfileImage] = React.useState(null);
    const [theme, setTheme] = React.useState(() => localStorage.getItem('appTheme') || 'dark');
    const [avatarGender, setAvatarGender] = React.useState(() => localStorage.getItem('userAvatarGender') || 'male');
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const profileRef = React.useRef(null);
    const fileInputRef = React.useRef(null);
    const messagesSectionRef = React.useRef(null);
    const loggedInUsersSectionRef = React.useRef(null);
    const rewardsSectionRef = React.useRef(null);

    React.useEffect(() => {
        const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snap) => {
            const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
        });
        return unsub;
    }, []);

    React.useEffect(() => {
        const q = query(collection(db, 'users'));
        const unsub = onSnapshot(q, async (snap) => {
            try {
                const usersWithRewards = await Promise.all(
                    snap.docs.map(async (userDoc) => {
                        const userData = userDoc.data();
                        const progressRef = doc(db, 'users', userDoc.id, 'gameProgress', 'stats');
                        const progressSnap = await getDoc(progressRef);
                        const progressData = progressSnap.exists() ? progressSnap.data() : {};

                        return {
                            id: userDoc.id,
                            ...userData,
                            rewardReference: progressData.rewardReference || null,
                            rewardClaimed: progressData.rewardClaimed || false,
                            rewardRedeemed: progressData.rewardRedeemed || false,
                            claimedAt: progressData.claimedAt || null,
                            rewardRedeemedAt: progressData.rewardRedeemedAt || null
                        };
                    })
                );

                const users = usersWithRewards.filter((user) => user.fullName); // Only show users with names
                setLoggedInUsers(users);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        });

        return unsub;
    }, []);

    React.useEffect(() => {
        const fetchAdminInfo = async () => {
            const user = auth.currentUser;
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    setAdminName(userData.fullName || user.displayName || 'Admin');
                    if (userData.profileImage) {
                        setAdminProfileImage(userData.profileImage);
                    }
                }
            }
        };
        fetchAdminInfo();
    }, []);

    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setIsProfileOpen(false);
            }
        };
        if (isProfileOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isProfileOpen]);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('appTheme', newTheme);
        if (newTheme === 'light') {
            document.documentElement.classList.add('light-theme');
        } else {
            document.documentElement.classList.remove('light-theme');
        }
    };

    const toggleAvatarGender = () => {
        const newGender = avatarGender === 'male' ? 'female' : 'male';
        setAvatarGender(newGender);
        localStorage.setItem('userAvatarGender', newGender);
        // Don't close the dropdown after changing avatar
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (window.confirm(`Are you sure you want to remove ${userName}? This action cannot be undone.`)) {
            try {
                await deleteDoc(doc(db, 'users', userId));
                console.log(`User ${userName} deleted successfully`);
            } catch (error) {
                console.error('Failed to delete user:', error);
                alert('Failed to delete user. Please try again.');
            }
        }
    };

    const handleReplyToMessage = async (msg) => {
        try {
            const messageRef = doc(db, 'messages', msg.id);
            await updateDoc(messageRef, {
                isRead: true,
                readAt: serverTimestamp(),
                readBy: auth.currentUser?.uid || null
            });
        } catch (error) {
            console.error('Failed to mark message as read:', error);
        }

        window.location.href = `mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject || ''}`)}&body=${encodeURIComponent(`\n\n--- Original Message from ${msg.name} ---\n${msg.message}`)}`;
    };

    const handleMarkRewardClaimed = async (userId, userName, referenceNumber) => {
        if (!referenceNumber) return;

        const isConfirmed = window.confirm(
            `Mark reward ${referenceNumber} as claimed by ${userName}?`
        );
        if (!isConfirmed) return;

        try {
            const statsRef = doc(db, 'users', userId, 'gameProgress', 'stats');
            await updateDoc(statsRef, {
                rewardRedeemed: true,
                rewardRedeemedAt: new Date(),
                rewardRedeemedBy: auth.currentUser?.uid || null
            });
        } catch (error) {
            console.error('Failed to mark reward as claimed:', error);
            alert('Failed to mark reward as claimed. Please try again.');
        }
    };

    const handleProfileImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user) return;

            // Upload image to Firebase Storage
            const storageRef = ref(storage, `admins/${user.uid}/profile-picture`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            // Save image URL to Firestore
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                profileImage: downloadURL
            });

            setAdminProfileImage(downloadURL);
            console.log('Profile image uploaded successfully');
        } catch (error) {
            console.error('Failed to upload profile image:', error);
            alert('Failed to upload profile image. Please try again.');
        }
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100, damping: 15 }
        }
    };

    const rewardUsers = loggedInUsers.filter((user) => user.rewardReference);

    const scrollToLoggedInUsers = () => {
        loggedInUsersSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const scrollToMessages = () => {
        messagesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const scrollToRewards = () => {
        rewardsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="admin-container">
            {/* Top Bar / Navbar for Admin */}
            <header className="admin-header glass">
                <div className="admin-brand">
                    <h2>Museo<span className="text-highlight">Admin</span></h2>
                </div>
                <div className="admin-nav">
                    <button className="nav-btn" onClick={() => navigate('/home')}>
                        <BookOpen size={18} /> View Site
                    </button>
                    <div className="admin-profile-icon-wrapper" ref={profileRef}>
                        <div 
                            className="admin-profile-icon" 
                            title={adminName}
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                        >
                            <div 
                                className="header-avatar"
                                style={{
                                    backgroundImage: adminProfileImage 
                                        ? `url('${adminProfileImage}')`
                                        : `url('https://api.dicebear.com/7.x/${avatarGender}_avatar/svg?seed=${adminName}')`
                                }}
                            >
                            </div>
                        </div>
                        {isProfileOpen && (
                            <motion.div 
                                className="profile-dropdown-header"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="dropdown-greeting">
                                    <h4>Hi {adminName}</h4>
                                </div>
                                <div className="dropdown-profile-section">
                                    <div 
                                        className="dropdown-profile-picture"
                                        style={{
                                            backgroundImage: adminProfileImage 
                                                ? `url('${adminProfileImage}')`
                                                : `url('https://api.dicebear.com/7.x/${avatarGender}_avatar/svg?seed=${adminName}')`
                                        }}
                                        onClick={() => fileInputRef.current?.click()}
                                        title="Click to upload profile picture"
                                    >
                                        <div className="profile-picture-overlay">Upload</div>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleProfileImageUpload}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                <div className="dropdown-divider"></div>
                                <div className="theme-selector">
                                    <button 
                                        className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                                        onClick={toggleTheme}
                                        title="Dark Mode"
                                    >
                                        <Moon size={16} /> Dark
                                    </button>
                                    <button 
                                        className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                                        onClick={toggleTheme}
                                        title="Light Mode"
                                    >
                                        <Sun size={16} /> Light
                                    </button>
                                </div>
                                <div className="dropdown-divider"></div>
                                <button className="logout-dropdown-btn" onClick={handleLogout}>
                                    <LogOut size={16} /> Logout
                                </button>
                            </motion.div>
                        )}
                    </div>
                    <button className="nav-btn logout" onClick={handleLogout}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </header>

            <main className="admin-main">
                {/* Stats Section */}
                <motion.div
                    className="admin-stats"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                <motion.div
                        className="stat-card glass clickable-stat-card"
                        variants={itemVariants}
                        onClick={scrollToLoggedInUsers}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                scrollToLoggedInUsers();
                            }
                        }}
                    >
                        <div className="stat-icon-wrapper">
                            <Users size={24} />
                        </div>
                        <div className="stat-info">
                            <h3>Active Users</h3>
                            <p className="stat-number">{loggedInUsers.length}</p>
                        </div>
                    </motion.div>
                    <motion.div
                        className="stat-card glass clickable-stat-card"
                        variants={itemVariants}
                        onClick={scrollToRewards}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                scrollToRewards();
                            }
                        }}
                    >
                        <div className="stat-icon-wrapper">
                            <CheckCircle2 size={24} />
                        </div>
                        <div className="stat-info">
                            <h3>Generated Rewards</h3>
                            <p className="stat-number">{rewardUsers.length}</p>
                        </div>
                    </motion.div>
                    <motion.div
                        className="stat-card glass clickable-stat-card"
                        variants={itemVariants}
                        onClick={scrollToMessages}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                scrollToMessages();
                            }
                        }}
                    >
                        <div className="stat-icon-wrapper">
                            <MessageSquare size={24} />
                        </div>
                        <div className="stat-info">
                            <h3>Total Messages</h3>
                            <p className="stat-number">{messages.length}</p>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Messages Section */}
                <motion.section
                    ref={messagesSectionRef}
                    className="admin-content-section"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <div className="section-heading">
                        <h3>Visitor Messages</h3>
                        <p>Manage and reply to inquiries from your visitors.</p>
                    </div>

                    <div className="table-glass-wrapper glass">
                        <div className="table-responsive">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>Sender</th>
                                        <th>Subject</th>
                                        <th>Message</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th className="text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {messages.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="empty-state">No messages yet.</td>
                                        </tr>
                                    ) : (
                                        messages.map(msg => (
                                            <tr key={msg.id} className={`glass-hover ${msg.isRead ? '' : 'unread-row'}`}>
                                                <td>
                                                    <div className="sender-info">
                                                        <div className="sender-avatar">
                                                            <User size={16} />
                                                        </div>
                                                        <div>
                                                            <div className="sender-name">{msg.name}</div>
                                                            <div className="sender-email">{msg.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="msg-subject">{msg.subject}</td>
                                                <td className="msg-preview">
                                                    <div className="msg-text-clamp">{msg.message}</div>
                                                </td>
                                                <td>
                                                    <span className={`msg-status-pill ${msg.isRead ? 'read' : 'unread'}`}>
                                                        {msg.isRead ? 'Read' : 'Unread'}
                                                    </span>
                                                </td>
                                                <td className="msg-date">
                                                    {msg.createdAt?.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td className="text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleReplyToMessage(msg)}
                                                        className="reply-action-btn"
                                                        title="Reply to message"
                                                    >
                                                        <Reply size={16} />
                                                        <span>Reply</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.section>

                {/* Logged In Users Section */}
                <motion.section
                    ref={loggedInUsersSectionRef}
                    className="admin-content-section"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <div className="section-heading">
                        <h3>Logged In Users</h3>
                        <p>View all registered users in the system.</p>
                    </div>

                    <div className="table-glass-wrapper glass">
                        <div className="table-responsive">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Account Created</th>
                                        <th className="text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loggedInUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="empty-state">No users found.</td>
                                        </tr>
                                    ) : (
                                        loggedInUsers.map(user => (
                                            <tr key={user.id} className="glass-hover">
                                                <td>
                                                    <div className="sender-info">
                                                        <div className="sender-avatar">
                                                            <User size={16} />
                                                        </div>
                                                        <div>
                                                            <div className="sender-name">{user.fullName}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="msg-subject">{user.email}</td>
                                                <td className="msg-subject">{user.role || 'visitor'}</td>
                                                <td className="msg-date">
                                                    {user.createdAt?.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) || 'N/A'}
                                                </td>
                                                <td className="text-right">
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id, user.fullName)}
                                                        className="delete-action-btn"
                                                        title="Delete user"
                                                    >
                                                        <Trash2 size={16} />
                                                        <span>Remove</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    ref={rewardsSectionRef}
                    className="admin-content-section"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                >
                    <div className="section-heading">
                        <h3>Reward Reference Claims</h3>
                        <p>Verify visitor reference numbers and mark rewards as claimed at the counter.</p>
                    </div>

                    <div className="table-glass-wrapper glass">
                        <div className="table-responsive">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>Visitor</th>
                                        <th>Email</th>
                                        <th>Reference Number</th>
                                        <th>Ticket Generated</th>
                                        <th>Status</th>
                                        <th className="text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rewardUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="empty-state">No reward references yet.</td>
                                        </tr>
                                    ) : (
                                        rewardUsers.map((user) => (
                                            <tr key={`${user.id}-reward`} className="glass-hover">
                                                <td>
                                                    <div className="sender-info">
                                                        <div className="sender-avatar">
                                                            <User size={16} />
                                                        </div>
                                                        <div>
                                                            <div className="sender-name">{user.fullName}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="msg-subject">{user.email}</td>
                                                <td>
                                                    <span className="reward-ref">{user.rewardReference}</span>
                                                </td>
                                                <td className="msg-date">
                                                    {user.claimedAt?.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) || 'N/A'}
                                                </td>
                                                <td>
                                                    <span className={`claim-status-pill ${user.rewardRedeemed ? 'redeemed' : 'pending'}`}>
                                                        {user.rewardRedeemed ? 'Claimed' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="text-right">
                                                    <button
                                                        className="claim-action-btn"
                                                        onClick={() => handleMarkRewardClaimed(user.id, user.fullName, user.rewardReference)}
                                                        disabled={user.rewardRedeemed}
                                                        title={user.rewardRedeemed ? 'Reward already claimed' : 'Mark reward as claimed'}
                                                    >
                                                        <CheckCircle2 size={16} />
                                                        <span>{user.rewardRedeemed ? 'Claimed' : 'Mark Claimed'}</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.section>
            </main>
            <Footer />
            {/* Background Effects */}
            <div className="bg-blob admin-blob-1"></div>
        </div>
    );
};

export default AdminDashboard;
