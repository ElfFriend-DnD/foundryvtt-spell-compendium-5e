import { SpellCompendium5eCompendium } from './classes/compendium.js';

export class SpellCompendium5e {
  static MODULE_NAME = "spell-compendium-5e";
  static MODULE_TITLE = "Spell Compendium DnD5e";

  static TEMPLATES = {
    filters: `modules/${this.MODULE_NAME}/templates/spell-compendium-filters.hbs`,
    header: `modules/${this.MODULE_NAME}/templates/spell-compendium-header.hbs`,
  }

  static log(...args) {
    if (game.modules.get('_dev-mode')?.api?.getPackageDebugValue(this.MODULE_NAME)) {
      console.log(this.MODULE_TITLE, '|', ...args);
    }
  }
}

Hooks.on("ready", async () => {
  console.log(`${SpellCompendium5e.MODULE_NAME} | Initializing ${SpellCompendium5e.MODULE_TITLE}`);

  SpellCompendium5eCompendium.init();
});

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(SpellCompendium5e.MODULE_NAME);
});

