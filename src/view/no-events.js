import AbstractView from "./abstract.js";

export default class NoEvents extends AbstractView {
  get template() {
    return `<p class="trip-events__msg">Click New Event to create your first point</p>`;
  }
}
