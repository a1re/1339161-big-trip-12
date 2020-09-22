export const CITIES = [`Amsterdam`, `Geneva`, `Chamonix`, `Saint Petersburg`];
export const TRANSPORTS = [`Taxi`, `Bus`, `Train`, `Ship`, `Transport`, `Drive`, `Flight`];
export const STOPS = [`Check-in`, `Sightseeing`, `Restaurant`];

export const UpdateMode = {
  PATCH: `PATCH`,
  MINOR: `MINOR`,
  MAJOR: `MAJOR`
};

export const EventMode = {
  SUMMARY: `SUMMARY`,
  EDITING: `EDITING`
};

export const MenuItem = {
  TABLE: `Table`,
  STATS: `Stats`
};

export const TIME_FORMAT = `HH:mm`;
export const DATETIME_FORMAT = `DD/MM/YY HH:mm`;

export const DEFAULT_FLATPICKR_SETTINGS = { };
DEFAULT_FLATPICKR_SETTINGS[`dateFormat`] = `d/m/y H:i`;
DEFAULT_FLATPICKR_SETTINGS[`enableTime`] = true;
DEFAULT_FLATPICKR_SETTINGS[`time_24hr`] = true;
