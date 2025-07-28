/**
 * Internal Search Engine for LLM Tools Hub
 * Provides client-side search functionality with bot optimization
 */

class SearchEngine {
    constructor() {
        this.searchIndex = new Map();
        this.documents = [];
        this.isIndexed = false;
        this.searchResults = [];
        this.minQueryLength = 2;
        this.maxResults = 20;
        
        // Initialize search engine
        this.init();
    }

    async init() {
        try {
            await this.buildSearchIndex();
            this.setupSearchInterface();
            this.isIndexed = true;
            console.log('Search engine initialized successfully');
        } catch (error) {
            console.error('Failed to initialize search engine:', error);
        }
    }

    /**
     * Build comprehensive search index from all site content
     */
    async buildSearchIndex() {
        // Define all searchable content with metadata
        const contentSources = [
            {
                url: '/',
                title: 'LLM Tools & AI Resources Hub - Homepage',
                type: 'homepage',
                description: 'Comprehensive guide to LLM tools, AI development, and machine learning resources',
                keywords: ['LLM tools', 'AI development', 'machine learning', 'artificial intelligence', 'developer resources', 'local LLM', 'GGUF Loader', 'desktop application'],
                content: 'LLM Tools AI Resources Hub comprehensive guide development machine learning GGUFLoader GGUF Loader desktop application local LLM offline chat UI floating assistant LM Studio Ollama documentation comparisons tutorials PyPI installation pip install ggufloader quantized models Q4_0 Q6_K cross-platform Windows Linux macOS'
            },
            {
                url: '/documents/llm-guide.html',
                title: 'Complete LLM Implementation Guide',
                type: 'document',
                description: 'Master LLM implementation with comprehensive guide covering tools, techniques, and best practices',
                keywords: ['LLM implementation', 'large language models', 'AI development', 'machine learning guide', 'local LLM', 'GGUF Loader'],
                content: 'Large Language Models implementation guide tools frameworks optimization performance deployment best practices TensorFlow PyTorch Hugging Face model selection training inference GGUFLoader GGUF Loader desktop application local LLM deployment offline chat UI GGUF models quantized models'
            },
            {
                url: '/documents/ai-tools-overview.html',
                title: 'AI Development Tools Overview',
                type: 'document',
                description: 'Explore the best AI development tools and frameworks for modern AI development',
                keywords: ['AI tools', 'development frameworks', 'machine learning tools', 'AI development', 'local LLM tools', 'GGUF Loader'],
                content: 'AI development tools frameworks TensorFlow PyTorch scikit-learn Ollama LM Studio GGUFLoader GGUF Loader desktop application local LLM tools offline chat UI deployment MLOps experimentation data processing computer vision NLP reinforcement learning GGUF models quantized models PyPI installation'
            },
            {
                url: '/documents/machine-learning-basics.html',
                title: 'Machine Learning Basics - Fundamentals for Developers',
                type: 'document',
                description: 'Learn machine learning fundamentals with practical examples and clear explanations',
                keywords: ['machine learning basics', 'ML fundamentals', 'developer guide', 'AI basics', 'local LLM', 'GGUF Loader'],
                content: 'machine learning basics fundamentals supervised unsupervised reinforcement learning algorithms classification regression clustering neural networks decision trees evaluation metrics GGUFLoader GGUF Loader desktop application local LLM tools offline deployment GGUF models quantized models beginner-friendly'
            },
            {
                url: '/comparisons/ggufloader-vs-lmstudio.html',
                title: 'GGUFLoader vs LM Studio - Detailed Comparison',
                type: 'comparison',
                description: 'In-depth comparison of GGUFLoader and LM Studio features, performance, and use cases',
                keywords: ['GGUFLoader', 'GGUF Loader', 'LM Studio', 'LLM tools comparison', 'GGUF models', 'local LLM', 'desktop application', 'offline chat'],
                content: 'GGUFLoader GGUF Loader LM Studio comparison features performance GGUF models local LLM deployment desktop application offline chat UI floating assistant API integration memory usage speed benchmarks PyPI installation pip install ggufloader quantized models Q4_0 Q6_K cross-platform Windows Linux macOS pros cons use cases'
            },
            {
                url: '/comparisons/ollama-comparison.html',
                title: 'Ollama vs Other LLM Tools - Comprehensive Comparison',
                type: 'comparison',
                description: 'Compare Ollama with other popular LLM tools including performance benchmarks and use cases',
                keywords: ['Ollama', 'LLM comparison', 'AI tools', 'machine learning tools', 'local LLM', 'GGUF Loader'],
                content: 'Ollama comparison LLM tools command line interface model management API server performance benchmarks GGUFLoader GGUF Loader desktop application LM Studio installation setup local LLM deployment offline chat UI GGUF models quantized models cross-platform'
            }
        ];

        // Build search index
        contentSources.forEach((doc, index) => {
            this.documents.push(doc);
            
            // Create searchable text combining all fields
            const searchableText = [
                doc.title,
                doc.description,
                doc.keywords.join(' '),
                doc.content
            ].join(' ').toLowerCase();

            // Tokenize and index
            const tokens = this.tokenize(searchableText);
            tokens.forEach(token => {
                if (!this.searchIndex.has(token)) {
                    this.searchIndex.set(token, []);
                }
                
                // Add document reference with relevance scoring
                const existingEntry = this.searchIndex.get(token).find(entry => entry.docIndex === index);
                if (existingEntry) {
                    existingEntry.frequency++;
                } else {
                    this.searchIndex.get(token).push({
                        docIndex: index,
                        frequency: 1,
                        inTitle: doc.title.toLowerCase().includes(token),
                        inDescription: doc.description.toLowerCase().includes(token),
                        inKeywords: doc.keywords.some(keyword => keyword.toLowerCase().includes(token))
                    });
                }
            });
        });

        console.log(`Search index built with ${this.searchIndex.size} unique terms`);
    }

    /**
     * Tokenize text for search indexing
     */
    tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, ' ')
            .split(/\s+/)
            .filter(token => token.length >= 2)
            .filter(token => !this.isStopWord(token));
    }

    /**
     * Check if word is a stop word
     */
    isStopWord(word) {
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
            'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
            'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
        ]);
        return stopWords.has(word);
    }

    /**
     * Perform search query
     */
    search(query) {
        if (!query || query.length < this.minQueryLength) {
            return [];
        }

        const queryTokens = this.tokenize(query);
        if (queryTokens.length === 0) {
            return [];
        }

        // Calculate relevance scores for each document
        const docScores = new Map();

        queryTokens.forEach(token => {
            if (this.searchIndex.has(token)) {
                this.searchIndex.get(token).forEach(entry => {
                    const docIndex = entry.docIndex;
                    if (!docScores.has(docIndex)) {
                        docScores.set(docIndex, 0);
                    }

                    // Calculate relevance score
                    let score = entry.frequency;
                    if (entry.inTitle) score *= 3;
                    if (entry.inDescription) score *= 2;
                    if (entry.inKeywords) score *= 2.5;

                    docScores.set(docIndex, docScores.get(docIndex) + score);
                });
            }
        });

        // Sort results by relevance score
        const results = Array.from(docScores.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, this.maxResults)
            .map(([docIndex, score]) => ({
                ...this.documents[docIndex],
                relevanceScore: score,
                matchedTerms: queryTokens.filter(token => 
                    this.searchIndex.has(token) && 
                    this.searchIndex.get(token).some(entry => entry.docIndex === docIndex)
                )
            }));

        this.searchResults = results;
        return results;
    }

    /**
     * Setup search interface elements
     */
    setupSearchInterface() {
        // Create search container if it doesn't exist
        if (!document.getElementById('search-container')) {
            this.createSearchInterface();
        }

        // Setup event listeners
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');
        const searchResults = document.getElementById('search-results');

        if (searchInput) {
            // Real-time search as user types
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performSearch(e.target.value);
                }, 300);
            });

            // Handle Enter key
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.performSearch(e.target.value);
                }
            });
        }

        if (searchButton) {
            searchButton.addEventListener('click', () => {
                const query = searchInput ? searchInput.value : '';
                this.performSearch(query);
            });
        }
    }

    /**
     * Create search interface HTML
     */
    createSearchInterface() {
        const searchHTML = `
            <div id="search-container" class="search-container" role="search" aria-label="Site search">
                <div class="search-input-group">
                    <label for="search-input" class="sr-only">Search site content</label>
                    <input 
                        type="search" 
                        id="search-input" 
                        class="search-input" 
                        placeholder="Search documentation, comparisons, and guides..."
                        aria-describedby="search-help"
                        autocomplete="off"
                        spellcheck="false"
                    >
                    <button 
                        type="button" 
                        id="search-button" 
                        class="search-button"
                        aria-label="Perform search"
                        title="Search"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                    </button>
                </div>
                <div id="search-help" class="search-help">
                    Search across all documentation, tool comparisons, and guides
                </div>
                <div id="search-results" class="search-results" role="region" aria-live="polite" aria-label="Search results"></div>
            </div>
        `;

        // Insert search interface into appropriate location
        const targetElement = document.querySelector('main') || document.querySelector('.hero-section') || document.body;
        if (targetElement) {
            const searchContainer = document.createElement('div');
            searchContainer.innerHTML = searchHTML;
            targetElement.insertBefore(searchContainer.firstElementChild, targetElement.firstChild);
        }
    }

    /**
     * Perform search and display results
     */
    performSearch(query) {
        const resultsContainer = document.getElementById('search-results');
        if (!resultsContainer) return;

        if (!query || query.length < this.minQueryLength) {
            resultsContainer.innerHTML = '';
            resultsContainer.style.display = 'none';
            return;
        }

        const results = this.search(query);
        this.displayResults(results, query);

        // Track search for analytics (bot-friendly)
        this.trackSearch(query, results.length);
    }

    /**
     * Display search results
     */
    displayResults(results, query) {
        const resultsContainer = document.getElementById('search-results');
        if (!resultsContainer) return;

        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-no-results">
                    <p>No results found for "${this.escapeHtml(query)}"</p>
                    <p class="search-suggestions">Try different keywords or browse our <a href="/documents/">documentation</a> and <a href="/comparisons/">comparisons</a>.</p>
                </div>
            `;
        } else {
            const resultsHTML = results.map(result => this.renderSearchResult(result, query)).join('');
            resultsContainer.innerHTML = `
                <div class="search-results-header">
                    <p>Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${this.escapeHtml(query)}"</p>
                </div>
                <div class="search-results-list">
                    ${resultsHTML}
                </div>
            `;
        }

        resultsContainer.style.display = 'block';
    }

    /**
     * Render individual search result
     */
    renderSearchResult(result, query) {
        const highlightedTitle = this.highlightMatches(result.title, query);
        const highlightedDescription = this.highlightMatches(result.description, query);
        const typeLabel = this.getTypeLabel(result.type);

        return `
            <article class="search-result-item" role="article">
                <div class="search-result-header">
                    <h3 class="search-result-title">
                        <a href="${result.url}" title="View ${result.title}">
                            ${highlightedTitle}
                        </a>
                    </h3>
                    <span class="search-result-type">${typeLabel}</span>
                </div>
                <p class="search-result-description">${highlightedDescription}</p>
                <div class="search-result-meta">
                    <span class="search-result-url">${result.url}</span>
                    <span class="search-result-relevance" title="Relevance score: ${result.relevanceScore.toFixed(1)}">
                        ${this.getRelevanceStars(result.relevanceScore)}
                    </span>
                </div>
                <div class="search-result-keywords">
                    ${result.matchedTerms.map(term => `<span class="matched-term">${this.escapeHtml(term)}</span>`).join('')}
                </div>
            </article>
        `;
    }

    /**
     * Highlight search matches in text
     */
    highlightMatches(text, query) {
        if (!query) return this.escapeHtml(text);

        const queryTokens = this.tokenize(query);
        let highlightedText = this.escapeHtml(text);

        queryTokens.forEach(token => {
            const regex = new RegExp(`\\b(${this.escapeRegex(token)})\\b`, 'gi');
            highlightedText = highlightedText.replace(regex, '<mark class="search-highlight">$1</mark>');
        });

        return highlightedText;
    }

    /**
     * Get type label for display
     */
    getTypeLabel(type) {
        const labels = {
            'homepage': 'Home',
            'document': 'Documentation',
            'comparison': 'Comparison'
        };
        return labels[type] || 'Page';
    }

    /**
     * Get relevance stars for display
     */
    getRelevanceStars(score) {
        const maxScore = 20; // Approximate max score
        const normalizedScore = Math.min(score / maxScore, 1);
        const stars = Math.round(normalizedScore * 5);
        return '★'.repeat(stars) + '☆'.repeat(5 - stars);
    }

    /**
     * Track search for analytics and bot optimization
     */
    trackSearch(query, resultCount) {
        // Create search event for bots and analytics
        const searchEvent = {
            type: 'search',
            query: query,
            resultCount: resultCount,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            isBot: this.detectBot()
        };

        // Store search data for bot optimization
        this.storeSearchData(searchEvent);

        // Dispatch custom event for analytics
        window.dispatchEvent(new CustomEvent('siteSearch', {
            detail: searchEvent
        }));
    }

    /**
     * Detect if user is a bot
     */
    detectBot() {
        const botPatterns = [
            /bot/i, /crawler/i, /spider/i, /scraper/i,
            /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i,
            /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
            /whatsapp/i, /telegram/i, /skype/i
        ];
        
        return botPatterns.some(pattern => pattern.test(navigator.userAgent));
    }

    /**
     * Store search data for optimization
     */
    storeSearchData(searchEvent) {
        try {
            const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
            searchHistory.push(searchEvent);
            
            // Keep only last 100 searches
            if (searchHistory.length > 100) {
                searchHistory.splice(0, searchHistory.length - 100);
            }
            
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        } catch (error) {
            console.warn('Could not store search data:', error);
        }
    }

    /**
     * Get search suggestions based on popular queries
     */
    getSearchSuggestions() {
        const popularQueries = [
            'GGUF Loader',
            'local LLM',
            'GGUFLoader desktop application',
            'GGUF Loader vs LM Studio',
            'offline chat UI',
            'LLM implementation',
            'AI development tools',
            'machine learning basics',
            'quantized models',
            'PyPI installation ggufloader'
        ];

        return popularQueries;
    }

    /**
     * Utility functions
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Public API methods
     */
    isReady() {
        return this.isIndexed;
    }

    getLastResults() {
        return this.searchResults;
    }

    clearResults() {
        const resultsContainer = document.getElementById('search-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
            resultsContainer.style.display = 'none';
        }
        this.searchResults = [];
    }
}

// Initialize search engine when DOM is ready
if (typeof window !== 'undefined') {
    window.searchEngine = null;
    
    document.addEventListener('DOMContentLoaded', () => {
        window.searchEngine = new SearchEngine();
    });

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SearchEngine;
    }
}