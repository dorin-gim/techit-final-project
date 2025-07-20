import { FunctionComponent, ReactNode, useEffect } from "react";

interface AccessibilityWrapperProps {
  children: ReactNode;
  title?: string;
}

const AccessibilityWrapper: FunctionComponent<AccessibilityWrapperProps> = ({ 
  children, 
  title 
}) => {
  useEffect(() => {
    // Update document title for screen readers
    if (title) {
      document.title = `${title} - TechIt`;
    }
    
    // Announce page changes to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = title ? `עמוד ${title} נטען` : 'עמוד נטען';
    
    document.body.appendChild(announcement);
    
    // Remove announcement after screen reader has time to read it
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
    
    // Focus management - move focus to main content
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
      // Remove tabindex after focus to prevent tab navigation issues
      setTimeout(() => {
        mainContent.removeAttribute('tabindex');
      }, 100);
    }
  }, [title]);

  useEffect(() => {
    // Keyboard navigation improvements
    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC key to close modals/dropdowns
      if (event.key === 'Escape') {
        // Close any open modals or dropdowns
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
          const closeButton = modal.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
          if (closeButton) {
            closeButton.click();
          }
        });
        
        // Close dropdowns
        const dropdowns = document.querySelectorAll('.dropdown-menu.show');
        dropdowns.forEach(dropdown => {
          dropdown.classList.remove('show');
        });
      }
      
      // Skip to main content with keyboard shortcut
      if (event.altKey && event.key === 'm') {
        event.preventDefault();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div 
      className="accessibility-wrapper"
      role="main"
      aria-label={title ? `${title} - TechIt` : 'TechIt - חנות טכנולוגיה'}
    >
      {children}

      <div className="sr-only">
        <h2>הוראות ניווט</h2>
        <ul>
          <li>השתמש במקש Tab לניווט בין אלמנטים</li>
          <li>השתמש במקש Enter או רווח כדי להפעיל כפתורים</li>
          <li>השתמש במקש Escape כדי לסגור חלונות קופצים</li>
          <li>השתמש ב-Alt+M כדי לעבור לתוכן הראשי</li>
        </ul>
      </div>
    </div>
  );
};

export default AccessibilityWrapper;