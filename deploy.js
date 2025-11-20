const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 BẮT ĐẦU AUTO DEPLOY...\n');

// 1. Tạo Dockerfile
console.log('📦 Tạo Dockerfile...');
const dockerfile = `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]`;

fs.writeFileSync('Dockerfile', dockerfile);

// 2. Tạo .dockerignore
const dockerignore = `node_modules
.git
*.md
.env`;
fs.writeFileSync('.dockerignore', dockerignore);

// 3. Tạo render.yaml cho auto deploy
console.log('⚙️ Tạo render.yaml...');
const renderYaml = `services:
  - type: web
    name: hotel-app
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
databases:
  - name: hotel-db
    databaseName: quanlykhachsan
    user: hotel_user`;

fs.writeFileSync('render.yaml', renderYaml);

// 4. Cập nhật package.json với engines
console.log('📝 Cập nhật package.json...');
const pkg = JSON.parse(fs.readFileSync('package.json'));
pkg.engines = { node: ">=18.0.0" };
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));

// 5. Push lên GitHub
console.log('📤 Push code lên GitHub...');
try {
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Auto deploy setup"', { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });
    console.log('✅ Code đã push lên GitHub!');
} catch (error) {
    console.log('⚠️ Lỗi push GitHub, tiếp tục...');
}

console.log('\n🎉 SETUP HOÀN THÀNH!');
console.log('\n📋 BƯỚC TIẾP THEO:');
console.log('1. Vào https://render.com');
console.log('2. New → Web Service');
console.log('3. Connect GitHub repo');
console.log('4. Render sẽ tự detect render.yaml và deploy!');
console.log('\n🌐 App sẽ có URL: https://hotel-app-xxxx.onrender.com');