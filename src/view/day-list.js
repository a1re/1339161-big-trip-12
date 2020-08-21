import AbstractView from "./abstract.js";

export default class DayList extends AbstractView {
  get template() {
    return `<ul class="trip-days"></div>`;
  }
}
