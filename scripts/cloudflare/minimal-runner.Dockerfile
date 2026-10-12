# Deliberately excludes Chromium/ATK/NSS and all other browser dependencies.
FROM node:22-bookworm-slim AS node
FROM ubuntu:24.04
COPY --from=node /usr/local/ /usr/local/
RUN apt-get update && apt-get install --yes --no-install-recommends ca-certificates python3-venv libstdc++6 && rm -rf /var/lib/apt/lists/*
ARG RELEASE_UID=1001
RUN useradd --create-home --uid ${RELEASE_UID} release
USER release
WORKDIR /work
ENTRYPOINT ["bash", "scripts/cloudflare/verify-minimal.sh"]
