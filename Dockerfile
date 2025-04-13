FROM node:22-alpine

WORKDIR /app

# Install required system utilities
RUN apk add --no-cache bash dcron

COPY . .

# Install dependencies and build
RUN npm ci
RUN npm run build

# Create necessary files
RUN mkdir -p /var/log && touch /var/log/filter.log

# Create the flag file and set up configuration
RUN echo "CRISI5{LFI_t0_RC3_1n_n3xt_js}" > /tmp/flag.txt && \
    chmod 644 /tmp/flag.txt && \
    echo "0" > /tmp/.flag_activated && \
    chmod 644 /tmp/.flag_activated

# Make scripts executable
RUN chmod +x /app/filter.sh && \
    chmod +x /app/flag.sh && \
    cp /app/flag.sh /usr/local/bin/flag

# Set up cron job
RUN echo "*/1 * * * * /bin/sh /app/filter.sh >> /var/log/filter.log 2>&1" > /etc/crontabs/root

# Create start script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'crond' >> /app/start.sh && \
    echo 'exec npm start' >> /app/start.sh && \
    chmod +x /app/start.sh

# Environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

EXPOSE 3000

CMD ["/app/start.sh"]