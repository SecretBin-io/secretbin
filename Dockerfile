FROM --platform=$BUILDPLATFORM denoland/deno:2.1.1 
ARG TARGETOS
ARG TARGETARCH

# Prefer not to run as root.
USER deno:deno

WORKDIR /app

COPY . .

RUN deno cache -r dev.ts
RUN deno task build

# The port that your application listens to.
EXPOSE 8080

CMD [ \
    "run", \
    "--allow-env=DENO_DEPLOYMENT_ID,GITHUB_SHA,PGSSL,PGCONNECT_TIMEOUT,PGMAX_LIFETIME,PGMAX_PIPELINE,PGBACKOFF,PGKEEP_ALIVE,PGPREPARE,PGDEBUG,PGFETCH_TYPES,PGPUBLICATIONS,PGTARGET_SESSION_ATTRS,PGTARGETSESSIONATTRS", \
    "--allow-read=.", \
    "--allow-net=0.0.0.0:8000,0.0.0.0:5432", \
    "--no-prompt", \
    "main.ts" \
    ]
