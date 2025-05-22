# The Deno version is overridden by the Taskfile
ARG DENO_VERSION="2.3.0"

# Use the official Ubuntu Deno image as a base
FROM denoland/deno:ubuntu-${DENO_VERSION}

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
COPY --chown=deno .. /app

# Install dependencies and build SecretBin
RUN deno install && \
    deno task build:fresh

ENTRYPOINT [ "deno", "task", "start" ] 
