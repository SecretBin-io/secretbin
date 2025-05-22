variable "DENO_VERSION" {}

variable "IMAGE" {
    default = "ghcr.io/nihility-io/secretbin"
}

variable "LABELS" {
    default = {
        "org.opencontainers.image.title"         = "SecretBin"
        "org.opencontainers.image.authors"       = "Nihility.io"
        "org.opencontainers.image.documentation" = "https://github.com/Nihility-io/SecretBin"
        "org.opencontainers.image.source"        = "https://github.com/Nihility-io/SecretBin"
        "org.opencontainers.image.licenses"      = "MIT"
        "org.opencontainers.image.description"   = "SecretBin is a web app for sharing secrets like tokens and passwords."
    }
}

target "default" {
    description = "Build a SecretBin container for the current platform only."
    no-cache    = true
    context     = ".."
    dockerfile  = "container/Dockerfile"
    tags        = ["${IMAGE}:2.0.0-dev", "${IMAGE}:dev"]
    args        = { "DENO_VERSION" = DENO_VERSION }
    labels      = LABELS
    annotations = [for k, v in LABELS: "index:${k}=${v}"]
}

target "multi_arch" {
    description = "Build a SecretBin container for ARM and x64."
    inherits    = ["default"]
    platforms   = ["linux/arm64", "linux/amd64"]
}