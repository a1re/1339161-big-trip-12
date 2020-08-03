const EVENTS_AMOUNT = 3;

const headerBlock = document.querySelector(`.trip-main`);
const eventListBlock = document.querySelector(`.trip-events`);

const render = (container, template, place) => {
  container.insertAdjacentHTML(place, template);
};

import {makeTripInfoBlockTemplate} from "./view/trip-info-block.js";
import {makeTripInfoHeadingTemplate} from "./view/trip-info-heading.js";
import {makeTripInfoCostTemplate} from "./view/trip-info-cost.js";
import {makeMenuTemplate} from "./view/menu.js";
import {makeFiltersTemplate} from "./view/filters.js";
import {makeSortingTemplate} from "./view/sorting.js";
import {makeDayTemplate} from "./view/day.js";
import {makeEventItemTemplate} from "./view/event-item.js";
import {makeEventInfoTemplate} from "./view/event-info.js";
import {makeEventEditTemplate} from "./view/event-edit.js";

const renderEvent = (container, template) => {
  render(container, makeEventItemTemplate(), `beforeend`);

  const lastEventBlock = container.querySelector(`.trip-events__item:last-child`);
  render(lastEventBlock, template, `beforeend`);
};

render(headerBlock, makeTripInfoBlockTemplate(), `afterbegin`);

const siteTripInfoBlock = headerBlock.querySelector(`.trip-info`);
render(siteTripInfoBlock, makeTripInfoHeadingTemplate(), `afterbegin`);
render(siteTripInfoBlock, makeTripInfoCostTemplate(), `beforeend`);

const menuHeadingBlock = headerBlock.querySelector(`.trip-controls h2:first-child`);
render(menuHeadingBlock, makeMenuTemplate(), `afterend`);

const filterHeadingBlock = headerBlock.querySelector(`.trip-controls h2:last-child`);
render(filterHeadingBlock, makeFiltersTemplate(), `afterend`);

render(eventListBlock, makeSortingTemplate(), `beforeend`);
render(eventListBlock, makeDayTemplate(), `beforeend`);

const dailyEventsLastBlock = eventListBlock.querySelector(`.day:last-child .trip-events__list`);

renderEvent(dailyEventsLastBlock, makeEventEditTemplate());

for (let i = 0; i < EVENTS_AMOUNT; i++) {
  renderEvent(dailyEventsLastBlock, makeEventInfoTemplate());
}
