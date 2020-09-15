import AbstractView from "./abstract-view.js";

export default class UpdatableView extends AbstractView {
  constructor() {
    super();
  }

  /**
   * Перерисовка шаблона.
   *
   * @return {void}
   */
  updateElement() {
    let prevElement = this.element;
    const parent = prevElement.parentElement;
    this.unset();

    const newElement = this.element;
    parent.replaceChild(newElement, prevElement);
    prevElement = null;

    this.setHandlers();
  }

  updateData() {
    throw new Error(`Abstract method not implemented: updateData`);
  }

  setHandlers() {
    throw new Error(`Abstract method not implemented: setHandlers`);
  }
}
