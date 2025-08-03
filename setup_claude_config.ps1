# PowerShell script to set up Claude Desktop MCP configuration for MCPShell

Write-Host "Setting up Claude Desktop MCP configuration for MCPShell..." -ForegroundColor Green

# Get the current directory (MCPShell project directory)
$projectPath = Get-Location
Write-Host "Project path: $projectPath" -ForegroundColor Yellow

# Create the MCP configuration
$mcpConfig = @{
    mcpServers = @{
        mcpshell = @{
            command = "node"
            args = @("index.js")
            cwd = $projectPath.ToString()
            env = @{
                NODE_ENV = "production"
            }
        }
    }
}

# Convert to JSON
$configJson = $mcpConfig | ConvertTo-Json -Depth 10

# Determine Claude Desktop config path
$claudeConfigPath = "$env:APPDATA\Claude\claude_desktop_config.json"
Write-Host "Claude Desktop config path: $claudeConfigPath" -ForegroundColor Yellow

# Check if Claude config directory exists
$claudeConfigDir = Split-Path $claudeConfigPath -Parent
if (-not (Test-Path $claudeConfigDir)) {
    Write-Host "Creating Claude config directory: $claudeConfigDir" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $claudeConfigDir -Force | Out-Null
}

# Check if existing config exists
if (Test-Path $claudeConfigPath) {
    Write-Host "Existing Claude config found. Backing up..." -ForegroundColor Yellow
    $backupPath = "$claudeConfigPath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $claudeConfigPath $backupPath
    Write-Host "Backup created: $backupPath" -ForegroundColor Green
    
    # Read existing config and merge
    try {
        $existingConfig = Get-Content $claudeConfigPath | ConvertFrom-Json
        if ($existingConfig.mcpServers) {
            $existingConfig.mcpServers.mcpshell = $mcpConfig.mcpServers.mcpshell
        } else {
            $existingConfig.mcpServers = $mcpConfig.mcpServers
        }
        $configJson = $existingConfig | ConvertTo-Json -Depth 10
        Write-Host "Merged with existing configuration" -ForegroundColor Green
    } catch {
        Write-Host "Error reading existing config, creating new one" -ForegroundColor Yellow
        $configJson = $mcpConfig | ConvertTo-Json -Depth 10
    }
} else {
    Write-Host "No existing Claude config found, creating new one" -ForegroundColor Yellow
}

# Write the configuration
Write-Host "Writing configuration to: $claudeConfigPath" -ForegroundColor Yellow
$configJson | Out-File -FilePath $claudeConfigPath -Encoding UTF8

Write-Host "Configuration setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart Claude Desktop" -ForegroundColor White
Write-Host "2. Test the connection by asking Claude to run a command like 'dir' or 'Get-Date'" -ForegroundColor White
Write-Host "3. The server will be available as the 'runCommand' tool" -ForegroundColor White
Write-Host ""
Write-Host "Configuration written:" -ForegroundColor Yellow
Write-Host $configJson -ForegroundColor Gray 