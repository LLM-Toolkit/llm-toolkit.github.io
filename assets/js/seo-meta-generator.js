/**
 * SEO Meta Tag Generation System
 * Dynamically generates and manages meta tags, Open Graph, and Twitter Cards
 */

class SEOMetaGenerator {
    constructor() {
        this.baseUrl = this.getBaseUrl();
        this.defaultImage = `${this.baseUrl}/assets/images/default-og-image.jpg`;
        this.siteName = "LLM Tools & AI Resources Hub";
        this.twitterHandle = "@llmtoolshub";
    }

    /**
     * Get the base URL of the site
     */
    getBaseUrl() {
        return window.location.origin;
    }

    /**
     * Generate canonical URL for the current page
     */
    generateCanonicalUrl() {
        const path = window.location.pathname;
        const cleanPath = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
        return `${this.baseUrl}${cleanPath}`;
    }

    /**
     * Set or update a meta tag
     */
    setMetaTag(name, content, property = false) {
        if (!content) return;

        const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
        let meta = document.querySelector(selector);

        if (!meta) {
            meta = document.createElement('meta');
            if (property) {
                meta.setAttribute('property', name);
            } else {
                meta.setAttribute('name', name);
            }
            document.head.appendChild(meta);
        }

        meta.setAttribute('content', content);
    }

    /**
     * Set canonical URL
     */
    setCanonicalUrl(url = null) {
        const canonicalUrl = url || this.generateCanonicalUrl();
        let link = document.querySelector('link[rel="canonical"]');

        if (!link) {
            link = document.createElement('link');
            link.setAttribute('rel', 'canonical');
            document.head.appendChild(link);
        }

        link.setAttribute('href', canonicalUrl);
    }

    /**
     * Generate basic meta tags
     */
    generateBasicMeta(config) {
        const {
            title,
            description,
            keywords = [],
            author = null,
            robots = 'index, follow'
        } = config;

        // Set title
        if (title) {
            document.title = title;
        }

        // Set meta tags
        this.setMetaTag('description', description);
        this.setMetaTag('robots', robots);

        if (keywords.length > 0) {
            this.setMetaTag('keywords', keywords.join(', '));
        }

        if (author) {
            this.setMetaTag('author', author);
        }

        // Set canonical URL
        this.setCanonicalUrl();
    }

    /**
     * Generate Open Graph meta tags
     */
    generateOpenGraphMeta(config) {
        const {
            title,
            description,
            image = this.defaultImage,
            type = 'website',
            url = null
        } = config;

        const ogUrl = url || this.generateCanonicalUrl();

        this.setMetaTag('og:type', type, true);
        this.setMetaTag('og:site_name', this.siteName, true);
        this.setMetaTag('og:url', ogUrl, true);
        this.setMetaTag('og:title', title, true);
        this.setMetaTag('og:description', description, true);
        this.setMetaTag('og:image', image, true);
        this.setMetaTag('og:image:alt', `${title} - ${this.siteName}`, true);
    }

    /**
     * Generate Twitter Card meta tags
     */
    generateTwitterCardMeta(config) {
        const {
            title,
            description,
            image = this.defaultImage,
            card = 'summary_large_image',
            site = this.twitterHandle,
            creator = this.twitterHandle
        } = config;

        this.setMetaTag('twitter:card', card, true);
        this.setMetaTag('twitter:site', site, true);
        this.setMetaTag('twitter:creator', creator, true);
        this.setMetaTag('twitter:title', title, true);
        this.setMetaTag('twitter:description', description, true);
        this.setMetaTag('twitter:image', image, true);
    }

    /**
     * Generate all meta tags for a page
     */
    generateAllMeta(config) {
        this.generateBasicMeta(config);
        this.generateOpenGraphMeta(config);
        this.generateTwitterCardMeta(config);
    }

    /**
     * Get page-specific configuration based on current URL
     */
    getPageConfig() {
        const path = window.location.pathname;
        const configs = {
            '/': {
                title: 'LLM Tools & AI Resources Hub - Comprehensive Guide for Developers',
                description: 'Discover comprehensive guides, comparisons, and resources for LLM tools, AI development, and machine learning. Expert insights on GGUFLoader, LM Studio, Ollama, and more.',
                keywords: ['LLM tools', 'AI development', 'machine learning', 'GGUFLoader', 'LM Studio', 'Ollama', 'artificial intelligence', 'developer resources'],
                type: 'website'
            },
            '/documents/llm-guide.html': {
                title: 'Complete LLM Implementation Guide - Tools and Best Practices',
                description: 'Comprehensive guide to implementing Large Language Models with practical examples, tool comparisons, and best practices for developers.',
                keywords: ['LLM implementation', 'large language models', 'AI development', 'machine learning guide'],
                type: 'article'
            },
            '/documents/ai-tools-overview.html': {
                title: 'AI Development Tools Overview - Complete Resource Guide',
                description: 'Explore the best AI development tools and frameworks. Compare features, performance, and use cases for modern AI development.',
                keywords: ['AI tools', 'development frameworks', 'machine learning tools', 'AI development'],
                type: 'article'
            },
            '/documents/machine-learning-basics.html': {
                title: 'Machine Learning Basics - Fundamentals for Developers',
                description: 'Learn machine learning fundamentals with practical examples and clear explanations. Perfect starting point for developers.',
                keywords: ['machine learning basics', 'ML fundamentals', 'developer guide', 'AI basics'],
                type: 'article'
            },
            '/comparisons/ggufloader-vs-lmstudio.html': {
                title: 'GGUFLoader vs LM Studio - Detailed Comparison and Analysis',
                description: 'In-depth comparison of GGUFLoader and LM Studio. Features, performance, pros and cons to help you choose the right tool.',
                keywords: ['GGUFLoader', 'LM Studio', 'LLM tools comparison', 'AI development tools'],
                type: 'article'
            },
            '/comparisons/ollama-comparison.html': {
                title: 'Ollama vs Other LLM Tools - Comprehensive Comparison Guide',
                description: 'Compare Ollama with other popular LLM tools. Performance benchmarks, features, and use case scenarios.',
                keywords: ['Ollama', 'LLM comparison', 'AI tools', 'machine learning tools'],
                type: 'article'
            }
        };

        return configs[path] || configs['/'];
    }

    /**
     * Initialize meta tags for the current page
     */
    init() {
        const config = this.getPageConfig();
        this.generateAllMeta(config);
    }

    /**
     * Update meta tags dynamically (useful for SPA navigation)
     */
    updateMeta(newConfig) {
        this.generateAllMeta(newConfig);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SEOMetaGenerator;
} else {
    window.SEOMetaGenerator = SEOMetaGenerator;
}