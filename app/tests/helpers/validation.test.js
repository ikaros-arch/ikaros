import { describe, it, expect } from 'vitest';
import { isUUID } from '../../src/helpers/validation';

describe('validation', () => {
  describe('isUUID', () => {
    it('should return true for valid UUIDs', () => {
      // Valid UUIDs
      expect(isUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(isUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
    });

    it('should return false for invalid UUIDs', () => {
      // Invalid UUIDs - wrong format
      expect(isUUID('not-a-uuid')).toBe(false);
      expect(isUUID('123e4567-e89b-12d3-a456')).toBe(false); // Too short
      expect(isUUID('123e4567-e89b-12d3-a456-4266141740001')).toBe(false); // Too long
      expect(isUUID('123e4567-e89b-12d3-a456-42661417400g')).toBe(false); // Invalid character 'g'
      
      // Invalid UUIDs - incorrect segments
      expect(isUUID('123e456-e89b-12d3-a456-426614174000')).toBe(false); // First segment too short
      expect(isUUID('123e45678-e89b-12d3-a456-426614174000')).toBe(false); // First segment too long
    });

    it('should return false for non-string inputs', () => {
      expect(isUUID(null)).toBe(false);
      expect(isUUID(undefined)).toBe(false);
      expect(isUUID(123)).toBe(false);
      expect(isUUID({})).toBe(false);
      expect(isUUID([])).toBe(false);
    });
  });
});