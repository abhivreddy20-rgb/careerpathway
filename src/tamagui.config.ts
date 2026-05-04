import { config as defaultConfig } from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'

export const config = createTamagui(defaultConfig)

export default config

export type Conf = typeof config

declare module 'tamagui' {
  // Tamagui requires interface-based declaration merging, so the
  // empty-interface lint is intentional here.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends Conf {}
}
