import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { Client } from 'ssh2';
import { readFileSync } from 'fs';
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

// SSH connection function
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
    }).connect({
      host: serverConfig.host,
      port: serverConfig.port,
      username: serverConfig.username,
      password: serverConfig.password,
      readyTimeout: 10000,
      keepaliveInterval: 1000
    });
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
      username: s.username
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
        description: 'Execute a Linux command on a remote server via SSH',
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
        description: 'List all available servers from the configuration',
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

console.error('MCP SSH Shell server started');