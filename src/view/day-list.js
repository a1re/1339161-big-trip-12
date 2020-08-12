import {createElement} from "../utils.js";

export default class DayList {
  constructor() {
    this._element = null;
  }

  get template() {
    return `<ul class="trip-days"></div>`;
  }

  get element() {
    if (!this._element) {
      this._element = createElement(this.template);
    }

    return this._element;
  }

  removeElement() {
    this._element = null;
  }
}
