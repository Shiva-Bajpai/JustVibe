import { useEffect } from 'react';
import { useAppState } from './useAppState';

export function useMediaSession({ onPlay, onPause, onNext, onPrev }) {
    const { state } = useAppState();
    const currentTrack = state.playlist[state.currentIndex] || null;

    useEffect(() => {
        if (!('mediaSession' in navigator)) return;

        if (currentTrack) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentTrack.title,
                artist: 'JustVibe',
                album: 'Queue',
                artwork: [
                    { src: currentTrack.thumbnail, sizes: '320x180', type: 'image/jpeg' },
                ],
            });
        }

        navigator.mediaSession.setActionHandler('play', onPlay);
        navigator.mediaSession.setActionHandler('pause', onPause);
        navigator.mediaSession.setActionHandler('nexttrack', onNext);
        navigator.mediaSession.setActionHandler('previoustrack', onPrev);

        return () => {
            navigator.mediaSession.setActionHandler('play', null);
            navigator.mediaSession.setActionHandler('pause', null);
            navigator.mediaSession.setActionHandler('nexttrack', null);
            navigator.mediaSession.setActionHandler('previoustrack', null);
        };
    }, [currentTrack, onPlay, onPause, onNext, onPrev]);
}
