FROM node:23-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Install cron and required utilities
RUN apk add --no-cache bash coreutils dcron

# Set up cron job for filter.sh
RUN chmod +x /app/filter.sh && \
    echo "*/2 * * * * /app/filter.sh >> /var/log/filter.log 2>&1" > /etc/crontabs/root

# Make flag.sh executable and move it to PATH
RUN chmod +x /app/flag.sh && \
    cp /app/flag.sh /usr/local/bin/flag

# Handle flag if available - append to existing .env.production
RUN if [ -f /tmp/flag.txt ]; then \
    export FLAG=$(cat /tmp/flag.txt); \
    echo "FLAG=$FLAG" >> .env.production; \
    fi

RUN npm run build

EXPOSE 3000

# Start cron in the background then start Next.js
CMD ["sh", "-c", "crond -b && npm start"]