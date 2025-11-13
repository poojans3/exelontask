"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TaskModal from "./components/TaskModal";

interface Task {
  title: string;
  
  status: "pending" | "completed" | "overdue";
}

export default function Home() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; hour: number } | null>(null);
  const [tasks, setTasks] = useState<Record<string, Task>>({});
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0); 

  
  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isModalOpen) return;
      const total = days.length * hours.length;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % total);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + total) % total);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev + days.length) % total);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev - days.length + total) % total);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const row = Math.floor(focusedIndex / days.length);
        const col = focusedIndex % days.length;
        openModal(days[col], hours[row]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedIndex, isModalOpen, days, hours]);

  const openModal = (day: string, hour: number) => {
    setSelectedSlot({ day, hour });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSlot(null);
  };

  const handleSaveTask = (taskTitle: string) => {
    if (selectedSlot) {
      const key = `${selectedSlot.day}-${selectedSlot.hour}`;
      setTasks((prev) => ({
        ...prev,
        [key]: { title: taskTitle, status: "pending" },
      }));
    }
  };

  const handleDragStart = (key: string) => {
    setDraggingKey(key);
  };

  const handleDrop = (targetKey: string) => {
    if (!draggingKey || draggingKey === targetKey) return;
    setTasks((prev) => {
      const updated = { ...prev };
      updated[targetKey] = updated[draggingKey];
      delete updated[draggingKey];
      return updated;
    });
    setDraggingKey(null);
  };

  const toggleStatus = (key: string) => {
    setTasks((prev) => {
      const updated = { ...prev };
      const current = updated[key];
      if (current) {
        updated[key] = {
          ...current,
          status:
            current.status === "pending"
              ? "completed"
              : current.status === "completed"
              ? "overdue"
              : "pending",
        };
      }
      return updated;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg shadow-green-300/50";
      case "overdue":
        return "bg-gradient-to-r from-red-400 to-red-600 text-white shadow-lg shadow-red-300/50";
      default:
        return "bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-300/50";
    }
  };

  const getTooltipColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-700";
      case "overdue":
        return "bg-red-700";
      default:
        return "bg-blue-700";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-100 to-indigo-100 p-6">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-blue-800 drop-shadow-md">
        🗓️ Smart Weekly Planner
      </h1>

      <div
        className="overflow-x-auto rounded-2xl shadow-2xl bg-white/70 backdrop-blur-md border border-blue-200 focus:outline-none"
        tabIndex={0} 
      >
        <div className="grid grid-cols-8">
          {/* Header Row */}
          <div className="bg-blue-100 text-center font-bold border-r border-blue-200 p-3 text-blue-700">
            Time
          </div>
          {days.map((day) => (
            <div
              key={day}
              className="bg-blue-100 text-center font-bold border-r border-blue-200 p-3 text-blue-700"
            >
              {day}
            </div>
          ))}

          {/* Time Slots */}
          {hours.map((hour, rowIndex) => (
            <div key={hour} className="contents">
              <div className="text-sm font-semibold text-blue-800 text-center border-t border-blue-200 p-3 bg-blue-50">
                {hour}:00
              </div>
              {days.map((day, colIndex) => {
                const key = `${day}-${hour}`;
                const task = tasks[key];
                const isDragging = draggingKey === key;
                const index = rowIndex * days.length + colIndex;
                const isFocused = focusedIndex === index;

                return (
                  <div
                    key={key}
                    tabIndex={-1}
                    onClick={() => openModal(day, hour)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(key)}
                    onMouseEnter={() => setHoveredKey(key)}
                    onMouseLeave={() => setHoveredKey(null)}
                    className={`relative border-t border-r border-blue-200 p-2 text-center min-h-[80px] cursor-pointer hover:bg-blue-50 transition ${
                      isFocused ? "ring-4 ring-blue-400 ring-offset-2" : ""
                    }`}
                  >
                    {task && (
                      <motion.div
                        draggable
                        onDragStart={() => handleDragStart(key)}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(key);
                        }}
                        className={`rounded-xl p-3 font-semibold cursor-grab ${getStatusColor(
                          task.status
                        )} ${
                          isDragging ? "opacity-70 scale-95" : "hover:scale-105"
                        } transition-transform relative`}
                        layout
                      >
                        {task.title}

                        {/* Tooltip */}
                        <AnimatePresence>
                          {hoveredKey === key && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className={`absolute -top-20 left-1/2 transform -translate-x-1/2 text-white text-xs rounded-lg px-4 py-2 shadow-xl ${getTooltipColor(
                                task.status
                              )} z-50 whitespace-nowrap`}
                            >
                              <div className="font-bold">{task.title}</div>
                              <div className="text-gray-200">
                                {day}, {hour}:00
                              </div>
                              <div className="text-yellow-200">
                                Status: {task.status}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveTask}
      />
    </main>
  );
}
