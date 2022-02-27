export class SpellCompendium5e {
  static MODULE_NAME = "spell-compendium-5e";
  static MODULE_TITLE = "Spell Compendium DnD5e";

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

class SpellCompendium5eCompendium {
  static addContentToListItem(listItem, {data}) {
    // Level
    const levelLabel = [
      CONFIG.DND5E.spellLevels[data.level],
      CONFIG.DND5E.spellSchools[data.school]
    ];
  
    if (data.level === 0) {
      levelLabel.reverse();
    }
  
    const levelContent = document.createTextNode(levelLabel.join(' '));
    const levelNode = document.createElement('small')
    levelNode.appendChild(levelContent);
  
  
    // Components
    const attributes = {
      ...CONFIG.DND5E.spellComponents,
      ...Object.fromEntries(Object.entries(CONFIG.DND5E.spellTags).map(([k, v]) => {
        v.tag = true;
        return [k, v];
      }))
    };
  
    const componentsArray = Object.entries(data.components).map(([component, active]) => {
      const config = attributes[component];
      if ( !config || (active !== true) ) return;
      return config.abbr;
    }).filter(val => !!val);
  
    const componentsLabel = new Intl.ListFormat(game.i18n.lang, { style: "narrow", type: "conjunction" }).format(componentsArray);
  
  
    // Casting Time
  
    const activationTimeLabel = [
      ['action', 'bonus', 'reaction', 'special'].includes(data.activation.type) ? null : data.activation.cost,
      CONFIG.DND5E.abilityActivationTypes[data.activation.type]
    ].filterJoin(" ");
  
  
  
    // Duration
  
    const durationLabel = [
      ["inst", "perm"].includes(data.duration.units) ? null : data.duration.value,
      CONFIG.DND5E.timePeriods[data.duration.units]
    ].filterJoin(" ");
  
  
    // Range
  
    const rangeLabel = [
      data.range.value,
      data.range.long ? `/ ${data.range.long}` : null,
      CONFIG.DND5E.distanceUnits[data.range.units]
    ].filterJoin(" ");
  
  
  
    // Target
  
    const targetLabel = [
      (["none", "touch", "self"].includes(data.target.units) || ["none", "self"].includes(data.target.type)) ? null : data.target.value,
      ["none", "self"].includes(data.target.type) ? null : CONFIG.DND5E.distanceUnits[data.target.units],
      CONFIG.DND5E.targetTypes[data.target.type]
    ].filterJoin(" ");
  
  
    // Action Type (or Saving Throw)
  
    let actionTypeLabel = [
      CONFIG.DND5E.itemActionTypes[data.actionType],
    ].filterJoin(" ");
  
    if (data.actionType === 'save') {
      actionTypeLabel = [
        CONFIG.DND5E.abilityAbbreviations[data.save.ability]?.toUpperCase(),
        game.i18n.localize('DND5E.ActionSave')
      ].filterJoin(' ');
    }
  
    // Damage Type
  
    const damageTypeLabel = [...new Set(
        data.damage.parts.map(
          ([formula, type]) => CONFIG.DND5E.damageTypes[type]
        )
      ).values()].join(", ");
  
  
    listItem.querySelector('.document-name').append(levelNode);
  
    
    const node = document.createRange().createContextualFragment(`
        <div class="components">${componentsLabel}</div>
        <div class="activation">
          <div>${activationTimeLabel}</div>
          <small>${durationLabel}</small>
        </div>
        <div  class="range">
          <div>${rangeLabel}</div>
          <small>${targetLabel}</small>
        </div>
        <div class="effect">
          <div>${actionTypeLabel}</div>
          <small>${damageTypeLabel}</small>
        </div>
    `)
  
    listItem.append(node);
  
    // listItem.append(...[componentsNode, activationDurationNode, rangeTargetNode, actionTypeNode, damageTypeNode]);
  }

  static renderListHeading() {
    return document.createRange().createContextualFragment(`
      <div class="list-heading flexrow">
        <div class="document-img"><i class="fas fa-image"></i></div>
        <div class="document-name">
          <div>${game.i18n.localize('DND5E.ItemName')}</div>
          <small>${game.i18n.localize('DND5E.SpellLevel')} & ${game.i18n.localize('DND5E.SpellSchool')}</small>
        </div>
        <div class="components">${game.i18n.localize('DND5E.SpellComponents')}</div>
        <div class="activation">
          <div>${game.i18n.localize('DND5E.ItemActivationCost')}</div>
          <small>${game.i18n.localize('DND5E.Duration')}</small>
        </div>
        <div class="range">
          <div>${game.i18n.localize('DND5E.Range')}</div>
          <small>${game.i18n.localize('DND5E.Target')}</small>
        </div>
        <div class="effect">
          <div>Effects</div>
          <small>${game.i18n.localize('DND5E.Damage')}</small>
        </div>
      </div>
    `)
  }

  static init() {
        
    Hooks.on('renderCompendium', async (app, [html], appData) => {
      if (app.collection.metadata.type !== 'Item') {
        return;
      }

      const compendiumHasFolders = app.collection.index.some(({name}) => name === '#[CF_tempEntity]');
      
      const indexWithoutFolders = app.collection.index.filter(({name}) => name !== '#[CF_tempEntity]');

      const hasNotSpell = !app.collection.index.size ||
        indexWithoutFolders.some(({type}) => type !== 'spell');

      if (hasNotSpell) {
        return;
      }

      // add our class to the outer element if it is not already there
      if (!app.element[0].classList.contains('spell-compendium-5e')) {
        app.element[0].classList.add('spell-compendium-5e');
      }

      const newIndex = await app.collection.getIndex({
        fields: [
          'labels',
          'data.actionType',
          'data.activation.cost',
          'data.activation.type',
          'data.components',
          'data.damage',
          'data.duration',
          'data.level',
          'data.materials',
          'data.range',
          'data.save.ability',
          'data.scaling',
          'data.school',
          'data.target',
        ]
      });

      const listElement = html.querySelector('.directory-list')


      // Only sort if the compendium does not have folders.
      if (!compendiumHasFolders) {
        const listElements = html.querySelectorAll('.directory-list .directory-item');
      
        [...listElements].sort((a, b) => {
          const relevantIndexEntryA = newIndex.get(a.dataset.documentId);
          const relevantIndexEntryB = newIndex.get(b.dataset.documentId);
      
          return relevantIndexEntryA.data.level - relevantIndexEntryB.data.level;
        }).forEach((item, index) => {
          listElement.appendChild(item);
        });
      }


      html.querySelectorAll('.directory-list .directory-item').forEach((listItem) => {
        const itemId = listItem.dataset.documentId;
        const relevantIndexEntry = newIndex.get(itemId);

        if (relevantIndexEntry.type !== 'spell') {
          return;
        }

        this.addContentToListItem(listItem, relevantIndexEntry);
      });


      html.querySelector('.directory-header')?.after(this.renderListHeading());

      app.options.width = null;
      app.setPosition()
    });

  }
}
