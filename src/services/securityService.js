/**
 * AgriSmart Security Service
 * Enterprise-grade client security, input sanitization, AI prompt injection firewall,
 * and cryptographic data integrity verification.
 */

// 1. Web Crypto API SHA-256 & HMAC
export async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function generateHmac(message, secret = 'agrismart-audit-salt-2026') {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// 2. Tamper-evident Secure Storage with Cryptographic Signatures
export const SecureStorage = {
  async setItem(key, data) {
    try {
      const serialized = JSON.stringify(data);
      const signature = await generateHmac(serialized);
      const envelope = {
        payload: data,
        signature,
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorage.setItem(`sec_${key}`, JSON.stringify(envelope));
      return true;
    } catch (err) {
      console.warn('SecureStorage write error:', err);
      return false;
    }
  },

  async getItem(key, fallback = null) {
    try {
      const raw = localStorage.getItem(`sec_${key}`);
      if (!raw) return fallback;

      const envelope = JSON.parse(raw);
      if (!envelope || !envelope.payload || !envelope.signature) {
        console.warn(`[Security Alert] Tampered or malformed payload detected for key: ${key}`);
        return fallback;
      }

      // Verify HMAC signature
      const expectedSig = await generateHmac(JSON.stringify(envelope.payload));
      if (expectedSig !== envelope.signature) {
        console.error(`[Security Breach] Integrity check failed for ${key}! Data has been altered.`);
        return fallback;
      }

      return envelope.payload;
    } catch (err) {
      console.warn(`SecureStorage read error for ${key}:`, err);
      return fallback;
    }
  },

  removeItem(key) {
    localStorage.removeItem(`sec_${key}`);
  }
};

// 3. AI Assistant Prompt Injection Firewall & Query Sanitizer
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /reveal\s+(system\s+)?prompt/i,
  /you\s+are\s+now\s+(an?\s+)?unrestricted/i,
  /system\s*:\s*role/i,
  /<script\b[^>]*>[\s\S]*?<\/script>/gi,
  /javascript\s*:/i,
  /union\s+select/i,
  /drop\s+table/i,
  /eval\s*\(/i,
  /exec\s*\(/i,
  /__proto__/i,
  /constructor\[/i
];

export function sanitizeAndInspectQuery(rawQuery) {
  if (typeof rawQuery !== 'string') {
    return { isClean: false, sanitizedText: '', threatDetected: 'Invalid input type' };
  }

  const trimmed = rawQuery.trim();

  // Check against injection attacks
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        isClean: false,
        sanitizedText: '',
        threatDetected: `Malicious pattern flagged: ${pattern.source.slice(0, 30)}...`,
        severity: 'HIGH'
      };
    }
  }

  // Sanitize HTML / Script entities
  const sanitized = trimmed
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .slice(0, 1000); // Enforce character length limit to avoid buffer attacks

  return {
    isClean: true,
    sanitizedText: sanitized,
    threatDetected: null,
    severity: 'NONE'
  };
}

// 4. Client Request Nonce & Security Headers Helper
export function createSecurityHeaders(apiKey = null) {
  const timestamp = Date.now().toString();
  const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  const headers = {
    'X-Client-Timestamp': timestamp,
    'X-Client-Nonce': nonce,
    'X-Client-Version': 'SQUADX-v2.6-SECURE'
  };

  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  return headers;
}

// 5. Audit Log System
export class SecurityAuditLogger {
  static logs = [];

  static logEvent(action, severity = 'INFO', details = {}) {
    const entry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      action,
      severity,
      details,
      userAgentHash: navigator.userAgent ? navigator.userAgent.slice(0, 20) : 'unknown'
    };

    this.logs.unshift(entry);
    if (this.logs.length > 50) this.logs.pop();

    if (severity === 'CRITICAL' || severity === 'HIGH') {
      console.warn(`[SECURITY EVENT - ${severity}]`, action, details);
    }
    return entry;
  }

  static getRecentLogs() {
    return this.logs;
  }
}
