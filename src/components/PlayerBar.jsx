import { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useAppState } from '../hooks/useAppState';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { useMediaSession } from '../hooks/useMediaSession';

function formatTime(s) {
    if (!s || isNaN(s)) return '0:00';
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function PlayerBar({ onVideoToggle }) {
    const { state, dispatch } = useAppState();
    const { togglePlay, next, prev, seekTo, getDuration, getCurrentTime, currentTrack, isPlaying } = useYouTubePlayer();
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isDragging] = useState(false);
    const progressRef = useRef(null);

    // Update duration and time
    useEffect(() => {
        const interval = setInterval(() => {
            const d = getDuration();
            const t = getCurrentTime();
            if (d > 0) setDuration(d);
            if (!isDragging && t >= 0) setCurrentTime(t);
        }, 250);
        return () => clearInterval(interval);
    }, [getDuration, getCurrentTime, isDragging]);

    // Media Session
    useMediaSession({
        onPlay: togglePlay,
        onPause: togglePlay,
        onNext: next,
        onPrev: prev,
    });

    const handleProgressClick = (e) => {
        if (!progressRef.current || !duration) return;
        const rect = progressRef.current.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        seekTo(pct * duration);
        setCurrentTime(pct * duration);
    };

    const handleVolumeChange = (e) => {
        dispatch({ type: 'SET_VOLUME', payload: parseInt(e.target.value) });
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    if (!currentTrack && state.playlist.length === 0) return null;

    return (
        <motion.div
            className="player-bar"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring', damping: 25 }}
        >
            {/* Progress bar at top of player bar */}
            <div className="player-progress-container" ref={progressRef} onClick={handleProgressClick}>
                <div className="player-progress-bg" />
                <motion.div
                    className="player-progress-fill"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                />
                <div className="player-progress-thumb" style={{ left: `${progress}%` }} />
            </div>

            <div className="player-bar-inner">
                {/* Left: Track info */}
                <div className="player-track-info">
                    {currentTrack ? (
                        <>
                            <img src={currentTrack.thumbnail} alt="" className="player-thumbnail" />
                            <div className="player-meta">
                                <span className="player-title">{currentTrack.title}</span>
                                <span className="player-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
                            </div>
                        </>
                    ) : (
                        <div className="player-meta">
                            <span className="player-title" style={{ opacity: 0.5 }}>No track selected</span>
                        </div>
                    )}
                </div>

                {/* Center: Controls */}
                <div className="player-controls">
                    <button
                        className={`player-ctrl-btn ${state.isShuffle ? 'active' : ''}`}
                        onClick={() => dispatch({ type: 'TOGGLE_SHUFFLE' })}
                        title="Shuffle"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
                            <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" />
                            <line x1="4" y1="4" x2="9" y2="9" />
                        </svg>
                    </button>

                    <button className="player-ctrl-btn" onClick={prev} title="Previous">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                        </svg>
                    </button>

                    <motion.button
                        className="player-play-btn"
                        onClick={togglePlay}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="4" width="4" height="16" rx="1" />
                                <rect x="14" y="4" width="4" height="16" rx="1" />
                            </svg>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </motion.button>

                    <button className="player-ctrl-btn" onClick={next} title="Next">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                        </svg>
                    </button>

                    <button
                        className={`player-ctrl-btn ${state.loopMode !== 'none' ? 'active' : ''}`}
                        onClick={() => dispatch({ type: 'CYCLE_LOOP' })}
                        title={`Loop: ${state.loopMode}`}
                    >
                        {state.loopMode === 'one' ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
                                <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
                                <text x="11" y="15" fontSize="8" fill="currentColor" stroke="none" fontWeight="bold">1</text>
