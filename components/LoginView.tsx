
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Check, X } from 'lucide-react';
import bcrypt from 'bcryptjs';
import sql from '../db';

interface LoginViewProps {
    onSuccess: (user: any) => void;
    onClose?: () => void; // Optional, for web modal
    isModal?: boolean;
}

const LoginView: React.FC<LoginViewProps> = ({ onSuccess, onClose, isModal = false }) => {
    const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [selectedPlan, setSelectedPlan] = useState('Disciple');
    const [isLoading, setIsLoading] = useState(false);

    const handleAuthSubmit = async () => {
        if (!email || !password) {
            alert("Email and Secret Code are required.");
            return;
        }

        if (authMode === 'register' && !name) {
            alert("Identify yourself first, seeker.");
            return;
        }

        setIsLoading(true);

        try {
            if (authMode === 'register') {
                // Check if user exists
                const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
                if (existing.length > 0) {
                    alert("This email is already archived. Log in instead.");
                    setIsLoading(false);
                    return;
                }

                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(password, salt);
                const uid = crypto.randomUUID();

                await sql`
                    INSERT INTO users (uid, name, email, password_hash, plan, auth_method)
                    VALUES (${uid}, ${name}, ${email}, ${hash}, ${selectedPlan}, 'email')
                `;

                onSuccess({ uid, name, plan: selectedPlan, identity: '', mission: '', avatar: null });
            } else {
                const users = await sql`SELECT * FROM users WHERE email = ${email}`;
                if (users.length === 0) {
                    alert("No record found. Establish a profile first.");
                    setIsLoading(false);
                    return;
                }

                const user = users[0];
                const isMatch = bcrypt.compareSync(password, user.password_hash);

                if (!isMatch) {
                    alert("Incorrect cipher key.");
                    setIsLoading(false);
                    return;
                }

                // Update last login
                await sql`UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE uid = ${user.uid}`;

                onSuccess(user);
            }

        } catch (error: any) {
            console.error("Auth Error:", error);
            alert("Authentication failed: " + (error.message || "Unknown error"));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        alert("Google Access is currently under transition. Please use Email Protocol.");
    };

    const plans = [
        { name: 'Disciple', price: 'Free', features: ['Core Protocols', '7-Day History'] },
        { name: 'Architect', price: '$9/mo', features: ['Full History', 'AI Audits', 'Cloud Sync'] },
        { name: 'Sage', price: '$29/mo', features: ['Mentor Mode', 'API Access', 'White Glove'] }
    ];

    return (
        <div className={`bg-white w-full ${isModal ? 'max-w-md rounded-[3rem] shadow-2xl relative border border-white/50' : 'h-full flex flex-col justify-center items-center'}`}>
            {isModal && onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-3 text-slate-300 hover:text-slate-900 transition-colors z-10 hover:bg-slate-50 rounded-full"
                >
                    <X size={24} />
                </button>
            )}

            <div className={`space-y-10 ${isModal ? 'p-10 md:p-14' : 'w-full max-w-md p-8'}`}>
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-indigo-200">
                        <Command size={32} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                        {authMode === 'register' ? 'Begin the Archive' : 'Return to Focus'}
                    </h3>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">
                        {authMode === 'register' ? 'Claim Your Sovereignty' : 'Welcome back, Architect'}
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-[1.5rem] font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3 relative overflow-hidden"
                    >
                        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                        {isLoading ? "Connecting..." : "Continue with Google"}
                    </button>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-slate-100"></div>
                        <span className="flex-shrink-0 mx-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">Or via Email</span>
                        <div className="flex-grow border-t border-slate-100"></div>
                    </div>

                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                            {authMode === 'register' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <input
                                        type="text"
                                        placeholder="Public Identity (Name)"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.2rem] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-sm transition-all mb-3"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <input
                            type="email"
                            placeholder="Email Coordinates"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.2rem] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-sm transition-all"
                        />
                        <input
                            type="password"
                            placeholder="Secret Cipher"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.2rem] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-sm transition-all"
                        />
                    </div>

                    {authMode === 'register' && (
                        <div className="grid grid-cols-3 gap-2 pt-2">
                            {plans.map((p) => (
                                <button
                                    key={p.name}
                                    onClick={() => setSelectedPlan(p.name)}
                                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all ${selectedPlan === p.name
                                        ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                                        }`}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-wider">{p.name}</span>
                                    <span className={`text-xs font-bold ${selectedPlan === p.name ? 'text-slate-300' : 'text-slate-900'}`}>{p.price}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={handleAuthSubmit}
                        disabled={isLoading}
                        className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/30 hover:bg-indigo-500 hover:shadow-indigo-500/50 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                {authMode === 'register' ? 'Initiate Protocol' : 'Access Archive'}
                                <div className="w-1 h-1 bg-white rounded-full animate-ping"></div>
                            </>
                        )}
                    </button>
                </div>

                <div className="text-center">
                    <button
                        onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        {authMode === 'login' ? "No Standing? Initiate Free" : "Already Sovereign? Access"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
