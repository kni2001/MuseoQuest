import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, LogIn, Sparkles, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import './AuthLayout.css'
import { auth, db } from '../../lib/firebase'
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

const LoginPage = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const user = userCredential.user

            // Fetch user role from Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid))

            if (userDoc.exists()) {
                const userData = userDoc.data()
                if (userData.role === 'visitor') {
                    setSuccess('Welcome back to MuseoQuest! Access granted.')
                    console.log('Visitor logged in successfully!')
                    setTimeout(() => navigate('/home'), 1500)
                } else if (userData.role === 'admin') {
                    setSuccess('Welcome Admin. System access granted.')
                    console.log('Admin logged in successfully!')
                    setTimeout(() => navigate('/admin'), 1500)
                } else {
                    setSuccess('Welcome back! Access granted.')
                    setTimeout(() => navigate('/home'), 1500)
                }
            } else {
                setSuccess('Welcome back! Profile verified.')
                setTimeout(() => navigate('/home'), 1500)
            }
        } catch (err) {
            console.error('Error during login:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setLoading(true)
        setError('')
        try {
            const provider = new GoogleAuthProvider()
            const result = await signInWithPopup(auth, provider)
            const user = result.user

            const userDoc = await getDoc(doc(db, "users", user.uid))
            if (userDoc.exists()) {
                const userData = userDoc.data()
                if (userData.role === 'admin') {
                    setSuccess('Admin sign in via Google. Access granted.')
                    setTimeout(() => navigate('/admin'), 1500)
                } else {
                    setSuccess('Welcome back! Signed in with Google.')
                    setTimeout(() => navigate('/home'), 1500)
                }
            } else {
                // If the user doesn't exist in Firestore, create default profile
                await setDoc(doc(db, "users", user.uid), {
                    fullName: user.displayName || 'Visitor',
                    email: user.email,
                    role: 'visitor',
                    xp: 0,
                    level: 1,
                    createdAt: serverTimestamp()
                })
                setSuccess('Account created via Google! Access granted.')
                setTimeout(() => navigate('/home'), 1500)
            }
        } catch (err) {
            console.error('Error with Google sign in:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>

            <div className="auth-card glass">
                <div className="auth-header">
                    <h1 className="auth-logo">
                        <Sparkles className="logo-icon" size={32} />
                        MuseoQuest
                    </h1>
                    <p className="auth-subtitle">Welcome back! Please login to your account.</p>
                </div>

                {error && <div className="error-message glass">{error}</div>}
                {success && (
                    <div className="success-message glass">
                        <CheckCircle2 size={18} />
                        {success}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="input-label">Email Address</label>
                        <div className="input-wrapper">
    <Mail className="input-icon" size={20} /> 
    <input
        type="email"
        className="auth-input"
        placeholder="name@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
    />
</div>
                    </div>

                    <div className="form-group">
                        <label className="input-label">Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                className="auth-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <LogIn size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                Login Now
                            </>
                        )}
                    </button>

                    <div className="auth-divider">
                        <span>OR</span>
                    </div>

                    <button 
                        type="button" 
                        className="social-button google-button" 
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                    >
                        <svg className="google-icon" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Sign in with Google
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account?
                    <Link to="/signup" className="auth-link">Sign Up</Link>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
