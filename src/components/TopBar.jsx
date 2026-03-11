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

