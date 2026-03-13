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
