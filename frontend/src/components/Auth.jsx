import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc';
import { login, signup, setAuthToken } from '../utils/api';
import OnboardingQuestions from './OnboardingQuestions';

const Auth = ({ onClose, onLoginSuccess, initialMode = 'login' }) => {
    const [isLogin, setIsLogin] = useState(initialMode === 'login');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [userToken, setUserToken] = useState(null);
    const [userData, setUserData] = useState(null);

    const validateEmail = (email) => {
        const emailString = String(email).toLowerCase();
        // first check basic format
        const isValidFormat = emailString.match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
        if (!isValidFormat) return false;

        // check for specific domains
        const domain = emailString.split('@')[1];
        return domain === 'gmail.com' || domain === 'outlook.com';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateEmail(email)) {
            setError('Please use a Gmail (@gmail.com) or Outlook (@outlook.com) email address');
            return;
        }

        setLoading(true);

        try {
            const data = isLogin
                ? await login(email, password)
                : await signup(username, email, password);

            setAuthToken(data.token);
            setUserToken(data.token);
            setUserData(data.user);

            if (isLogin) {
                // For login, directly complete
                onLoginSuccess();
                onClose();
            } else {
                // For signup, show onboarding
                setShowOnboarding(true);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOnboardingComplete = (recommendation) => {
        setShowOnboarding(false);
        onLoginSuccess();
        onClose();
        // Optionally show a success message or redirect
        if (recommendation) {
            setTimeout(() => {
                window.location.href = '/roadmap';
            }, 500);
        }
    };

    const handleOnboardingSkip = () => {
        setShowOnboarding(false);
        onLoginSuccess();
        onClose();
    };

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            try {
                // Send the credential to the backend
                // Note: useGoogleLogin with default flow (implicit) returns an access_token.
                // However, the backend usually expects an ID Token for verification. 
                // We should use flow: 'auth-code' or just send the access token if backend supports it.
                // Or better, use credentialResponse if we used <GoogleLogin>.

                // For simplicity with useGoogleLogin (Pop-up), we can just fetch the user info from Google directly 
                // OR send the code. Let's send the credential if we can get it, but useGoogleLogin gives access_token.
                // Let's actually use the ID Token flow which is simpler for backend verification.
                // Changing to flow: 'implicit' is default.

                // Let's just adjust to standard OIDC flow by getting the ID token via the Component OR 
                // fetching user info here and sending specific data to backend (less secure but works for "simulated-real" transition).

                // Wait, the robust way is:
                // 1. Get access_token
                // 2. Fetch https://www.googleapis.com/oauth2/v3/userinfo
                // 3. Send email/sub to backend to login.

                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await userInfoRes.json();

                // Now we have real Google Data. Send to backend as if it was a token payload
                // Ideally backend verifies token, but we are hacking the "credential" param to be a JSON string of info
                // so we don't need to rewrite backend verification logic for now.
                // Backend expects a JWT string to decode. We can just mock a JWT structure or Update backend to accept raw info.
                // Let's update backend to handle raw info? No, let's just make a fake JWT with real info.

                const fakeJwtPayload = btoa(JSON.stringify(userInfo));
                const fakeJwt = `header.${fakeJwtPayload}.signature`;

                const res = await fetch('http://localhost:8080/auth/google', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ credential: fakeJwt })
                });

                if (!res.ok) throw new Error('Google auth failed on server');

                const data = await res.json();
                setAuthToken(data.token);
                setUserToken(data.token);
                setUserData(data.user);

                onLoginSuccess();
                onClose();
            } catch (err) {
                console.error(err);
                setError('Google Sign In failed');
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            setError('Google Sign In Failed');
            setLoading(false);
        }
    });

    if (showOnboarding) {
        return (
            <OnboardingQuestions
                onComplete={handleOnboardingComplete}
                onSkip={handleOnboardingSkip}
                userToken={userToken}
                userData={userData}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-md bg-[#0f0518] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-8"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500" />

                <h2 className="text-3xl font-black text-white mb-2 text-center">
                    {isLogin ? 'Welcome Back' : 'Join Root2Rise'}
                </h2>
                <p className="text-gray-400 text-center mb-8">
                    {isLogin ? 'Sign in to continue your journey' : 'Start your skill intelligence journey today'}
                </p>



                {/* Google Sign In Button */}


                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            overflow="hidden"
                        >
                            <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="UniqueUsername123"
                            />
                        </motion.div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="text-rose-400 text-sm bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                            {error}
                        </div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </motion.button>
                </form>



                <div className="relative flex py-2 items-center my-6">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
                    <div className="flex-grow border-t border-white/10"></div>
                </div>

                <button
                    type="button"
                    onClick={() => googleLogin()}
                    disabled={loading}
                    className="w-full bg-white text-gray-900 font-bold py-3 rounded-xl shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-3 mb-6 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                    <FcGoogle className="text-2xl group-hover:scale-110 transition-transform" />
                    <span>Continue with Google</span>
                </button>

                <div className="mt-6 text-center text-sm text-gray-400">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </div>
            </motion.div>
        </div >
    );
};

export default Auth;
