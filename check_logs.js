const { execSync } = require('child_process');
const fs = require('fs');

try {
    const logs = execSync('docker logs allumnova_backend --tail 100').toString();
    fs.writeFileSync('backend_logs.txt', logs);
    console.log('Logs written successfully.');
} catch (error) {
    fs.writeFileSync('backend_logs.txt', 'Error fetching logs: ' + error.message + '\n\n' + (error.stderr ? error.stderr.toString() : ''));
}
