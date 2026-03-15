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
            if (!container) {
                container = document.createElement('div');
                container.id = 'yt-player-container';
                container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-1;';
                document.body.appendChild(container);
            }

            let playerDiv = document.getElementById('yt-player');
            if (!playerDiv) {
                playerDiv = document.createElement('div');
                playerDiv.id = 'yt-player';
                container.appendChild(playerDiv);
            }

            playerInstance = new window.YT.Player('yt-player', {
                height: '1',
                width: '1',
                playerVars: {
                    autoplay: 0,
                    controls: 0,
                    disablekb: 1,
                    fs: 0,
                    iv_load_policy: 3,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    origin: window.location.origin,
                },
                events: {
                    onReady: () => {
                        playerRef.current = playerInstance;
                    },
                    onStateChange: (event) => {
                        if (event.data === window.YT.PlayerState.ENDED) {
                            dispatchRef.current({ type: 'NEXT' });
                        }
                        if (event.data === window.YT.PlayerState.PLAYING) {
                            dispatchRef.current({ type: 'SET_PLAYING', payload: true });
                        }
                        if (event.data === window.YT.PlayerState.PAUSED) {
                            dispatchRef.current({ type: 'SET_PLAYING', payload: false });
                        }
                    },
                },
            });
            playerRef.current = playerInstance;
        });

        return () => {
            if (progressInterval.current) clearInterval(progressInterval.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Load video when currentTrack changes
    useEffect(() => {
        if (!currentTrack) return;
        if (currentVideoRef.current === currentTrack.id) return;

        const loadVideo = () => {
            if (playerRef.current && playerRef.current.cueVideoById) {
                currentVideoRef.current = currentTrack.id;
                if (state.isPlaying) {
                    // If we're supposed to be playing, load and auto-play
                    playerRef.current.loadVideoById({
                        videoId: currentTrack.id,
                        startSeconds: 0,
                    });
                } else {
                    // Just cue the video without playing
                    playerRef.current.cueVideoById({
                        videoId: currentTrack.id,
                        startSeconds: 0,
                    });
                }
            } else {
                setTimeout(loadVideo, 500);
            }
        };

        loadVideo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTrack?.id]);

    // Handle play/pause state
    useEffect(() => {
        if (!playerRef.current || !playerRef.current.getPlayerState) return;
        try {
            if (state.isPlaying) {
                const playerState = playerRef.current.getPlayerState();
                if (playerState === window.YT.PlayerState.PAUSED || playerState === window.YT.PlayerState.CUED) {
                    playerRef.current.playVideo();
                }
            } else {
                const playerState = playerRef.current.getPlayerState();
                if (playerState === window.YT.PlayerState.PLAYING) {
                    playerRef.current.pauseVideo();
                }
            }
        } catch {
            // Player not ready
        }
    }, [state.isPlaying]);

    // Volume
    useEffect(() => {
        if (playerRef.current && playerRef.current.setVolume) {
            try {
                playerRef.current.setVolume(state.volume);
            } catch { /* Player not ready */ }
        }
    }, [state.volume]);

    // Progress tracking
    useEffect(() => {
        if (progressInterval.current) clearInterval(progressInterval.current);
        progressInterval.current = setInterval(() => {
            if (playerRef.current && playerRef.current.getCurrentTime && state.isPlaying) {
                try {
                    const time = playerRef.current.getCurrentTime();
                    if (time > 0) {
                        dispatch({ type: 'UPDATE_TIME', payload: Math.floor(time) });
                    }
                } catch { /* ignore */ }
            }
        }, 1000);
        return () => clearInterval(progressInterval.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.isPlaying]);

    // Loop one mode
    useEffect(() => {
        if (playerRef.current && playerRef.current.setLoop) {
            // YouTube player loop is for the whole playlist, we handle loop one manually
        }
    }, [state.loopMode]);

    const play = useCallback(() => dispatch({ type: 'SET_PLAYING', payload: true }), [dispatch]);
