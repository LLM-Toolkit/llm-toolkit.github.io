#!/usr/bin/env node

/**
 * Manual Freshness Trigger
 * Allows manual triggering of freshness updates for immediate bot engagement
 */

const DailyFreshnessUpdater = require('./daily-freshness-updater');
const { execSync } = require('child_process');

class ManualFreshnessTrigger {
    constructor() {
        this.updater = new DailyFreshnessUpdater();
    }

    async triggerFreshness(options = {}) {
        console.log('🚀 Manual freshness trigger initiated...');
        
        try {
            // Run the daily freshness updater
            await this.updater.updateDailyFreshness();
            
            if (options.rebuild !== false) {
                console.log('\n🔨 Rebuilding project...');
                execSync('npm run build', { stdio: 'inherit' });
            }
            
            if (options.deploy && process.env.GITHUB_ACTIONS) {
                console.log('\n🚀 Triggering deployment...');
                // This would trigger in GitHub Actions environment
            }
            
            console.log('\n✅ Manual freshness update completed successfully!');
            console.log('🤖 Your website now appears fresh and updated to bots.');
            
        } catch (error) {
            console.error('❌ Error during manual freshness update:', error.message);
            process.exit(1);
        }
    }
}

// Command line interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = {
        rebuild: !args.includes('--no-rebuild'),
        deploy: args.includes('--deploy')
    };
    
    const trigger = new ManualFreshnessTrigger();
    trigger.triggerFreshness(options);
}

module.exports = ManualFreshnessTrigger;