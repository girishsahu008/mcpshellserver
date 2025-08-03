# PowerShell script to add MCPShell to existing Claude Desktop MCP configuration

Write-Host "Adding MCPShell to Claude Desktop MCP configuration..." -ForegroundColor Green

# Get the current directory (MCPShell project directory)
$projectPath = Get-Location
Write-Host "MCPShell project path: $projectPath" -ForegroundColor Yellow

# Determine Claude Desktop config path
$claudeConfigPath = "$env:APPDATA\Claude\claude_desktop_config.json"
Write-Host "Claude Desktop config path: $claudeConfigPath" -ForegroundColor Yellow

# Check if Claude config exists
if (-not (Test-Path $claudeConfigPath)) {
    Write-Host "Claude config not found. Creating new config file..." -ForegroundColor Yellow
    $config = @{
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
} else {
    Write-Host "Reading existing Claude config..." -ForegroundColor Yellow
    try {
        $config = Get-Content $claudeConfigPath | ConvertFrom-Json
        
        # Ensure mcpServers object exists
        if (-not $config.mcpServers) {
            $config.mcpServers = @{}
        }
        
        # Add mcpshell configuration
        $config.mcpServers.mcpshell = @{
            command = "node"
            args = @("index.js")
            cwd = $projectPath.ToString()
            env = @{
                NODE_ENV = "production"
            }
        }
        
        Write-Host "Added mcpshell to existing configuration" -ForegroundColor Green
    } catch {
        Write-Host "Error reading existing config. Creating new one..." -ForegroundColor Red
        $config = @{
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
    }
}

# Convert back to JSON and write
$configJson = $config | ConvertTo-Json -Depth 10

# Ensure Claude config directory exists
$claudeConfigDir = Split-Path $claudeConfigPath -Parent
if (-not (Test-Path $claudeConfigDir)) {
    Write-Host "Creating Claude config directory: $claudeConfigDir" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $claudeConfigDir -Force | Out-Null
}

# Write the configuration
Write-Host "Writing updated configuration to: $claudeConfigPath" -ForegroundColor Yellow
$configJson | Out-File -FilePath $claudeConfigPath -Encoding UTF8

Write-Host "Configuration updated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart Claude Desktop" -ForegroundColor White
Write-Host "2. Test the connection by asking Claude to run a command like 'dir' or 'Get-Date'" -ForegroundColor White
Write-Host "3. The server will be available as the 'runCommand' tool" -ForegroundColor White
Write-Host ""
Write-Host "Updated configuration:" -ForegroundColor Yellow
Write-Host $configJson -ForegroundColor Gray 