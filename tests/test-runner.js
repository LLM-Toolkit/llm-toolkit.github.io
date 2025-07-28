#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const SEOValidator = require('./seo-validation');
const StructuredDataValidator = require('./structured-data-validation');
const PerformanceTester = require('./performance-testing');
const SearchValidator = require('./search-validation');

class TestRunner {
    constructor() {
        this.results = {
            seo: null,
            structuredData: null,
            performance: null,
            search: null,
            overall: {
                passed: 0,
                failed: 0,
                warnings: 0,
                total: 0,
                score: 0
            }
        };
    }

    // Run all test suites
    async runAllTests() {
        console.log('🚀 Starting comprehensive testing suite...\n');
        console.log('=' .repeat(60));
        
        const startTime = Date.now();
        
        // Run SEO validation
        console.log('\n📊 Running SEO Validation Tests...');
        const seoValidator = new SEOValidator();
        seoValidator.validateAllPages();
        this.results.seo = {
            passed: seoValidator.results.passed,
            failed: seoValidator.results.failed,
            warnings: seoValidator.results.warnings,
            total: seoValidator.results.tests.length
        };
        
        // Run structured data validation
        console.log('\n🏗️  Running Structured Data Validation Tests...');
        const structuredDataValidator = new StructuredDataValidator();
        structuredDataValidator.validateAllFiles();
        this.results.structuredData = {
            passed: structuredDataValidator.results.passed,
            failed: structuredDataValidator.results.failed,
            warnings: structuredDataValidator.results.warnings,
            total: structuredDataValidator.results.tests.length
        };
        
        // Run performance tests
        console.log('\n⚡ Running Performance Tests...');
        const performanceTester = new PerformanceTester();
        performanceTester.testAllFiles();
        this.results.performance = {
            passed: performanceTester.results.passed,
            failed: performanceTester.results.failed,
            warnings: performanceTester.results.warnings,
            total: performanceTester.results.tests.length
        };
        
        // Run search validation tests
        console.log('\n🔍 Running Search Validation Tests...');
        const searchValidator = new SearchValidator();
        searchValidator.validateGGUFLoaderSearch();
        this.results.search = {
            passed: searchValidator.results.passed,
            failed: searchValidator.results.failed,
            warnings: searchValidator.results.warnings,
            total: searchValidator.results.tests.length
        };
        
        // Calculate overall results
        this.calculateOverallResults();
        
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        // Generate comprehensive report
        this.generateComprehensiveReport(duration);
        
        return this.results.overall.failed === 0;
    }

    // Calculate overall test results
    calculateOverallResults() {
        const suites = [this.results.seo, this.results.structuredData, this.results.performance, this.results.search];
        
        this.results.overall = suites.reduce((acc, suite) => ({
            passed: acc.passed + suite.passed,
            failed: acc.failed + suite.failed,
            warnings: acc.warnings + suite.warnings,
            total: acc.total + suite.total
        }), { passed: 0, failed: 0, warnings: 0, total: 0 });
        
        this.results.overall.score = this.results.overall.total > 0 
            ? ((this.results.overall.passed / this.results.overall.total) * 100).toFixed(1)
            : 0;
    }

    // Generate comprehensive report
    generateComprehensiveReport(duration) {
        console.log('\n' + '=' .repeat(60));
        console.log('📋 COMPREHENSIVE TEST REPORT');
        console.log('=' .repeat(60));
        
        // Overall summary
        console.log('\n🎯 Overall Results:');
        console.log(`   ✅ Passed: ${this.results.overall.passed}`);
        console.log(`   ❌ Failed: ${this.results.overall.failed}`);
        console.log(`   ⚠️  Warnings: ${this.results.overall.warnings}`);
        console.log(`   📝 Total Tests: ${this.results.overall.total}`);
        console.log(`   🏆 Overall Score: ${this.results.overall.score}%`);
        console.log(`   ⏱️  Duration: ${duration}s`);
        
        // Suite breakdown
        console.log('\n📊 Test Suite Breakdown:');
        
        console.log('\n   SEO Validation:');
        console.log(`     ✅ ${this.results.seo.passed} passed`);
        console.log(`     ❌ ${this.results.seo.failed} failed`);
        console.log(`     ⚠️  ${this.results.seo.warnings} warnings`);
        console.log(`     📊 Score: ${this.calculateSuiteScore(this.results.seo)}%`);
        
        console.log('\n   Structured Data:');
        console.log(`     ✅ ${this.results.structuredData.passed} passed`);
        console.log(`     ❌ ${this.results.structuredData.failed} failed`);
        console.log(`     ⚠️  ${this.results.structuredData.warnings} warnings`);
        console.log(`     📊 Score: ${this.calculateSuiteScore(this.results.structuredData)}%`);
        
        console.log('\n   Performance:');
        console.log(`     ✅ ${this.results.performance.passed} passed`);
        console.log(`     ❌ ${this.results.performance.failed} failed`);
        console.log(`     ⚠️  ${this.results.performance.warnings} warnings`);
        console.log(`     📊 Score: ${this.calculateSuiteScore(this.results.performance)}%`);
        
        console.log('\n   Search Validation:');
        console.log(`     ✅ ${this.results.search.passed} passed`);
        console.log(`     ❌ ${this.results.search.failed} failed`);
        console.log(`     ⚠️  ${this.results.search.warnings} warnings`);
        console.log(`     📊 Score: ${this.calculateSuiteScore(this.results.search)}%`);
        
        // Quality assessment
        this.generateQualityAssessment();
        
        // Recommendations
        this.generateRecommendations();
        
        // Save comprehensive report
        this.saveComprehensiveReport(duration);
    }

    // Calculate suite score
    calculateSuiteScore(suite) {
        return suite.total > 0 ? ((suite.passed / suite.total) * 100).toFixed(1) : 0;
    }

    // Generate quality assessment
    generateQualityAssessment() {
        console.log('\n🏆 Quality Assessment:');
        
        const score = parseFloat(this.results.overall.score);
        let grade, assessment;
        
        if (score >= 90) {
            grade = 'A';
            assessment = 'Excellent - Production ready';
        } else if (score >= 80) {
            grade = 'B';
            assessment = 'Good - Minor improvements needed';
        } else if (score >= 70) {
            grade = 'C';
            assessment = 'Fair - Several improvements needed';
        } else if (score >= 60) {
            grade = 'D';
            assessment = 'Poor - Major improvements required';
        } else {
            grade = 'F';
            assessment = 'Failing - Significant work required';
        }
        
        console.log(`   Grade: ${grade}`);
        console.log(`   Assessment: ${assessment}`);
        
        // Specific quality indicators
        const indicators = [];
        
        if (this.results.seo.failed === 0) {
            indicators.push('✅ SEO optimized');
        } else {
            indicators.push('❌ SEO issues present');
        }
        
        if (this.results.structuredData.failed === 0) {
            indicators.push('✅ Structured data valid');
        } else {
            indicators.push('❌ Structured data issues');
        }
        
        if (this.results.performance.failed === 0) {
            indicators.push('✅ Performance optimized');
        } else {
            indicators.push('❌ Performance issues');
        }
        
        console.log('\n   Quality Indicators:');
        indicators.forEach(indicator => console.log(`     ${indicator}`));
    }

    // Generate recommendations
    generateRecommendations() {
        console.log('\n💡 Recommendations:');
        
        const recommendations = [];
        
        // SEO recommendations
        if (this.results.seo.failed > 0) {
            recommendations.push('Fix SEO validation errors to improve search engine visibility');
        }
        if (this.results.seo.warnings > 5) {
            recommendations.push('Address SEO warnings to optimize discoverability');
        }
        
        // Structured data recommendations
        if (this.results.structuredData.failed > 0) {
            recommendations.push('Fix structured data errors to improve rich snippet eligibility');
        }
        if (this.results.structuredData.warnings > 3) {
            recommendations.push('Enhance structured data completeness for better AI understanding');
        }
        
        // Performance recommendations
        if (this.results.performance.failed > 0) {
            recommendations.push('Address performance issues to improve Core Web Vitals');
        }
        if (this.results.performance.warnings > 5) {
            recommendations.push('Optimize assets and code for better performance');
        }
        
        // General recommendations
        if (this.results.overall.warnings > 10) {
            recommendations.push('Consider addressing warnings to improve overall quality');
        }
        
        if (recommendations.length === 0) {
            console.log('   🎉 No major recommendations - excellent work!');
        } else {
            recommendations.forEach((rec, index) => {
                console.log(`   ${index + 1}. ${rec}`);
            });
        }
    }

    // Save comprehensive report to file
    saveComprehensiveReport(duration) {
        const reportPath = 'build-reports/comprehensive-test-report.json';
        
        // Ensure directory exists
        const dir = path.dirname(reportPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const report = {
            timestamp: new Date().toISOString(),
            duration: duration,
            summary: this.results.overall,
            suites: {
                seo: this.results.seo,
                structuredData: this.results.structuredData,
                performance: this.results.performance
            },
            grade: this.getGrade(this.results.overall.score),
            recommendations: this.getRecommendationsList()
        };

        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n💾 Comprehensive report saved to: ${reportPath}`);
        
        // Also generate HTML report
        this.generateHTMLReport(report);
    }

    // Get grade based on score
    getGrade(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    // Get recommendations as array
    getRecommendationsList() {
        const recommendations = [];
        
        if (this.results.seo.failed > 0) {
            recommendations.push('Fix SEO validation errors');
        }
        if (this.results.structuredData.failed > 0) {
            recommendations.push('Fix structured data errors');
        }
        if (this.results.performance.failed > 0) {
            recommendations.push('Address performance issues');
        }
        
        return recommendations;
    }

    // Generate HTML report
    generateHTMLReport(report) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprehensive Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .grade { font-size: 3em; font-weight: bold; margin: 10px 0; }
        .grade.A { color: #4CAF50; }
        .grade.B { color: #8BC34A; }
        .grade.C { color: #FF9800; }
        .grade.D { color: #FF5722; }
        .grade.F { color: #F44336; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .suite { margin: 20px 0; padding: 15px; border-left: 4px solid #2196F3; background: #f8f9fa; }
        .suite h3 { margin-top: 0; color: #2196F3; }
        .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .recommendations h3 { color: #856404; margin-top: 0; }
        .recommendations ul { margin: 10px 0; }
        .recommendations li { margin: 5px 0; }
        .timestamp { text-align: center; color: #666; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Comprehensive Test Report</h1>
            <div class="grade ${report.grade}">${report.grade}</div>
            <p>Overall Score: ${report.summary.score}%</p>
        </div>

        <div class="summary">
            <div class="metric">
                <div class="metric-value" style="color: #4CAF50;">${report.summary.passed}</div>
                <div>Passed</div>
            </div>
            <div class="metric">
                <div class="metric-value" style="color: #F44336;">${report.summary.failed}</div>
                <div>Failed</div>
            </div>
            <div class="metric">
                <div class="metric-value" style="color: #FF9800;">${report.summary.warnings}</div>
                <div>Warnings</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.total}</div>
                <div>Total Tests</div>
            </div>
        </div>

        <div class="suite">
            <h3>SEO Validation</h3>
            <p>Passed: ${report.suites.seo.passed} | Failed: ${report.suites.seo.failed} | Warnings: ${report.suites.seo.warnings}</p>
            <p>Score: ${this.calculateSuiteScore(report.suites.seo)}%</p>
        </div>

        <div class="suite">
            <h3>Structured Data</h3>
            <p>Passed: ${report.suites.structuredData.passed} | Failed: ${report.suites.structuredData.failed} | Warnings: ${report.suites.structuredData.warnings}</p>
            <p>Score: ${this.calculateSuiteScore(report.suites.structuredData)}%</p>
        </div>

        <div class="suite">
            <h3>Performance</h3>
            <p>Passed: ${report.suites.performance.passed} | Failed: ${report.suites.performance.failed} | Warnings: ${report.suites.performance.warnings}</p>
            <p>Score: ${this.calculateSuiteScore(report.suites.performance)}%</p>
        </div>

        ${report.recommendations.length > 0 ? `
        <div class="recommendations">
            <h3>Recommendations</h3>
            <ul>
                ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
        ` : ''}

        <div class="timestamp">
            Generated: ${new Date(report.timestamp).toLocaleString()}<br>
            Duration: ${report.duration}s
        </div>
    </div>
</body>
</html>`;

        const htmlPath = 'build-reports/comprehensive-test-report.html';
        fs.writeFileSync(htmlPath, html);
        console.log(`📄 HTML report saved to: ${htmlPath}`);
    }

    // Run specific test suite
    async runSuite(suiteName) {
        switch (suiteName) {
            case 'seo':
                const seoValidator = new SEOValidator();
                return seoValidator.validateAllPages();
            case 'structured-data':
                const structuredDataValidator = new StructuredDataValidator();
                return structuredDataValidator.validateAllFiles();
            case 'performance':
                const performanceTester = new PerformanceTester();
                return performanceTester.testAllFiles();
            default:
                console.log('Unknown test suite. Available: seo, structured-data, performance');
                return false;
        }
    }
}

// CLI interface
if (require.main === module) {
    const runner = new TestRunner();
    const command = process.argv[2];
    
    switch (command) {
        case 'seo':
            runner.runSuite('seo');
            break;
        case 'structured-data':
            runner.runSuite('structured-data');
            break;
        case 'performance':
            runner.runSuite('performance');
            break;
        case 'all':
        default:
            runner.runAllTests();
            break;
    }
}

module.exports = TestRunner;