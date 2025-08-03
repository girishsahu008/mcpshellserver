// Simple test script to demonstrate the MCP server
// This would typically be run by an MCP client

const testCommands = [
  'dir',
  'echo "Hello from MCP!"',
  'Get-Date',
  'Get-Process | Select-Object -First 3'
];

console.log('MCP Shell Server Test Commands:');
console.log('================================');
testCommands.forEach((cmd, index) => {
  console.log(`${index + 1}. ${cmd}`);
});

console.log('\nTo test the server:');
console.log('1. Start the server: npm start');
console.log('2. Use an MCP client to connect to the server');
console.log('3. Call the "runCommand" tool with any of the above commands');
console.log('\nExample MCP request:');
console.log(JSON.stringify({
  method: 'tools/call',
  params: {
    name: 'runCommand',
    arguments: {
      command: 'dir'
    }
  }
}, null, 2)); 