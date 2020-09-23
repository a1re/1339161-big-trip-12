import {createElement} from "../utils/render.js";

export default class AbstractView {
  /**
   * Конструктор абстрактного класса для отображений.
   */
  constructor() {
    if (new.target === AbstractView) {
      throw new Error(`Can't instantiate AbstractView, only concrete one.`);
    }

    this._element = null;
    this._callback = {};
  }

  /**
   * Абстрактный геттер шаблона (нужно переопределить в дочернем классе).
   */
  get template() {
    throw new Error(`AbstractView method not implemented: get template.`);
  }

  /**
   * Геттер элемента.
   *
   * @return {Node} - Элемент для вставки в DOM.
   */
  get element() {
    if (!this._element) {
      this._element = createElement(this.template);
    }

    return this._element;
  }

  /**
   * Обнуление элемента.
   */
  unset() {
    this._element = null;
  }

  /**
   * Удаление элемента.
   */
  remove() {
    if (!this._element) {
      return;
    }

    this._element.remove();
    this.unset();
  }
}
