import {createElement} from "../utils.js";

export default class Menu {
  constructor() {
    this._element = null;
  }

  get template() {
    return `<nav class="trip-controls__trip-tabs  trip-tabs">
              <h2 class="visually-hidden">Switch trip view</h2>
              <a class="trip-tabs__btn  trip-tabs__btn--active" href="#">Table</a>
              <a class="trip-tabs__btn" href="#">Stats</a>
            </nav>`;
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
