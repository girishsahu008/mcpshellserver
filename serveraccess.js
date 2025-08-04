import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { Client } from 'ssh2';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load server configurations
let serverConfigs = [];
try {
  const configPath = join(__dirname, 'servers.json');
  const configData = readFileSync(configPath, 'utf8');
  serverConfigs = JSON.parse(configData).servers;
  console.error(`Loaded ${serverConfigs.length} server configurations`);
} catch (error) {
  console.error('Error loading server configurations:', error.message);
  serverConfigs = [];
}

// Function to read PEM key file
function readPEMKey(keyPath) {
  try {
    if (!existsSync(keyPath)) {
      throw new Error(`PEM key file not found: ${keyPath}`);
    }
    return readFileSync(keyPath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read PEM key file: ${error.message}`);
  }
}

// SSH connection function with support for both password and PEM key authentication
async function executeSSHCommand(serverName, command) {
  const serverConfig = serverConfigs.find(s => s.name === serverName);
  
  if (!serverConfig) {
    throw new Error(`Server '${serverName}' not found in configuration`);
  }

  return new Promise((resolve, reject) => {
    const conn = new Client();
    let output = '';
    let errorOutput = '';

    conn.on('ready', () => {
      console.error(`Connected to ${serverName} (${serverConfig.host})`);
      
      conn.exec(command, (err, stream) => {
        if (err) {
          conn.end();
          reject(new Error(`Failed to execute command: ${err.message}`));
          return;
        }

        stream.on('close', (code) => {
          conn.end();
          const result = {
            output: output,
            error: errorOutput,
            exitCode: code
          };
          resolve(result);
        }).on('data', (data) => {
          output += data.toString();
        }).stderr.on('data', (data) => {
          errorOutput += data.toString();
        });
      });
    }).on('error', (err) => {
      reject(new Error(`SSH connection failed: ${err.message}`));
    });

    // Prepare connection options
    const connectionOptions = {
      host: serverConfig.host,
      port: serverConfig.port || 22,
      username: serverConfig.username,
      readyTimeout: 10000,
      keepaliveInterval: 1000
    };

    // Determine authentication method
    if (serverConfig.privateKeyPath) {
      // Use PEM key authentication
      try {
        const privateKey = readPEMKey(serverConfig.privateKeyPath);
        connectionOptions.privateKey = privateKey;
        
        // Optional: Add passphrase if the key is encrypted
        if (serverConfig.passphrase) {
          connectionOptions.passphrase = serverConfig.passphrase;
        }
        
        console.error(`Using PEM key authentication for ${serverName}`);
      } catch (error) {
        reject(new Error(`PEM key authentication failed: ${error.message}`));
        return;
      }
    } else if (serverConfig.password) {
      // Use password authentication
      connectionOptions.password = serverConfig.password;
      console.error(`Using password authentication for ${serverName}`);
    } else {
      reject(new Error(`No authentication method specified for server ${serverName}. Please provide either 'password' or 'privateKeyPath'`));
      return;
    }

    // Connect using the determined authentication method
    conn.connect(connectionOptions);
  });
}

// Create the server
const server = new Server({
  name: 'mcpshell-ssh',
  version: '1.0.0',
});

// Define the SSH command tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'executeSSHCommand') {
    const { serverName, command } = args;
    
    if (!serverName) {
      throw new Error('Server name is required');
    }
    
    if (!command) {
      throw new Error('Command is required');
    }

    try {
      console.error(`Executing SSH command on ${serverName}: ${command}`);
      const result = await executeSSHCommand(serverName, command);

      let responseText = `Command executed successfully on ${serverName}!\n\n`;
      responseText += `Command: ${command}\n`;
      responseText += `Exit Code: ${result.exitCode}\n\n`;
      
      if (result.output) {
        responseText += `Output:\n${result.output}\n`;
      }
      
      if (result.error) {
        responseText += `Errors:\n${result.error}\n`;
      }

      return {
        content: [
          {
            type: 'text',
            text: responseText,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `SSH command failed: ${error.message}`,
          },
        ],
      };
    }
  }

  if (name === 'listServers') {
    const serverList = serverConfigs.map(s => ({
      name: s.name,
      host: s.host,
      port: s.port,
      username: s.username,
      authMethod: s.privateKeyPath ? 'PEM Key' : 'Password'
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Available servers:\n${JSON.stringify(serverList, null, 2)}`,
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Define the tool schemas
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'executeSSHCommand',
        description: 'Execute a Linux command on a remote server via SSH (supports password and PEM key authentication)',
        inputSchema: {
          type: 'object',
          properties: {
            serverName: {
              type: 'string',
              description: 'Name of the server (as defined in servers.json)',
            },
            command: {
              type: 'string',
              description: 'The Linux command to execute (e.g., "ls -la", "ps aux", "df -h")',
            },
          },
          required: ['serverName', 'command'],
        },
      },
      {
        name: 'listServers',
        description: 'List all available servers from the configuration with authentication methods',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
    ],
  };
});

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('MCP SSH Shell server started with PEM key support');