#!/bin/bash

APP_PATH="/home/ihab/ctf-nextjs"

LOGS_DIR="${APP_PATH}/logs"

FILTERED_LOGS_DIR="${APP_PATH}/logs/filtered"

mkdir -p "${FILTERED_LOGS_DIR}"

sanitize_input() {
    local input="$1"
    sanitized=$(echo "$input" | sed 's/`//g' | sed 's/;//g' | sed 's/|//g' | sed 's/&//g' | sed 's/$(//g' | sed 's/)//g')
    echo "$sanitized"
}

find "${LOGS_DIR}" -type f -name "*.log" -not -path "${FILTERED_LOGS_DIR}/*" | while read -r log_file; do
    log_filename=$(basename "${log_file}")
    filtered_log_path="${FILTERED_LOGS_DIR}/${log_filename}"
    TMP_FILE=$(mktemp)
    cat "${log_file}" | while read -r line; do
        sanitized_line=$(sanitize_input "$line")
        echo "$sanitized_line" >> "$TMP_FILE"
    done
    
    grep "ERROR" "$TMP_FILE" > "${filtered_log_path}" 2>/dev/null
    
    rm -f "$TMP_FILE"
    
    if [[ "$log_filename" == "contact.log" ]]; then
        > "${FILTERED_LOGS_DIR}/browser_stats.log"
        
        grep -o "User-Agent: .*" "$log_file" | cut -d':' -f2- | while read -r agent; do
            agent_type=$(eval "echo $agent" | grep -E "Firefox|Chrome|Safari|Edge" || echo "Unknown")
            echo "Detected browser: $agent_type" >> "${FILTERED_LOGS_DIR}/browser_stats.log"
        done
    fi
done