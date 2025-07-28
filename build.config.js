module.exports = {
  // File size constraints
  maxLines: 500,
  
  // Files to monitor
  watchPatterns: [
    '**/*.html',
    '**/*.css', 
    '**/*.js'
  ],
  
  // Files to exclude from monitoring
  excludePatterns: [
    'node_modules/**',
    '**/*.min.js',
    '**/*.min.css',
    'build-reports/**',
    '.git/**'
  ],
  
  // Minification settings
  minification: {
    css: {
      enabled: true,
      options: {
        level: 2,
        compatibility: 'ie8'
      }
    },
    js: {
      enabled: true,
      options: {
        compress: true,
        mangle: true,
        sourceMap: false
      }
    }
  },
  
  // Build output directories
  output: {
    reports: 'build-reports',
    minified: {
      css: 'assets/css',
      js: 'assets/js'
    }
  },
  
  // Alert thresholds
  alerts: {
    fileSizeWarning: 400, // lines
    fileSizeError: 500,   // lines
    buildTimeWarning: 30  // seconds
  },
  
  // File splitting suggestions
  splittingSuggestions: {
    js: [
      'Extract classes into separate modules',
      'Split utilities and helpers',
      'Separate configuration objects',
      'Move constants to dedicated files'
    ],
    css: [
      'Split by component styles',
      'Separate media queries',
      'Extract utility classes',
      'Split by page-specific styles'
    ],
    html: [
      'Extract reusable templates',
      'Split into partial components',
      'Separate sections into includes',
      'Move inline scripts to external files'
    ]
  }
};