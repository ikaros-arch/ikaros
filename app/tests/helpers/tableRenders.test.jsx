/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Cancel from '@mui/icons-material/Cancel';
import {
  renderBooleanCell,
  getYearSortComparator,
  standardColDef,
  jsonColDef,
  selectColDef,
  colDef,
  surveyColDefs
} from '../../src/helpers/tableRenders';

// Mock the imports used in tableRenders.jsx
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

vi.mock('helpers/transformers', () => ({
  extractRangeDate: vi.fn((dating, type, format) => {
    if (type === 'TPQ') {
      return { yearInt: 2012, yearStr: '2012 CE', notation: 'CE' };
    } else {
      return { yearInt: 2013, yearStr: '2013 CE', notation: 'CE' };
    }
  })
}));

vi.mock('helpers/buttonActions', () => ({
  goToRecord: vi.fn()
}));

describe('tableRenders', () => {
  describe('renderBooleanCell', () => {
    it('should render CheckCircle for true values', () => {
      const params = { value: true };
      const result = renderBooleanCell(params);
      
      // Check that it's a CheckCircle component
      expect(result.type).toBe(CheckCircle);
      // Check that it has style
      expect(result.props.style).toBeDefined();
    });

    it('should render Cancel for false values', () => {
      const params = { value: false };
      const result = renderBooleanCell(params);
      
      // Check that it's a Cancel component
      expect(result.type).toBe(Cancel);
      // Check that it has style
      expect(result.props.style).toBeDefined();
    });
  });

  describe('getYearSortComparator', () => {
    it('should sort in ascending order when sortDirection is "asc"', () => {
      const comparator = getYearSortComparator('asc');
      
      // Normal values
      expect(comparator(100, 200)).toBeLessThan(0);
      expect(comparator(200, 100)).toBeGreaterThan(0);
      // Use numeric equality check for zero values
      expect(comparator(100, 100) === 0).toBe(true);
      
      // Empty values should be sorted last
      expect(comparator('', 100)).toBeGreaterThan(0);
      expect(comparator(100, '')).toBeLessThan(0);
      expect(comparator(null, 100)).toBeGreaterThan(0);
      expect(comparator(undefined, 100)).toBeGreaterThan(0);
    });

    it('should sort in descending order when sortDirection is "desc"', () => {
      const comparator = getYearSortComparator('desc');
      
      // Normal values
      expect(comparator(100, 200)).toBeGreaterThan(0);
      expect(comparator(200, 100)).toBeLessThan(0);
      // Use numeric equality check for zero values
      expect(comparator(100, 100) === 0).toBe(true);
      
      // Empty values should be sorted last
      expect(comparator('', 100)).toBeGreaterThan(0);
      expect(comparator(100, '')).toBeLessThan(0);
    });
  });

  describe('standardColDef', () => {
    it('should create a standard column definition with default values', () => {
      const colDef = standardColDef('fieldName', 'Field Name');
      
      expect(colDef.field).toBe('fieldName');
      expect(colDef.headerName).toBe('Field Name');
      expect(colDef.flex).toBe(1);
      expect(colDef.type).toBe('text');
      expect(colDef.editable).toBe(false);
      expect(colDef.sortable).toBe(true);
    });

    it('should create a column definition with custom flex value', () => {
      const colDef = standardColDef('fieldName', 'Field Name', 2);
      
      expect(colDef.flex).toBe(2);
    });

    it('should create an editable column when specified', () => {
      const colDef = standardColDef('fieldName', 'Field Name', 1, true);
      
      expect(colDef.editable).toBe(true);
    });
  });

  describe('jsonColDef', () => {
    it('should create a column definition for JSON data with default values', () => {
      const colDef = jsonColDef('changedFields', 'Changed Fields');
      
      expect(colDef.field).toBe('changedFields');
      expect(colDef.headerName).toBe('Changed Fields');
      expect(colDef.flex).toBe(4);
      expect(colDef.type).toBe('text');
      expect(colDef.editable).toBe(false);
      expect(colDef.sortable).toBe(true);
      expect(typeof colDef.renderCell).toBe('function');
      expect(typeof colDef.valueGetter).toBe('function');
    });

    it('should create a column definition with custom flex value', () => {
      const colDef = jsonColDef('changedFields', 'Changed Fields', 2);
      
      expect(colDef.flex).toBe(2);
    });
  });

  describe('selectColDef', () => {
    it('should create a column definition for selectable data with default values', () => {
      const options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
      ];
      const colDef = selectColDef('status', 'Status', options);
      
      expect(colDef.field).toBe('status');
      expect(colDef.headerName).toBe('Status');
      expect(colDef.flex).toBe(1);
      expect(colDef.editable).toBe(true);
      expect(typeof colDef.renderCell).toBe('function');
      expect(typeof colDef.renderEditCell).toBe('function');
    });

    it('should create a column definition with custom flex value', () => {
      const options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
      ];
      const colDef = selectColDef('status', 'Status', options, 2);
      
      expect(colDef.flex).toBe(2);
    });

    it('should render cell with correct label for matching value', () => {
      const options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
      ];
      const colDef = selectColDef('status', 'Status', options);
      
      const params = { value: 'option1' };
      const result = colDef.renderCell(params);
      
      expect(result).toBe('Option 1');
    });

    it('should render cell with raw value when no match found', () => {
      const options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
      ];
      const colDef = selectColDef('status', 'Status', options);
      
      const params = { value: 'option3' };
      const result = colDef.renderCell(params);
      
      expect(result).toBe('option3');
    });
  });

  describe('exported column definitions', () => {
    it('should export colDef with expected fields', () => {
      const expectedFields = [
        'uuid', 'id', 'link', 'entryName', 'name', 'authorities', 
        'inventory', 'placeName', 'dateStart', 'dateEnd', 'dateNotes',
        'indexTopics', 'tags', 'completeBool', 'visitedBool'
      ];
      
      expectedFields.forEach(field => {
        expect(colDef[field]).toBeDefined();
      });
    });

    it('should export surveyColDefs with expected fields', () => {
      const expectedFields = ['name', 'parent', 'type'];
      
      expectedFields.forEach(field => {
        expect(surveyColDefs[field]).toBeDefined();
      });
    });

    it('should define boolean columns with the correct renderer', () => {
      expect(colDef.completeBool.renderCell).toBe(renderBooleanCell);
      expect(colDef.visitedBool.renderCell).toBe(renderBooleanCell);
    });

    it('should define date columns with the correct value getter and renderer', () => {
      expect(typeof colDef.dateStart.valueGetter).toBe('function');
      expect(typeof colDef.dateStart.renderCell).toBe('function');
      expect(typeof colDef.dateStart.getSortComparator).toBe('function');

      expect(typeof colDef.dateEnd.valueGetter).toBe('function');
      expect(typeof colDef.dateEnd.renderCell).toBe('function');
      expect(typeof colDef.dateEnd.getSortComparator).toBe('function');
    });
  });

  // Testing React components requires more setup, here's a simple test for basic rendering
  describe('React component functions', () => {
    it('should have the expected shape for column definitions with React components', () => {
      // These are more complex to test, so we're just verifying they're functions
      expect(typeof colDef.entryName.renderCell).toBe('function');
      expect(typeof colDef.authorities.renderCell).toBe('function');
      expect(typeof colDef.inventory.renderCell).toBe('function');
      expect(typeof colDef.dateNotes.renderCell).toBe('function');
      expect(typeof colDef.link.renderCell).toBe('function');
    });
  });
});