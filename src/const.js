export const DateFormat = {
  EVENT_DEFAULT: 'YYYY-MM-DD',
  EVENT_HUMAN: 'MMM DD',
  EVENT_START: 'YYYY-MM-DDTHH:mm',
  EVENT_TIME: 'HH:mm',
  FORM_START: 'YY/MM/DD HH:mm',
  INFO_HUMAN: 'DD MMM'
};

export const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past',
};

export const EventListMessage = {
  [FilterType.EVERYTHING]: 'Click New Event to create your first point',
  [FilterType.PAST]: 'There are no past events now',
  [FilterType.PRESENT]: 'There are no present events now',
  [FilterType.FUTURE]: 'There are no future events now',
};

export const SortType = {
  DAY: 'day',
  EVENT: 'event',
  TIME: 'time',
  PRICE: 'price',
  OFFER: 'offers',
};

export const FormMode = {
  CREATE: 'CREATE',
  EDIT: 'EDIT',
};

export const KeyCode = {
  ESC: 'Escape',
  ENTER: 'Enter',
};

export const tripDefault = {
  basePrice: 0,
  destination: null,
  isFavorite: false,
  offers: [],
  type: 'flight',
};

export const ElementSelectors = {
  ROLL_UP_BUTTON: '.event__rollup-btn',
  EVENT_ITEM: '.event',
};
