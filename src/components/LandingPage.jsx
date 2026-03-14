import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export default function LandingPage({ onEnter }) {
    const [exiting, setExiting] = useState(false);

    const handleEnter = () => {
        setExiting(true);
        setTimeout(onEnter, 1000);
    };

    return (
        <motion.div
            className="landing-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
        >
            <div className="landing-bg" />
            <div className="landing-overlay" />

            {/* Brand top-left */}
            <motion.span
                className="landing-brand"
                initial={{ opacity: 0 }}
                animate={{ opacity: exiting ? 0 : 1 }}
                transition={{ duration: 1, delay: 0.3 }}
            >
                <img src="/logo.svg" alt="JustVibe" className="landing-brand-logo" />
            </motion.span>

            {/* Pro button top-right — aligned with logo */}
            <motion.div
                className="landing-pro-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: exiting ? 0 : 1 }}
                transition={{ duration: 1, delay: 0.5 }}
            >
                <button className="landing-pro-btn">
                    <span className="pro-sparkle">✦</span> Vibe Pro
                </button>
                <div className="pro-modal-wrapper">
                    <div className="pro-modal">
                        <div className="pro-modal-glow"></div>
                        <span className="pro-modal-badge">✦ Premium</span>
                        <h3 className="pro-modal-title">Vibe Pro</h3>
                        <p className="pro-modal-desc">Elevate your listening experience with premium features designed for true music lovers.</p>
                        <div className="pro-features">
                            <div className="pro-feature">
                                <div className="pro-feature-icon">🔄</div>
                                <div className="pro-feature-text">
                                    <span className="pro-feature-title">Playlist Syncing</span>
                                    <span className="pro-feature-sub">Sync playlists across all your devices</span>
                                </div>
                            </div>
                            <div className="pro-feature">
                                <div className="pro-feature-icon">🌌</div>
                                <div className="pro-feature-text">
                                    <span className="pro-feature-title">Create Spaces</span>
                                    <span className="pro-feature-sub">Build custom listening rooms & moods</span>
                                </div>
                            </div>
                            <div className="pro-feature">
                                <div className="pro-feature-icon">🎧</div>
                                <div className="pro-feature-text">
                                    <span className="pro-feature-title">Listen with Friends</span>
                                    <span className="pro-feature-sub">Real-time listening sessions together</span>
                                </div>
                            </div>
                            <div className="pro-feature">
                                <div className="pro-feature-icon">💬</div>
                                <div className="pro-feature-text">
                                    <span className="pro-feature-title">Chat</span>
                                    <span className="pro-feature-sub">Message friends while vibing</span>
                                </div>
                            </div>
                        </div>
                        <button className="pro-cta">Upgrade to Vibe Pro — $4.99/mo</button>
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="landing-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: exiting ? 0 : 1 }}
                transition={{ duration: 0.8 }}
            >
                {/* Main title — editorial split */}
                <motion.h1
                    className="landing-title"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                    <span className="title-top">Music,</span>
                    <span className="title-bottom">Without the <em>Noise.</em></span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    className="landing-subtitle"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                >
                    Your sound. Your space. No algorithms, no ads,
                    <br />no distractions just you and the music.
                </motion.p>

                {/* CTA */}
                <motion.button
                    className="landing-cta"
                    onClick={handleEnter}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                >
                    Start Listening
                </motion.button>
            </motion.div>

            {/* Giant outlined watermark text — SILQUE-style */}
            <motion.div
                className="landing-watermark"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: exiting ? 0 : 1, y: 0 }}
                transition={{ duration: 1.5, delay: 0.6 }}
            >
                justvibe
            </motion.div>

            <motion.footer
                className="landing-footer"
                initial={{ opacity: 0 }}
                animate={{ opacity: exiting ? 0 : 0.8 }}
                transition={{ duration: 1, delay: 2 }}
            >
                nothing else :) 
            </motion.footer>
        </motion.div>
    );
}
