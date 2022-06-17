//@ts-check
import { SpellCompendium5e } from "../spell-compendium-5e.js";

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
      SpellCompendium5e.SPELLCONFIG("Levels")[this.data.level],
      SpellCompendium5e.SPELLCONFIG("Schools")[this.data.school]
    ]

    if (this.data.level === 0) {
      levelLabelParts.reverse();
    }

    return levelLabelParts.filterJoin(' ');
  }

  /** Components */
  get componentsLabel() {
    if (SpellCompendium5e.SPELLCONFIG("Tags")) {
      const attributes = {
        ...SpellCompendium5e.SPELLCONFIG("Components"),
        ...Object.fromEntries(Object.entries(SpellCompendium5e.SPELLCONFIG("Tags")).map(([k, v]) => {
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
      this.data.materials.cost ? `${SpellCompendium5e.CONFIG.currencies.gp?.abbreviation}` : null,
      this.data.materials.consumed ? 
        (this.data.materials.cost ? '*' : game.i18n.localize(`${SpellCompendium5e.SYSTEM}.Consumed`))
        : null
    ].filterJoin('')
  }

  /** Casting Time */
  get activationTimeLabel() {
    return [
      ['action', 'bonus', 'reaction', 'special'].includes(this.data.activation.type) ? null : this.data.activation.cost,
      SpellCompendium5e.CONFIG.abilityActivationTypes[this.data.activation.type]
    ].filterJoin(" ")
  }

  /** Duration */
  get durationLabel() {
    return [
      ["inst", "perm"].includes(this.data.duration.units) ? null : this.data.duration.value,
      SpellCompendium5e.CONFIG.timePeriods[this.data.duration.units]
    ].filterJoin(" ");
  }

  /** Range */
  get rangeLabel() {
    return [
      this.data.range.value,
      this.data.range.long ? `/ ${this.data.range.long}` : null,
      SpellCompendium5e.CONFIG.distanceUnits[this.data.range.units]
    ].filterJoin(" ");
  }

  /** Target */
  get targetLabel() {
    return [
      (["none", "touch", "self"].includes(this.data.target.units) || ["none", "self"].includes(this.data.target.type)) ? null : this.data.target.value,
      ["none", "self"].includes(this.data.target.type) ? null : SpellCompendium5e.CONFIG.distanceUnits[this.data.target.units],
      SpellCompendium5e.CONFIG.targetTypes[this.data.target.type]
    ].filterJoin(" ");
  }

  /** Action Type (or Saving Throw) */
  get actionTypeLabel() {
    if (this.data.actionType === 'save') {
      return [
        SpellCompendium5e.CONFIG.abilityAbbreviations[this.data.save.ability]?.toUpperCase(),
        game.i18n.localize(`${SpellCompendium5e.SYSTEM}.ActionSave`)
      ].filterJoin(' ');
    }

    return [
      SpellCompendium5e.CONFIG.itemActionTypes[this.data.actionType],
    ].filterJoin(" ");
  }

  /** Damage Type */
  get damageTypeLabel() {
    return [...new Set(
      this.data.damage.parts.map(
        ([formula, type]) => SpellCompendium5e.CONFIG.damageTypes[type]
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
          <small title="${this.data.materials.consumed ? game.i18n.localize(`${SpellCompendium5e.SYSTEM}.Consumed`) : ''}">${componentsSpecialLabel}</small>
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

