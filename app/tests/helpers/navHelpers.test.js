/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { scrollto } from '../../src/helpers/navHelpers';

describe('navHelpers', () => {
  describe('scrollto', () => {
    // Mock document.getElementById and element.scrollIntoView
    beforeEach(() => {
      // Mock scrollIntoView
      Element.prototype.scrollIntoView = vi.fn();
    });
    
    afterEach(() => {
      // Clean up mocks
      vi.restoreAllMocks();
      
      // Clear any elements added to the document
      document.body.innerHTML = '';
    });
    
    it('should scroll to an element when it exists', () => {
      // Create a test element
      const testElement = document.createElement('div');
      testElement.id = 'testSection';
      document.body.appendChild(testElement);
      
      // Spy on getElementById
      const getByIdSpy = vi.spyOn(document, 'getElementById');
      
      // Call scrollto function
      scrollto('testSection');
      
      // Verify getElementById was called with correct ID
      expect(getByIdSpy).toHaveBeenCalledWith('testSection');
      
      // Verify scrollIntoView was called
      expect(testElement.scrollIntoView).toHaveBeenCalled();
    });
    
    it('should do nothing when element does not exist', () => {
      // Spy on getElementById
      const getByIdSpy = vi.spyOn(document, 'getElementById')
        .mockReturnValue(null);
      
      // Call scrollto function with non-existent element
      scrollto('nonExistentSection');
      
      // Verify getElementById was called
      expect(getByIdSpy).toHaveBeenCalledWith('nonExistentSection');
      
      // No error should be thrown
    });
  });
});