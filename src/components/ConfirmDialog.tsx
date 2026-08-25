"use client";

import { useContext } from "react";
import { useToast } from "@/lib/ToastProvider";
import { X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
}

export function ConfirmDialog({ open, onClose, title, confirmText, cancelText, onConfirm }: ConfirmDialogProps) {
  const { showToast } = useToast();

  return open ? (
    <div className="modal-backdrop" onClick={onClose} style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
        </div>
        <p className="text-muted" style={{ marginBottom: 20 }}>Are you sure you want to proceed?</p>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>{cancelText}</button>
          <button
            className="btn btn-danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  ) : null;
}

ConfirmDialog.displayName = "ConfirmDialog";
