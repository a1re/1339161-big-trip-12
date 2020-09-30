export const MAX_OFFERS_TO_SHOW = 3;
export const MAX_ITINERARY_POINTS = 3;

export const AUTH_STRING_LENGTH = 16;
export const API_END_POINT = `https://12.ecmascript.pages.academy/big-trip`;

export const STORAGE_PREFIX = `big-trip`;
export const STORAGE_VER = `v1`;

export const UpdateMode = {
  PATCH: `PATCH`,
  MINOR: `MINOR`,
  MAJOR: `MAJOR`
};

export const PointMode = {
  SUMMARY: `SUMMARY`,
  EDITING: `EDITING`
};

export const MenuItem = {
  TABLE: `Table`,
  STATS: `Stats`
};

export const ButtonState = {
  ENABLED: false,
  DISABLED: true
};

export const Datatype = {
  POINTS: `points`,
  DESTINATIONS: `destinations`,
  OFFERS: `offers`
};

export const TIME_FORMAT = `HH:mm`;
export const DATETIME_FORMAT = `DD/MM/YY HH:mm`;

export const DEFAULT_FLATPICKR_SETTINGS = { };
DEFAULT_FLATPICKR_SETTINGS[`dateFormat`] = `d/m/y H:i`;
DEFAULT_FLATPICKR_SETTINGS[`enableTime`] = true;
DEFAULT_FLATPICKR_SETTINGS[`time_24hr`] = true;
