# Use Alpine to get the latest root ca's
FROM alpine:latest AS certs
RUN apk --update add ca-certificates

# Use Distroless to get the latest required libraries
FROM gcr.io/distroless/cc as cc

# Inherit from this image
FROM scratch
ARG TARGETARCH

# Copy root CAs into scratch image
USER root
COPY --from=certs /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt

# Inspired by https://github.com/dojyorin/deno_docker_image/blob/master/src/alpine.dockerfile
COPY --from=cc --chown=root:root --chmod=755 /lib/*-linux-gnu/* /usr/local/lib/
COPY --from=cc --chown=root:root --chmod=755 /lib/*-linux-gnu/ld-linux-* /lib/
COPY --from=cc --chown=root:root --chmod=755 /lib/*-linux-gnu/ld-linux-* /lib64/
ENV LD_LIBRARY_PATH="/usr/local/lib"

# Use an unprivileged user.
USER 1001:1001

# Copy static executable.
ADD SecretBin_Linux_${TARGETARCH}.tar.gz /app/

# Set working directory.
WORKDIR /app

# Run binary.
ENTRYPOINT ["/app/SecretBin"]