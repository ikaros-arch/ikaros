import { describe, it, expect, vi } from 'vitest';
import { 
  handlePress, 
  handleInputChange,
  handleJSONChange,
  handleDateChange,
  handleDateRangeChange,
  handleCheckChange,
  handleAutocompleteChange,
  handleMultiAutocompleteChange,
  handleArrayChange,
  goToRecord
} from '../../src/helpers/buttonActions';
import { formatISO } from 'date-fns';

// Mock the formatToPostgresDateRange function since we're importing it from another file
vi.mock('helpers/transformers', () => ({
  formatToPostgresDateRange: vi.fn((dateRange) => `[${dateRange[0]},${dateRange[1]}]`)
}));

describe('buttonActions', () => {
  describe('handlePress', () => {
    it('should call navigate with the target', () => {
      const navigate = vi.fn();
      handlePress(navigate, '/target-path');
      expect(navigate).toHaveBeenCalledWith('/target-path');
    });
  });

  describe('handleInputChange', () => {
    it('should update currData with string value', () => {
      const setCurrData = vi.fn();
      const currData = { name: 'John' };
      const event = { target: { name: 'email', value: 'john@example.com' } };
      
      handleInputChange(event, currData, setCurrData);
      
      expect(setCurrData).toHaveBeenCalledWith({ 
        name: 'John', 
        email: 'john@example.com' 
      });
    });

    it('should parse JSON values if possible', () => {
      const setCurrData = vi.fn();
      const currData = { name: 'John' };
      const event = { target: { name: 'preferences', value: '{"theme":"dark"}' } };
      
      handleInputChange(event, currData, setCurrData);
      
      expect(setCurrData).toHaveBeenCalledWith({ 
        name: 'John', 
        preferences: { theme: 'dark' } 
      });
    });

    it('should set value to null if empty string', () => {
      const setCurrData = vi.fn();
      const currData = { name: 'John', email: 'john@example.com' };
      const event = { target: { name: 'email', value: '' } };
      
      handleInputChange(event, currData, setCurrData);
      
      expect(setCurrData).toHaveBeenCalledWith({ 
        name: 'John', 
        email: null 
      });
    });

    it('should use original value if JSON parsing fails', () => {
      const setCurrData = vi.fn();
      const currData = { name: 'John' };
      const event = { target: { name: 'preferences', value: '{invalid JSON}' } };
      
      handleInputChange(event, currData, setCurrData);
      
      expect(setCurrData).toHaveBeenCalledWith({ 
        name: 'John', 
        preferences: '{invalid JSON}' 
      });
    });
  });

  describe('handleJSONChange', () => {
    it('should update nested JSON structure', () => {
      const setCurrData = vi.fn();
      const currData = { 
        metadata: { 
          settings: { theme: 'light' },
          user: { name: 'John' }
        } 
      };
      const localData = { theme: 'dark', fontSize: 'large' };
      
      handleJSONChange(localData, currData, setCurrData, 'settings', 'metadata');
      
      expect(setCurrData).toHaveBeenCalledWith({ 
        metadata: { 
          settings: { theme: 'dark', fontSize: 'large' },
          user: { name: 'John' }
        } 
      });
    });
  });

  describe('handleDateChange', () => {
    it('should format date and update currData', () => {
      const setCurrData = vi.fn();
      const currData = { name: 'Event' };
      const date = new Date(2023, 0, 15); // Jan 15, 2023
      const isoDate = formatISO(date);
      
      handleDateChange(date, 'eventDate', currData, setCurrData);
      
      expect(setCurrData).toHaveBeenCalledWith({ 
        name: 'Event', 
        eventDate: isoDate
      });
    });
  });

  describe('handleDateRangeChange', () => {
    it('should format date range and update currData', () => {
      const setCurrData = vi.fn();
      const currData = { name: 'Event' };
      const dateRange = ['2023-01-01', '2023-01-31'];
      
      handleDateRangeChange(dateRange, 'eventPeriod', currData, setCurrData);
      
      expect(setCurrData).toHaveBeenCalledWith({ 
        name: 'Event', 
        eventPeriod: '[2023-01-01,2023-01-31]'
      });
    });
  });

  describe('handleCheckChange', () => {
    it('should update boolean value in currData', () => {
      const setCurrData = vi.fn();
      const currData = { name: 'Feature', enabled: false };
      const event = { target: { checked: true } };
      
      handleCheckChange(event, 'enabled', currData, setCurrData);
      
      expect(setCurrData).toHaveBeenCalledWith({ 
        name: 'Feature', 
        enabled: true
      });
    });
  });

  describe('handleAutocompleteChange', () => {
    it('should update currData with uuid from complex object', () => {
      const setCurrData = vi.fn();
      const currData = { name: 'Form' };
      const newValue = { uuid: '123e4567-e89b-12d3-a456-426614174000', label: 'Option 1' };
      
      handleAutocompleteChange(null, newValue, 'selectedOption', currData, setCurrData);
      
      expect(setCurrData).toHaveBeenCalledWith({ 
        name: 'Form', 
        selectedOption: '123e4567-e89b-12d3-a456-426614174000'
      });
    });

    it('should update currData with value from object without uuid', () => {
      const setCurrData = vi.fn();
      const currData = { name: 'Form' };
      const newValue = { value: 'option-1', label: 'Option 1' };
      
      handleAutocompleteChange(null, newValue, 'selectedOption', currData, setCurrData);
      
      expect(setCurrData).toHaveBeenCalledWith({ 
        name: 'Form', 
        selectedOption: 'option-1'
      });
    });

    it('should update currData with direct value', () => {
      const setCurrData = vi.fn();
      const currData = { name: 'Form' };
      const newValue = 'option-1';
      
      handleAutocompleteChange(null, newValue, 'selectedOption', currData, setCurrData);
      
      expect(setCurrData).toHaveBeenCalledWith({ 
        name: 'Form', 
        selectedOption: 'option-1'
      });
    });

    it('should set null when value is null or undefined', () => {
      const setCurrData = vi.fn();
      const currData = { name: 'Form', selectedOption: 'old-value' };
      
      handleAutocompleteChange(null, null, 'selectedOption', currData, setCurrData);
      
      expect(setCurrData).toHaveBeenCalledWith({ 
        name: 'Form', 
        selectedOption: null
      });
    });
  });

  describe('handleMultiAutocompleteChange', () => {
    it('should update currData with array of uuids', () => {
      const setCurrData = vi.fn();
      const currData = { name: 'Form' };
      const newValues = [
        { uuid: '123e4567-e89b-12d3-a456-426614174000', label: 'Option 1' },
        { uuid: '550e8400-e29b-41d4-a716-446655440000', label: 'Option 2' }
      ];
      
      // Mock console.log to avoid cluttering test output
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      handleMultiAutocompleteChange(null, newValues, 'selectedOptions', currData, setCurrData);
      
      expect(setCurrData).toHaveBeenCalledWith({ 
        name: 'Form', 
        selectedOptions: [
          '123e4567-e89b-12d3-a456-426614174000',
          '550e8400-e29b-41d4-a716-446655440000'
        ]
      });
      
      // Restore console.log
      consoleLogSpy.mockRestore();
    });

    it('should handle null values', () => {
      const setCurrData = vi.fn();
      const currData = { name: 'Form', selectedOptions: ['old-value'] };
      
      // Mock console.log to avoid cluttering test output
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      handleMultiAutocompleteChange(null, null, 'selectedOptions', currData, setCurrData);
      
      expect(setCurrData).toHaveBeenCalledWith({ 
        name: 'Form', 
        selectedOptions: null
      });
      
      // Restore console.log
      consoleLogSpy.mockRestore();
    });
  });

  describe('handleArrayChange', () => {
    it('should update currData with array values', () => {
      const setCurrData = vi.fn();
      const currData = { name: 'Form' };
      const newValues = ['value1', 'value2', 'value3'];
      
      handleArrayChange(newValues, 'selectedItems', currData, setCurrData);
      
      expect(setCurrData).toHaveBeenCalledWith({ 
        name: 'Form', 
        selectedItems: ['value1', 'value2', 'value3']
      });
    });
  });

  describe('goToRecord', () => {
    it('should navigate to Documentary route for D prefixed IDs', () => {
      const navigate = vi.fn();
      goToRecord(navigate, 'D123');
      expect(navigate).toHaveBeenCalledWith('/Documentary/D123');
    });

    it('should navigate to Literary route for L prefixed IDs', () => {
      const navigate = vi.fn();
      goToRecord(navigate, 'L456');
      expect(navigate).toHaveBeenCalledWith('/Literary/L456');
    });

    it('should navigate to Archaeological route for A prefixed IDs', () => {
      const navigate = vi.fn();
      goToRecord(navigate, 'A789');
      expect(navigate).toHaveBeenCalledWith('/Archaeological/A789');
    });

    it('should navigate to Visual route for V prefixed IDs', () => {
      const navigate = vi.fn();
      goToRecord(navigate, 'V012');
      expect(navigate).toHaveBeenCalledWith('/Visual/V012');
    });

    it('should navigate directly to ID for other formats', () => {
      const navigate = vi.fn();
      goToRecord(navigate, 'X345');
      expect(navigate).toHaveBeenCalledWith('X345');
    });
  });
});