/**
 * Accessibility Enhancer
 * Provides comprehensive ARIA support and accessibility features
 * Ensures the site is fully accessible to assistive technologies
 */

class AccessibilityEnhancer {
    constructor() {
        this.keyboardNavigation = new KeyboardNavigationManager();
        this.ariaManager = new AriaManager();
        this.focusManager = new FocusManager();
        this.screenReaderSupport = new ScreenReaderSupport();
        this.init();
    }

    init() {
        this.enhanceExistingElements();
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupScreenReaderSupport();
        this.monitorDynamicContent();
        this.setupAccessibilityTesting();
    }

    enhanceExistingElements() {
        this.ariaManager.enhanceAllElements();
        this.addSkipLinks();
        this.enhanceNavigation();
        this.enhanceInteractiveElements();
        this.enhanceFormElements();
    }

    addSkipLinks() {
        // Create skip navigation links for keyboard users
        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#main-navigation" class="skip-link">Skip to navigation</a>
            <a href="#footer" class="skip-link">Skip to footer</a>
        `;
        
        document.body.insertBefore(skipLinks, document.body.firstChild);
        
        // Add corresponding IDs if they don't exist
        this.ensureSkipTargets();
    }

    ensureSkipTargets() {
        const main = document.querySelector('main');
        if (main && !main.id) {
            main.id = 'main-content';
        }
        
        const nav = document.querySelector('nav[role="navigation"], .main-nav');
        if (nav && !nav.id) {
            nav.id = 'main-navigation';
        }
        
        const footer = document.querySelector('footer');
        if (footer && !footer.id) {
            footer.id = 'footer';
        }
    }

    enhanceNavigation() {
        // Enhance main navigation
        const navElements = document.querySelectorAll('nav, .main-nav');
        navElements.forEach(nav => {
            this.ariaManager.enhanceNavigation(nav);
        });
        
        // Enhance breadcrumbs
        const breadcrumbs = document.querySelectorAll('.breadcrumb');
        breadcrumbs.forEach(breadcrumb => {
            this.ariaManager.enhanceBreadcrumb(breadcrumb);
        });
    }

    enhanceInteractiveElements() {
        // Enhance buttons
        const buttons = document.querySelectorAll('button, .cta-primary, .cta-secondary');
        buttons.forEach(button => {
            this.ariaManager.enhanceButton(button);
        });
        
        // Enhance links
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            this.ariaManager.enhanceLink(link);
        });
    }

    enhanceFormElements() {
        // Enhance any form elements that might be added later
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            this.ariaManager.enhanceForm(form);
        });
    }

    setupKeyboardNavigation() {
        this.keyboardNavigation.init();
    }

    setupFocusManagement() {
        this.focusManager.init();
    }

    setupScreenReaderSupport() {
        this.screenReaderSupport.init();
    }

    monitorDynamicContent() {
        // Monitor for dynamically added content
        if ('MutationObserver' in window) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            this.enhanceNewElement(node);
                        }
                    });
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    enhanceNewElement(element) {
        // Enhance newly added elements
        this.ariaManager.enhanceElement(element);
        
        // Enhance any child elements
        const interactiveElements = element.querySelectorAll('a, button, input, select, textarea');
        interactiveElements.forEach(el => {
            this.ariaManager.enhanceElement(el);
        });
    }

    setupAccessibilityTesting() {
        // Add accessibility testing utilities for development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.addAccessibilityTestingTools();
        }
    }

    addAccessibilityTestingTools() {
        // Add keyboard shortcut to test accessibility
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                this.runAccessibilityAudit();
            }
        });
    }

    runAccessibilityAudit() {
        const issues = [];
        
        // Check for missing alt text
        const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
        if (imagesWithoutAlt.length > 0) {
            issues.push(`${imagesWithoutAlt.length} images missing alt text`);
        }
        
        // Check for missing form labels
        const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
        if (inputsWithoutLabels.length > 0) {
            issues.push(`${inputsWithoutLabels.length} inputs missing labels`);
        }
        
        // Check for missing headings hierarchy
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let previousLevel = 0;
        headings.forEach(heading => {
            const level = parseInt(heading.tagName.charAt(1));
            if (level > previousLevel + 1) {
                issues.push(`Heading hierarchy skip detected: ${heading.tagName} after H${previousLevel}`);
            }
            previousLevel = level;
        });
        
        console.log('Accessibility Audit Results:', issues.length === 0 ? 'No issues found' : issues);
    }
}

/**
 * ARIA Manager
 * Handles ARIA attributes and semantic enhancements
 */
class AriaManager {
    enhanceAllElements() {
        // Enhance semantic structure
        this.enhanceSemanticStructure();
        
        // Enhance interactive elements
        const interactiveElements = document.querySelectorAll('a, button, input, select, textarea');
        interactiveElements.forEach(element => {
            this.enhanceElement(element);
        });
    }

    enhanceSemanticStructure() {
        // Ensure main landmarks are properly labeled
        const main = document.querySelector('main');
        if (main && !main.getAttribute('aria-label')) {
            main.setAttribute('aria-label', 'Main content');
        }
        
        const header = document.querySelector('header');
        if (header && !header.getAttribute('aria-label')) {
            header.setAttribute('aria-label', 'Site header');
        }
        
        const footer = document.querySelector('footer');
        if (footer && !footer.getAttribute('aria-label')) {
            footer.setAttribute('aria-label', 'Site footer');
        }
        
        // Enhance sections with proper labels
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            this.enhanceSection(section);
        });
    }

    enhanceSection(section) {
        // Find heading within section for labeling
        const heading = section.querySelector('h1, h2, h3, h4, h5, h6');
        if (heading && !section.getAttribute('aria-labelledby')) {
            if (!heading.id) {
                heading.id = this.generateId('section-heading');
            }
            section.setAttribute('aria-labelledby', heading.id);
        }
    }

    enhanceNavigation(nav) {
        if (!nav.getAttribute('role')) {
            nav.setAttribute('role', 'navigation');
        }
        
        if (!nav.getAttribute('aria-label')) {
            // Determine navigation type
            if (nav.classList.contains('main-nav') || nav.closest('header')) {
                nav.setAttribute('aria-label', 'Main site navigation');
            } else if (nav.classList.contains('breadcrumb')) {
                nav.setAttribute('aria-label', 'Breadcrumb navigation');
            } else if (nav.closest('footer')) {
                nav.setAttribute('aria-label', 'Footer navigation');
            } else {
                nav.setAttribute('aria-label', 'Navigation menu');
            }
        }
        
        // Enhance navigation lists
        const lists = nav.querySelectorAll('ul, ol');
        lists.forEach(list => {
            if (!list.getAttribute('role')) {
                list.setAttribute('role', 'list');
            }
        });
        
        // Enhance navigation items
        const items = nav.querySelectorAll('li');
        items.forEach(item => {
            if (!item.getAttribute('role')) {
                item.setAttribute('role', 'listitem');
            }
        });
    }

    enhanceBreadcrumb(breadcrumb) {
        if (!breadcrumb.getAttribute('aria-label')) {
            breadcrumb.setAttribute('aria-label', 'Breadcrumb navigation');
        }
        
        const list = breadcrumb.querySelector('ol, ul');
        if (list && !list.getAttribute('role')) {
            list.setAttribute('role', 'list');
        }
        
        // Mark current page in breadcrumb
        const currentItem = breadcrumb.querySelector('[aria-current="page"]');
        if (currentItem && !currentItem.getAttribute('aria-label')) {
            currentItem.setAttribute('aria-label', 'Current page');
        }
    }

    enhanceButton(button) {
        // Ensure button has proper role
        if (button.tagName !== 'BUTTON' && !button.getAttribute('role')) {
            button.setAttribute('role', 'button');
        }
        
        // Add keyboard support for non-button elements
        if (button.tagName !== 'BUTTON') {
            button.setAttribute('tabindex', '0');
            this.addButtonKeyboardSupport(button);
        }
        
        // Enhance button description
        if (!button.getAttribute('aria-label') && !button.getAttribute('aria-labelledby')) {
            const text = button.textContent.trim();
            if (text) {
                button.setAttribute('aria-label', text);
            }
        }
    }

    enhanceLink(link) {
        // Enhance link descriptions
        if (!link.getAttribute('aria-label') && !link.getAttribute('aria-labelledby')) {
            const text = link.textContent.trim();
            const title = link.getAttribute('title');
            
            if (title && title !== text) {
                link.setAttribute('aria-label', title);
            }
        }
        
        // Mark external links
        if (link.hostname && link.hostname !== window.location.hostname) {
            if (!link.getAttribute('aria-label')) {
                link.setAttribute('aria-label', `${link.textContent.trim()} (opens in new window)`);
            }
            link.setAttribute('rel', 'noopener noreferrer');
        }
        
        // Enhance download links
        if (link.hasAttribute('download')) {
            const label = link.getAttribute('aria-label') || link.textContent.trim();
            link.setAttribute('aria-label', `Download ${label}`);
        }
    }

    enhanceForm(form) {
        // Enhance form labels and descriptions
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            this.enhanceFormInput(input);
        });
        
        // Enhance fieldsets
        const fieldsets = form.querySelectorAll('fieldset');
        fieldsets.forEach(fieldset => {
            this.enhanceFieldset(fieldset);
        });
    }

    enhanceFormInput(input) {
        // Ensure input has proper labeling
        if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
            const label = input.closest('label') || document.querySelector(`label[for="${input.id}"]`);
            if (label) {
                if (!label.id) {
                    label.id = this.generateId('label');
                }
                input.setAttribute('aria-labelledby', label.id);
            }
        }
        
        // Add required field indicators
        if (input.hasAttribute('required')) {
            input.setAttribute('aria-required', 'true');
        }
        
        // Add invalid state support
        input.addEventListener('invalid', () => {
            input.setAttribute('aria-invalid', 'true');
        });
        
        input.addEventListener('input', () => {
            if (input.validity.valid) {
                input.removeAttribute('aria-invalid');
            }
        });
    }

    enhanceFieldset(fieldset) {
        const legend = fieldset.querySelector('legend');
        if (legend && !fieldset.getAttribute('aria-labelledby')) {
            if (!legend.id) {
                legend.id = this.generateId('legend');
            }
            fieldset.setAttribute('aria-labelledby', legend.id);
        }
    }

    enhanceElement(element) {
        // Generic element enhancement
        const tagName = element.tagName.toLowerCase();
        
        switch (tagName) {
            case 'button':
                this.enhanceButton(element);
                break;
            case 'a':
                this.enhanceLink(element);
                break;
            case 'nav':
                this.enhanceNavigation(element);
                break;
            case 'form':
                this.enhanceForm(element);
                break;
            case 'section':
                this.enhanceSection(element);
                break;
        }
        
        // Check for elements with button-like classes
        if (element.classList.contains('cta-primary') || element.classList.contains('cta-secondary')) {
            this.enhanceButton(element);
        }
    }

    addButtonKeyboardSupport(button) {
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
        });
    }

    generateId(prefix) {
        return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

/**
 * Keyboard Navigation Manager
 * Handles keyboard navigation and focus management
 */
class KeyboardNavigationManager {
    init() {
        this.setupKeyboardShortcuts();
        this.enhanceFocusVisibility();
        this.setupTabNavigation();
        this.setupArrowKeyNavigation();
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Skip to main content (Alt + M)
            if (e.altKey && e.key === 'm') {
                e.preventDefault();
                const main = document.getElementById('main-content') || document.querySelector('main');
                if (main) {
                    main.focus();
                    main.scrollIntoView();
                }
            }
            
            // Skip to navigation (Alt + N)
            if (e.altKey && e.key === 'n') {
                e.preventDefault();
                const nav = document.getElementById('main-navigation') || document.querySelector('nav');
                if (nav) {
                    const firstLink = nav.querySelector('a');
                    if (firstLink) {
                        firstLink.focus();
                    }
                }
            }
        });
    }

    enhanceFocusVisibility() {
        // Add focus indicators for keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    setupTabNavigation() {
        // Ensure proper tab order
        const focusableElements = this.getFocusableElements();
        focusableElements.forEach((element, index) => {
            if (!element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }
        });
    }

    setupArrowKeyNavigation() {
        // Add arrow key navigation for navigation menus
        const navMenus = document.querySelectorAll('nav ul, .main-nav ul');
        navMenus.forEach(menu => {
            this.addArrowKeySupport(menu);
        });
    }

    addArrowKeySupport(menu) {
        const links = menu.querySelectorAll('a');
        
        links.forEach((link, index) => {
            link.addEventListener('keydown', (e) => {
                let targetIndex;
                
                switch (e.key) {
                    case 'ArrowDown':
                    case 'ArrowRight':
                        e.preventDefault();
                        targetIndex = (index + 1) % links.length;
                        links[targetIndex].focus();
                        break;
                    case 'ArrowUp':
                    case 'ArrowLeft':
                        e.preventDefault();
                        targetIndex = (index - 1 + links.length) % links.length;
                        links[targetIndex].focus();
                        break;
                    case 'Home':
                        e.preventDefault();
                        links[0].focus();
                        break;
                    case 'End':
                        e.preventDefault();
                        links[links.length - 1].focus();
                        break;
                }
            });
        });
    }

    getFocusableElements() {
        return document.querySelectorAll(
            'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
    }
}

/**
 * Focus Manager
 * Manages focus states and focus trapping
 */
class FocusManager {
    init() {
        this.setupFocusTrapping();
        this.setupFocusRestoration();
        this.enhanceFocusIndicators();
    }

    setupFocusTrapping() {
        // Will be used for modals and other focus-trapped components
        this.focusTraps = new Map();
    }

    setupFocusRestoration() {
        // Store focus before navigation
        document.addEventListener('beforeunload', () => {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.id) {
                sessionStorage.setItem('lastFocusedElement', activeElement.id);
            }
        });
        
        // Restore focus after page load
        window.addEventListener('load', () => {
            const lastFocusedId = sessionStorage.getItem('lastFocusedElement');
            if (lastFocusedId) {
                const element = document.getElementById(lastFocusedId);
                if (element) {
                    setTimeout(() => {
                        element.focus();
                    }, 100);
                }
                sessionStorage.removeItem('lastFocusedElement');
            }
        });
    }

    enhanceFocusIndicators() {
        // Add enhanced focus indicators
        const style = document.createElement('style');
        style.textContent = `
            .keyboard-navigation *:focus {
                outline: 2px solid #007bff !important;
                outline-offset: 2px !important;
            }
            
            .keyboard-navigation button:focus,
            .keyboard-navigation .cta-primary:focus,
            .keyboard-navigation .cta-secondary:focus {
                outline: 2px solid #fff !important;
                box-shadow: 0 0 0 4px #007bff !important;
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Screen Reader Support
 * Provides enhanced screen reader support and announcements
 */
class ScreenReaderSupport {
    constructor() {
        this.announcer = null;
    }

    init() {
        this.createAnnouncer();
        this.setupLiveRegions();
        this.enhanceContentForScreenReaders();
    }

    createAnnouncer() {
        // Create live region for announcements
        this.announcer = document.createElement('div');
        this.announcer.setAttribute('aria-live', 'polite');
        this.announcer.setAttribute('aria-atomic', 'true');
        this.announcer.className = 'sr-only';
        this.announcer.style.cssText = `
            position: absolute !important;
            width: 1px !important;
            height: 1px !important;
            padding: 0 !important;
            margin: -1px !important;
            overflow: hidden !important;
            clip: rect(0, 0, 0, 0) !important;
            white-space: nowrap !important;
            border: 0 !important;
        `;
        document.body.appendChild(this.announcer);
    }

    announce(message, priority = 'polite') {
        if (this.announcer) {
            this.announcer.setAttribute('aria-live', priority);
            this.announcer.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                this.announcer.textContent = '';
            }, 1000);
        }
    }

    setupLiveRegions() {
        // Add live regions for dynamic content
        const dynamicAreas = document.querySelectorAll('[data-dynamic]');
        dynamicAreas.forEach(area => {
            if (!area.getAttribute('aria-live')) {
                area.setAttribute('aria-live', 'polite');
            }
        });
    }

    enhanceContentForScreenReaders() {
        // Add screen reader only content for better context
        this.addScreenReaderOnlyContent();
        this.enhanceListsForScreenReaders();
        this.enhanceTablesForScreenReaders();
    }

    addScreenReaderOnlyContent() {
        // Add helpful context for screen readers
        const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])');
        externalLinks.forEach(link => {
            if (!link.querySelector('.sr-only')) {
                const srText = document.createElement('span');
                srText.className = 'sr-only';
                srText.textContent = ' (opens in new window)';
                link.appendChild(srText);
            }
        });
    }

    enhanceListsForScreenReaders() {
        // Enhance lists with counts for screen readers
        const lists = document.querySelectorAll('ul, ol');
        lists.forEach(list => {
            const items = list.querySelectorAll('li');
            if (items.length > 0 && !list.getAttribute('aria-label')) {
                list.setAttribute('aria-label', `List with ${items.length} items`);
            }
        });
    }

    enhanceTablesForScreenReaders() {
        // Enhance tables for screen readers
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            if (!table.getAttribute('role')) {
                table.setAttribute('role', 'table');
            }
            
            // Enhance table headers
            const headers = table.querySelectorAll('th');
            headers.forEach(header => {
                if (!header.getAttribute('scope')) {
                    header.setAttribute('scope', 'col');
                }
            });
        });
    }
}

// Initialize accessibility enhancer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityEnhancer = new AccessibilityEnhancer();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityEnhancer;
}