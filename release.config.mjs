/* eslint-disable no-template-curly-in-string */
/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  repositoryUrl: 'https://github.com/BossSloth/Steam-SteamDB-extension',
  tagFormat: 'v${version}',
  branches: ['master'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    [
      '@semantic-release/git',
      {
        assets: ['build/*.zip'],
      },
    ],
    [
      '@semantic-release/exec',
      {
        prepareCmd: 'helpers/generate-metadata.sh && RELEASE_VERSION=${nextRelease.version} python helpers/build_zip.py',
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
