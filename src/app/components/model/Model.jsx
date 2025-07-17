import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const backdrop = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const modal = {
  hidden: {
    y: "-40px",
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    y: "0px",
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: {
    y: "20px",
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

const Modal = ({
  show,
  onClose,
  title,
  children,
  showFooter = false,
  onConfirm,
  confirmText = "Save",
  cancelText = "Cancel",
}) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center px-4"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg max-w-lg w-full p-6 relative"
            variants={modal}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Icon */}
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}

            {/* Content */}
            <div className="modal-content space-y-4">{children}</div>

            {/* Footer */}
            {showFooter && (
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  {confirmText}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
