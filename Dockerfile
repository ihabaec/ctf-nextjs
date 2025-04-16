FROM node:22-alpine

RUN addgroup -S filtergroup && adduser -D filteruser -G filtergroup

WORKDIR /app

RUN apk add --no-cache bash

COPY . .

RUN npm ci
RUN npm run build

RUN mkdir -p /var/log && touch /var/log/filter.log

RUN echo "FLAG{FAKE-FLAG}" > /tmp/flag.txt && \
    chmod 644 /tmp/flag.txt && \
    echo "0" > /tmp/.flag_activated && \
    chmod 777 /tmp/.flag_activated

# Make scripts executable
RUN chmod +x /app/filter.sh && \
    chmod +x /app/flag.sh && \
    cp /app/flag.sh /usr/local/bin/flag && \
    chmod 755 /usr/local/bin/flag


RUN mkdir -p /restricted/bin && \
    cp /usr/local/bin/flag /restricted/bin/ && \
    cp /bin/mkdir /restricted/bin/ && \
    cp /usr/bin/find /restricted/bin/ && \
    cp /bin/sleep /restricted/bin/ && \
    cp /bin/date /restricted/bin/ && \
    cp /usr/bin/basename /restricted/bin/ && \
    cp /bin/touch /restricted/bin/ && \
    cp /bin/mktemp /restricted/bin/ && \
    cp /bin/rm /restricted/bin/ && \
    cp /bin/cat /restricted/bin/ && \
    cp /bin/grep /restricted/bin/ && \
    cp /bin/sed /restricted/bin/ && \
    cp /usr/bin/cut /restricted/bin/ && \
    cp /usr/bin/tr /restricted/bin/ && \
    cp /bin/echo /restricted/bin/ && \
    cp /bin/sync /restricted/bin/ && \
    chmod 755 /restricted/bin/* && \
    chown -R filteruser:filtergroup /restricted/bin

RUN echo '#!/bin/sh' > /app/run-filter.sh && \
    echo 'export PATH=/restricted/bin' >> /app/run-filter.sh && \
    echo 'export SHELL=/bin/sh' >> /app/run-filter.sh && \ 
    echo 'cd /app' >> /app/run-filter.sh && \
    echo 'echo "[+] Starting periodic filter.sh run every 3 minutes..."' >> /app/run-filter.sh && \
    echo 'while true; do' >> /app/run-filter.sh && \
    echo '  echo "[+] Running filter script at $(date)"' >> /app/run-filter.sh && \
    echo '  /bin/sh /app/filter.sh' >> /app/run-filter.sh && \
    echo '  echo "[+] Filter script completed. Sleeping 3 minutes..."' >> /app/run-filter.sh && \
    echo '  sleep 180' >> /app/run-filter.sh && \
    echo 'done' >> /app/run-filter.sh && \
    chmod +x /app/run-filter.sh && \
    chown filteruser:filtergroup /app/run-filter.sh


RUN mkdir -p /app/logs/filtered && \
    chmod 775 /app/logs && \
    chmod 775 /app/logs/filtered && \
    chown -R filteruser:filtergroup /app/logs

RUN chmod 755 /app/filter.sh && \
    chown filteruser:filtergroup /app/filter.sh

RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'exec npm start' >> /app/start.sh && \
    chmod +x /app/start.sh

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

EXPOSE 3000

CMD ["/app/start.sh"]