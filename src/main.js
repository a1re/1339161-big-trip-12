// import {CITIES, STOPS, TRANSPORTS, TRANSPORT_OFFERS_MAP, STOP_OFFERS_MAP} from "../const.js";

const headerBlock = document.querySelector(`.trip-main`);
const eventListBlock = document.querySelector(`.trip-events`);

const render = (container, template, place) => {
  container.insertAdjacentHTML(place, template);
};

import {makeTripHeadingTemplate} from "./view/heading.js";
import {makeMenuTemplate} from "./view/menu.js";
import {makeFiltersTemplate} from "./view/filters.js";
import {makeSortingTemplate} from "./view/sorting.js";
import {makeEventListTemplate} from "./view/event-list.js";

import {generateEvents} from "./mock/events.js";

const events = generateEvents();

render(headerBlock, makeTripHeadingTemplate(events), `afterbegin`);
const menuHeadingBlock = headerBlock.querySelector(`.trip-controls h2:first-child`);
render(menuHeadingBlock, makeMenuTemplate(), `afterend`);

const filterHeadingBlock = headerBlock.querySelector(`.trip-controls h2:last-child`);
render(filterHeadingBlock, makeFiltersTemplate(), `afterend`);

render(eventListBlock, makeSortingTemplate(), `beforeend`);
render(eventListBlock, makeEventListTemplate(events), `beforeend`);
