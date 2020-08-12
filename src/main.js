const EVENTS_MIN = 15;
const EVENTS_MAX = 20;

import {render, RenderPosition, organizeEventsByDays, getRandomInt} from "./utils.js";

import HeadingView from "./view/heading.js";
import MenuView from "./view/menu.js";
import FiltersView from "./view/filters.js";
import SortingView from "./view/sorting.js";
import DayListView from "./view/day-list.js";
import DayView from "./view/day.js";
import EventSummaryView from "./view/event-summary.js";
import EventEditView from "./view/event-edit.js";

import {generateEvents} from "./mock/events.js";

const renderEvent = (container, event) => {
  const makeSummaryElement = (eventData) => {
    const eventSummary = new EventSummaryView(eventData);
    eventSummary.element.querySelector(`.event__rollup-btn`).addEventListener(`click`, () => {
      container.replaceChild(makeEditFormElemen(eventData), eventSummary.element);
      eventSummary.element.remove();
      eventSummary.removeElement();
    });

    return eventSummary.element;
  };

  const makeEditFormElemen = (eventData) => {
    const eventEdit = new EventEditView(eventData);
    const closeEventEdit = (evt) => {
      evt.preventDefault();
      container.replaceChild(makeSummaryElement(eventData), eventEdit.element);
      eventEdit.element.remove();
      eventEdit.removeElement();
    };
    eventEdit.element.addEventListener(`submit`, closeEventEdit);
    eventEdit.element.querySelector(`.event__rollup-btn`).addEventListener(`click`, closeEventEdit);

    return eventEdit.element;
  };

  render(container, makeSummaryElement(event), RenderPosition.BEFOREEND);
};

const headerElement = document.querySelector(`.trip-main`);
const eventListElement = document.querySelector(`.trip-events`);

const events = generateEvents(getRandomInt(EVENTS_MIN, EVENTS_MAX));
const eventsByDays = organizeEventsByDays(events);

render(headerElement, new HeadingView(events).element, RenderPosition.AFTERBEGIN);

const menuHeadingElement = headerElement.querySelector(`.trip-controls h2:first-child`);
render(menuHeadingElement, new MenuView(events).element, RenderPosition.AFTEREND);

const filtersHeadingElement = headerElement.querySelector(`.trip-controls h2:last-child`);
render(filtersHeadingElement, new FiltersView(events).element, RenderPosition.AFTEREND);

render(eventListElement, new SortingView().element, RenderPosition.BEFOREEND);

const dayListElement = new DayListView().element;
render(eventListElement, dayListElement, RenderPosition.BEFOREEND);

let dayNumber = 1;
for (const [dayDate, dayEvents] of eventsByDays) {
  const dayElement = new DayView({dayNumber, dayDate}).element;
  render(dayListElement, dayElement, RenderPosition.BEFOREEND);

  const eventsOfDayElement = dayElement.querySelector(`.trip-events__list`);
  for (const event of dayEvents) {
    renderEvent(eventsOfDayElement, event);
  }
  dayNumber++;
}
