import { useEffect, useRef, useCallback } from 'react';
import { useAppState } from './useAppState';

let playerInstance = null;
let apiLoadPromise = null;

function loadYouTubeAPI() {
    if (apiLoadPromise) return apiLoadPromise;
    if (window.YT && window.YT.Player) {
        return Promise.resolve();
    }
    apiLoadPromise = new Promise((resolve) => {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScript = document.getElementsByTagName('script')[0];
        firstScript.parentNode.insertBefore(tag, firstScript);
        window.onYouTubeIframeAPIReady = () => {
            resolve();
        };
    });
    return apiLoadPromise;
}

export function useYouTubePlayer() {
    const { state, dispatch } = useAppState();
    const playerRef = useRef(null);
    const currentVideoRef = useRef(null);
    const progressInterval = useRef(null);
    const isInitialized = useRef(false);
    const dispatchRef = useRef(dispatch);

    // Keep dispatch ref up to date so onStateChange always has latest dispatch
    useEffect(() => {
        dispatchRef.current = dispatch;
    }, [dispatch]);

    const currentTrack = state.playlist[state.currentIndex] || null;

    // Initialize player once
    useEffect(() => {
        if (isInitialized.current) return;
        isInitialized.current = true;

        loadYouTubeAPI().then(() => {
            // Create the hidden container if not exists
            let container = document.getElementById('yt-player-container');
