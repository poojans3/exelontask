"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: string) => void;
}

export default function TaskModal({ isOpen, onClose, onSave }: TaskModalProps) {
  const [task, setTask] = useState("");

  useEffect(() => {
    if (!isOpen) setTask("");
  }, [isOpen]);

  const handleSubmit = () => {
    if (task.trim() !== "") {
      onSave(task);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-96 max-w-full border border-blue-200"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120 }}
          >
            <h2 className="text-2xl font-bold text-center text-blue-800 mb-4">
              ✨ Add a Task
            </h2>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Type your task here..."
              className="w-full h-28 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none bg-white/90 text-gray-800"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition"
              >
                Save Task
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
