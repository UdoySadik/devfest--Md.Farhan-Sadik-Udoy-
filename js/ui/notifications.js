/**
 * Notifications Component (Phase 1 Stub & Foundation)
 * Displays toast messages for errors, warnings, and success notices.
 */

let containerElement = null;

function getContainer() {
  if (!containerElement) {
    containerElement = document.getElementById('notifications-container');
  }
  return containerElement;
}

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'info' | 'success' | 'warning' | 'error'} type
 * @param {number} duration Duration in milliseconds (default 4000)
 */
export function showNotification(message, type = 'info', duration = 4000) {
  const container = getContainer();
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `notification notification-${type} animate-slide-in`;

  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };

  toast.innerHTML = `
    <span class="notification-icon">${icons[type] || 'ℹ️'}</span>
    <span class="notification-message">${message}</span>
    <button class="notification-close" aria-label="Close">&times;</button>
  `;

  const closeBtn = toast.querySelector('.notification-close');
  closeBtn?.addEventListener('click', () => {
    toast.remove();
  });

  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

/**
 * Clear all currently displayed notifications.
 */
export function clearNotifications() {
  const container = getContainer();
  if (container) {
    container.innerHTML = '';
  }
}
