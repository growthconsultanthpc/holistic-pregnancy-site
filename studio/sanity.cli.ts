import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'ef4m6d01',
    dataset: 'production'
  },
  deployment: {
    appId: 'oas7c0l74o9vnon0ensccz0n', // hosted Studio (sanity deploy), so deploys do not ask again
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
})
