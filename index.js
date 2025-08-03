import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Create the server
const server = new Server({
  name: 'mcpshell',
  version: '1.0.0',
});

// Define the command line tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'runCommand') {
    const { command } = args;
    
    if (!command) {
      throw new Error('Command is required');
    }

    try {
      console.error(`Executing command: ${command}`);
      const { stdout, stderr } = await execAsync(command, {
        shell: 'powershell.exe',
        cwd: process.cwd(),
        timeout: 30000, // 30 second timeout
      });

      return {
        content: [
          {
            type: 'text',
            text: `Command executed successfully!\n\nOutput:\n${stdout}${stderr ? `\nErrors:\n${stderr}` : ''}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Command failed: ${error.message}\n\nOutput:\n${error.stdout || ''}${error.stderr ? `\nErrors:\n${error.stderr}` : ''}`,
          },
        ],
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Define the tool schema
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'runCommand',
        description: 'Execute a command line command in Windows PowerShell',
        inputSchema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'The command to execute (e.g., "dir", "Get-Process", "echo hello")',
            },
          },
          required: ['command'],
        },
      },
    ],
  };
});

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('MCP Shell server started');
