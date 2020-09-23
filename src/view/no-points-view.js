import AbstractView from "./abstract-view.js";

export default class NoPointsView extends AbstractView {
  /**
   * Геттер шаблона заглушки маршрута без точек..
   *
   * @return {String} - Шаблон в виде строки с HTML-кодом.
   */
  get template() {
    return `<p class="trip-events__msg">Click New Event to create your first point</p>`;
  }
}
