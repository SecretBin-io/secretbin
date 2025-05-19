ARG DENO_VERSION="20"

FROM denoland/deno:ubuntu-${DENO_VERSION}

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
