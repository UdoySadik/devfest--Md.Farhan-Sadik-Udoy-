/**
 * Notifications Component (Phase 2 Full Implementation)
 * Displays toast messages for errors, warnings, info, and success notices.
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
 * @param {'info' | 'success' | 'warning' | 'error'} [type='info']
 * @param {number} [duration=4000] Duration in milliseconds
 */
export function showNotification(message, type = 'info', duration = 4000) {
  const container = getContainer();
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `notification notification--${type}`;

  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };

  toast.innerHTML = `
    <span class="notification-icon">${icons[type] || 'ℹ️'}</span>
    <div class="notification-content">
      <span class="notification-message">${escapeHtml(message)}</span>
    </div>
    <button class="notification-close" aria-label="Close">&times;</button>
  `;

  const closeBtn = toast.querySelector('.notification-close');
  closeBtn?.addEventListener('click', () => {
    dismissToast(toast);
  });

  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(() => {
      dismissToast(toast);
    }, duration);
  }
}

/**
 * Animate and remove a toast element.
 * @param {HTMLElement} toast
 */
function dismissToast(toast) {
  if (!toast || toast.classList.contains('removing')) return;
  toast.classList.add('removing');
  setTimeout(() => {
    toast.remove();
  }, 250);
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

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
