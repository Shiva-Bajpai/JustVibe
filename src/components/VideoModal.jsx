// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

export default function VideoModal({ track, onClose }) {
    if (!track) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="video-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="video-modal"
                    initial={{ scale: 0.8, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 50 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="video-modal-header">
                        <span className="video-modal-title">{track.title}</span>
                        <button className="video-modal-close" onClick={onClose}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                    <div className="video-modal-body">
                        <iframe
                            src={`https://www.youtube.com/embed/${track.id}?autoplay=1&rel=0&modestbranding=1`}
                            title={track.title}
