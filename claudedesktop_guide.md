# Claude Desktop MCP Setup Guide

A comprehensive guide to setting up and using MCP (Model Context Protocol) tools in Claude Desktop for both local Windows commands and remote SSH server management.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration Setup](#configuration-setup)
4. [Testing the Setup](#testing-the-setup)
5. [Usage Examples](#usage-examples)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before setting up MCP tools in Claude Desktop, ensure you have:

- **Claude Desktop** installed and running
- **Node.js** (v16 or higher) installed
- **MCPShell project** downloaded and dependencies installed
- **SSH access** to your target servers (for SSH functionality)

## Installation

### Step 1: Install MCPShell Dependencies

```bash
cd D:\AI\MCPShell
npm install
```

### Step 2: Configure SSH Servers

Edit `servers.json` with your actual server credentials:

```json
{
  "servers": [
    {
      "name": "webserver1",
      "host": "192.168.1.100",
      "port": 22,
      "username": "ubuntu",
      "password": "your_actual_password"
    },
    {
      "name": "dbserver1",
      "host": "192.168.1.101",
      "port": 22,
      "username": "ubuntu",
      "password": "your_actual_password"
    }
  ]
}
```

## Configuration Setup

### Step 1: Locate Claude Desktop Config Directory

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

### Step 2: Create/Update Claude Desktop Configuration

Create or update your `claude_desktop_config.json` file:

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

**Important:** Replace `D:\\AI\\MCPShell` with your actual project path.

### Step 3: Restart Claude Desktop

After updating the configuration:
1. Close Claude Desktop completely
2. Reopen Claude Desktop
3. The MCP tools should now be available

## Testing the Setup

### Test Local PowerShell Commands

Ask Claude to run these commands:

```
"Show me the current directory contents"
"Get the current date and time"
"List running processes"
"Show system information"
```

### Test SSH Commands

Ask Claude to run these commands:

```
"List available servers"
"Show directory contents on webserver1"
"Check disk usage on dbserver1"
"Get system uptime on webserver1"
```

## Usage Examples

### Local Windows Commands

#### 1. File System Operations

**English Command:** "List directories in my desktop"
**Claude Response:** Will use the `runCommand` tool with `dir` or `Get-ChildItem` command

**English Command:** "Show me what's in the Documents folder"
**Claude Response:** Will execute `dir "C:\Users\[username]\Documents"`

**English Command:** "Create a new folder called 'test' on my desktop"
**Claude Response:** Will execute `mkdir "C:\Users\[username]\Desktop\test"`

#### 2. System Information

**English Command:** "Show me running services"
**Claude Response:** Will execute `Get-Service | Where-Object {$_.Status -eq "Running"}`

**English Command:** "What's my computer's hostname?"
**Claude Response:** Will execute `hostname`

**English Command:** "Show me system memory usage"
**Claude Response:** Will execute `Get-ComputerInfo | Select-Object TotalPhysicalMemory, AvailablePhysicalMemory`

#### 3. Process Management

**English Command:** "Show me all running processes"
**Claude Response:** Will execute `Get-Process | Sort-Object CPU -Descending | Select-Object -First 10`

**English Command:** "Kill the notepad process"
**Claude Response:** Will execute `Stop-Process -Name "notepad" -Force`

### SSH Remote Server Commands

#### 1. Server Information

**English Command:** "List running services inside server1"
**Claude Response:** Will use `executeSSHCommand` with server "webserver1" and command `systemctl list-units --type=service --state=running`

**English Command:** "Show me the system uptime on webserver1"
**Claude Response:** Will execute `uptime` on the webserver1 server

**English Command:** "What's the hostname of the dbserver1?"
**Claude Response:** Will execute `hostname` on the dbserver1 server

#### 2. File System Operations

**English Command:** "Show me the contents of /var/log on webserver1"
**Claude Response:** Will execute `ls -la /var/log` on webserver1 server

**English Command:** "Check disk usage on dbserver1"
**Claude Response:** Will execute `df -h` on dbserver1 server

**English Command:** "Show me the largest files in /home on webserver1"
**Claude Response:** Will execute `find /home -type f -exec ls -lh {} + | sort -k5 -hr | head -10`

#### 3. System Monitoring

**English Command:** "Show me CPU usage on webserver1"
**Claude Response:** Will execute `top -bn1 | grep "Cpu(s)"` or `htop -t`

**English Command:** "List all users logged into dbserver1"
**Claude Response:** Will execute `who` or `w`

**English Command:** "Show me network connections on webserver1"
**Claude Response:** Will execute `netstat -tuln` or `ss -tuln`

#### 4. Service Management

**English Command:** "Check if nginx is running on webserver1"
**Claude Response:** Will execute `systemctl status nginx`

**English Command:** "Restart the apache service on dbserver1"
**Claude Response:** Will execute `sudo systemctl restart apache2`

**English Command:** "Show me all failed services on webserver1"
**Claude Response:** Will execute `systemctl --failed`

## Advanced Usage Examples

### Combined Operations

**English Command:** "Check disk usage on all servers and show me which one has the most free space"
**Claude Response:** Will execute `df -h` on both servers and compare results

**English Command:** "Show me the top 5 processes by CPU usage on both servers"
**Claude Response:** Will execute `ps aux --sort=-%cpu | head -6` on both servers

### File Operations

**English Command:** "Search for files containing 'error' in the logs on webserver1"
**Claude Response:** Will execute `grep -r "error" /var/log/`

**English Command:** "Show me the last 20 lines of the system log on dbserver1"
**Claude Response:** Will execute `tail -20 /var/log/syslog`

## Troubleshooting

### Common Issues

#### 1. "Tool not found" Error
**Problem:** Claude says the tool is not available
**Solution:** 
- Restart Claude Desktop after configuration changes
- Verify the config file path is correct
- Check that Node.js is in your system PATH

#### 2. SSH Connection Failed
**Problem:** Cannot connect to remote servers
**Solution:**
- Verify server credentials in `servers.json`
- Check if SSH is enabled on target servers
- Test connectivity with standard SSH client
- Ensure firewall allows SSH connections

#### 3. Permission Denied
**Problem:** Commands fail with permission errors
**Solution:**
- Use `sudo` for administrative commands on Linux servers
- Check Windows execution policy for PowerShell commands
- Verify user permissions on target systems

#### 4. Path Issues
**Problem:** Cannot find the MCP server files
**Solution:**
- Use absolute paths in the configuration
- Ensure the project directory exists
- Verify file permissions

### Debug Commands

#### Test Local Server
```bash
cd D:\AI\MCPShell
node index.js
```

#### Test SSH Server
```bash
cd D:\AI\MCPShell
node serveraccess.js
```

#### Check Claude Config
```bash
# Windows
type "%APPDATA%\Claude\claude_desktop_config.json"

# macOS/Linux
cat ~/.config/Claude/claude_desktop_config.json
```

## Best Practices

### Security
1. **Use strong passwords** for SSH connections
2. **Consider SSH keys** instead of passwords for production
3. **Limit server access** to necessary users only
4. **Monitor access logs** regularly
5. **Keep credentials secure** and don't share config files

### Performance
1. **Close connections** after use (handled automatically)
2. **Use specific commands** rather than broad searches
3. **Limit output** for large directories or processes
4. **Cache results** when possible

### Maintenance
1. **Update server credentials** when passwords change
2. **Test connections** regularly
3. **Backup configurations** before changes
4. **Monitor server health** through the tools

## Support

If you encounter issues:

1. **Check the logs** in Claude Desktop
2. **Verify configurations** match the examples
3. **Test manually** using standard SSH/PowerShell
4. **Review troubleshooting** section above
5. **Check project documentation** in README.md

---

**Note:** This guide assumes you have the MCPShell project set up correctly. Refer to the main README.md for detailed installation and configuration instructions. 

## Author
Girish Prasad Sahu