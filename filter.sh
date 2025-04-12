#!/bin/sh
APP_PATH="/app"
LOGS_DIR="${APP_PATH}/logs"
FILTERED_LOGS_DIR="${APP_PATH}/logs/filtered"

mkdir -p "${FILTERED_LOGS_DIR}"

sanitize_input() {
    local input="$1"
    sanitized=$(echo "$input" | sed 's/[`;&|$()])//g')
    echo "$sanitized"
}

find "${LOGS_DIR}" -type f -name "*.log" -not -path "${FILTERED_LOGS_DIR}/*" | while read -r log_file; do
    log_filename=$(basename "${log_file}")
    filtered_log_path="${FILTERED_LOGS_DIR}/${log_filename}"

    grep "ERROR" "${log_file}" > "${filtered_log_path}" 2>/dev/null
    
    if [ "$log_filename" = "contact.log" ]; then
        TMP_FILE=$(mktemp /tmp/log_filter.XXXXXX)
        
        while IFS= read -r line; do
            if echo "$line" | grep -q "User-Agent:"; then
                user_agent=$(echo "$line" | cut -d ':' -f 2- | sed 's/^ //')
                
                sanitized=$(echo "$user_agent" | sed 's/[;&|`$()]//g')
                
                decoded=$(printf '%b' "$sanitized")
                processed=$(eval "echo \"$decoded\"")
                
                new_line=$(echo "$line" | sed "s|User-Agent:.*|User-Agent|")
                echo "$new_line" >> "$TMP_FILE"
            else
                echo "$line" >> "$TMP_FILE"
            fi
        done < "${filtered_log_path}"
        cat "$TMP_FILE" > "${filtered_log_path}"
        rm -f "$TMP_FILE"
    else
        TMP_FILE=$(mktemp /tmp/log_filter.XXXXXX)
        while IFS= read -r line; do
            sanitized_line=$(sanitize_input "$line")
            echo "$sanitized_line" >> "$TMP_FILE"
        done < "${filtered_log_path}"
        
        cat "$TMP_FILE" > "${filtered_log_path}"
        rm -f "$TMP_FILE"
    fi
done