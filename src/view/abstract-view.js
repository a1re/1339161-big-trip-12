import {createElement} from "../utils/render.js";

export default class AbstractView {
  constructor() {
    if (new.target === AbstractView) {
      throw new Error(`Can't instantiate AbstractView, only concrete one.`);
    }

    this._element = null;
    this._callback = {};
  }

  get template() {
    throw new Error(`AbstractView method not implemented: get template.`);
  }

  get element() {
    if (!this._element) {
      this._element = createElement(this.template);
    }

    return this._element;
  }

  unset() {
    this._element = null;
  }

  remove() {
    if (!this._element) {
      return;
    }

    this._element.remove();
    this.unset();
  }
}
