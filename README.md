# MCP Shell Server

A Model Context Protocol (MCP) server that provides both local Windows PowerShell commands and remote SSH Linux command execution capabilities.

## Features

- **Local PowerShell Tool**: Execute Windows PowerShell commands locally
- **SSH Remote Tool**: Execute Linux commands on remote servers via SSH
- **Server Management**: List and manage multiple SSH server connections
- **Simple Configuration**: JSON-based server configuration
- **ES Module Support**: Modern JavaScript implementation
- **Error Handling**: Comprehensive error handling and output capture

## Installation

1. Install dependencies:
```bash
npm install
```

## Usage

### Running the Servers

#### Local PowerShell Server (index.js)
Start the local PowerShell MCP server:
```bash
npm start
```

#### SSH Remote Server (serveraccess.js)
Start the SSH remote server:
```bash
node serveraccess.js
```

Both servers will start and listen for MCP requests via stdio.

### Testing

#### Local PowerShell Testing
Run the test script to see example PowerShell commands:
```bash
node test.js
```

#### SSH Server Testing
Run the SSH test script to see example Linux commands:
```bash
node test_ssh.js
```

## Tools

### Local PowerShell Tool: runCommand

The local server exposes a `runCommand` tool that allows you to execute Windows PowerShell commands.

**Parameters:**
- `command` (string, required): The PowerShell command to execute

**Examples:**
- `dir` - List directory contents
- `Get-Process` - Get running processes
- `echo "Hello World"` - Print a message
- `Get-Date` - Get current date and time

**Example MCP Request:**
```json
{
  "method": "tools/call",
  "params": {
    "name": "runCommand",
    "arguments": {
      "command": "dir"
    }
  }
}
```

### SSH Remote Tools

The SSH server exposes two tools for remote server management:

#### 1. executeSSHCommand

Execute Linux commands on remote servers via SSH.

**Parameters:**
- `serverName` (string, required): Name of the server (as defined in servers.json)
- `command` (string, required): The Linux command to execute

**Examples:**
- `ls -la` - List directory contents
- `ps aux` - Get running processes
- `df -h` - Check disk usage
- `whoami` - Get current user
- `hostname` - Get server hostname

**Example MCP Request:**
```json
{
  "method": "tools/call",
  "params": {
    "name": "executeSSHCommand",
    "arguments": {
      "serverName": "webserver1",
      "command": "ls -la"
    }
  }
}
```

#### 2. listServers

List all available servers from the configuration.

**Parameters:** None

**Example MCP Request:**
```json
{
  "method": "tools/call",
  "params": {
    "name": "listServers",
    "arguments": {}
  }
}
```

## Configuration

### SSH Server Configuration

Configure your SSH servers in `servers.json`:

```json
{
  "servers": [
    {
      "name": "webserver1",
      "host": "192.168.1.100",
      "port": 22,
      "username": "ubuntu",
      "password": "your_password_here"
    },
    {
      "name": "dbserver1",
      "host": "192.168.1.101",
      "port": 22,
      "username": "ubuntu",
      "password": "your_password_here"
    }
  ]
}
```

**Configuration Fields:**
- `name`: Unique identifier for the server
- `host`: Server IP address or hostname
- `port`: SSH port (usually 22)
- `username`: SSH username
- `password`: SSH password

## MCP Configuration

### General MCP Client Configuration

To use these servers with an MCP client, add them to your MCP configuration:

#### Local PowerShell Server
```json
{
  "mcpServers": {
    "mcpshell": {
      "command": "node",
      "args": ["D:\\AI\\MCPShell\\index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

#### SSH Remote Server
```json
{
  "mcpServers": {
    "mcpshell-ssh": {
      "command": "node",
      "args": ["D:\\AI\\MCPShell\\serveraccess.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### Claude Desktop Configuration

To use both servers with Claude Desktop:

1. **Update your Claude config** to include both servers:
```json
{
  "mcpServers": {
    "mcpshell": {
      "command": "node",
      "args": ["D:\\AI\\MCPShell\\index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    },
    "mcpshell-ssh": {
      "command": "node",
      "args": ["D:\\AI\\MCPShell\\serveraccess.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

2. **Place the config** at: `%APPDATA%\Claude\claude_desktop_config.json`
3. **Restart Claude Desktop** after updating the configuration
4. **Test the connections**:
   - Local: Ask Claude to run "dir" or "Get-Date"
   - SSH: Ask Claude to run "ls -la" on "webserver1" server

## Security Notes

### Local PowerShell Server
This server executes commands directly in PowerShell. Use with caution and only in trusted environments.

### SSH Remote Server
- Store server credentials securely
- Use strong passwords
- Consider using SSH keys instead of passwords for production
- Ensure SSH is properly configured on target servers
- Monitor server access logs

## Troubleshooting

### SSH Connection Issues
1. **Check server credentials** in `servers.json`
2. **Verify SSH is enabled** on target servers
3. **Test connectivity** using standard SSH client
4. **Check firewall settings** on target servers
5. **Verify username/password** are correct

### Local Server Issues
1. **Ensure PowerShell is available** on Windows
2. **Check execution policy** if commands are blocked
3. **Verify Node.js installation** and path

## License
## Author
Girish Prasad Sahu
ISC 