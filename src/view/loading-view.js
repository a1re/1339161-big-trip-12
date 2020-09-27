import AbstractView from "./abstract-view.js";

export default class LoadingView extends AbstractView {
  /**
   * Геттер шаблона прелоадера.
   *
   * @return {String} - Шаблон в виде строки с HTML-кодом.
   */
  get template() {
    return `<p class="trip-events__msg">Loading...</p>`;
  }
}
