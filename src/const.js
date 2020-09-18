export const CITIES = [`Amsterdam`, `Geneva`, `Chamonix`, `Saint Petersburg`];
export const TRANSPORTS = [`Taxi`, `Bus`, `Train`, `Ship`, `Transport`, `Drive`, `Flight`];
export const STOPS = [`Check-in`, `Sightseeing`, `Restaurant`];

export const TRANSPORT_OFFERS_MAP = new Map([
  [`luggage`, {title: `Add luggage`, price: `30`}],
  [`comfort`, {title: `Comfort class`, price: `100`}],
  [`meal`, {title: `Add meal`, price: `15`}],
  [`seats`, {title: `Choose seats`, price: `5`}],
  [`train`, {title: `Travel by train`, price: `40`}]
]);

export const STOP_OFFERS_MAP = new Map([
  [`breakfast`, {title: `Add breakfast`, price: `50`}],
  [`tickets`, {title: `Book tickets`, price: `40`}],
  [`lunch`, {title: `Lunch in the city`, price: `50`}]
]);

export const SortingMethod = {
  EVENT: `sort-event`,
  TIME: `sort-time`,
  PRICE: `sort-price`
};

export const UpdateMode = {
  DATA: `DATA`,
  PATCH: `PATCH`,
  MINOR: `MINOR`,
  MAJOR: `MAJOR`
};

export const TIME_FORMAT = `HH:mm`;
export const DATETIME_FORMAT = `DD/MM/YY HH:mm`;

export const DEFAULT_FLATPICKR_SETTINGS = { };
DEFAULT_FLATPICKR_SETTINGS[`dateFormat`] = `d/m/y H:i`;
DEFAULT_FLATPICKR_SETTINGS[`enableTime`] = true;
DEFAULT_FLATPICKR_SETTINGS[`time_24hr`] = true;
