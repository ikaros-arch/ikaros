import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavMenu } from '../../src/components/layout/NavMenu';

// Mock the scrollto function
vi.mock('helpers/navHelpers', () => ({
  scrollto: vi.fn()
}));

describe('NavMenu Component', () => {
  const mockMenuItems = [
    { iconClass: 'fa fa-info-circle fa-fw', scrollTarget: 'info', title: 'Info' },
    { iconClass: 'fa fa-language fa-fw', scrollTarget: 'translation', title: 'Translation' },
  ];

  it('renders menu items correctly', () => {
    render(<NavMenu menuItems={mockMenuItems} additionalClasses="testMenu" />);
    
    // Check if icons are rendered
    const icons = document.querySelectorAll('.fa');
    expect(icons.length).toBe(2);
    expect(icons[0].classList.contains('fa-info-circle')).toBe(true);
    expect(icons[1].classList.contains('fa-language')).toBe(true);
  });

  it('applies additional classes', () => {
    render(<NavMenu menuItems={mockMenuItems} additionalClasses="testMenu" />);
    
    // Check if additional classes are applied
    const menuContainer = document.querySelector('.testMenu');
    expect(menuContainer).not.toBeNull();
  });

  // Add more tests as needed
});