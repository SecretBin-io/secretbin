# The Deno version is overridden by the Taskfile
ARG DENO_VERSION="2.3.0"

# Use the official Ubuntu Deno image as a base
FROM denoland/deno:ubuntu-${DENO_VERSION}

# Set images metadata
LABEL org.opencontainers.image.title="SecretBin"
LABEL org.opencontainers.image.authors="Nihility.io"
LABEL org.opencontainers.image.documentation="https://github.com/Nihility-io/SecretBin"
LABEL org.opencontainers.image.source="https://github.com/Nihility-io/SecretBin"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.description="SecretBin is a web app for sharing secrets like tokens and passwords."

# Switch to the root user in order to prepare the app folder
USER root

# Create the app folder and make sure the deno user owns it
RUN mkdir -p /app && \
    chown -R deno /app && \
    chmod -R 777 /app

# Switch back to the Deno user
USER deno

# Set the working directory to the app folder
WORKDIR /app

# Expose the port Deno Fresh listens on
EXPOSE 8000

# Copy SecretBin into the container
COPY --chown=deno . /app

# Install dependencies and build SecretBin
RUN ls -lah && deno install && \
    deno cache -r dev.ts && \
    deno cache -r main.ts && \
    deno task freshBuild

ENTRYPOINT [ "deno", "task", "start" ] 
