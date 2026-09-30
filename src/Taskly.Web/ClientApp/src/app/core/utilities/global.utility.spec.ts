import { Guid, Guard } from './global.utility';

describe('Guid', () => {
  describe('empty', () => {
    it('should return the empty GUID constant', () => {
      expect(Guid.empty).toBe('00000000-0000-0000-0000-000000000000');
    });
  });

  describe('newGuid', () => {
    it('should generate a valid GUID format', () => {
      const guid = Guid.newGuid();
      const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(guid).toMatch(guidPattern);
    });

    it('should generate unique GUIDs on consecutive calls', () => {
      const guid1 = Guid.newGuid();
      const guid2 = Guid.newGuid();
      const guid3 = Guid.newGuid();

      expect(guid1).not.toBe(guid2);
      expect(guid2).not.toBe(guid3);
      expect(guid1).not.toBe(guid3);
    });

    it('should always have version 4 in the correct position', () => {
      for (let i = 0; i < 10; i++) {
        const guid = Guid.newGuid();
        expect(guid.charAt(14)).toBe('4');
      }
    });
  });

  describe('isGuidReference', () => {
    it('should return true for valid GUIDs', () => {
      expect(Guid.isGuidReference('12345678-1234-1234-1234-123456789abc')).toBe(true);
      expect(Guid.isGuidReference('ABCDEF12-3456-7890-ABCD-EF1234567890')).toBe(true);
      expect(Guid.isGuidReference('00000000-0000-0000-0000-000000000000')).toBe(true);
    });

    it('should return false for invalid GUIDs', () => {
      expect(Guid.isGuidReference('not-a-guid')).toBe(false);
      expect(Guid.isGuidReference('12345678-1234-1234-1234-123456789')).toBe(false);
      expect(Guid.isGuidReference('12345678-1234-1234-1234-123456789abcdef')).toBe(false);
      expect(Guid.isGuidReference('')).toBe(false);
      expect(Guid.isGuidReference('12345678123412341234123456789abc')).toBe(false);
    });

    it('should handle generated GUIDs', () => {
      const guid = Guid.newGuid();
      expect(Guid.isGuidReference(guid)).toBe(true);
    });
  });
});

describe('Guard', () => {
  describe('against.nullOrEmpty', () => {
    it('should not throw for non-empty objects', () => {
      expect(() => Guard.against.nullOrEmpty({ key: 'value' })).not.toThrow();
    });

    it('should throw for null', () => {
      expect(() => Guard.against.nullOrEmpty(null)).toThrow();
    });

    it('should throw for undefined', () => {
      expect(() => Guard.against.nullOrEmpty(undefined)).toThrow();
    });

    it('should throw for empty objects', () => {
      expect(() => Guard.against.nullOrEmpty({})).toThrow();
    });
  });
});

describe('String prototype extensions', () => {
  describe('isNullOrWhitespace', () => {
    it('should return true for empty string', () => {
      expect(''.isNullOrWhitespace()).toBe(true);
    });

    it('should return true for whitespace only', () => {
      expect('   '.isNullOrWhitespace()).toBe(true);
      expect('\t'.isNullOrWhitespace()).toBe(true);
      expect('\n'.isNullOrWhitespace()).toBe(true);
    });

    it('should return false for non-empty strings', () => {
      expect('hello'.isNullOrWhitespace()).toBe(false);
      expect('  hello  '.isNullOrWhitespace()).toBe(false);
    });
  });

  describe('isNullOrEmpty', () => {
    it('should return true for empty string', () => {
      expect(''.isNullOrEmpty()).toBe(true);
    });

    it('should return false for whitespace string', () => {
      expect('   '.isNullOrEmpty()).toBe(false);
    });

    it('should return false for non-empty strings', () => {
      expect('hello'.isNullOrEmpty()).toBe(false);
    });
  });
});

describe('Array prototype extensions', () => {
  describe('isNullOrEmpty', () => {
    it('should return true for empty array', () => {
      expect([].isNullOrEmpty()).toBe(true);
    });

    it('should return false for non-empty array', () => {
      expect([1].isNullOrEmpty()).toBe(false);
      expect([1, 2, 3].isNullOrEmpty()).toBe(false);
      expect(['a', 'b'].isNullOrEmpty()).toBe(false);
    });
  });
});
