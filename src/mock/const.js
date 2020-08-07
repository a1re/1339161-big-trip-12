export const CITIES = [`Amsterdam`, `Geneva`, `Chamonix`, `Saint Petersburg`];
export const TRANSPORTS = [`Taxi`, `Bus`, `Train`, `Ship`, `Transport`, `Drive`, `Flight`];
export const STOPS = [`Check-in`, `Sightseeing`, `Restaurant`];

export const TRANSPORT_OFFERS_MAP = new Map([
  [`luggage`, {title: `Add luggage`, price: `30`}],
  [`comfort`, {title: `Switch to comfort class`, price: `100`}],
  [`meal`, {title: `Add meal`, price: `15`}],
  [`seats`, {title: `Choose seats`, price: `5`}],
  [`train`, {title: `Travel by train`, price: `40`}]
]);

export const STOP_OFFERS_MAP = new Map([
  [`breakfast`, {title: `Add breakfast`, price: `50`}],
  [`tickets`, {title: `Book tickets`, price: `40`}],
  [`lunch`, {title: `Lunch in the city`, price: `50`}]
]);
