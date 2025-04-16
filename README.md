# Command Injection in the Logs

## Competition Information
**Event**: AISEC ENSA MARRAKECH CTF COMPETITION 2025
**Challenge Author**: hmidal3yan

## Challenge Description

This CTF challenge focuses on exploiting a command injection vulnerability in a log processing system.

The challenge runs a Next.js web application that records user interactions in log files. These logs are periodically processed by a filtering script that has a critical vulnerability in how it handles certain log entries - particularly in the User-Agent field of the contact.log file.

## Challenge Details

- **Category**: Web Exploitation
- **Difficulty**: Medium
- **Skills Required**: Command Injection, Path Restriction Bypass, Shell Scripting, API Manipulation

## Challenge Overview

A filter script runs every 3 minutes to process log files. The script contains an unsafe `eval` command when processing the User-Agent field in the contact.log file. Your goal is to exploit this vulnerability to execute commands and retrieve the flag stored at `/tmp/flag.txt`.

The system operates with restricted permissions:
- The filter script runs with limited user privileges (`filteruser`)
- The available commands are restricted to a specific set in `/restricted/bin`
- You must activate the flag using the `flag` command before reading it
- The flag is only accessible via the `/api/i7tiramati` endpoint after getting the proper cookie

## Setting Up

1. Build and run the Docker container:
```bash
docker build -t log-filter-challenge .
docker run -p 3000:3000 log-filter-challenge
```

2. Access the web application at `http://localhost:3000`

## API Endpoints

The application exposes several key API endpoints:

- **POST /api/contact**: Processes contact form submissions and logs the user-agent to `contact.log`
- **GET /api/logs**: Retrieves filtered log files from the `logs/filtered` directory
- **GET /api/i7tiramati**: Returns the flag when accessed with the correct cookie and when the flag is activated

## Exploitation Path

1. Examine how the `filter.sh` script processes the contact.log file
2. Note the vulnerability in how User-Agent strings are processed with `eval`
3. Submit a specially crafted User-Agent header to the contact form API
4. The filter script will process your payload, executing your injected commands
5. The key objective is to execute the `flag` command which writes "1" to `/tmp/.flag_activated`
6. Use the special target User-Agent value `\x24\x28flag\x29` to receive a special cookie
7. With both the flag activated and the cookie set, access the `/api/i7tiramati` endpoint to retrieve the flag

## Key Files to Understand

- `filter.sh`: Contains the vulnerable log processing logic with `eval` command
- `flag.sh`: Controls flag activation by writing to `/tmp/.flag_activated`
- `app/api/contact/route.ts`: Handles contact form submissions and logs User-Agent
- `app/api/logs/route.ts`: Allows viewing processed log files
- `app/api/i7tiramati/route.ts`: Endpoint that provides the flag when the flag is activated and correct cookie is present
- `utils/flagChecker.ts`: Checks if the flag is activated by reading from `/tmp/.flag_activated`

## Restrictions to Note

- Commands can only be executed within the available set in `/restricted/bin`
- The main objective is to run the `flag` command through command injection
- Time limitation - flag is only accessible for 2 minutes after activation
- Need to obtain the proper cookie to access the flag endpoint

## Inspiration

This challenge is inspired by the recent Next.js middleware bypass vulnerability (CVE-2025-29927), where adding a specific header could bypass authentication and security middleware completely. In the real-world vulnerability, adding the header `x-middleware-subrequest: src/middleware:src/middleware:src/middleware:src/middleware:src/middleware` would allow attackers to bypass authentication mechanisms implemented in the middleware.

While this challenge focuses on command injection rather than middleware bypass, it shares the theme of manipulating HTTP headers to bypass security controls. The bypass header needs to be included in every request to consistently bypass authentication mechanisms.

Good luck and happy hacking!
