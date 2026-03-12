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
