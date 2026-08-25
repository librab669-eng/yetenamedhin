"use client";

import { useEffect } from "react";

export function KeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key: close modals/dialogs
      if (event.key === "Escape") {
        // Try to find and focus a close button or just prevent default
        event.preventDefault();
      }

      // Control + S: save (prevent default and show toast)
      if (event.key === "s" && event.ctrlKey) {
        event.preventDefault();
        // Show a toast or try to save the focused form
        // This is a basic implementation - can be enhanced
        window.dispatchEvent(new CustomEvent("saveForm", { detail: { key: "Ctrl+S" } }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}