import { createContext, useContext, useReducer, useEffect, useRef } from 'react';

const STORAGE_KEY = 'justvibe_state';

const defaultState = {
    playlist: [],
    currentIndex: -1,
    isShuffle: false,
    loopMode: 'none', // 'none' | 'one' | 'all'
    playbackTime: 0,
    isPlaying: false,
    volume: 80,
};

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return { ...defaultState, ...parsed, isPlaying: false };
        }
    } catch (e) {
        console.warn('Failed to load state:', e);
    }
    return defaultState;
}

function reducer(state, action) {
    switch (action.type) {
        case 'ADD_TRACK':
            return {
                ...state,
                playlist: [...state.playlist, action.payload],
                currentIndex: state.currentIndex === -1 ? 0 : state.currentIndex,
            };
        case 'ADD_TRACKS':
            return {
                ...state,
                playlist: [...state.playlist, ...action.payload],
                currentIndex: state.currentIndex === -1 ? 0 : state.currentIndex,
            };
        case 'REMOVE_TRACK': {
            const newPlaylist = state.playlist.filter((_, i) => i !== action.payload);
            let newIndex = state.currentIndex;
            if (action.payload < state.currentIndex) {
                newIndex--;
            } else if (action.payload === state.currentIndex) {
                newIndex = Math.min(newIndex, newPlaylist.length - 1);
            }
            return { ...state, playlist: newPlaylist, currentIndex: newIndex };
        }
        case 'REORDER':
            return { ...state, playlist: action.payload.newPlaylist, currentIndex: action.payload.newIndex };
        case 'SET_INDEX':
            return { ...state, currentIndex: action.payload, isPlaying: true, playbackTime: 0 };
        case 'SET_PLAYING':
            return { ...state, isPlaying: action.payload };
        case 'TOGGLE_SHUFFLE':
            return { ...state, isShuffle: !state.isShuffle };
        case 'SET_LOOP':
            return { ...state, loopMode: action.payload };
        case 'CYCLE_LOOP': {
            const modes = ['none', 'all', 'one'];
            const idx = modes.indexOf(state.loopMode);
            return { ...state, loopMode: modes[(idx + 1) % modes.length] };
        }
        case 'UPDATE_TIME':
            return { ...state, playbackTime: action.payload };
        case 'SET_VOLUME':
            return { ...state, volume: action.payload };
        case 'CLEAR_ALL':
            return { ...defaultState };
        case 'NEXT': {
            if (state.playlist.length === 0) return state;
            if (state.loopMode === 'one') return { ...state, isPlaying: true };
            if (state.isShuffle) {
                let next;
                do {
                    next = Math.floor(Math.random() * state.playlist.length);
                } while (next === state.currentIndex && state.playlist.length > 1);
                return { ...state, currentIndex: next, isPlaying: true, playbackTime: 0 };
            }
            const nextIdx = state.currentIndex + 1;
            if (nextIdx >= state.playlist.length) {
                if (state.loopMode === 'all') {
                    return { ...state, currentIndex: 0, isPlaying: true, playbackTime: 0 };
                }
                return { ...state, isPlaying: false };
            }
            return { ...state, currentIndex: nextIdx, isPlaying: true, playbackTime: 0 };
        }
        case 'PREV': {
            if (state.playlist.length === 0) return state;
            if (state.isShuffle) {
                let prev;
                do {
                    prev = Math.floor(Math.random() * state.playlist.length);
                } while (prev === state.currentIndex && state.playlist.length > 1);
                return { ...state, currentIndex: prev, isPlaying: true, playbackTime: 0 };
            }
            const prevIdx = state.currentIndex - 1;
            if (prevIdx < 0) {
                if (state.loopMode === 'all') {
                    return { ...state, currentIndex: state.playlist.length - 1, isPlaying: true, playbackTime: 0 };
                }
                return { ...state, currentIndex: 0, playbackTime: 0 };
            }
            return { ...state, currentIndex: prevIdx, isPlaying: true, playbackTime: 0 };
        }
        default:
            return state;
    }
}

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, null, loadState);
    const saveTimeout = useRef(null);

    // Throttled localStorage save
    useEffect(() => {
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(() => {
            const toSave = { ...state };
            delete toSave.isPlaying; // Don't persist playing state
            localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        }, 500);
        return () => clearTimeout(saveTimeout.current);
    }, [state]);

    return (
        <AppStateContext.Provider value={{ state, dispatch }}>
            {children}
        </AppStateContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppState() {
    const ctx = useContext(AppStateContext);
    if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
    return ctx;
}
