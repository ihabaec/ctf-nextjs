FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN npm run build

FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache bash dcron

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

COPY filter.sh ./filter.sh
COPY flag.sh ./flag.sh

RUN mkdir -p /var/log && touch /var/log/filter.log

RUN echo "CRISI5{LFI_t0_RC3_1n_n3xt_js}" > /tmp/flag.txt && \
    chmod 644 /tmp/flag.txt

RUN chmod +x /app/filter.sh && \
    echo "*/1 * * * * /bin/sh /app/filter.sh >> /var/log/filter.log 2>&1" > /etc/crontabs/root

RUN chmod +x /app/flag.sh && \
    cp /app/flag.sh /usr/local/bin/flag

RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'crond' >> /app/start.sh && \
    echo 'exec npm start' >> /app/start.sh && \
    chmod +x /app/start.sh

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

CMD ["/app/start.sh"]