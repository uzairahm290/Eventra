/**
 * Security utility functions for input sanitization and validation
 */

/**
 * Sanitize user input to prevent XSS attacks
 * Removes potentially dangerous HTML tags and scripts
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  
  // Remove vbscript: protocol
  sanitized = sanitized.replace(/vbscript:/gi, '');
  
  return sanitized.trim();
}

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(text: string): string {
  if (!text) return '';
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate phone number (basic validation)
 */
export function isValidPhone(phone: string): boolean {
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');
  // Check if it contains only digits and optional + at start
  const phoneRegex = /^\+?\d{10,15}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Sanitize SQL-like input (additional safety layer)
 * Note: Backend already uses parameterized queries, but this adds client-side validation
 */
export function containsSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
    /(--|;|\/\*|\*\/|xp_|sp_)/gi,
    /('|\b(OR|AND)\b.*=.*)/gi
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Validate input length
 */
export function validateLength(input: string, min: number, max: number): boolean {
  return input.length >= min && input.length <= max;
}

/**
 * Remove non-alphanumeric characters (useful for IDs, usernames)
 */
export function sanitizeAlphanumeric(input: string): string {
  return input.replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: string): string {
  return input.replace(/[^0-9.-]/g, '');
}

/**
 * Rate limiting helper - tracks API calls per endpoint
 */
class RateLimiter {
  private calls: Map<string, number[]> = new Map();
  
  /**
   * Check if rate limit is exceeded
   * @param key Unique key for the action (e.g., endpoint + user)
   * @param maxCalls Maximum number of calls allowed
   * @param windowMs Time window in milliseconds
   */
  isLimitExceeded(key: string, maxCalls: number, windowMs: number): boolean {
    const now = Date.now();
    const calls = this.calls.get(key) || [];
    
    // Remove calls outside the time window
    const recentCalls = calls.filter(time => now - time < windowMs);
    
    if (recentCalls.length >= maxCalls) {
      return true;
    }
    
    // Add current call
    recentCalls.push(now);
    this.calls.set(key, recentCalls);
    
    return false;
  }
  
  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.calls.delete(key);
  }
}

export const rateLimiter = new RateLimiter();
