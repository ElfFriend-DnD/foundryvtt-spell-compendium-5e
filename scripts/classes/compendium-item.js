//@ts-check
/**
 * Class which replicates a lot of the item label logic native to 5e
 */
export class SpellCompendium5eCompendiumItem {
  constructor(listItemElement, {data, effects}) {
    this.listItemElement = listItemElement;
    this.data = data;
    this.effects = effects;
  }

  /** Spell Level and School */
  get levelLabel() {
    const levelLabelParts = [
      CONFIG.DND5E.spellLevels[this.data.level],
      CONFIG.DND5E.spellSchools[this.data.school]
    ]

    if (this.data.level === 0) {
      levelLabelParts.reverse();
    }

    return levelLabelParts.filterJoin(' ');
  }

  /** Components */
  get componentsLabel() {
    if (CONFIG.DND5E.spellTags) {
      const attributes = {
        ...CONFIG.DND5E.spellComponents,
        ...Object.fromEntries(Object.entries(CONFIG.DND5E.spellTags).map(([k, v]) => {
          v.tag = true;
          return [k, v];
        }))
      };

      const componentsArray = Object.entries(this.data.components).map(([component, active]) => {
        const config = attributes[component];
        if (!config || (active !== true)) return;
        return config.abbr;
      }).filter(val => !!val);

      return new Intl.ListFormat(game.i18n.lang, { style: "narrow", type: "conjunction" }).format(componentsArray);
    }

    return Object.entries(this.data.components).reduce((arr, c) => {
      if (c[1] !== true) return arr;
      arr.push(c[0].titleCase().slice(0, 1));
      return arr;
    }, []);
  }

  /** Components  */
  get componentsSpecialLabel() {
    return [
      this.data.materials.cost ? `${this.data.materials.cost}` : null,
      this.data.materials.cost ? `${CONFIG.DND5E.currencies.gp?.abbreviation}` : null,
      this.data.materials.consumed ? 
        (this.data.materials.cost ? '*' : game.i18n.localize('DND5E.Consumed'))
        : null
    ].filterJoin('')
  }

  /** Casting Time */
  get activationTimeLabel() {
    return [
      ['action', 'bonus', 'reaction', 'special'].includes(this.data.activation.type) ? null : this.data.activation.cost,
      CONFIG.DND5E.abilityActivationTypes[this.data.activation.type]
    ].filterJoin(" ")
  }

  /** Duration */
  get durationLabel() {
    return [
      ["inst", "perm"].includes(this.data.duration.units) ? null : this.data.duration.value,
      CONFIG.DND5E.timePeriods[this.data.duration.units]
    ].filterJoin(" ");
  }

  /** Range */
  get rangeLabel() {
    return [
      this.data.range.value,
      this.data.range.long ? `/ ${this.data.range.long}` : null,
      CONFIG.DND5E.distanceUnits[this.data.range.units]
    ].filterJoin(" ");
  }

  /** Target */
  get targetLabel() {
    return [
      (["none", "touch", "self"].includes(this.data.target.units) || ["none", "self"].includes(this.data.target.type)) ? null : this.data.target.value,
      ["none", "self"].includes(this.data.target.type) ? null : CONFIG.DND5E.distanceUnits[this.data.target.units],
      CONFIG.DND5E.targetTypes[this.data.target.type]
    ].filterJoin(" ");
  }

  /** Action Type (or Saving Throw) */
  get actionTypeLabel() {
    if (this.data.actionType === 'save') {
      return [
        CONFIG.DND5E.abilityAbbreviations[this.data.save.ability]?.toUpperCase(),
        game.i18n.localize('DND5E.ActionSave')
      ].filterJoin(' ');
    }

    return [
      CONFIG.DND5E.itemActionTypes[this.data.actionType],
    ].filterJoin(" ");
  }

  /** Damage Type */
  get damageTypeLabel() {
    return [...new Set(
      this.data.damage.parts.map(
        ([formula, type]) => CONFIG.DND5E.damageTypes[type]
      )
    ).values()].join(", ");
  }

  /** Damage Type + Active Effects */
  get effectTypeLabel() {
    const effectLabel = this.effects.length ? game.i18n.localize('DOCUMENT.ActiveEffects') : null;

    return [this.damageTypeLabel, effectLabel].filterJoin(", ");
  }

  /**
   * Appends spell details to this list item
   */
   addContentToListItem() {
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
    } = this;

    // Add Level and School to document-name
    const levelContent = document.createTextNode(levelLabel);
    const levelNode = document.createElement('small')
    levelNode.appendChild(levelContent);
    this.listItemElement.querySelector('.document-name').append(levelNode);

    const node = document.createRange().createContextualFragment(`
        <div class="components">
          <div>${componentsLabel}</div>
          <small title="${this.data.materials.consumed ? game.i18n.localize('DND5E.Consumed') : ''}">${componentsSpecialLabel}</small>
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

    this.listItemElement.append(node);
  }
  
}

