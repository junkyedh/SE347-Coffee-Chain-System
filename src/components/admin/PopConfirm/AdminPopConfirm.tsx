
import React, { useLayoutEffect, useRef, useState } from "react";
import AdminButton from "../AdminButton/AdminButton";
import "./AdminPopConfirm.scss";
import * as ReactDOM from 'react-dom';

interface AdminPopConfirmProps {
  title: React.ReactNode;
  okText?: string;
  cancelText?: string;
  onConfirm: () => void;
  children: React.ReactNode;
}

const AdminPopConfirm: React.FC<AdminPopConfirmProps> = ({
  title,
  okText = "Đồng ý",
  cancelText = "Hủy",
  onConfirm,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Định vị dropdown
  useLayoutEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const margin = 6;
      setPosition({
        top: rect.bottom + window.scrollY + margin,
        left: rect.right + window.scrollX - 280, // điều chỉnh nếu thay đổi width
        width: rect.width,
      });
    }
  }, [open]);

  // Click ngoài popup để đóng
  React.useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Dropdown chính, dùng Portal
  const Dropdown = open
    ? ReactDOM.createPortal(
      <div
        ref={dropdownRef}
        className="admin-popconfirm-dropdown"
        style={{
          position: "absolute",
          top: position.top,
          left: position.left,
          minWidth: 280,
          zIndex: 10001,
        }}
        onClick={e => e.stopPropagation()} // Quan trọng: chặn nổi bọt lên document!
      >
        <div className="admin-popconfirm-title">{title}</div>
        <div className="admin-popconfirm-actions">
          <AdminButton
            variant="secondary"
            size="sm"
            onClick={e => {
              e.stopPropagation();
              setOpen(false);
            }}
          >
            {cancelText}
          </AdminButton>
          <AdminButton
            variant="destructive"
            size="sm"
            onClick={e => {
              e.stopPropagation(); // CHẶN nổi bọt!
              onConfirm();
              setOpen(false);
            }}
          >
            {okText}
          </AdminButton>
        </div>
        {/* Mũi tên */}
        <span
          className="admin-popconfirm-arrow"
          style={{
            position: "absolute",
            top: -8,
            right: 36,
            width: 16,
            height: 8,
            pointerEvents: "none",
          }}
        >
          <svg width="18" height="8">
            <polygon
              points="9,0 18,8 0,8"
              fill="#fff"
              stroke="#ffd2cc"
              strokeWidth="1"
            />
          </svg>
        </span>
      </div>,
      document.body
    )
    : null;

  return (
    <>
      <span
        ref={triggerRef}
        style={{ display: "inline-block" }}
        onClick={e => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        {children}
      </span>
      {Dropdown}
    </>
  );
};

export default AdminPopConfirm;
