import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export function SimpleModal({ isOpen, onClose, children, maxWidth = "max-w-lg", className = "" }: CustomModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        style={{
          position: "relative",
          backgroundColor: "white",
          color: "black",
          borderRadius: "8px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          maxHeight: "90vh",
          overflow: "auto",
          width: "100%",
          maxWidth: maxWidth === "max-w-lg" ? "32rem" : maxWidth === "max-w-md" ? "28rem" : maxWidth === "max-w-6xl" ? "72rem" : "32rem"
        }}
        className={className}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            right: "16px",
            top: "16px",
            zIndex: 10,
            padding: "4px",
            borderRadius: "4px",
            opacity: 0.7,
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            color: "black"
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "0.7"}
        >
          <X style={{ width: "16px", height: "16px" }} />
          <span style={{ position: "absolute", width: "1px", height: "1px", margin: "-1px", padding: 0, overflow: "hidden", clip: "rect(0, 0, 0, 0)", border: 0 }}>Close</span>
        </button>
        
        <div style={{ color: "black" }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default SimpleModal;