# Firebase Emulator Suite Docker Image
# Node 20 + Java 21 (Temurin) + Firebase CLI

FROM node:20-slim

# Install dependencies and Java 21 (Eclipse Temurin)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://packages.adoptium.net/artifactory/api/gpg/key/public | gpg --dearmor -o /etc/apt/keyrings/adoptium.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/adoptium.gpg] https://packages.adoptium.net/artifactory/deb $(awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release) main" > /etc/apt/sources.list.d/adoptium.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends temurin-21-jre \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Firebase CLI
RUN npm install -g firebase-tools

# Create app directory
WORKDIR /app

# Copy Firebase configuration files
COPY firebase.json firestore.rules firestore.indexes.json ./
COPY .firebaserc ./

# Create data directory for persistence
RUN mkdir -p /app/data

# Expose emulator ports
# 4000: Emulator UI
# 8080: Firestore
# 9099: Authentication
# 9199: Storage
EXPOSE 4000 8080 9099 9199

# Start emulators with data import/export
CMD ["firebase", "emulators:start", "--import=/app/data", "--export-on-exit=/app/data"]
