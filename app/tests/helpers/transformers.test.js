import { describe, it, expect } from 'vitest';
import {
  parsePostgresDateRange,
  formatToPostgresDateRange,
  formatDateString,
  dateSortComparator,
  extractRangeDate,
  capitalizeFirstLetter
} from '../../src/helpers/transformers';

describe('transformers', () => {
  describe('parsePostgresDateRange', () => {
    it('should parse a valid PostgreSQL daterange string', () => {
      const range = '[2012-06-01,2013-09-15)';
      const result = parsePostgresDateRange(range);
      
      expect(result.length).toBe(2);
      expect(result[0] instanceof Date).toBe(true);
      expect(result[1] instanceof Date).toBe(true);
      expect(result[0].toISOString().split('T')[0]).toBe('2012-06-01');
      expect(result[1].toISOString().split('T')[0]).toBe('2013-09-15');
    });

    it('should return [null, null] for empty or null input', () => {
      expect(parsePostgresDateRange('')).toEqual([null, null]);
      expect(parsePostgresDateRange(null)).toEqual([null, null]);
      expect(parsePostgresDateRange(undefined)).toEqual([null, null]);
    });

    it('should handle different bracket notations', () => {
      const range1 = '(2012-06-01,2013-09-15]';
      const result1 = parsePostgresDateRange(range1);
      expect(result1[0].toISOString().split('T')[0]).toBe('2012-06-01');
      expect(result1[1].toISOString().split('T')[0]).toBe('2013-09-15');
      
      const range2 = '[2012-06-01,2013-09-15]';
      const result2 = parsePostgresDateRange(range2);
      expect(result2[0].toISOString().split('T')[0]).toBe('2012-06-01');
      expect(result2[1].toISOString().split('T')[0]).toBe('2013-09-15');
    });
  });

  describe('formatToPostgresDateRange', () => {
    it('should format valid Date objects to a PostgreSQL daterange string', () => {
      const startDate = new Date('2012-06-01');
      const endDate = new Date('2013-09-15');
      const result = formatToPostgresDateRange([startDate, endDate]);
      
      expect(result).toBe('[2012-06-01,2013-09-15)');
    });

    it('should handle null or invalid dates', () => {
      expect(formatToPostgresDateRange([null, null])).toBe('[,)');
      expect(formatToPostgresDateRange([new Date('2012-06-01'), null])).toBe('[2012-06-01,)');
      expect(formatToPostgresDateRange([null, new Date('2013-09-15')])).toBe('[,2013-09-15)');
      expect(formatToPostgresDateRange([new Date('invalid'), new Date('invalid')])).toBe('[,)');
    });
  });

  describe('formatDateString', () => {
    it('should replace BC with BCE', () => {
      expect(formatDateString('2000 BC')).toBe('2000 BCE');
      expect(formatDateString('500BC')).toBe('500 BCE');
    });

    it('should remove leading zeros', () => {
      expect(formatDateString('0500 BCE')).toBe('500 BCE');
      expect(formatDateString('0099')).toBe('99');
      expect(formatDateString('00123')).toBe('123');
    });

    it('should handle strings without BC and leading zeros', () => {
      expect(formatDateString('2021')).toBe('2021');
      expect(formatDateString('500 CE')).toBe('500 CE');
    });
  });

  describe('dateSortComparator', () => {
    it('should sort BCE dates before CE dates', () => {
      const date1 = '500 BCE';
      const date2 = '500 CE';
      
      expect(dateSortComparator(date1, date2)).toBe(-1);
      expect(dateSortComparator(date2, date1)).toBe(1);
    });

    it('should sort dates chronologically within the same era', () => {
      const earlier = '400 BCE';
      const later = '200 BCE';
      
      expect(dateSortComparator(earlier, later)).toBe(-1);
      expect(dateSortComparator(later, earlier)).toBe(1);
      
      const earlierCE = '200 CE';
      const laterCE = '400 CE';
      
      expect(dateSortComparator(earlierCE, laterCE)).toBe(-1);
      expect(dateSortComparator(laterCE, earlierCE)).toBe(1);
    });

    it('should handle equal dates', () => {
      expect(dateSortComparator('400 BCE', '400 BCE')).toBe(0);
      expect(dateSortComparator('2021 CE', '2021 CE')).toBe(0);
    });

    it('should handle dates with different formats', () => {
      expect(dateSortComparator('500-01-01 BCE', '500 BCE')).toBe(0);
      expect(dateSortComparator('2021', '2021-01-01')).toBe(0);
    });
  });

  describe('extractRangeDate', () => {
    it('should extract TPQ (terminus post quem) date from dating string', () => {
      const dating = '["2012-06-01","2013-09-15")';
      const result = extractRangeDate(dating, 'TPQ', 'year');
      
      expect(result.yearInt).toBe(2012);
      expect(result.yearStr).toBe('2012 CE');
      expect(result.notation).toBe('CE');
    });

    it('should extract TAQ (terminus ante quem) date from dating string', () => {
      const dating = '["2012-06-01","2013-09-15")';
      const result = extractRangeDate(dating, 'TAQ', 'year');
      
      expect(result.yearInt).toBe(2013);
      expect(result.yearStr).toBe('2013 CE');
      expect(result.notation).toBe('CE');
    });

    it('should return empty string for null or undefined input', () => {
      expect(extractRangeDate(null, 'TPQ')).toBe('');
      expect(extractRangeDate(undefined, 'TAQ')).toBe('');
    });

    it('should return empty string when regex doesn\'t match', () => {
      expect(extractRangeDate('invalid-format', 'TPQ')).toBe('');
      expect(extractRangeDate('invalid-format', 'TAQ')).toBe('');
    });
  });

  describe('capitalizeFirstLetter', () => {
    it('should capitalize first letter of a string', () => {
      expect(capitalizeFirstLetter('hello')).toBe('Hello');
      expect(capitalizeFirstLetter('world')).toBe('World');
    });

    it('should not change already capitalized strings', () => {
      expect(capitalizeFirstLetter('Hello')).toBe('Hello');
      expect(capitalizeFirstLetter('WORLD')).toBe('WORLD');
    });

    it('should handle empty strings and non-string inputs', () => {
      expect(capitalizeFirstLetter('')).toBe('');
      expect(capitalizeFirstLetter(null)).toBe(null);
      expect(capitalizeFirstLetter(undefined)).toBe(undefined);
    });

    it('should handle single letter strings', () => {
      expect(capitalizeFirstLetter('a')).toBe('A');
      expect(capitalizeFirstLetter('Z')).toBe('Z');
    });
  });
});