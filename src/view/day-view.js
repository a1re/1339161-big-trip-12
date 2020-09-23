import AbstractView from "./abstract-view.js";

export default class DayView extends AbstractView {
  /**
   * Конструктор отображения дня для вывода списка точек.
   *
   * @param  {Number} options.dayNumber - Порядковый номер дня маршрута.
   * @param  {String} options.dayDate   - Дата маршрута в формате YYYY-MM-DD.
   */
  constructor({dayNumber = null, dayDate = null}) {
    super();
    this._number = dayNumber;
    this._date = dayDate;
    this._pointsContainer = null;
  }

  /**
   * Геттер шаблона контейнера для точек с опциональным выводом номера дня..
   *
   * @return {String} - Шаблон в виде строки с HTML-кодом.
   */
  get template() {
    let template = `<li class="trip-days__item day"><div class="day__info">`;
    if (this._date) {
      const dayTitle = new Date(this._date).toLocaleString(`en-US`, {day: `numeric`, month: `short`});
      template += `<span class="day__counter">${(Number(this._number) > 0) ? this._number : ``}</span>
                   <time class="day__date" datetime="${this._date}">${dayTitle}</time>`;
    }
    template += `</div><ul class="trip-events__list"></ul></li>`;

    return template;
  }

  /**
   * Геттер элемента контейнера для точек.
   *
   * @return {Node} - Элемент из DOM.
   */
  get pointsContainer() {
    if (!this._pointsContainer) {
      this._pointsContainer = this.element.querySelector(`.trip-events__list`);
    }

    return this._pointsContainer;
  }
}
