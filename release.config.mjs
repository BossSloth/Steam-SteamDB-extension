/* eslint-disable no-template-curly-in-string */
/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  repositoryUrl: 'https://github.com/BossSloth/Steam-SteamDB-extension',
  tagFormat: 'v${version}',
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    [
      '@semantic-release/exec',
      {
        prepareCmd: 'RELEASE_VERSION=${nextRelease.version} bun run helpers/update-version.ts && helpers/generate-metadata.sh && python helpers/build_zip.py',
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'plugin.json'],
        message: 'chore: bump version to ${nextRelease.version}',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: ['build/*.zip'],
      },
    ],
  ],
};
