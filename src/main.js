const EVENTS_MIN = 15;
const EVENTS_MAX = 20;

import {generateEvents} from "./mock/events.js";
import {getRandomInt} from "./utils/common.js";

import TripPresenter from "./presenter/trip-presenter.js";
import HeaderPresenter from "./presenter/header-presenter.js";

const headerElement = document.querySelector(`.trip-main`);
const eventListElement = document.querySelector(`.trip-events`);

const tripPresenter = new TripPresenter(eventListElement);
const headerPresenter = new HeaderPresenter(headerElement);

const eventList = generateEvents(getRandomInt(EVENTS_MIN, EVENTS_MAX));

tripPresenter.init(eventList);
headerPresenter.init(eventList);
