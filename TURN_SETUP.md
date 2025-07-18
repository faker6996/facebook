# TURN Server Setup - Metered Service

## 📋 Setup Instructions

### 1. Create Metered Account
1. Go to https://www.metered.ca/
2. Sign up for free account (50GB/month free)
3. Create a new project
4. Get your API credentials

### 2. Get Credentials
After creating project:
- **API Key**: Your username (e.g., `abc123def456`)
- **Secret Key**: Your password (e.g., `ghi789jkl012`)

### 3. Update Environment Variables

#### Development (.env):
```bash
# Metered TURN Service - Sign up at https://www.metered.ca/
TURN_USERNAME=your-metered-username
TURN_PASSWORD=your-metered-password
```

#### Production (.env.prod):
```bash
# Metered TURN Service - Production
TURN_USERNAME=your-metered-username
TURN_PASSWORD=your-metered-password
```

### 4. HTTPS Deployment Compatibility

The new configuration is fully compatible with HTTPS deployment:

✅ **Port 443**: TURNS over TLS
✅ **Port 80**: TURN over HTTP (fallback)
✅ **Mixed Content**: No issues with HTTPS sites
✅ **Firewall Friendly**: Uses standard HTTP/HTTPS ports

### 5. Server Configuration

The updated `/app/api/turn-cred/route.ts` now provides:

```typescript
// HTTPS compatible TURN servers
{
  urls: 'turn:global.relay.metered.ca:80',      // HTTP fallback
  urls: 'turn:global.relay.metered.ca:443',     // HTTPS
  urls: 'turns:global.relay.metered.ca:443',    // TLS encrypted
}
```

### 6. Benefits over Self-hosted

| Feature | Self-hosted | Metered Service |
|---------|-------------|-----------------|
| **Setup** | Complex | Simple |
| **Maintenance** | Required | None |
| **Scaling** | Manual | Automatic |
| **Global CDN** | No | Yes |
| **HTTPS Support** | Manual SSL | Built-in |
| **Cost** | Server + bandwidth | Free tier |
| **Reliability** | Depends on server | 99.9% uptime |

### 7. Testing

After deployment, test video calls:
1. Open browser console
2. Check network tab for TURN server connections
3. Test calls between different networks
4. Verify HTTPS compatibility

### 8. Monitoring

Monitor usage at Metered dashboard:
- Bandwidth usage
- Connection statistics
- Server performance
- Free tier limits

### 9. Production Considerations

For production deployment:
- Use separate credentials for prod/dev
- Monitor bandwidth usage
- Consider upgrading plan if needed
- Set up monitoring alerts

### 10. Troubleshooting

Common issues:
- **Connection failed**: Check credentials
- **HTTPS mixed content**: Ensure using port 443
- **Firewall blocking**: Metered uses standard ports
- **Rate limiting**: Check usage limits

## 🔧 Technical Details

### ICE Servers Configuration
The system now provides multiple fallback options:
1. **STUN servers**: Google public servers
2. **TURN HTTP**: Port 80 (firewall friendly)
3. **TURN HTTPS**: Port 443 (secure)
4. **TURNS TLS**: Port 443 (encrypted)

### Failover Strategy
If TURN credentials missing:
- Falls back to STUN only
- Logs warning message
- Still allows basic connectivity

### Security
- Credentials stored in environment variables
- No hardcoded secrets in code
- Automatic credential rotation support
- TLS encryption for secure connections