// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

export default function VideoModal({ track, onClose }) {
    if (!track) return null;

    return (
        <AnimatePresence>
            <motion.div
