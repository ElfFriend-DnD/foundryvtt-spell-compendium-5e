//@ts-check
import { SpellCompendium5e } from "../spell-compendium-5e.js";
import { SpellCompendium5eCompendiumItem } from "./compendium-item.js";

/**
 * Class which replicates a lot of the item label logic native to 5e
 */
export class SpellCompendium5eCompendium {

  constructor(app, html) {
    app.options.width = null;

    this.collection = app.collection;
    this.html = html;
    this.rootElement = app.element[0];
  }

  _newIndex = null;

  NEW_INDEX_FIELDS = [
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
    'effects',
  ];

  /**
   * A static element placed at the heading of the list
   */
  _listHeadingElement = null;


  get compendiumHasFolders() {
    return this.collection.index.some(({ name }) => name === '#[CF_tempEntity]');
  }

  get listElement() {
    return this.html.querySelector('.directory-list');
  }

  get listItemElements() {
    return this.html.querySelectorAll('.directory-list .directory-item');
  }

  get filterFormElement() {
    return this.html.querySelector('.filters');
  }

  /**
   * A cached property for obtaining the new index with all our required fields
   */
  get newIndex() {
    return this._newIndex;
  }

  /**
   * A cached property for obtaining the new index with all our required fields
   */
  get listHeadingElement() {
    return this._listHeadingElement;
  }

  get spellActivationTypes() {
    return Object.fromEntries(
      Object.entries(SpellCompendium5e.CONFIG.abilityActivationTypes).filter(
        ([abbrev, label]) => ['bonus', 'action', 'reaction', 'minute', 'hour', 'day'].includes(abbrev)
      )
    );
  }

  get spellComponentTypes() {
    return {
      vocal: game.i18n.localize(`${SpellCompendium5e.SYSTEM}.ComponentVerbal`),
      somatic: game.i18n.localize(`${SpellCompendium5e.SYSTEM}.ComponentSomatic`),
      material: game.i18n.localize(`${SpellCompendium5e.SYSTEM}.ComponentMaterial`),
    }
    // Object.values(SpellCompendium5e.SPELLCONFIG("Components")]).reduce((acc, label) => {
    //   acc[label.toLowerCase()] = label;
    //   return acc;
    // }, {});
  }

  get spellTagTypes() {
    const tags = {
      ritual: game.i18n.localize(`${SpellCompendium5e.SYSTEM}.Ritual`),
      concentration: game.i18n.localize(`${SpellCompendium5e.SYSTEM}.Concentration`)
    }

    return tags;
  }


  get defaultInputsValues() {
    SpellCompendium5e.log('this.spellActivationTypes', this.spellActivationTypes)

    return {
      level: Object.keys(SpellCompendium5e.SPELLCONFIG("Levels")).reduce((acc, key) => { acc[key] = true; return acc }, {}),
      school: Object.keys(SpellCompendium5e.SPELLCONFIG("Schools")).reduce((acc, key) => { acc[key] = true; return acc }, {}),
      activation: {
        type: Object.keys(this.spellActivationTypes).reduce((acc, key) => { acc[key] = true; return acc }, {}),
      }
    }
  }

  /**
   * Get the new index with all our required fields
   */
  async _getNewIndex() {
    if (this._newIndex) {
      return this._newIndex;
    }

    const newIndex = await this.collection.getIndex({
      fields: this.NEW_INDEX_FIELDS
    });

    return this._newIndex = newIndex;
  }

  /**
   * Get the list heading element from our template
   */
  async _getListHeadingElement() {
    const config = {
      localize: {
        itemName: `${SpellCompendium5e.SYSTEM}.ItemName`,
        spellLevel: `${SpellCompendium5e.SYSTEM}.${SpellCompendium5e.Spell}Level`,
        spellSchool: `${SpellCompendium5e.SYSTEM}.${SpellCompendium5e.Spell}School`,
        spellComponents: `${SpellCompendium5e.SYSTEM}.${SpellCompendium5e.Spell}Components`,
        itemActivationCost: `${SpellCompendium5e.SYSTEM}.ItemActivationCost`,
        duration: `${SpellCompendium5e.SYSTEM}.Duration`,
        range: `${SpellCompendium5e.SYSTEM}.Range`,
        target: `${SpellCompendium5e.SYSTEM}.Target`,
        effects: `${SpellCompendium5e.SYSTEM}.Effects`,
        damage: `${SpellCompendium5e.SYSTEM}.Damage`,
      },
    }
    const element = await renderTemplate(SpellCompendium5e.TEMPLATES.header, {config});
    return this._listHeadingElement = document.createRange().createContextualFragment(element);
  }

  /**
   * Sort the List Item elements based on Spell Level
   * Only runs if there are no folders in the compendium
   */
  handleSort() {
    // Only sort if the compendium does not have folders.
    if (this.compendiumHasFolders) {
      return;
    }

    [...this.listItemElements].sort((a, b) => {
      const relevantIndexEntryA = this.newIndex.get(a.dataset.documentId);
      const relevantIndexEntryB = this.newIndex.get(b.dataset.documentId);

      return relevantIndexEntryA.data.level - relevantIndexEntryB.data.level;
    }).forEach((item, index) => {
      this.listElement.appendChild(item);
    });
  }

  /**
   * Converts an object of objects who end up in `key: bool` to instead be objects with arrays of only true values at the end
   */
  _recursiveConvertToArrays(object) {
    return Object.fromEntries(
      Object.entries(object).map(([key, value]) => {
        let newVal;
        if (Object.values(value).some(subValue => typeof subValue !== 'boolean')) {
          newVal = this._recursiveConvertToArrays(value);
        } else {
          newVal = Object.keys(value).filter((key) => value[key]);
        }
        return [key, newVal]
      })
    )
  }

  getFilterValues(filterForm) {
    const formData = new FormDataExtended(filterForm).toObject();

    const formDataExpanded = foundry.utils.expandObject(formData);

    const selectedKeys = this._recursiveConvertToArrays(formDataExpanded);

    return selectedKeys;
  }

  /**
   * Filter the List Item elements based on active filter selections
   */
  handleFilter() {
    if (!this.filterFormElement) {
      SpellCompendium5e.log('No form element');
      return;
    }

    const values = this.getFilterValues(this.filterFormElement);

    const flatValues = foundry.utils.flattenObject(values);

    if (Object.values(flatValues).some((val) => val.length)) {
      this.html.querySelector('input[name="search"]').disabled = true;
    } else {
      this.html.querySelector('input[name="search"]').disabled = false;
    }

    SpellCompendium5e.log('Form Values', values);

    this.listItemElements.forEach((listItemElement) => {
      const itemId = listItemElement.dataset.documentId;
      const relevantIndexEntry = this.newIndex.get(itemId);

      if (relevantIndexEntry.type !== SpellCompendium5e.spell) {
        return;
      }

      const { data } = relevantIndexEntry;


      const firstFailedTest = Object.entries(flatValues).find(
        // Return True to filter this item out
        ([path, includedValues]) => {

          const relevantValue = foundry.utils.getProperty(data, path);

          if (relevantValue === undefined) {
            return true;
          }

          switch(path) {
            case 'components': {
              if (!includedValues.length) {
                return false;
              }
              // relevantValue[componentType] is expected to be a boolean
              return includedValues.some((componentType) => !relevantValue[componentType]);
            }

            case 'damage.parts': {
              if (!includedValues.length) {
                return false;
              }

              return !includedValues.some((damageType) => relevantValue.some(([formula, type]) => type === damageType));
            }

            default: {
              if (!includedValues.length) {
                return false;
              }

              // sometimes level is a string...
              return !includedValues.includes(
                String(relevantValue)
              )
            }
          }

        }
      )

      SpellCompendium5e.log(!!firstFailedTest ? 'excluded' : 'included', relevantIndexEntry.name, {
        firstFailedTest,
        data,
        values,
      })

      if (!!firstFailedTest) {
        listItemElement.style.display = 'none';
      } else {
        listItemElement.style.display = 'flex';
      }

    });
  }

  /**
   * Renders a bunch of filters at the top of the display.
   */
  async renderFilters() {
    const config = {
      ...SpellCompendium5e.CONFIG,
      spellActivationTypes: this.spellActivationTypes,
      spellComponentTypes: this.spellComponentTypes,
      spellTagTypes: this.spellTagTypes,
      spellLevels: SpellCompendium5e.SPELLCONFIG("Levels"),
      spellSchools: SpellCompendium5e.SPELLCONFIG("Schools"),
      localize: {
        spellLevel: `${SpellCompendium5e.SYSTEM}.${SpellCompendium5e.Spell}Level`,
        spellSchool: `${SpellCompendium5e.SYSTEM}.${SpellCompendium5e.Spell}School`,
        itemActivationCost: `${SpellCompendium5e.SYSTEM}.ItemActivationCost`,
        spellComponents: `${SpellCompendium5e.SYSTEM}.${SpellCompendium5e.Spell}Components`,
        spellTags: `${SpellCompendium5e.Spell} Tags`,
        damage: `${SpellCompendium5e.SYSTEM}.Damage`,
        itemName: `${SpellCompendium5e.SYSTEM}.ItemName`,
        duration: `${SpellCompendium5e.SYSTEM}.Duration`,
      },
    }

    const element = await renderTemplate(SpellCompendium5e.TEMPLATES.filters, {
      config,
      inputs: {},
    });

    const node = document.createRange().createContextualFragment(element);

    const directoryHeader = this.html.querySelector('.directory-header');


    directoryHeader?.classList?.remove('flexrow');
    directoryHeader?.classList?.add('flexcol');
    directoryHeader?.appendChild(node);
  }

  /**
   * The main entry point for this process.
   * Handles any changes to the compendium display
   */
  async handleRender() {
    if (this.newIndex === null) {
      await this._getNewIndex();
    }

    if (this.listHeadingElement === null) {
      await this._getListHeadingElement();
    }

    // add our class to the outer element if it is not already there
    if (!this.rootElement.classList.contains('spell-compendium-5e')) {
      this.rootElement.classList.add('spell-compendium-5e');
    }

    await this.renderFilters();

    this.handleFilter();

    this.handleSort();

    this.listItemElements.forEach((listItemElement) => {
      const itemId = listItemElement.dataset.documentId;
      const relevantIndexEntry = this.newIndex.get(itemId);

      if (relevantIndexEntry.type !== SpellCompendium5e.spell) {
        return;
      }

      new SpellCompendium5eCompendiumItem(listItemElement, relevantIndexEntry).addContentToListItem();
    });

    this.html.querySelector('.directory-header')?.after(this.listHeadingElement);

    this.activateFilterListeners();
  }

  activateFilterListeners() {
    $(this.filterFormElement).on('input', 'input', (event) => {
      SpellCompendium5e.log('filter changed', event.currentTarget);
      event.stopPropagation();

      this.handleFilter();
    });
  }

  static init() {
    Hooks.on('renderCompendium', async (app, [html], appData) => {
      if (app.collection.metadata.type !== 'Item') {
        return;
      }

      const indexWithoutFolders = app.collection.index.filter(({ name }) => name !== '#[CF_tempEntity]');

      const hasNotSpell = !indexWithoutFolders.length ||
        indexWithoutFolders.some(({ type }) => type !== SpellCompendium5e.spell);

      // abort if this is not a compendium with only spells
      if (hasNotSpell) {
        return;
      }

      await new this(app, html).handleRender();

      app.setPosition();
    });
  }
}
