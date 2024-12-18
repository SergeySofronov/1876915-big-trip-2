import AbstractView from './abstract-view';
import { DateFormat, FormMode } from '../const';
import { nanoid } from 'nanoid';
import { toUpperCaseFirstLetter } from '../utils';
import dayjs from 'dayjs';


const createEventTypeItemTemplate = (eventType, offerTypes = []) => offerTypes.map((type) => {
  const id = nanoid();
  const checkStatus = eventType === type ? 'checked' : '';
  return (`
    <div class="event__type-item">
      <input id="event-type-taxi-${id}" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}" ${checkStatus}>
        <label class="event__type-label  event__type-label--${type}" for="event-type-taxi-${id}">${toUpperCaseFirstLetter(type)}</label>
    </div>`
  );
}).join('');

const createEventTypeListTemplate = (eventType, offerTypes) => (`
  <div class="event__type-list">
    <fieldset class="event__type-group">
      <legend class="visually-hidden">Event type</legend>
        ${createEventTypeItemTemplate(eventType, offerTypes)}
    </fieldset>
  </div>`
);

const createOfferListItemTemplate = (offers) => offers.map(({ id, title, price, isChecked }) => (`
    <div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden" id="event-offer-${id}" type="checkbox" name="event-offer-${id}" ${isChecked ? 'checked' : ''}>
      <label class="event__offer-label" for="event-offer-${id}">
        <span class="event__offer-title">${title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${price}</span>
      </label>
    </div>`
)).join('');

const createOfferListTemplate = (offers) => (`
    <section class="event__section  event__section--offers">
      <h3 class="event__section-title  event__section-title--offers">Offers</h3>
      <div class="event__available-offers">
        ${createOfferListItemTemplate(offers)}
      </div>
    </section>`
);

const createDestinationListTemplate = ({ type, destination }, destinations = []) => {
  const [labelId, listId] = [nanoid(), nanoid()];
  return (`
    <div div class="event__field-group  event__field-group--destination" >
      <label class="event__label  event__type-output" for="event-destination-${labelId}">${type}</label>
      <input class="event__input  event__input--destination" id="event-destination-${labelId}" type="text" name="event-destination" value="${destination ? destination.name : ''}" list="destination-list-${listId}">
      <datalist id="destination-list-${listId}">
          ${destinations.map(({ name }) => `<option value="${name}"></option>`).join('')}
      </datalist>
    </div>`
  );
};

const createPicturesTemplate = (pictures = []) => pictures.map(({ src, description }) => `<img class="event__photo" src="${src}" alt="${description}">`).join('');

const createDestinationDescriptionTemplate = ({ description, pictures }) => (`
    <section class="event__section  event__section--destination">
      <h3 class="event__section-title  event__section-title--destination">Destination</h3>
      ${description ? `<p class="event__destination-description">${description}</p>` : ''}
      ${pictures.length ? `<div class="event__photos-container">
        <div class="event__photos-tape">
          ${createPicturesTemplate(pictures)}
        </div>
      </div>` : ''}
    </section>`
);


const createFormTemplate = (event, destinations, offerTypes, mode) => {
  const {
    basePrice,
    dateFrom,
    dateTo,
    destination,
    offers,
    type,
  } = event || {};

  const id = nanoid();
  const exitButtonText = mode === FormMode.EDIT ? 'Delete' : 'Cancel';
  const eventTypeList = createEventTypeListTemplate(type, offerTypes);
  const destinationList = createDestinationListTemplate({ type, destination }, destinations);
  const offerDetailsList = offers.length ? createOfferListTemplate(offers) : '';
  const destinationDescription = destination && (destination.pictures.length || destination.description) ? createDestinationDescriptionTemplate(destination) : '';

  const dateStart = dayjs(dateFrom).format(DateFormat.FORM_START);
  const dateEnd = dayjs(dateTo).format(DateFormat.FORM_START);
  const price = basePrice > 0 ? basePrice : '';

  return (`
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-${id}">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-${id}" type="checkbox">
            ${eventTypeList}
          </div>

          ${destinationList}

          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-${id}">From</label>
            <input class="event__input  event__input--time" id="event-start-time-${id}" type="text" name="event-start-time" value="${dateStart}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-${id}">To</label>
            <input class="event__input  event__input--time" id="event-end-time-${id}" type="text" name="event-end-time" value="${dateEnd}">
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-${id}">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-${id}" type="text" name="event-price" value="${price}">
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">${exitButtonText}</button>
        </header>

        <section class="event__details">
          ${offerDetailsList}
          ${destinationDescription}
        </section>
      </form>
    </li>`
  );
};

export default class FormView extends AbstractView {

  #eventData = [];
  #destinations = [];
  #offerTypes = [];
  #mode = FormMode.EDIT;

  constructor(event, destinations, offerTypes, mode = FormMode.EDIT) {
    super();
    this.#eventData = event;
    this.#destinations = destinations;
    this.#offerTypes = offerTypes;
    this.#mode = mode in FormMode ? mode : FormMode.EDIT;
  }

  get template() {
    return createFormTemplate(this.#eventData, this.#destinations, this.#offerTypes, this.#mode);
  }
}
