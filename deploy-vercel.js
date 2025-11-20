const { execSync } = require('child_process');
const fs = require('fs');

console.log('▲ VERCEL SERVERLESS DEPLOY...\n');

// 1. Tạo vercel.json
console.log('⚙️ Tạo vercel.json...');
const vercelConfig = {
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
};

fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));

// 2. Tạo api/index.js cho Vercel
console.log('📁 Tạo API structure...');
if (!fs.existsSync('api')) {
    fs.mkdirSync('api');
}

const apiIndex = `module.exports = require('../backend/server.js');`;
fs.writeFileSync('api/index.js', apiIndex);

// 3. Tạo index.html redirect
console.log('🏠 Tạo index.html...');
const indexHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=/frontend/login.html">
    <title>Hotel Management</title>
</head>
<body>
    <p>Redirecting to <a href="/frontend/login.html">Hotel Management System</a></p>
</body>
</html>`;

fs.writeFileSync('index.html', indexHtml);

// 4. Install Vercel CLI và deploy
console.log('📦 Installing Vercel CLI...');
try {
    execSync('npm install -g vercel', { stdio: 'inherit' });
} catch (error) {
    console.log('⚠️ Vercel CLI already installed or error');
}

// 5. Push code
console.log('📤 Push code...');
try {
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Vercel deploy setup"', { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });
} catch (error) {
    console.log('⚠️ Git error');
}

console.log('\n🎉 VERCEL SETUP DONE!');
console.log('\n📋 DEPLOY COMMANDS:');
console.log('1. Run: npx vercel');
console.log('2. Follow prompts');
console.log('3. For production: npx vercel --prod');
console.log('\n💡 Note: You need external MySQL database');
console.log('   - Use PlanetScale (free MySQL)');
console.log('   - Or Railway MySQL');
console.log('   - Set DATABASE_URL in Vercel dashboard');