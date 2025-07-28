/**
 * Document Page Template System
 * Handles document page initialization, breadcrumbs, and content management
 */

class DocumentTemplate {
    constructor() {
        this.baseUrl = this.getBaseUrl();
        this.siteName = "LLM Tools & AI Resources Hub";
        this.seoGenerator = null;
        this.structuredDataGenerator = null;
        this.canonicalManager = null;
    }

    /**
     * Get the base URL of the site
     */
    getBaseUrl() {
        return window.location.origin;
    }

    /**
     * Initialize SEO modules
     */
    initializeSEOModules() {
        if (typeof SEOMetaGenerator !== 'undefined') {
            this.seoGenerator = new SEOMetaGenerator();
        }
        if (typeof StructuredDataGenerator !== 'undefined') {
            this.structuredDataGenerator = new StructuredDataGenerator();
        }
        if (typeof CanonicalURLManager !== 'undefined') {
            this.canonicalManager = new CanonicalURLManager();
        }
    }

    /**
     * Generate breadcrumb navigation based on current path
     */
    generateBreadcrumbs() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(segment => segment);
        
        const breadcrumbs = [{
            name: 'Home',
            url: this.baseUrl + '/',
            title: 'Return to homepage'
        }];

        let currentPath = '';
        segments.forEach((segment, index) => {
            currentPath += '/' + segment;
            
            // Skip the last segment if it's an HTML file (current page)
            if (index === segments.length - 1 && segment.endsWith('.html')) {
                return;
            }
            
            // Convert segment to readable name
            let name = segment.replace(/-/g, ' ')
                             .replace(/\.html$/, '')
                             .replace(/\b\w/g, l => l.toUpperCase());
            
            // Special handling for known directories
            if (segment === 'documents') {
                name = 'Documentation';
            } else if (segment === 'comparisons') {
                name = 'Tool Comparisons';
            }
            
            breadcrumbs.push({
                name: name,
                url: this.baseUrl + currentPath + (segment.endsWith('.html') ? '' : '/'),
                title: `Browse ${name.toLowerCase()}`
            });
        });

        return breadcrumbs;
    }

    /**
     * Update breadcrumb navigation in the DOM
     */
    updateBreadcrumbs(customBreadcrumbs = null) {
        const breadcrumbNav = document.querySelector('.breadcrumb ol');
        if (!breadcrumbNav) return;

        const breadcrumbs = customBreadcrumbs || this.generateBreadcrumbs();
        
        // Clear existing breadcrumbs
        breadcrumbNav.innerHTML = '';
        
        breadcrumbs.forEach((crumb, index) => {
            const li = document.createElement('li');
            
            if (index === breadcrumbs.length - 1) {
                // Last item (current page) - no link
                li.setAttribute('aria-current', 'page');
                li.textContent = crumb.name;
            } else {
                // Create link for navigation
                const a = document.createElement('a');
                a.href = crumb.url;
                a.textContent = crumb.name;
                a.title = crumb.title;
                li.appendChild(a);
            }
            
            breadcrumbNav.appendChild(li);
        });
    }

    /**
     * Update document metadata
     */
    updateDocumentMeta(config) {
        const {
            title,
            description,
            publishDate,
            updateDate,
            readingTime,
            keywords = []
        } = config;

        // Update document title
        const titleElement = document.getElementById('document-title');
        if (titleElement && title) {
            titleElement.textContent = title;
        }

        // Update document description
        const descElement = document.querySelector('.document-description');
        if (descElement && description) {
            descElement.textContent = description;
        }

        // Update meta dates
        if (publishDate) {
            const publishTimeElement = document.querySelector('.document-meta time[datetime*="T"]');
            if (publishTimeElement) {
                publishTimeElement.setAttribute('datetime', publishDate);
                publishTimeElement.textContent = `Published: ${this.formatDate(publishDate)}`;
            }
        }

        if (updateDate) {
            const updateTimeElements = document.querySelectorAll('.document-meta time[datetime*="T"]');
            if (updateTimeElements.length > 1) {
                updateTimeElements[1].setAttribute('datetime', updateDate);
                updateTimeElements[1].textContent = `Updated: ${this.formatDate(updateDate)}`;
            }
        }

        // Update reading time
        if (readingTime) {
            const readingTimeElement = document.querySelector('.document-meta span[aria-label="Reading time"]');
            if (readingTimeElement) {
                readingTimeElement.innerHTML = `📖 Reading time: ${readingTime} min`;
            }
        }

        // Update SEO meta tags
        if (this.seoGenerator) {
            this.seoGenerator.updateMeta({
                title: title,
                description: description,
                keywords: keywords,
                type: 'article'
            });
        }

        // Update structured data
        if (this.structuredDataGenerator) {
            this.structuredDataGenerator.updateStructuredData({
                type: 'article',
                headline: title,
                description: description,
                datePublished: publishDate,
                dateModified: updateDate || publishDate,
                keywords: keywords
            });
        }
    }

    /**
     * Format date for display
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Generate table of contents from document headings
     */
    generateTableOfContents() {
        const tocContainer = document.querySelector('.document-toc ul');
        if (!tocContainer) return;

        const headings = document.querySelectorAll('.document-content h2, .document-content h3');
        if (headings.length === 0) return;

        // Clear existing TOC
        tocContainer.innerHTML = '';

        headings.forEach((heading, index) => {
            // Ensure heading has an ID
            if (!heading.id) {
                heading.id = this.generateHeadingId(heading.textContent);
            }

            const li = document.createElement('li');
            const a = document.createElement('a');
            
            a.href = `#${heading.id}`;
            a.textContent = heading.textContent;
            a.title = `Jump to ${heading.textContent} section`;
            
            // Add indentation for h3 elements
            if (heading.tagName === 'H3') {
                li.style.paddingLeft = '1rem';
                li.style.fontSize = '0.9em';
            }
            
            li.appendChild(a);
            tocContainer.appendChild(li);
        });
    }

    /**
     * Generate ID from heading text
     */
    generateHeadingId(text) {
        return text.toLowerCase()
                  .replace(/[^\w\s-]/g, '')
                  .replace(/\s+/g, '-')
                  .replace(/--+/g, '-')
                  .trim();
    }

    /**
     * Update navigation active state
     */
    updateNavigationState() {
        const navLinks = document.querySelectorAll('.main-nav a');
        const currentPath = window.location.pathname;
        
        navLinks.forEach(link => {
            link.removeAttribute('aria-current');
            
            // Check if this is the documents section
            if (currentPath.includes('/documents/') && link.getAttribute('href').includes('documents')) {
                link.setAttribute('aria-current', 'page');
            }
        });
    }

    /**
     * Add smooth scrolling for anchor links
     */
    initializeSmoothScrolling() {
        const tocLinks = document.querySelectorAll('.document-toc a[href^="#"]');
        
        tocLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update URL without triggering page reload
                    history.pushState(null, null, `#${targetId}`);
                }
            });
        });
    }

    /**
     * Calculate and update reading time
     */
    calculateReadingTime() {
        const content = document.querySelector('.document-content');
        if (!content) return 0;

        const text = content.textContent || content.innerText;
        const wordsPerMinute = 200; // Average reading speed
        const wordCount = text.trim().split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / wordsPerMinute);

        return readingTime;
    }

    /**
     * Initialize document template functionality
     */
    init(config = {}) {
        // Initialize SEO modules
        this.initializeSEOModules();

        // Update breadcrumbs
        this.updateBreadcrumbs(config.breadcrumbs);

        // Calculate reading time if not provided
        if (!config.readingTime) {
            config.readingTime = this.calculateReadingTime();
        }

        // Update document metadata
        this.updateDocumentMeta(config);

        // Generate table of contents
        this.generateTableOfContents();

        // Update navigation state
        this.updateNavigationState();

        // Initialize smooth scrolling
        this.initializeSmoothScrolling();

        // Initialize canonical URL management
        if (this.canonicalManager) {
            this.canonicalManager.init();
        }

        // Initialize structured data
        if (this.structuredDataGenerator) {
            this.structuredDataGenerator.init();
        }
    }

    /**
     * Update document content dynamically (for SPA-like behavior)
     */
    updateDocument(config) {
        this.updateDocumentMeta(config);
        this.updateBreadcrumbs(config.breadcrumbs);
        this.generateTableOfContents();
        
        if (this.canonicalManager) {
            this.canonicalManager.updateCanonical();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocumentTemplate;
} else {
    window.DocumentTemplate = DocumentTemplate;
}