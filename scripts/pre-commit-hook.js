#!/usr/bin/env node

const { execSync } = require('child_process');
const FileSizeMonitor = require('./file-size-monitor');

console.log('🔍 Running pre-commit file size check...');

const monitor = new FileSizeMonitor();
const passed = monitor.displayReport();

if (!passed) {
    console.log('\n❌ Commit blocked: Files exceed 500-line limit');
    console.log('💡 Run "npm run size:suggest" for splitting suggestions');
    process.exit(1);
} else {
    console.log('\n✅ All files within size limits - commit allowed');
    process.exit(0);
}