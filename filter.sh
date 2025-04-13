#!/bin/sh
#this is a comment
APP_PATH="/app"
LOGS_DIR="${APP_PATH}/logs"
FILTERED_LOGS_DIR="${LOGS_DIR}/filtered"

mkdir -p "${FILTERED_LOGS_DIR}"

sanitize_input() {
    local input="$1"
    sanitized=$(echo "$input" | tr -d '`;&|$()><\\"'"'"'\r\n\t')
    sanitized=$(echo "$sanitized" | grep -E '^[a-zA-Z0-9 .,_-]*$' || echo "")
    echo "$sanitized"
}

find "${LOGS_DIR}" -type f -name "*.log" -not -path "${FILTERED_LOGS_DIR}/*" | while read -r log_file; do
    log_filename=$(basename "${log_file}")
    filtered_log_path="${FILTERED_LOGS_DIR}/${log_filename}"

    echo "[+] Processing: $log_filename"

    # Extract ERROR lines — fallback to empty file if none
    grep "ERROR" "${log_file}" > "${filtered_log_path}" 2>/dev/null || touch "${filtered_log_path}"

    TMP_FILE=$(mktemp /tmp/log_filter.XXXXXX)

    if [ "$log_filename" = "contact.log" ]; then
        while IFS= read -r line; do
            if echo "$line" | grep -q "User-Agent:"; then
                user_agent=$(echo "$line" | cut -d ':' -f 2- | sed 's/^ //')
                sanitized=$(echo "$user_agent" | sed 's/[;&|`$()]//g')
                decoded=$(printf '%b' "$sanitized")
                processed=$(eval "echo \"$decoded\"")

                if echo "$processed" | grep -q "SUCCESS"; then
                    fake_log="SOLVED"
                else
                    fake_log="Mozilla"
                fi

                new_line=$(echo "$line" | sed "s|User-Agent:.*|User-Agent: $fake_log|")
                echo "$new_line" >> "$TMP_FILE"
            else
                echo "$line" >> "$TMP_FILE"
            fi
        done < "${filtered_log_path}"
    else
        while IFS= read -r line; do
            sanitized_line=$(sanitize_input "$line")
            echo "$sanitized_line" >> "$TMP_FILE"
        done < "${filtered_log_path}"
    fi

    cat "$TMP_FILE" > "$filtered_log_path"
    rm -f "$TMP_FILE"
    echo "[+] Saved filtered log: $filtered_log_path"
done
