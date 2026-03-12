import { useState, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAppState } from '../hooks/useAppState';
import { extractVideoId, extractPlaylistId, fetchVideoInfo } from '../utils/youtubeUtils';

export default function TopBar() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const { dispatch } = useAppState();

    const handleAdd = useCallback(async () => {
        if (!url.trim()) return;

        const videoId = extractVideoId(url);
        const playlistId = extractPlaylistId(url);

        if (!videoId && !playlistId) {
            toast.error('Invalid YouTube link', {
                style: { background: 'rgba(30,30,30,0.9)', color: '#fff', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' },
                icon: '⚠️'
            });
            return;
        }

        setLoading(true);

        try {
            if (videoId) {
                const info = await fetchVideoInfo(videoId);
                dispatch({ type: 'ADD_TRACK', payload: info });
                toast.success(`Added: ${info.title}`, {
                    style: { background: 'rgba(30,30,30,0.9)', color: '#fff', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' },
                    icon: '🎵'
                });
                setUrl('');
            } else if (playlistId && !videoId) {
                toast('Playlists: paste individual video URLs for best results', {
                    style: { background: 'rgba(30,30,30,0.9)', color: '#fff', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' },
                    icon: 'ℹ️',
                    duration: 4000,
                });
            }
        } catch {
            toast.error('Failed to add track', {
                style: { background: 'rgba(30,30,30,0.9)', color: '#fff', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' },
            });
        } finally {
            setLoading(false);
        }
    }, [url, dispatch]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleAdd();
    };

    return (
        <div className="top-bar">
            <div className="top-bar-logo">
                <span className="logo-text">JustVibe</span>
            </div>
            <div className="top-bar-input-group">
                <input
                    type="text"
                    className="url-input"
                    placeholder="Paste YouTube URL here..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                />
                <motion.button
                    className="add-btn"
                    onClick={handleAdd}
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {loading ? (
                        <span className="spinner" />
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    )}
                </motion.button>
            </div>
        </div>
    );
}
