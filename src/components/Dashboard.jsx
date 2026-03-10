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
