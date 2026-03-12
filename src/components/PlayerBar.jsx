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
