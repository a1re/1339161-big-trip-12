import AbstractView from "./abstract-view.js";

export default class UpdatableView extends AbstractView {
  /**
   * Конструктор асбтрактного класса обновляемого отбражения для форм
   * добавления и редактирования точки.
   */
  constructor() {
    super();
  }

  /**
   * Перерисовка шаблона.
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

  /**
   * Интерфейс обновления данных (абстрактный метод, его необходимо
   * переопределить в дочернем классе).
   */
  updateData() {
    throw new Error(`Abstract method not implemented: updateData`);
  }

  /**
   * Интерфейс установки обработчиков (абстрактный метод, его необходимо
   * переопределить в дочернем классе).
   */
  setHandlers() {
    throw new Error(`Abstract method not implemented: setHandlers`);
  }
}
