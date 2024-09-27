FROM node:20-alpine AS backend

# Set working directory for the backend
WORKDIR /app

# Copy backend package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend source code
COPY *.ts ./
COPY tsconfig.json ./
COPY libs ./libs
COPY swagger ./swagger
COPY .env ./

# # Build the backend using the TypeScript compiler
# RUN npm run build

RUN sed -i 's/MONGO_HOST=localhost/MONGO_HOST=mongo/' .env

# Expose port 5000 for the backend
EXPOSE 5000

# Start the backend server
ENTRYPOINT [ "npm", "start" ]


