const fs = require('fs');
const path = require('path');

// Read the monLogs.json file
console.log('Reading monLogs.json...');
const monLogs = JSON.parse(fs.readFileSync(path.join(__dirname, 'monLogs.json'), 'utf8'));

// Process and filter the logs
console.log('Processing logs...');
const processedLogs = monLogs
  .filter(log => 
    // Only include login events and session connects
    log.eventid === 'cowrie.login.failed' || 
    log.eventid === 'cowrie.login.success' || 
    log.eventid === 'cowrie.session.connect'
  )
  .map(log => ({
    timestamp: log.timestamp,
    src_ip: log.src_ip,
    username: log.username || null,
    password: log.password || null,
    eventid: log.eventid,
    message: log.message
  }))
  .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Sort by timestamp

// Write the processed logs to a new file
console.log('Writing processed logs...');
fs.writeFileSync(
  path.join(__dirname, 'processed_logs.json'),
  JSON.stringify(processedLogs, null, 2)
);

console.log(`Processed ${processedLogs.length} logs from ${monLogs.length} total logs`);
console.log('Processed logs saved to processed_logs.json');

// Print some statistics
const stats = {
  totalLogs: monLogs.length,
  processedLogs: processedLogs.length,
  uniqueIPs: new Set(processedLogs.map(log => log.src_ip)).size,
  loginAttempts: processedLogs.filter(log => 
    log.eventid === 'cowrie.login.failed' || log.eventid === 'cowrie.login.success'
  ).length,
  sessionConnects: processedLogs.filter(log => 
    log.eventid === 'cowrie.session.connect'
  ).length
};

console.log('\nStatistics:');
console.log('Total logs:', stats.totalLogs);
console.log('Processed logs:', stats.processedLogs);
console.log('Unique attacking IPs:', stats.uniqueIPs);
console.log('Login attempts:', stats.loginAttempts);
console.log('Session connects:', stats.sessionConnects); 