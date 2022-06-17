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

  static get system() { return game.system.id; }
  static get SYSTEM() { return game.system.id.toUpperCase(); }
  static get CONFIG() { return CONFIG[this.SYSTEM]; }
  static get spell() {
    if (this.system === "sw5e") return 'power';
    return 'spell';
  }
  static get Spell() {
    if (this.system === "sw5e") return 'Power';
    return 'Spell';
  }
  static spellAttr(attr) { return `${this.spell}${attr}`; }
  static SPELLCONFIG(attr) { return this.CONFIG[this.spellAttr(attr)]; }
}

Hooks.on("ready", async () => {
  console.log(`${SpellCompendium5e.MODULE_NAME} | Initializing ${SpellCompendium5e.MODULE_TITLE}`);

  SpellCompendium5eCompendium.init();
});

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(SpellCompendium5e.MODULE_NAME);
});

