const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚂 RAILWAY AUTO DEPLOY...\n');

// 1. Tạo railway.json
console.log('⚙️ Tạo railway.json...');
const railwayConfig = {
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
};

fs.writeFileSync('railway.json', JSON.stringify(railwayConfig, null, 2));

// 2. Tạo nixpacks.toml
console.log('📦 Tạo nixpacks.toml...');
const nixpacks = `[phases.setup]
nixPkgs = ['nodejs-18_x', 'npm-9_x']

[phases.install]
cmds = ['npm install']

[phases.build]
cmds = ['echo "No build step required"']

[start]
cmd = 'npm start'`;

fs.writeFileSync('nixpacks.toml', nixpacks);

// 3. Cập nhật package.json
console.log('📝 Cập nhật package.json...');
const pkg = JSON.parse(fs.readFileSync('package.json'));
pkg.engines = { node: ">=18.0.0", npm: ">=9.0.0" };
pkg.scripts.build = "echo 'No build step'";
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));

// 4. Push code
console.log('📤 Push code...');
try {
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Railway deploy setup"', { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });
    console.log('✅ Code pushed!');
} catch (error) {
    console.log('⚠️ Git error, continuing...');
}

console.log('\n🎉 RAILWAY SETUP DONE!');
console.log('\n📋 NEXT STEPS:');
console.log('1. Go to https://railway.app');
console.log('2. Login with GitHub');
console.log('3. New Project → Deploy from GitHub repo');
console.log('4. Select your repo');
console.log('5. Railway auto-deploys with MySQL!');
console.log('\n💡 Railway gives you:');
console.log('   - Free $5/month credit');
console.log('   - Built-in MySQL database');
console.log('   - Auto HTTPS');
console.log('   - Custom domain support');