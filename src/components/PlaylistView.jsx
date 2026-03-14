import { useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppState } from '../hooks/useAppState';

function SortableTrackItem({ track, index, currentIndex, onPlay, onDelete, onVideoToggle }) {
    const isActive = index === currentIndex;
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: track.id + '-' + index });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            className={`track-item ${isActive ? 'track-active' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            layout
        >
            <div className="track-drag-handle" {...attributes} {...listeners}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="9" cy="6" r="1.5" />
                    <circle cx="15" cy="6" r="1.5" />
                    <circle cx="9" cy="12" r="1.5" />
                    <circle cx="15" cy="12" r="1.5" />
                    <circle cx="9" cy="18" r="1.5" />
                    <circle cx="15" cy="18" r="1.5" />
                </svg>
            </div>

            <div className="track-thumbnail-wrap" onClick={() => onPlay(index)}>
                <img src={track.thumbnail} alt="" className="track-thumbnail" loading="lazy" />
                {isActive && (
                    <div className="track-playing-indicator">
                        <span /><span /><span />
                    </div>
                )}
            </div>

            <div className="track-info" onClick={() => onPlay(index)}>
                <span className="track-title">{track.title}</span>
            </div>

            <div className="track-actions">
                <button className="track-btn" onClick={() => onVideoToggle(track)} title="Toggle video">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                </button>
                <button className="track-btn track-btn-delete" onClick={() => onDelete(index)} title="Remove">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>
        </motion.div>
    );
}

export default function PlaylistView({ onVideoToggle }) {
    const { state, dispatch } = useAppState();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const handlePlay = (index) => {
        dispatch({ type: 'SET_INDEX', payload: index });
    };

    const handleDelete = (index) => {
        dispatch({ type: 'REMOVE_TRACK', payload: index });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = state.playlist.findIndex((t, i) => t.id + '-' + i === active.id);
        const newIndex = state.playlist.findIndex((t, i) => t.id + '-' + i === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        const newPlaylist = arrayMove(state.playlist, oldIndex, newIndex);
        let newCurrentIndex = state.currentIndex;
        if (oldIndex === state.currentIndex) {
            newCurrentIndex = newIndex;
        } else if (oldIndex < state.currentIndex && newIndex >= state.currentIndex) {
            newCurrentIndex--;
        } else if (oldIndex > state.currentIndex && newIndex <= state.currentIndex) {
            newCurrentIndex++;
        }

        dispatch({ type: 'REORDER', payload: { newPlaylist, newIndex: newCurrentIndex } });
    };

    const items = useMemo(() =>
        state.playlist.map((t, i) => t.id + '-' + i),
        [state.playlist]
    );

    if (state.playlist.length === 0) {
        return (
            <div className="playlist-empty">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="empty-state"
                >
                    <div className="empty-icon">🎵</div>
                    <h3>Your queue is empty</h3>
                    <p>Paste a YouTube URL above to start vibing</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="playlist-view">
            <div className="playlist-header">
                <span className="playlist-count">{state.playlist.length} track{state.playlist.length !== 1 ? 's' : ''}</span>
                <button className="clear-all-btn" onClick={() => dispatch({ type: 'CLEAR_ALL' })}>
                    Clear All
                </button>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items} strategy={verticalListSortingStrategy}>
                    <AnimatePresence mode="popLayout">
                        {state.playlist.map((track, index) => (
                            <SortableTrackItem
                                key={track.id + '-' + index}
                                track={track}
                                index={index}
                                currentIndex={state.currentIndex}
                                onPlay={handlePlay}
                                onDelete={handleDelete}
                                onVideoToggle={onVideoToggle}
                            />
                        ))}
                    </AnimatePresence>
                </SortableContext>
            </DndContext>
        </div>
    );
}
