const EVENTS_MIN = 15;
const EVENTS_MAX = 20;

import {generateEvents} from "./mock/events.js";
import {getRandomInt} from "./utils/common.js";

import TripPresenter from "./presenter/trip-presenter.js";
import HeaderPresenter from "./presenter/header-presenter.js";

import EventsModel from "./model/events-model.js";

const eventList = generateEvents(getRandomInt(EVENTS_MIN, EVENTS_MAX));
const eventsModel = new EventsModel(eventList);

const headerElement = document.querySelector(`.trip-main`);
const eventListElement = document.querySelector(`.trip-events`);

const tripPresenter = new TripPresenter(eventListElement, eventsModel);
const headerPresenter = new HeaderPresenter(headerElement, eventsModel);

tripPresenter.init();
headerPresenter.init();
