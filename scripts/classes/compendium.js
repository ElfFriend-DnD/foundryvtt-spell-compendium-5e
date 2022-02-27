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
  listHeadingElement = document.createRange().createContextualFragment(`
    <div class="list-heading flexrow">
      <div class="document-img"><i class="fas fa-image"></i></div>
      <div class="document-name">
        <strong>${game.i18n.localize('DND5E.ItemName')}</strong>
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
        <div>${game.i18n.localize('DND5E.Effects')}</div>
        <small>${game.i18n.localize('DND5E.Damage')} & ${game.i18n.localize('DOCUMENT.ActiveEffects')}</small>
      </div>
    </div>
  `);

  get compendiumHasFolders() {
    return this.collection.index.some(({ name }) => name === '#[CF_tempEntity]');
  }

  get listElement() {
    return this.html.querySelector('.directory-list');
  }

  get listItemElements() {
    return this.html.querySelectorAll('.directory-list .directory-item');
  }


  /**
   * A cached property for obtaining the new index with all our required fields
   */
  get newIndex() {
    return this._newIndex;
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
   * Appends spell details to the List Item element provided.
   * @param {*} listItem
   * @param {*} indexEntry
   */
  addContentToListItem(listItem, indexData) {
    const {
      levelLabel,
      componentsLabel,
      componentsSpecialLabel,
      actionTypeLabel,
      activationTimeLabel,
      effectTypeLabel,
      durationLabel,
      rangeLabel,
      targetLabel
    } = new SpellCompendium5eCompendiumItem(indexData);

    // Add Level and School to document-name
    const levelContent = document.createTextNode(levelLabel);
    const levelNode = document.createElement('small')
    levelNode.appendChild(levelContent);
    listItem.querySelector('.document-name').append(levelNode);

    const node = document.createRange().createContextualFragment(`
        <div class="components">
          <div>${componentsLabel}</div>
          <small title="${indexData.data.materials.consumed ? game.i18n.localize('DND5E.Consumed') : ''}">${componentsSpecialLabel}</small>
        </div>
        <div class="activation">
          <div>${activationTimeLabel}</div>
          <small>${durationLabel}</small>
        </div>
        <div  class="range">
          <div>${rangeLabel}</div>
          <small title="${targetLabel}">${targetLabel}</small>
        </div>
        <div class="effect">
          <div>${actionTypeLabel}</div>
          <small title="${effectTypeLabel}">${effectTypeLabel}</small>
        </div>
    `)

    listItem.append(node);
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
   * The main entry point for this process.
   * Handles any changes to the compendium display
   */
  async handleRender() {
    if (this.newIndex === null) {
      await this._getNewIndex();
    }

    // add our class to the outer element if it is not already there
    if (!this.rootElement.classList.contains('spell-compendium-5e')) {
      this.rootElement.classList.add('spell-compendium-5e');
    }

    this.handleSort();

    this.listItemElements.forEach((listItemElement) => {
      const itemId = listItemElement.dataset.documentId;
      const relevantIndexEntry = this.newIndex.get(itemId);

      if (relevantIndexEntry.type !== 'spell') {
        return;
      }

      this.addContentToListItem(listItemElement, relevantIndexEntry);
    });

    this.html.querySelector('.directory-header')?.after(this.listHeadingElement);
  }

  static init() {
    Hooks.on('renderCompendium', async (app, [html], appData) => {
      if (app.collection.metadata.type !== 'Item') {
        return;
      }

      const indexWithoutFolders = app.collection.index.filter(({ name }) => name !== '#[CF_tempEntity]');

      const hasNotSpell = !indexWithoutFolders.length ||
        indexWithoutFolders.some(({ type }) => type !== 'spell');

      // abort if this is not a compendium with only spells
      if (hasNotSpell) {
        return;
      }

      await new this(app, html).handleRender();

      app.setPosition();
    });
  }
}
