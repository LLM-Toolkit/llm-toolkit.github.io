/**
 * Search Integration Script
 * Integrates search functionality into existing pages
 */

(function() {
    'use strict';

    // Configuration
    const SEARCH_CONFIG = {
        enableAutoComplete: true,
        enableSearchSuggestions: true,
        enableKeyboardShortcuts: true,
        searchShortcut: 'ctrl+k', // or 'cmd+k' on Mac
        debounceDelay: 300,
        maxSuggestions: 5
    };

    /**
     * Initialize search integration
     */
    function initSearchIntegration() {
        // Wait for search engine to be ready
        if (typeof window.searchEngine === 'undefined' || !window.searchEngine) {
            setTimeout(initSearchIntegration, 100);
            return;
        }

        // Add search styles
        addSearchStyles();
        
        // Add search to navigation
        addSearchToNavigation();
        
        // Setup keyboard shortcuts
        if (SEARCH_CONFIG.enableKeyboardShortcuts) {
            setupKeyboardShortcuts();
        }
        
        // Setup search suggestions
        if (SEARCH_CONFIG.enableSearchSuggestions) {
            setupSearchSuggestions();
        }
        
        // Setup URL-based search
        setupURLSearch();
        
        // Setup search analytics
        setupSearchAnalytics();
        
        console.log('Search integration initialized');
    }

    /**
     * Add search styles to the page
     */
    function addSearchStyles() {
        const existingStyles = document.getElementById('search-styles');
        if (existingStyles) return;

        const link = document.createElement('link');
        link.id = 'search-styles';
        link.rel = 'stylesheet';
        link.href = '/assets/css/search-styles.css';
        document.head.appendChild(link);
    }

    /**
     * Add search functionality to navigation
     */
    function addSearchToNavigation() {
        const nav = document.querySelector('.main-nav ul');
        if (!nav) return;

        // Create search toggle button
        const searchToggle = document.createElement('li');
        searchToggle.innerHTML = `
            <button type="button" id="search-toggle" class="search-toggle" title="Search site (Ctrl+K)" aria-label="Open search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <span class="search-toggle-text">Search</span>
            </button>
        `;

        nav.appendChild(searchToggle);

        // Add styles for search toggle
        const style = document.createElement('style');
        style.textContent = `
            .search-toggle {
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                transition: background-color 0.3s ease, transform 0.2s ease;
                font-weight: 500;
            }
            
            .search-toggle:hover,
            .search-toggle:focus {
                background-color: rgba(255, 255, 255, 0.2);
                transform: translateY(-1px);
                outline: none;
            }
            
            .search-toggle svg {
                width: 18px;
                height: 18px;
            }
            
            @media (max-width: 768px) {
                .search-toggle-text {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);

        // Setup toggle functionality
        document.getElementById('search-toggle').addEventListener('click', toggleSearch);
    }

    /**
     * Toggle search interface
     */
    function toggleSearch() {
        let searchContainer = document.getElementById('search-container');
        
        if (!searchContainer) {
            // Create search interface if it doesn't exist
            window.searchEngine.createSearchInterface();
            searchContainer = document.getElementById('search-container');
        }

        if (searchContainer) {
            const isVisible = searchContainer.style.display !== 'none';
            searchContainer.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }
        }
    }

    /**
     * Setup keyboard shortcuts
     */
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Check for Ctrl+K or Cmd+K
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                toggleSearch();
                return;
            }

            // Escape to close search
            if (e.key === 'Escape') {
                const searchContainer = document.getElementById('search-container');
                if (searchContainer && searchContainer.style.display !== 'none') {
                    searchContainer.style.display = 'none';
                }
            }
        });
    }

    /**
     * Setup search suggestions
     */
    function setupSearchSuggestions() {
        document.addEventListener('DOMContentLoaded', () => {
            const searchInput = document.getElementById('search-input');
            if (!searchInput) return;

            let suggestionsContainer;

            searchInput.addEventListener('focus', () => {
                if (!suggestionsContainer) {
                    createSuggestionsContainer();
                }
                showSearchSuggestions();
            });

            searchInput.addEventListener('blur', (e) => {
                // Delay hiding to allow clicking on suggestions
                setTimeout(() => {
                    if (suggestionsContainer && !suggestionsContainer.contains(document.activeElement)) {
                        hideSuggestions();
                    }
                }, 150);
            });

            function createSuggestionsContainer() {
                suggestionsContainer = document.createElement('div');
                suggestionsContainer.id = 'search-suggestions';
                suggestionsContainer.className = 'search-suggestions-container';
                suggestionsContainer.innerHTML = `
                    <div class="search-suggestions-header">Popular searches:</div>
                    <div class="search-suggestions-list"></div>
                `;

                const searchContainer = document.getElementById('search-container');
                if (searchContainer) {
                    searchContainer.appendChild(suggestionsContainer);
                }

                // Add styles
                const style = document.createElement('style');
                style.textContent = `
                    .search-suggestions-container {
                        position: absolute;
                        top: 100%;
                        left: 0;
                        right: 0;
                        background: white;
                        border: 1px solid #e9ecef;
                        border-top: none;
                        border-radius: 0 0 8px 8px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        z-index: 1000;
                        display: none;
                    }
                    
                    .search-suggestions-header {
                        padding: 0.75rem 1rem;
                        font-size: 0.85rem;
                        color: #6c757d;
                        font-weight: 500;
                        border-bottom: 1px solid #f1f3f4;
                    }
                    
                    .search-suggestions-list {
                        padding: 0.5rem 0;
                    }
                    
                    .search-suggestion-item {
                        display: block;
                        width: 100%;
                        padding: 0.5rem 1rem;
                        border: none;
                        background: none;
                        text-align: left;
                        cursor: pointer;
                        transition: background-color 0.2s ease;
                        font-size: 0.9rem;
                        color: #495057;
                    }
                    
                    .search-suggestion-item:hover,
                    .search-suggestion-item:focus {
                        background: #f8f9fa;
                        outline: none;
                    }
                `;
                document.head.appendChild(style);
            }

            function showSearchSuggestions() {
                if (!suggestionsContainer || !window.searchEngine) return;

                const suggestions = window.searchEngine.getSearchSuggestions();
                const suggestionsList = suggestionsContainer.querySelector('.search-suggestions-list');
                
                suggestionsList.innerHTML = suggestions
                    .slice(0, SEARCH_CONFIG.maxSuggestions)
                    .map(suggestion => `
                        <button type="button" class="search-suggestion-item" data-query="${suggestion}">
                            ${suggestion}
                        </button>
                    `).join('');

                // Add click handlers
                suggestionsList.querySelectorAll('.search-suggestion-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const query = item.dataset.query;
                        searchInput.value = query;
                        window.searchEngine.performSearch(query);
                        hideSuggestions();
                    });
                });

                suggestionsContainer.style.display = 'block';
            }

            function hideSuggestions() {
                if (suggestionsContainer) {
                    suggestionsContainer.style.display = 'none';
                }
            }
        });
    }

    /**
     * Setup URL-based search
     */
    function setupURLSearch() {
        // Check for search query in URL
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('q') || urlParams.get('search');
        
        if (searchQuery) {
            // Wait for search engine to be ready
            const performURLSearch = () => {
                if (window.searchEngine && window.searchEngine.isReady()) {
                    const searchInput = document.getElementById('search-input');
                    if (searchInput) {
                        searchInput.value = searchQuery;
                        window.searchEngine.performSearch(searchQuery);
                        
                        // Show search container
                        const searchContainer = document.getElementById('search-container');
                        if (searchContainer) {
                            searchContainer.style.display = 'block';
                        }
                    }
                } else {
                    setTimeout(performURLSearch, 100);
                }
            };
            
            performURLSearch();
        }
    }

    /**
     * Setup search analytics
     */
    function setupSearchAnalytics() {
        // Listen for search events
        window.addEventListener('siteSearch', (event) => {
            const searchData = event.detail;
            
            // Send to analytics if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'search', {
                    search_term: searchData.query,
                    result_count: searchData.resultCount,
                    is_bot: searchData.isBot
                });
            }
            
            // Custom analytics for bots
            if (searchData.isBot) {
                console.log('Bot search detected:', searchData);
                
                // Store bot search data for optimization
                storeBotSearchData(searchData);
            }
        });
    }

    /**
     * Store bot search data for optimization
     */
    function storeBotSearchData(searchData) {
        try {
            const botSearches = JSON.parse(localStorage.getItem('botSearches') || '[]');
            botSearches.push({
                query: searchData.query,
                resultCount: searchData.resultCount,
                timestamp: searchData.timestamp,
                userAgent: searchData.userAgent
            });
            
            // Keep only last 50 bot searches
            if (botSearches.length > 50) {
                botSearches.splice(0, botSearches.length - 50);
            }
            
            localStorage.setItem('botSearches', JSON.stringify(botSearches));
        } catch (error) {
            console.warn('Could not store bot search data:', error);
        }
    }

    /**
     * Add structured data for search functionality
     */
    function addSearchStructuredData() {
        const existingScript = document.querySelector('script[type="application/ld+json"]');
        if (existingScript) {
            try {
                const structuredData = JSON.parse(existingScript.textContent);
                
                // Add search action if it doesn't exist
                if (!structuredData.potentialAction) {
                    structuredData.potentialAction = {
                        "@type": "SearchAction",
                        "target": {
                            "@type": "EntryPoint",
                            "urlTemplate": window.location.origin + "/?q={search_term_string}"
                        },
                        "query-input": "required name=search_term_string"
                    };
                    
                    existingScript.textContent = JSON.stringify(structuredData, null, 2);
                }
            } catch (error) {
                console.warn('Could not update structured data:', error);
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSearchIntegration);
    } else {
        initSearchIntegration();
    }

    // Add structured data
    addSearchStructuredData();

})();