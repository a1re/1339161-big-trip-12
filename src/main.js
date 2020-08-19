const EVENTS_MIN = 15;
const EVENTS_MAX = 20;

import {render, RenderPosition} from "./utils/render.js";
import {getRandomInt, EscHandler} from "./utils/common.js";
import {Route} from "./utils/route.js";

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
    eventSummary.openHandler = () => {
      container.replaceChild(makeEditFormElement(eventData), eventSummary.element);
      eventSummary.element.remove();
      eventSummary.removeElement();
    };

    return eventSummary.element;
  };

  const makeEditFormElement = (eventData) => {
    const eventEdit = new EventEditView(eventData);
    const closeEventEdit = () => {
      container.replaceChild(makeSummaryElement(eventData), eventEdit.element);
      eventEdit.element.remove();
      eventEdit.removeElement();
      closeEventByEsc.unbind();
    };

    const closeEventByEsc = new EscHandler(closeEventEdit);
    eventEdit.closeHandler = closeEventEdit;
    eventEdit.submitHandler = closeEventEdit;

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

const eventList = generateEvents(getRandomInt(EVENTS_MIN, EVENTS_MAX));

render(headerElement, new HeadingView(eventList).element, RenderPosition.AFTERBEGIN);

const menuHeadingElement = headerElement.querySelector(`.trip-controls h2:first-child`);
render(menuHeadingElement, new MenuView(eventList).element, RenderPosition.AFTEREND);

const filtersHeadingElement = headerElement.querySelector(`.trip-controls h2:last-child`);
render(filtersHeadingElement, new FiltersView(eventList).element, RenderPosition.AFTEREND);

render(eventListElement, new SortingView().element, RenderPosition.BEFOREEND);

const dayListElement = new DayListView().element;
render(eventListElement, dayListElement, RenderPosition.BEFOREEND);

renderDays(dayListElement, Route.organizeByDays(eventList));
