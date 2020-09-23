export const MAX_OFFERS_TO_SHOW = 3;

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
