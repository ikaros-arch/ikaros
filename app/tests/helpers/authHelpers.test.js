import { describe, it, expect, vi } from 'vitest';
import { hasRole } from '../../src/helpers/authHelpers';

describe('authHelpers', () => {
  describe('hasRole', () => {
    it('should return true when user has the specified role', () => {
      // Mock console.log to avoid cluttering test output
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const keycloak = {
        realmAccess: {
          roles: ['user', 'admin', 'editor']
        },
        resourceAccess: {
          mima: {
            roles: ['user', 'editor']
          }
        },
        hasResourceRole: vi.fn().mockReturnValue(true)
      };
      
      expect(hasRole(keycloak, 'admin')).toBe(true);
      
      // Restore console.log
      consoleLogSpy.mockRestore();
    });

    it('should return false when user does not have the specified role', () => {
      // Mock console.log to avoid cluttering test output
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const keycloak = {
        realmAccess: {
          roles: ['user', 'editor']
        },
        resourceAccess: {
          mima: {
            roles: ['user']
          }
        },
        hasResourceRole: vi.fn().mockReturnValue(false)
      };
      
      expect(hasRole(keycloak, 'admin')).toBe(false);
      
      // Restore console.log
      consoleLogSpy.mockRestore();
    });

    it('should return false when keycloak is not initialized', () => {
      // Mock console.log to avoid cluttering test output
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      expect(hasRole(null, 'admin')).toBe(false);
      expect(hasRole(undefined, 'admin')).toBe(false);
      
      // Restore console.log
      consoleLogSpy.mockRestore();
    });

    it('should return false when realmAccess is not available', () => {
      // Mock console.log to avoid cluttering test output
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const keycloak = { 
        resourceAccess: {
          mima: {
            roles: ['user']
          }
        },
        hasResourceRole: vi.fn().mockReturnValue(true)
      };
      
      expect(hasRole(keycloak, 'admin')).toBe(false);
      
      // Restore console.log
      consoleLogSpy.mockRestore();
    });
  });
});