#!/bin/bash

APP_PATH="/home/ihab/ctf-nextjs"
LOGS_DIR="${APP_PATH}/logs"
FILTERED_LOGS_DIR="${APP_PATH}/logs/filtered"

mkdir -p "${FILTERED_LOGS_DIR}"

# Regular sanitize function for most content
sanitize_input() {
    local input="$1"
    sanitized=$(echo "$input" | sed 's/`//g' | sed 's/;//g' | sed 's/|//g' | sed 's/&//g' | sed 's/$(//g' | sed 's/)//g')
    echo "$sanitized"
}

# Incomplete sanitize function for user agents - intentionally vulnerable
sanitize_user_agent() {
    local input="$1"
    sanitized=$(echo "$input" | sed 's/;;//g' | sed 's/||//g' | sed 's/&&//g')
    decoded=$(echo "$sanitized" | sed 's/\\x\([0-9a-fA-F][0-9a-fA-F]\)/\\\\\\x\1/g')
    echo -e "$decoded"
}

find "${LOGS_DIR}" -type f -name "*.log" -not -path "${FILTERED_LOGS_DIR}/*" | while read -r log_file; do
    log_filename=$(basename "${log_file}")
    filtered_log_path="${FILTERED_LOGS_DIR}/${log_filename}"
    
    # First extract all ERROR lines to filtered log
    grep "ERROR" "${log_file}" > "${filtered_log_path}" 2>/dev/null
    
    # For contact.log, process User-Agent headers in a vulnerable way
    if [[ "$log_filename" == "contact.log" ]]; then
        TMP_FILE=$(mktemp)
        
        while IFS= read -r line; do
            if [[ "$line" == *"User-Agent:"* ]]; then
                # Extract the user agent
                user_agent=$(echo "$line" | grep -o "User-Agent:.*" | cut -d':' -f2- | xargs)
                
                # Apply the weaker sanitization to user agent
                sanitized_agent=$(sanitize_user_agent "$user_agent")
                
                # Process user agent in an unsafe way - vulnerable to command injection
                # This will evaluate the sanitized agent which may contain decoded commands
                processed_agent=$(eval "echo \"$sanitized_agent\"" 2>/dev/null)
                
                # Replace the original user agent with the processed version
                new_line="${line/User-Agent: $user_agent/User-Agent: $processed_agent}"
                echo "$new_line" >> "$TMP_FILE"
            else
                echo "$line" >> "$TMP_FILE"
            fi
        done < "${filtered_log_path}"
        
        cat "$TMP_FILE" > "${filtered_log_path}"
        rm -f "$TMP_FILE"
    else
        # For other log files, apply regular sanitization
        TMP_FILE=$(mktemp)
        while IFS= read -r line; do
            sanitized_line=$(sanitize_input "$line")
            echo "$sanitized_line" >> "$TMP_FILE"
        done < "${filtered_log_path}"
        
        cat "$TMP_FILE" > "${filtered_log_path}"
        rm -f "$TMP_FILE"
    fi
done