#!/bin/bash
export RELEASE_VERSION=${nextRelease.version}

bun run helpers/update-version.ts
helpers/generate-metadata.sh
python helpers/build_zip.py