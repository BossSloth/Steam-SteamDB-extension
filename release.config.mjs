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
        prepareCmd: './helpers/prepare.sh ${nextRelease.version}',
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'plugin.json', 'metadata.json'],
        message: 'chore: bump version to ${nextRelease.version}\n\n${nextRelease.notes}',
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
