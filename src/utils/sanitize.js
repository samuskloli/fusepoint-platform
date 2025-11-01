// Centralized sanitization utility for HTML content across widgets
// This ensures consistent allowed tags/attributes and supports interactive Markdown checkboxes

import DOMPurify from 'dompurify'

// Basic inline markdown (bold, italic, code, line breaks)
export function sanitizeBasic(html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['strong', 'em', 'code', 'br'],
    ALLOWED_ATTR: []
  })
}

// Comments or chat messages that may include links and spans
export function sanitizeComments(html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['span', 'a', 'br', 'strong', 'em', 'code'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
  })
}

// Notes/Markdown with interactive task checkboxes rendered in the DOM
export function sanitizeTasksInteractive(html) {
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['input'],
    ADD_ATTR: ['type', 'checked', 'data-task-index', 'class']
  })
}

// Notes/Markdown preview (non-interactive) where inputs may be disabled
export function sanitizeTasksPreview(html) {
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['input'],
    ADD_ATTR: ['type', 'checked', 'class', 'disabled']
  })
}

// Escape hatch: allow passing custom options when necessary
export function sanitizeWithOptions(html, options = {}) {
  return DOMPurify.sanitize(html, options)
}