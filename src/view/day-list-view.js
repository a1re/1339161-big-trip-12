import AbstractView from "./abstract-view.js";

export default class DayListView extends AbstractView {
  get template() {
    return `<ul class="trip-days"></div>`;
  }
}
