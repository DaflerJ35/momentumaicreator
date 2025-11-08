const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting dependency update process...');

// Function to update dependencies in a package.json
const updateDeps = (packagePath) => {
  try {
    console.log(`\n📦 Updating dependencies in ${packagePath}`);
    process.chdir(path.dirname(packagePath));
    
    // Update all dependencies to latest versions
    console.log('🔄 Running npm update...');
    execSync('npm update --save --save-exact', { stdio: 'inherit' });
    
    // Audit and fix vulnerabilities
    console.log('🔍 Running npm audit...');
    try {
      execSync('npm audit fix --force', { stdio: 'inherit' });
    } catch (e) {
      console.log('⚠️ Some vulnerabilities may require manual review');
    }
    
    console.log('✅ Update complete!');
  } catch (error) {
    console.error(`❌ Error updating ${packagePath}:`, error.message);
  }
};

// Update main package.json
updateDeps(path.join(__dirname, 'package.json'));

// Update server/package.json if it exists
const serverPackage = path.join(__dirname, 'server', 'package.json');
if (fs.existsSync(serverPackage)) {
  updateDeps(serverPackage);
}

console.log('\n✨ All dependencies have been updated!');
console.log('Please review the changes and test your application thoroughly.');
