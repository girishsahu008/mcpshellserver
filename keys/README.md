# SSH Keys Directory

This directory contains SSH private key files for PEM-based authentication.

## Security Notice

⚠️ **IMPORTANT**: This directory contains sensitive SSH private keys. Never commit these files to version control!

## File Structure

```
keys/
├── README.md
├── prod-server1.pem      # Production server private key
├── staging-server1.pem   # Staging server private key
└── .gitkeep              # Keeps directory in git (ignore actual keys)
```

## Setup Instructions

1. **Place your PEM key files** in this directory
2. **Update `servers.json`** with the correct key file paths
3. **Set proper permissions** on key files (600 recommended)
4. **Add key files to `.gitignore`** to prevent accidental commits

## Key File Permissions

Set proper permissions on your key files:

```bash
# Linux/macOS
chmod 600 keys/*.pem

# Windows (PowerShell)
icacls "keys\*.pem" /inheritance:r /grant:r "%USERNAME%:F"
```

## Configuration Example

In `servers.json`:

```json
{
  "name": "prod-server1",
  "host": "192.168.1.102",
  "port": 22,
  "username": "ubuntu",
  "privateKeyPath": "./keys/prod-server1.pem",
  "passphrase": "optional_passphrase_if_key_is_encrypted"
}
```

## Supported Key Formats

- RSA private keys
- DSA private keys
- ECDSA private keys
- Ed25519 private keys

## Troubleshooting

### Common Issues

1. **"PEM key file not found"**
   - Check the file path in `servers.json`
   - Ensure the key file exists in the specified location

2. **"Permission denied"**
   - Set proper file permissions (600)
   - Ensure the key file is readable by the application

3. **"Invalid key format"**
   - Ensure the key file is in PEM format
   - Check that the key file is not corrupted

4. **"Passphrase required"**
   - Add the `passphrase` field to your server configuration
   - Ensure the passphrase is correct

## Best Practices

1. **Use different keys** for different environments
2. **Rotate keys regularly** for security
3. **Store keys securely** with proper permissions
4. **Use encrypted keys** with passphrases for additional security
5. **Backup keys safely** in a secure location 