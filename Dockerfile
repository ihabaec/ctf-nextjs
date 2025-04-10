FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV DEMO_USER_MAIL=test@gmail.com
ENV DEMO_USER_PASS=password
ENV NEXTAUTH_URL=http://localhost:3000

RUN if [ -f /tmp/flag.txt ]; then \
    export FLAG=$(cat /tmp/flag.txt); \
    echo "FLAG=$FLAG" >> .env.production.local; \
    fi

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]