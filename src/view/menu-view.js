import AbstractView from "./abstract-view.js";

export default class MenuView extends AbstractView {
  /**
   * Конструктор отображения меню.
   */
  constructor() {
    super();

    this._tableMenuItem = null;
    this._statsMenuItem = null;

    this._displayTableHandler = this._displayTableHandler.bind(this);
    this._displayStatsHandler = this._displayStatsHandler.bind(this);
  }

  /**
   * Геттер шаблона меню
   *
   * @return {String} - Шаблон в виде строки с HTML-кодом.
   */
  get template() {
    return `<nav class="trip-controls__trip-tabs  trip-tabs">
              <h2 class="visually-hidden">Switch trip view</h2>
              <a class="trip-tabs__btn trip-tabs__btn--active" href="#">Table</a>
              <a class="trip-tabs__btn" href="#">Stats</a>
            </nav>`;
  }

  /**
   * Сеттер коллбека клика на ссылку Table в меню.
   *
   * @param  {Function} callback - Вызываемая функция
   */
  set displayTable(callback) {
    this._callback.displayTable = callback;
    this._tableMenuItem = this.element.querySelector(`.trip-tabs__btn`);
    this._tableMenuItem.addEventListener(`click`, this._displayTableHandler);
  }

  /**
   * Сеттер коллбека клика на ссылку Stats в меню.
   *
   * @param  {Function} callback - Вызываемая функция
   */
  set displayStats(callback) {
    this._callback.displayStats = callback;
    this._statsMenuItem = this.element.querySelector(`.trip-tabs__btn:last-child`);
    this._statsMenuItem.addEventListener(`click`, this._displayStatsHandler);
  }

  /**
   * Обработчик клике на ссылку Table в меню.
   *
   * @param  {Event} evt - Объект события в DOM.
   */
  _displayTableHandler(evt) {
    evt.preventDefault();

    if (this._tableMenuItem.classList.contains(`trip-tabs__btn--active`)) {
      return;
    }

    this._statsMenuItem.classList.remove(`trip-tabs__btn--active`);
    this._tableMenuItem.classList.add(`trip-tabs__btn--active`);
    this._callback.displayTable();
  }

  /**
   * Обработчик клике на ссылку Stats в меню.
   *
   * @param  {Event} evt - Объект события в DOM.
   */
  _displayStatsHandler(evt) {
    evt.preventDefault();

    if (this._statsMenuItem.classList.contains(`trip-tabs__btn--active`)) {
      return;
    }

    this._tableMenuItem.classList.remove(`trip-tabs__btn--active`);
    this._statsMenuItem.classList.add(`trip-tabs__btn--active`);
    this._callback.displayStats();
  }
}
