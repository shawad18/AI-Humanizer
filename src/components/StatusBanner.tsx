import React from 'react';
import '../styles/StatusBanner.css';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type BannerVariant = 'success' | 'error' | 'warning' | 'info';

type Action = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
};

interface StatusBannerProps {
  open: boolean;
  variant: BannerVariant;
  title: string;
  message?: string;
  progress?: number; // 0-100, optional percentage indicator
  actions?: Action[];
  onClose?: () => void;
}

export default function StatusBanner({
  open,
  variant,
  title,
  message,
  progress,
  actions,
  onClose,
}: StatusBannerProps) {
  if (!open) return null;

  const percent = typeof progress === 'number' ? Math.max(0, Math.min(100, progress)) : undefined;

  return (
    <div className={`status-banner status-banner--${variant}`}>
      <div className="status-banner__content">
        <div className="status-banner__text">
          <div className="status-banner__title">{title}</div>
          {message && <div className="status-banner__message">{message}</div>}
          {percent !== undefined && (
            <div className="status-banner__progress">
              <div className="status-banner__progress-bar">
                <div
                  className="status-banner__progress-fill"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="status-banner__progress-label">{percent}%</div>
            </div>
          )}
        </div>
        <div className="status-banner__actions">
          {actions?.map((action, idx) => (
            <IconButton
              key={idx}
              aria-label={action.label}
              size="small"
              onClick={action.onClick}
              className="status-banner__action-btn"
            >
              {action.icon}
            </IconButton>
          ))}
          {onClose && (
            <IconButton aria-label="Close" size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          )}
        </div>
      </div>
    </div>
  );
}