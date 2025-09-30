import securityService from '../securityService';

describe('SecurityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should sanitize safe input', () => {
      const safeInput = 'This is a safe text input';
      const result = securityService.sanitizeInput(safeInput);
      expect(result).toBe(safeInput);
    });

    it('should remove XSS attempts', () => {
      const xssInput = '<script>alert("xss")</script>Hello';
      const result = securityService.sanitizeInput(xssInput);
      expect(result).toBe('Hello');
      expect(result).not.toContain('<script>');
    });

    it('should remove javascript protocols', () => {
      const jsInput = 'javascript:alert("test")';
      const result = securityService.sanitizeInput(jsInput);
      expect(result).not.toContain('javascript:');
    });

    it('should remove event handlers', () => {
      const eventInput = 'onclick="alert()" onload="malicious()"';
      const result = securityService.sanitizeInput(eventInput);
      expect(result).not.toContain('onclick=');
      expect(result).not.toContain('onload=');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove script tags', () => {
      const input = 'Hello <script>alert("test")</script> world';
      const sanitized = securityService.sanitizeInput(input);
      
      expect(sanitized).toBe('Hello  world');
      expect(sanitized).not.toContain('<script>');
    });

    it('should remove javascript protocols', () => {
      const input = 'javascript:alert("test") and some text';
      const sanitized = securityService.sanitizeInput(input);
      
      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).toContain('and some text');
    });

    it('should remove event handlers', () => {
      const input = 'onclick="malicious()" onload="bad()" normal text';
      const sanitized = securityService.sanitizeInput(input);
      
      expect(sanitized).not.toContain('onclick=');
      expect(sanitized).not.toContain('onload=');
      expect(sanitized).toContain('normal text');
    });

    it('should preserve safe content', () => {
      const input = 'This is a normal sentence with numbers 123 and punctuation!';
      const sanitized = securityService.sanitizeInput(input);
      
      expect(sanitized).toBe(input);
    });

    it('should handle empty input', () => {
      const sanitized = securityService.sanitizeInput('');
      expect(sanitized).toBe('');
    });

    it('should trim whitespace', () => {
      const input = '  some text with spaces  ';
      const sanitized = securityService.sanitizeInput(input);
      
      expect(sanitized).toBe('some text with spaces');
    });
  });

  describe('checkRateLimit', () => {
    it('should allow requests within rate limit', () => {
      const result = securityService.checkRateLimit('test-user', 'humanize');
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('should deny requests exceeding rate limit', () => {
      // Make multiple requests to exceed the limit
      for (let i = 0; i < 15; i++) {
        securityService.checkRateLimit('test-user-2', 'humanize');
      }
      
      const result = securityService.checkRateLimit('test-user-2', 'humanize');
      
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should handle different endpoints with different limits', () => {
      const humanizeResult = securityService.checkRateLimit('test-user-3', 'humanize');
      const detectResult = securityService.checkRateLimit('test-user-3', 'detect');
      
      expect(humanizeResult.allowed).toBe(true);
      expect(detectResult.allowed).toBe(true);
      // detect endpoint should have higher limit than humanize
      expect(detectResult.remaining).toBeGreaterThan(humanizeResult.remaining);
    });

    it('should use custom rate limit config when provided', () => {
      const customConfig = { windowMs: 60000, maxRequests: 1 };
      const result1 = securityService.checkRateLimit('test-user-4', 'custom', customConfig);
      const result2 = securityService.checkRateLimit('test-user-4', 'custom', customConfig);
      
      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(false);
    });
  });

  describe('logSecurityAlert', () => {
    it('should log security alerts with proper format', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      securityService.logSecurityAlert({
        type: 'suspicious_activity',
        severity: 'high',
        message: 'XSS attempt detected',
        userId: 'test-user',
        details: { input: '<script>' }
      });
      
      // Check if critical alerts are escalated
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should escalate critical alerts', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      securityService.logSecurityAlert({
        type: 'data_breach',
        severity: 'critical',
        message: 'Critical security event',
        userId: 'test-user'
      });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'CRITICAL SECURITY ALERT:',
        expect.objectContaining({
          type: 'data_breach',
          severity: 'critical'
        })
      );
      consoleSpy.mockRestore();
    });

    it('should handle missing parameters with defaults', () => {
      securityService.logSecurityAlert({});
      
      // Should not throw and use default values
      expect(true).toBe(true);
    });
  });

  describe('validateFileUpload', () => {
    it('should validate allowed file types', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const result = securityService.validateFileUpload(file);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject disallowed file types', () => {
      const file = new File(['content'], 'test.exe', { type: 'application/x-executable' });
      const result = securityService.validateFileUpload(file);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('File type not allowed');
    });

    it('should reject files that are too large', () => {
      // Create a mock file that's larger than 10MB
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.txt', { type: 'text/plain' });
      const result = securityService.validateFileUpload(largeFile);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('File size exceeds limit');
    });

    it('should accept valid PDF files', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const result = securityService.validateFileUpload(file);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('encryptContent', () => {
    it('should encrypt and decrypt content correctly', () => {
      const originalContent = 'sensitive information';
      const encrypted = securityService.encryptContent(originalContent);
      const decrypted = securityService.decryptContent(encrypted);
      
      expect(encrypted).not.toBe(originalContent);
      expect(decrypted).toBe(originalContent);
    });

    it('should handle empty content', () => {
      const encrypted = securityService.encryptContent('');
      const decrypted = securityService.decryptContent(encrypted);
      
      expect(decrypted).toBe('');
    });

    it('should produce different encrypted values for same input', () => {
      const content = 'test data';
      const encrypted1 = securityService.encryptContent(content);
      const encrypted2 = securityService.encryptContent(content);
      
      // Should be different due to random IV
      expect(encrypted1).not.toBe(encrypted2);
      
      // But should decrypt to same value
      expect(securityService.decryptContent(encrypted1)).toBe(content);
      expect(securityService.decryptContent(encrypted2)).toBe(content);
    });
  });

  describe('hashSensitiveData', () => {
    it('should hash data consistently', () => {
      const data = 'sensitive data';
      const hash1 = securityService.hashSensitiveData(data);
      const hash2 = securityService.hashSensitiveData(data);
      
      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(data);
    });

    it('should produce different hashes for different data', () => {
      const hash1 = securityService.hashSensitiveData('data1');
      const hash2 = securityService.hashSensitiveData('data2');
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Performance and reliability', () => {
    it('should sanitize input efficiently', () => {
      const startTime = Date.now();
      const complexInput = '<div onclick="test()">Content</div>'.repeat(100);
      
      securityService.sanitizeInput(complexInput);
      
      const processingTime = Date.now() - startTime;
      expect(processingTime).toBeLessThan(500);
    });
  });
});