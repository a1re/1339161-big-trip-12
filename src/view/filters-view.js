import AbstractView from "./abstract-view.js";

export default class FiltersView extends AbstractView {
  /**
   * Конструктор отображения списка фильтров.
   *
   * @param  {Array} filterList - Список фильтров для вывода.
   */
  constructor(filterList) {
    super();

    this._filterHandler = this._filterHandler.bind(this);
    this._filterList = filterList;
  }

  /**
   * Геттер шаблона списка фильтров.
   *
   * @return {String} - Шаблон в виде строки с HTML-кодом.
   */
  get template() {
    let template = `<form class="trip-filters" action="#" method="get">`;

    this._filterList.forEach((filter) => {
      let state = ``;
      if (filter.isAvalible && filter.isActive) {
        state = `checked`;
      }
      if (!filter.isAvalible) {
        state = `disabled`;
      }
      template += `<div class="trip-filters__filter">
                <input
                  id="${filter.id}"
                  class="trip-filters__filter-input  visually-hidden"
                  type="radio" name="trip-filter"
                  value="${filter.id}" ${state}>
                <label
                  class="trip-filters__filter-label ${!filter.isAvalible ? `trip-filters__filter-label--disabled` : ``}"
                  for="${filter.id}">${filter.title}</label>
              </div>`;
    });

    template += `<button class="visually-hidden" type="submit">Accept filter</button>
            </form>`;

    return template;
  }
  /**
   * Сеттер обработчика клика на фильтр.
   *
   * @param  {Function} callback - Коллбек по нажатию на фильтр.
   */
  set filterPointsHandler(callback) {
    this._callback.filterEvents = callback;
    const filterLabels = this.element.querySelectorAll(`.trip-filters__filter-label`);
    filterLabels.forEach((label) => {
      label.addEventListener(`click`, this._filterHandler);
    });
  }

  /**
   * Обработчик нажатия на фильтр.
   *
   * @param  {Event} evt - Объект события в DOM.
   */
  _filterHandler(evt) {
    this._callback.filterEvents(evt.target.getAttribute(`for`));
  }
}
