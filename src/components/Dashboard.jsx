import { useState, useCallback, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppState } from '../hooks/useAppState';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { useMediaSession } from '../hooks/useMediaSession';
import { extractVideoId, extractPlaylistId, fetchVideoInfo } from '../utils/youtubeUtils';
import VideoModal from './VideoModal';

function formatTime(s) {
    if (!s || isNaN(s)) return '0:00';
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/* ─── Sortable Queue Item ─── */
function SortableQueueItem({ track, index, currentIndex, onPlay, onDelete }) {
    const isActive = index === currentIndex;
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: track.id + '-' + index });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            className={`queue-item ${isActive ? 'queue-item-active' : ''}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.25 }}
            layout
            onClick={() => onPlay(index)}
        >
            {/* Drag handle — visible on mobile for reordering */}
            <span className="queue-drag-handle" {...attributes} {...listeners}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" opacity="0.4">
                    <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
                    <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                    <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
                </svg>
            </span>
            <span className="queue-item-number">
                {isActive ? (
                    <span className="queue-eq">
                        <span /><span /><span />
                    </span>
                ) : (
                    `${index + 1}.`
                )}
            </span>
            <span className="queue-item-title">{track.title}</span>
            <button
                className="queue-item-delete"
                onClick={(e) => { e.stopPropagation(); onDelete(index); }}
            >
                ×
            </button>
        </motion.div>
    );
}

/* ─── Main Dashboard ─── */
export default function Dashboard({ onBack }) {
    const { state, dispatch } = useAppState();
    const { togglePlay, next, prev, seekTo, getDuration, getCurrentTime, currentTrack, isPlaying } = useYouTubePlayer();
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isDragging] = useState(false);
    const [videoTrack, setVideoTrack] = useState(null);
    const [showQueue, setShowQueue] = useState(true);
    const [searchMode, setSearchMode] = useState('youtube'); // 'youtube' | 'queue'

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
    );

    // Pull-to-refresh
    const dashRef = useRef(null);
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const touchStartY = useRef(0);
    const isPulling = useRef(false);

    useEffect(() => {
        const el = dashRef.current;
        if (!el) return;

        const onTouchStart = (e) => {
            // Only enable pull-to-refresh when scrolled to top
            if (el.scrollTop <= 0) {
                touchStartY.current = e.touches[0].clientY;
                isPulling.current = true;
            }
        };
        const onTouchMove = (e) => {
            if (!isPulling.current) return;
            const diff = e.touches[0].clientY - touchStartY.current;
            if (diff > 0 && el.scrollTop <= 0) {
                setPullDistance(Math.min(diff * 0.5, 80));
            } else {
                setPullDistance(0);
            }
        };
        const onTouchEnd = () => {
            if (pullDistance > 60) {
                setIsRefreshing(true);
                setPullDistance(50);
                setTimeout(() => {
                    window.location.reload();
                }, 600);
            } else {
                setPullDistance(0);
            }
            isPulling.current = false;
        };

        el.addEventListener('touchstart', onTouchStart, { passive: true });
        el.addEventListener('touchmove', onTouchMove, { passive: true });
        el.addEventListener('touchend', onTouchEnd, { passive: true });
        return () => {
            el.removeEventListener('touchstart', onTouchStart);
            el.removeEventListener('touchmove', onTouchMove);
            el.removeEventListener('touchend', onTouchEnd);
        };
    }, [pullDistance]);

    // Media Session
    useMediaSession({ onPlay: togglePlay, onPause: togglePlay, onNext: next, onPrev: prev });

    // Time tracking
    useEffect(() => {
        const interval = setInterval(() => {
            const d = getDuration();
            const t = getCurrentTime();
            if (d > 0) setDuration(d);
            if (!isDragging && t >= 0) setCurrentTime(t);
        }, 250);
        return () => clearInterval(interval);
    }, [getDuration, getCurrentTime, isDragging]);

    // Add/Search track handler
    const handleAdd = useCallback(async () => {
        if (!url.trim()) return;

        const videoId = extractVideoId(url);
        const playlistId = extractPlaylistId(url);

        setLoading(true);
        try {
            if (videoId && !playlistId) {
                // Single video — add directly
                const info = await fetchVideoInfo(videoId);
                dispatch({ type: 'ADD_TRACK', payload: info });
                toast.success(`Added: ${info.title}`, { icon: '🎵' });
            } else if (playlistId) {
                // Playlist URL (with or without a specific video)
                toast.loading('Importing playlist... this might take a moment', { id: 'playlist-toast' });

                // Import from youtubeUtils.js
                const { fetchPlaylistVideos } = await import('../utils/youtubeUtils');
                const result = await fetchPlaylistVideos(playlistId);

                if (result.error) {
                    toast.error(result.error, { id: 'playlist-toast', duration: 4000 });
                } else if (result.videos && result.videos.length > 0) {
                    dispatch({ type: 'ADD_TRACKS', payload: result.videos });
                    toast.success(`Imported ${result.videos.length} videos from playlist!`, { id: 'playlist-toast', icon: '🎶' });
                }
            } else {
                // Not a video or playlist URL -> Treat as a search query
                toast.loading(`Searching for "${url}"...`, { id: 'search-toast' });
                const { searchYouTube } = await import('../utils/youtubeUtils');
                const result = await searchYouTube(url);

                if (result.error) {
                    toast.error(result.error, { id: 'search-toast', duration: 4000 });
                } else if (result.id) {
                    dispatch({ type: 'ADD_TRACK', payload: result });
                    toast.success(`Found & Added: ${result.title}`, { id: 'search-toast', icon: '🎵' });
                }
            }
            setUrl('');
        } catch {
            toast.error('Failed to add track or search');
        } finally {
            setLoading(false);
        }
    }, [url, dispatch]);

    const handleKeyDown = (e) => { if (e.key === 'Enter') handleAdd(); };

    const handleProgressClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        seekTo(pct * duration);
        setCurrentTime(pct * duration);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldI = state.playlist.findIndex((t, i) => t.id + '-' + i === active.id);
        const newI = state.playlist.findIndex((t, i) => t.id + '-' + i === over.id);
        if (oldI === -1 || newI === -1) return;
        const newPlaylist = arrayMove(state.playlist, oldI, newI);
        let newCurrentIndex = state.currentIndex;
        if (oldI === state.currentIndex) newCurrentIndex = newI;
        else if (oldI < state.currentIndex && newI >= state.currentIndex) newCurrentIndex--;
        else if (oldI > state.currentIndex && newI <= state.currentIndex) newCurrentIndex++;
        dispatch({ type: 'REORDER', payload: { newPlaylist, newIndex: newCurrentIndex } });
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const items = state.playlist.map((t, i) => t.id + '-' + i);

    return (
        <motion.div
            className="dash"
            ref={dashRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <div className="dash-bg" />
            <div className="dash-overlay" />

            {/* Pull-to-refresh indicator */}
            <div className="pull-refresh-indicator" style={{
                transform: `translateY(${pullDistance - 50}px)`,
                opacity: pullDistance > 10 ? Math.min(pullDistance / 60, 1) : 0,
            }}>
                <div className={`pull-refresh-spinner ${isRefreshing ? 'spinning' : ''}`}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                </div>
            </div>

            <div className="dash-inner">
                {/* ── Header ── */}
                <div className="dash-header">
                    <button className="dash-back" onClick={onBack} title="Back">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                    <span className="dash-brand">JustVibe</span>

                    <div className="header-right-actions">
                        <div className="pro-container">
                            <button className="landing-pro-btn dash-pro-btn">
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
                        </div>
                    </div>
                </div>
                {/* ── Now Playing Section ── */}
                <div className="dash-player">
                    {/* Song Title */}
                    <AnimatePresence mode="wait">
                        <motion.h2
                            key={currentTrack?.id || 'empty'}
                            className="now-playing-title"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.35 }}
                        >
                            {currentTrack?.title || 'No track selected'}
                        </motion.h2>
                    </AnimatePresence>

                    {/* Progress Bar */}
                    <div className="progress-section">
                        <div className="progress-bar-wrap" onClick={handleProgressClick}>
                            <div className="progress-bar-bg" />
                            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                            <div className="progress-bar-dot" style={{ left: `${progress}%` }} />
                        </div>
                        <div className="progress-times">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="controls-row">
                        <button
                            className={`ctrl-btn ${state.isShuffle ? 'ctrl-active' : ''}`}
                            onClick={() => dispatch({ type: 'TOGGLE_SHUFFLE' })}
                            title="Shuffle"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
                                <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" />
                                <line x1="4" y1="4" x2="9" y2="9" />
                            </svg>
                        </button>

                        <button className="ctrl-btn" onClick={prev} title="Previous">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                            </svg>
                        </button>

                        <motion.button
                            className="play-btn"
                            onClick={togglePlay}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                        >
                            {isPlaying ? (
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                                    <rect x="6" y="4" width="4" height="16" rx="1" />
                                    <rect x="14" y="4" width="4" height="16" rx="1" />
                                </svg>
                            ) : (
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            )}
                        </motion.button>

                        <button className="ctrl-btn" onClick={next} title="Next">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                            </svg>
                        </button>

                        <button
                            className={`ctrl-btn ${state.loopMode !== 'none' ? 'ctrl-active' : ''}`}
                            onClick={() => dispatch({ type: 'CYCLE_LOOP' })}
                            title={`Loop: ${state.loopMode}`}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
                                <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
                            </svg>
                            {state.loopMode === 'one' && <span className="loop-badge">1</span>}
                        </button>
                    </div>

                    {/* Volume */}
                    <div className="volume-row">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        </svg>
                        <input
                            type="range"
                            min="0" max="100"
                            value={state.volume}
                            onChange={(e) => dispatch({ type: 'SET_VOLUME', payload: parseInt(e.target.value) })}
                            className="vol-slider"
                        />
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                        </svg>
                    </div>

                    {/* URL Input */}
                    <div className="url-section">
                        <div className="search-pills">
                            <button
                                className={`search-pill ${searchMode === 'youtube' ? 'active' : ''}`}
                                onClick={() => setSearchMode('youtube')}
                            >
                                Search YT
                            </button>
                            <button
                                className={`search-pill ${searchMode === 'queue' ? 'active' : ''}`}
                                onClick={() => setSearchMode('queue')}
                            >
                                Search Queue
                            </button>
                        </div>
                        <div className="url-input-row">
                            <input
                                type="text"
                                className="dash-url-input"
                                placeholder={searchMode === 'queue' ? "Search your queue..." : "Paste YouTube URL or search..."}
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={loading}
                            />
                            {searchMode === 'youtube' && (
                                <motion.button
                                    className="dash-add-btn"
                                    onClick={handleAdd}
                                    disabled={loading}
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.92 }}
                                >
                                    {loading ? <span className="mini-spin" /> : '+'}
                                </motion.button>
                            )}
                        </div>
                    </div>

                    {/* URL Helper */}
                    {searchMode === 'youtube' && (
                        <span className="url-helper">
                            Drop any song or playlist you wanna listen ad free, always.
                        </span>
                    )}
                </div>

                {/* ── Queue Section ── */}
                <div className="dash-queue-section">
                    <button className="queue-toggle" onClick={() => setShowQueue(!showQueue)}>
                        <span>Queue ({String(state.playlist.length).padStart(2, '0')})</span>
                        <svg
                            width="14" height="14"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round"
                            style={{ transform: showQueue ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>

                    <AnimatePresence>
                        {showQueue && (
                            <motion.div
                                className="queue-list"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.35 }}
                            >
                                {state.playlist.length === 0 ? (
                                    <div className="queue-empty">
                                        <span>Your queue is empty. Add a song above to start vibing.</span>
                                    </div>
                                ) : (
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                        <SortableContext items={items} strategy={verticalListSortingStrategy}>
                                            <AnimatePresence mode="popLayout">
                                                {state.playlist
                                                    .map((track, originalIndex) => ({ track, originalIndex }))
                                                    .filter(({ track }) => searchMode === 'queue' && url.trim() ? track.title.toLowerCase().includes(url.toLowerCase()) : true)
                                                    .map(({ track, originalIndex }) => (
                                                        <SortableQueueItem
                                                            key={track.id + '-' + originalIndex}
                                                            track={track}
                                                            index={originalIndex}
                                                            currentIndex={state.currentIndex}
                                                            onPlay={(i) => dispatch({ type: 'SET_INDEX', payload: i })}
                                                            onDelete={(i) => dispatch({ type: 'REMOVE_TRACK', payload: i })}
                                                        />
                                                    ))}
                                            </AnimatePresence>
                                        </SortableContext>
                                    </DndContext>
                                )}
                                {state.playlist.length > 0 && (
                                    <button className="queue-clear" onClick={() => dispatch({ type: 'CLEAR_ALL' })}>
                                        Clear All
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {videoTrack && (
                <VideoModal track={videoTrack} onClose={() => setVideoTrack(null)} />
            )}
        </motion.div>
    );
}
