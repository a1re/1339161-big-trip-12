const EVENTS_MIN = 15;
const EVENTS_MAX = 20;

import {generateEvents} from "./mock/events.js";

import {render, RenderPosition} from "./utils/render.js";
import {getRandomInt} from "./utils/common.js";

import HeadingView from "./view/heading.js";
import MenuView from "./view/menu.js";
import FiltersView from "./view/filters.js";

import TripPresenter from "./presenter/trip.js";

const headerElement = document.querySelector(`.trip-main`);
const eventListElement = document.querySelector(`.trip-events`);

const tripPresenter = new TripPresenter(eventListElement);

const eventList = generateEvents(getRandomInt(EVENTS_MIN, EVENTS_MAX));

render(headerElement, new HeadingView(eventList).element, RenderPosition.AFTERBEGIN);

const menuHeadingElement = headerElement.querySelector(`.trip-controls h2:first-child`);
render(menuHeadingElement, new MenuView(eventList).element, RenderPosition.AFTEREND);

const filtersHeadingElement = headerElement.querySelector(`.trip-controls h2:last-child`);
render(filtersHeadingElement, new FiltersView(eventList).element, RenderPosition.AFTEREND);

tripPresenter.init(eventList);
