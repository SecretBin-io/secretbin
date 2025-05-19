ARG DENO_VERSION="20"

FROM denoland/deno:ubuntu-${DENO_VERSION}

LABEL org.opencontainers.image.title="SecretBin"
LABEL org.opencontainers.image.authors="Nihility.io"
LABEL org.opencontainers.image.documentation="https://github.com/Nihility-io/SecretBin"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.description="SecretBin is a web app for sharing secrets like tokens and passwords."

USER root

RUN mkdir -p /app

ADD . /app

RUN chown -R deno /app && chmod -R 777 /app

EXPOSE 8000

WORKDIR /app

USER deno

RUN deno cache -r dev.ts && \
    deno cache -r main.ts && \
    deno task build && \
    mv tailwind.css _fresh/static/styles.css

ENTRYPOINT [ "deno", "task", "start" ] 
