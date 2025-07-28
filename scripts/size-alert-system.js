#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const FileSizeMonitor = require('./file-size-monitor');

class SizeAlertSystem {
    constructor() {
        this.monitor = new FileSizeMonitor();
        this.alertsFile = 'build-reports/size-alerts.json';
        this.thresholds = {
            warning: 400,
            error: 500
        };
    }

    // Generate alerts for file size violations
    generateAlerts() {
        const results = this.monitor.analyze();
        const alerts = [];
        
        results.forEach(file => {
            if (file.lines >= this.thresholds.error) {
                alerts.push({
                    level: 'error',
                    file: file.path,
                    lines: file.lines,
                    message: `File exceeds ${this.thresholds.error} line limit`,
                    excess: file.excess,
                    timestamp: new Date().toISOString()
                });
            } else if (file.lines >= this.thresholds.warning) {
                alerts.push({
                    level: 'warning',
                    file: file.path,
                    lines: file.lines,
                    message: `File approaching ${this.thresholds.error} line limit`,
                    excess: 0,
                    timestamp: new Date().toISOString()
                });
            }
        });

        return alerts;
    }

    // Save alerts to file
    saveAlerts(alerts) {
        // Ensure directory exists
        const dir = path.dirname(this.alertsFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const alertData = {
            timestamp: new Date().toISOString(),
            alerts: alerts,
            summary: {
                total: alerts.length,
                errors: alerts.filter(a => a.level === 'error').length,
                warnings: alerts.filter(a => a.level === 'warning').length
            }
        };

        fs.writeFileSync(this.alertsFile, JSON.stringify(alertData, null, 2));
        return alertData;
    }

    // Display alerts in console
    displayAlerts(alerts) {
        if (alerts.length === 0) {
            console.log('✅ No file size alerts');
            return;
        }

        console.log('\n🚨 File Size Alerts:');
        console.log('=' .repeat(50));

        const errors = alerts.filter(a => a.level === 'error');
        const warnings = alerts.filter(a => a.level === 'warning');

        if (errors.length > 0) {
            console.log(`\n❌ ERRORS (${errors.length}):`);
            errors.forEach(alert => {
                console.log(`   ${alert.file}: ${alert.lines} lines (+${alert.excess} over limit)`);
            });
        }

        if (warnings.length > 0) {
            console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
            warnings.forEach(alert => {
                console.log(`   ${alert.file}: ${alert.lines} lines (approaching limit)`);
            });
        }

        console.log(`\n📊 Summary: ${errors.length} errors, ${warnings.length} warnings`);
    }

    // Send email alert (placeholder for future implementation)
    sendEmailAlert(alerts) {
        const errors = alerts.filter(a => a.level === 'error');
        
        if (errors.length > 0) {
            console.log('📧 Email alert would be sent for critical file size violations');
            console.log('   Configure email settings in build.config.js to enable');
        }
    }

    // Generate HTML alert report
    generateHTMLReport(alerts) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Size Alert Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .alert { margin: 10px 0; padding: 10px; border-radius: 5px; }
        .error { background-color: #ffebee; border-left: 4px solid #f44336; }
        .warning { background-color: #fff3e0; border-left: 4px solid #ff9800; }
        .summary { background-color: #f5f5f5; padding: 15px; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f5f5f5; }
    </style>
</head>
<body>
    <h1>File Size Alert Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p>Total Alerts: ${alerts.length}</p>
        <p>Errors: ${alerts.filter(a => a.level === 'error').length}</p>
        <p>Warnings: ${alerts.filter(a => a.level === 'warning').length}</p>
    </div>

    ${alerts.length > 0 ? `
    <h2>Alerts</h2>
    <table>
        <thead>
            <tr>
                <th>Level</th>
                <th>File</th>
                <th>Lines</th>
                <th>Excess</th>
                <th>Message</th>
            </tr>
        </thead>
        <tbody>
            ${alerts.map(alert => `
            <tr class="${alert.level}">
                <td>${alert.level.toUpperCase()}</td>
                <td>${alert.file}</td>
                <td>${alert.lines}</td>
                <td>${alert.excess || 'N/A'}</td>
                <td>${alert.message}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>
    ` : '<p>✅ No alerts to display</p>'}
</body>
</html>`;

        const reportPath = 'build-reports/size-alert-report.html';
        fs.writeFileSync(reportPath, html);
        console.log(`📄 HTML report saved to: ${reportPath}`);
    }

    // Main alert process
    run() {
        console.log('🔔 Running file size alert system...');
        
        const alerts = this.generateAlerts();
        const alertData = this.saveAlerts(alerts);
        
        this.displayAlerts(alerts);
        this.generateHTMLReport(alerts);
        this.sendEmailAlert(alerts);
        
        return alertData;
    }
}

// CLI interface
if (require.main === module) {
    const alertSystem = new SizeAlertSystem();
    alertSystem.run();
}

module.exports = SizeAlertSystem;