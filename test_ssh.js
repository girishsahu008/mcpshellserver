// Test script to demonstrate the SSH MCP server
// This would typically be run by an MCP client

const testCommands = [
  'ls -la',
  'ps aux | head -10',
  'df -h',
  'whoami',
  'hostname',
  'uptime'
];

console.log('MCP SSH Server Test Commands:');
console.log('==============================');
testCommands.forEach((cmd, index) => {
  console.log(`${index + 1}. ${cmd}`);
});

console.log('\nTo test the server:');
console.log('1. Update servers.json with your actual server credentials');
console.log('2. Start the server: npm start');
console.log('3. Use an MCP client to connect to the server');
console.log('4. Call the "executeSSHCommand" tool with server name and command');
console.log('5. Use "listServers" tool to see available servers');

console.log('\nExample MCP requests:');
console.log('\n1. List available servers:');
console.log(JSON.stringify({
  method: 'tools/call',
  params: {
    name: 'listServers',
    arguments: {}
  }
}, null, 2));

console.log('\n2. Execute SSH command:');
console.log(JSON.stringify({
  method: 'tools/call',
  params: {
    name: 'executeSSHCommand',
    arguments: {
      serverName: 'webserver1',
      command: 'ls -la'
    }
  }
}, null, 2));

console.log('\nConfiguration:');
console.log('- Update servers.json with your actual server details');
console.log('- Make sure SSH is enabled on your target servers');
console.log('- Ensure the username/password are correct'); 