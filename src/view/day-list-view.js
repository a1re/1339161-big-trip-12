import {AbstractView} from "./abstract-view.js";

export class DayListView extends AbstractView {
  get template() {
    return `<ul class="trip-days"></div>`;
  }
}
