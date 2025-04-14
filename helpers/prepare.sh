#!/bin/bash
export RELEASE_VERSION="$1"

bun run helpers/update-version.ts
helpers/generate-metadata.sh
python helpers/build_zip.py