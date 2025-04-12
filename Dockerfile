FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Install cron and required utilities
RUN apk add --no-cache bash coreutils dcron

# Set up cron job for filter.sh
RUN chmod +x /app/filter.sh && \
    echo "*/1 * * * * /bin/sh /app/filter.sh >> /var/log/filter.log 2>&1" > /etc/crontabs/root && \
    mkdir -p /var/log && \
    touch /var/log/filter.log

# Make flag.sh executable and move it to PATH
RUN chmod +x /app/flag.sh && \
    cp /app/flag.sh /usr/local/bin/flag

# Create the flag file
RUN mkdir -p /tmp && \
    echo "CRISI5{LFI_t0_RC3_1n_n3xt_js}" > /tmp/flag.txt && \
    chmod 644 /tmp/flag.txt

EXPOSE 3000

# Create a start script to run both cron and Next.js
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'crond' >> /app/start.sh && \
    echo 'exec npm run dev' >> /app/start.sh && \
    chmod +x /app/start.sh

# Verify the script exists
RUN ls -la /app/start.sh

CMD ["/app/start.sh"]