const EVENTS_MIN = 15;
const EVENTS_MAX = 20;

import {render, RenderPosition, organizeEventsByDays, getRandomInt, bindToEsc} from "./utils.js";

import HeadingView from "./view/heading.js";
import MenuView from "./view/menu.js";
import FiltersView from "./view/filters.js";
import SortingView from "./view/sorting.js";
import DayListView from "./view/day-list.js";
import DayView from "./view/day.js";
import EventSummaryView from "./view/event-summary.js";
import EventEditView from "./view/event-edit.js";
import NoEvents from "./view/no-events.js";

import {generateEvents} from "./mock/events.js";

const renderEvent = (container, event) => {
  const makeSummaryElement = (eventData) => {
    const eventSummary = new EventSummaryView(eventData);
    eventSummary.element.querySelector(`.event__rollup-btn`).addEventListener(`click`, () => {
      container.replaceChild(makeEditFormElement(eventData), eventSummary.element);
      eventSummary.element.remove();
      eventSummary.removeElement();
    });

    return eventSummary.element;
  };

  const makeEditFormElement = (eventData) => {
    const eventEdit = new EventEditView(eventData);
    const closeEventEdit = () => {
      container.replaceChild(makeSummaryElement(eventData), eventEdit.element);
      eventEdit.element.remove();
      eventEdit.removeElement();
    };
    const closeEventByEsc = bindToEsc(closeEventEdit);

    const saveEvent = (evt) => {
      evt.preventDefault();
      closeEventEdit();
    };

    eventEdit.element.addEventListener(`submit`, saveEvent);
    eventEdit.element.querySelector(`.event__rollup-btn`).addEventListener(`click`, () => {
      closeEventEdit();
      document.removeEventListener(`keydown`, closeEventByEsc);
    });
    document.addEventListener(`keydown`, closeEventByEsc);

    return eventEdit.element;
  };

  render(container, makeSummaryElement(event), RenderPosition.BEFOREEND);
};

const renderDays = (daysContainer, daysList) => {
  if (daysList.size === 0) {
    render(daysContainer, new NoEvents().element, RenderPosition.BEFOREEND);
    return;
  }

  let dayNumber = 1;
  for (const [dayDate, dayEvents] of daysList) {
    const dayElement = new DayView({dayNumber, dayDate}).element;
    render(dayListElement, dayElement, RenderPosition.BEFOREEND);

    const eventsOfDayElement = dayElement.querySelector(`.trip-events__list`);
    for (const event of dayEvents) {
      renderEvent(eventsOfDayElement, event);
    }
    dayNumber++;
  }
};

const headerElement = document.querySelector(`.trip-main`);
const eventListElement = document.querySelector(`.trip-events`);

const events = generateEvents(getRandomInt(EVENTS_MIN, EVENTS_MAX));

render(headerElement, new HeadingView(events).element, RenderPosition.AFTERBEGIN);

const menuHeadingElement = headerElement.querySelector(`.trip-controls h2:first-child`);
render(menuHeadingElement, new MenuView(events).element, RenderPosition.AFTEREND);

const filtersHeadingElement = headerElement.querySelector(`.trip-controls h2:last-child`);
render(filtersHeadingElement, new FiltersView(events).element, RenderPosition.AFTEREND);

render(eventListElement, new SortingView().element, RenderPosition.BEFOREEND);

const dayListElement = new DayListView().element;
render(eventListElement, dayListElement, RenderPosition.BEFOREEND);

renderDays(dayListElement, organizeEventsByDays(events));
