/**
 * Structured Data (JSON-LD) Generation System
 * Generates schema.org markup for different page types
 */

class StructuredDataGenerator {
    constructor() {
        this.baseUrl = this.getBaseUrl();
        this.siteName = "LLM Tools & AI Resources Hub";
        this.organization = {
            "@type": "Organization",
            "name": "LLM Tools Hub",
            "url": this.baseUrl,
            "logo": `${this.baseUrl}/assets/images/logo.png`
        };
    }

    /**
     * Get the base URL of the site
     */
    getBaseUrl() {
        return typeof window !== 'undefined' ? window.location.origin : 'https://llm-toolkit.github.io';
    }

    /**
     * Generate WebPage schema
     */
    generateWebPageSchema(config) {
        const {
            name,
            description,
            url = this.baseUrl + (typeof window !== 'undefined' ? window.location.pathname : '/'),
            datePublished = null,
            dateModified = null,
            author = null,
            breadcrumbs = null
        } = config;

        const schema = {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": name,
            "description": description,
            "url": url,
            "isPartOf": {
                "@type": "WebSite",
                "name": this.siteName,
                "url": this.baseUrl
            },
            "publisher": this.organization
        };

        if (datePublished) schema.datePublished = datePublished;
        if (dateModified) schema.dateModified = dateModified;
        if (author) schema.author = author;
        if (breadcrumbs) schema.breadcrumb = breadcrumbs;

        return schema;
    }

    /**
     * Generate Article schema
     */
    generateArticleSchema(config) {
        const {
            headline,
            description,
            url = this.baseUrl + (typeof window !== 'undefined' ? window.location.pathname : '/'),
            datePublished,
            dateModified = datePublished,
            author = {
                "@type": "Organization",
                "name": "LLM Tools Hub"
            },
            image = `${this.baseUrl}/assets/images/default-article-image.jpg`,
            wordCount = null,
            keywords = []
        } = config;

        const schema = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": headline,
            "description": description,
            "url": url,
            "datePublished": datePublished,
            "dateModified": dateModified,
            "author": author,
            "publisher": this.organization,
            "image": {
                "@type": "ImageObject",
                "url": image,
                "width": 1200,
                "height": 630
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": url
            }
        };

        if (wordCount) schema.wordCount = wordCount;
        if (keywords.length > 0) schema.keywords = keywords;

        return schema;
    }    /**

     * Generate Comparison schema (using Review type)
     */
    generateComparisonSchema(config) {
        const {
            name,
            description,
            url = this.baseUrl + (typeof window !== 'undefined' ? window.location.pathname : '/'),
            datePublished,
            dateModified = datePublished,
            itemsReviewed = [],
            author = {
                "@type": "Organization",
                "name": "LLM Tools Hub"
            }
        } = config;

        const schema = {
            "@context": "https://schema.org",
            "@type": "Review",
            "name": name,
            "description": description,
            "url": url,
            "datePublished": datePublished,
            "dateModified": dateModified,
            "author": author,
            "publisher": this.organization,
            "itemReviewed": itemsReviewed.map(item => ({
                "@type": "SoftwareApplication",
                "name": item.name,
                "description": item.description,
                "applicationCategory": "AI/ML Tool",
                "operatingSystem": item.operatingSystem || "Cross-platform"
            }))
        };

        return schema;
    }

    /**
     * Generate breadcrumb structured data
     */
    generateBreadcrumbSchema(breadcrumbs) {
        if (!breadcrumbs || breadcrumbs.length === 0) return null;

        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs.map((crumb, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": crumb.name,
                "item": crumb.url
            }))
        };
    }

    /**
     * Generate FAQ schema
     */
    generateFAQSchema(faqs) {
        if (!faqs || faqs.length === 0) return null;

        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                }
            }))
        };
    }

    /**
     * Generate website search action schema
     */
    generateWebSiteSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": this.siteName,
            "description": "Comprehensive guide and resources for LLM tools, AI development, and machine learning",
            "url": this.baseUrl,
            "potentialAction": {
                "@type": "SearchAction",
                "target": `${this.baseUrl}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string"
            },
            "publisher": this.organization
        };
    }

    /**
     * Insert or update JSON-LD script in document head
     */
    insertStructuredData(schema, id = 'structured-data') {
        if (typeof document === 'undefined') return;

        // Remove existing script with same ID
        const existing = document.getElementById(id);
        if (existing) {
            existing.remove();
        }

        // Create new script element
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = id;
        script.textContent = JSON.stringify(schema, null, 2);
        
        document.head.appendChild(script);
    } 
   /**
     * Get page-specific structured data configuration
     */
    getPageStructuredData() {
        const path = typeof window !== 'undefined' ? window.location.pathname : '/';
        const configs = {
            '/': {
                type: 'website',
                schema: this.generateWebSiteSchema()
            },
            '/documents/llm-guide.html': {
                type: 'article',
                schema: this.generateArticleSchema({
                    headline: 'Complete LLM Implementation Guide - Tools and Best Practices',
                    description: 'Comprehensive guide to implementing Large Language Models with practical examples, tool comparisons, and best practices for developers.',
                    datePublished: '2024-01-15T10:00:00Z',
                    dateModified: '2024-01-20T15:30:00Z',
                    keywords: ['LLM implementation', 'large language models', 'AI development', 'machine learning guide']
                })
            },
            '/documents/ai-tools-overview.html': {
                type: 'article',
                schema: this.generateArticleSchema({
                    headline: 'AI Development Tools Overview - Complete Resource Guide',
                    description: 'Explore the best AI development tools and frameworks. Compare features, performance, and use cases for modern AI development.',
                    datePublished: '2024-01-10T09:00:00Z',
                    dateModified: '2024-01-18T14:00:00Z',
                    keywords: ['AI tools', 'development frameworks', 'machine learning tools', 'AI development']
                })
            },
            '/documents/machine-learning-basics.html': {
                type: 'article',
                schema: this.generateArticleSchema({
                    headline: 'Machine Learning Basics - Fundamentals for Developers',
                    description: 'Learn machine learning fundamentals with practical examples and clear explanations. Perfect starting point for developers.',
                    datePublished: '2024-01-05T08:00:00Z',
                    dateModified: '2024-01-15T12:00:00Z',
                    keywords: ['machine learning basics', 'ML fundamentals', 'developer guide', 'AI basics']
                })
            },
            '/comparisons/ggufloader-vs-lmstudio.html': {
                type: 'comparison',
                schema: this.generateComparisonSchema({
                    name: 'GGUFLoader vs LM Studio - Detailed Comparison and Analysis',
                    description: 'In-depth comparison of GGUFLoader and LM Studio. Features, performance, pros and cons to help you choose the right tool.',
                    datePublished: '2024-01-12T11:00:00Z',
                    dateModified: '2024-01-19T16:00:00Z',
                    itemsReviewed: [
                        {
                            name: 'GGUFLoader',
                            description: 'Efficient GGUF model loading tool for LLM applications'
                        },
                        {
                            name: 'LM Studio',
                            description: 'User-friendly desktop application for running LLMs locally'
                        }
                    ]
                })
            },
            '/comparisons/ollama-comparison.html': {
                type: 'comparison',
                schema: this.generateComparisonSchema({
                    name: 'Ollama vs Other LLM Tools - Comprehensive Comparison Guide',
                    description: 'Compare Ollama with other popular LLM tools. Performance benchmarks, features, and use case scenarios.',
                    datePublished: '2024-01-08T13:00:00Z',
                    dateModified: '2024-01-16T17:00:00Z',
                    itemsReviewed: [
                        {
                            name: 'Ollama',
                            description: 'Command-line tool for running LLMs locally with ease'
                        }
                    ]
                })
            }
        };

        return configs[path] || configs['/'];
    }

    /**
     * Generate breadcrumbs based on current path
     */
    generateBreadcrumbs() {
        if (typeof window === 'undefined') return [];

        const path = window.location.pathname;
        const segments = path.split('/').filter(segment => segment);
        
        const breadcrumbs = [{
            name: 'Home',
            url: this.baseUrl + '/'
        }];

        let currentPath = '';
        segments.forEach((segment, index) => {
            currentPath += '/' + segment;
            
            // Convert segment to readable name
            const name = segment.replace(/-/g, ' ')
                               .replace(/\.html$/, '')
                               .replace(/\b\w/g, l => l.toUpperCase());
            
            breadcrumbs.push({
                name: name,
                url: this.baseUrl + currentPath
            });
        });

        return breadcrumbs;
    }

    /**
     * Initialize structured data for current page
     */
    init() {
        const pageData = this.getPageStructuredData();
        
        // Insert main page schema
        this.insertStructuredData(pageData.schema, 'main-structured-data');
        
        // Generate and insert breadcrumbs if not homepage
        const path = typeof window !== 'undefined' ? window.location.pathname : '/';
        if (path !== '/') {
            const breadcrumbs = this.generateBreadcrumbs();
            if (breadcrumbs.length > 1) {
                const breadcrumbSchema = this.generateBreadcrumbSchema(breadcrumbs);
                this.insertStructuredData(breadcrumbSchema, 'breadcrumb-structured-data');
            }
        }
    }

    /**
     * Update structured data dynamically
     */
    updateStructuredData(config) {
        let schema;
        
        switch (config.type) {
            case 'article':
                schema = this.generateArticleSchema(config);
                break;
            case 'comparison':
                schema = this.generateComparisonSchema(config);
                break;
            case 'webpage':
                schema = this.generateWebPageSchema(config);
                break;
            default:
                schema = this.generateWebSiteSchema();
        }
        
        this.insertStructuredData(schema, 'main-structured-data');
        
        // Update breadcrumbs if provided
        if (config.breadcrumbs) {
            const breadcrumbSchema = this.generateBreadcrumbSchema(config.breadcrumbs);
            this.insertStructuredData(breadcrumbSchema, 'breadcrumb-structured-data');
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StructuredDataGenerator;
} else {
    window.StructuredDataGenerator = StructuredDataGenerator;
}