import { sortEvents } from '../utils/sort';
import { ElementSelectors as E, EventListMessage, EventMode, FilterType, FormMode, KeyCode, SortType, UpdateType, UserAction } from '../const';
import SortView from '../view/sort-view';
import EventListView from '../view/event-list-view';
import NoEventsView from '../view/no-events-view';
import NewEventButtonView from '../view/new-event-button-view';
import { filterEvents } from '../utils/filter';
import EventPresenter from './event-presenter';
import { remove, render } from '../framework/render';

export default class BoardPresenter {
  #boardContainer = null;
  #newEventButtonContainer = null;

  #eventListComponent = null;
  #newEventButtonComponent = new NewEventButtonView();
  #sortComponent = null;
  #noEventsComponent = null;

  /** @type {TripEvent[]} */
  #events = [];

  /** @type {TripModel} */
  #tripModel = null;

  #activeSortType = SortType.PRICE;
  #eventPresenters = new Map();
  #activeEventId = '';
  #newEventPresenter = null;

  #isLoading = true;

  constructor(boardContainer, newEventButtonContainer, tripModel) {
    this.#boardContainer = boardContainer;
    this.#newEventButtonContainer = newEventButtonContainer;
    this.#tripModel = tripModel;
    this.#tripModel.addObserver(this.#onModelChangeHandler);
  }

  get #offers() {
    return this.#tripModel.offers;
  }

  get #destinations() {
    return this.#tripModel.destinations;
  }

  init() {

    this.#newEventButtonComponent.setOnClickHandler(this.#newEventHandler);
    render(this.#newEventButtonContainer, this.#newEventButtonComponent);

    this.#renderBoard();
  }

  #renderBoard = () => {

    if ((this.#events.length === 0) || (this.#isLoading)) {
      this.#renderNoEvents();
      return;
    }

    this.#renderSort();
    this.#renderEventList();
    this.#renderEvents();
  };

  #renderNoEvents = () => {
    const message = this.#isLoading ? EventListMessage.LOADING : EventListMessage[this.#tripModel.filterType];
    this.#noEventsComponent = new NoEventsView(message);
    render(this.#boardContainer, this.#noEventsComponent);
  };

  #renderEventList = () => {
    this.#eventListComponent = new EventListView()
      .setEventToggleHandler(this.#eventToggleHandler)
      .setEscKeyDownHandler(this.#escKeyHandler);
    render(this.#boardContainer, this.#eventListComponent);
  };

  #renderSort = () => {
    this.#sortComponent = new SortView(this.#tripModel.sortItems, this.#activeSortType).setOnSortClickHandler(this.#sortChangeHandler);
    render(this.#boardContainer, this.#sortComponent);
  };

  #sortChangeHandler = (sortType) => {
    if ((sortType === this.#activeSortType) || !(Object.values(SortType).includes(sortType))) {
      return;
    }

    this.#activeSortType = sortType;
    this.#updateEventList();
  };

  #createEventPresenter = (event, mode = FormMode.EDIT) => new EventPresenter(this.#eventListComponent.element, () => this.#events.length)
    .init(event, this.#offers, this.#destinations, mode)
    .setViewActionHandler(this.#viewActionHandler);

  #renderEvents = () => sortEvents(this.#events, this.#activeSortType).forEach((event) => {
    const presenter = this.#createEventPresenter(event);
    this.#eventPresenters.set(event.id, presenter);
  });

  #newEventHandler = () => {
    this.#toggleEventMode();
    this.#activeSortType = SortType.DAY;
    this.#tripModel.updateFilterType(UpdateType.MAJOR, FilterType.EVERYTHING);
    this.#newEventButtonComponent.disable();
    if (this.#events.length === 0) {
      remove(this.#noEventsComponent);
      this.#renderEventList(); //!!! не удалять EventList?
    }
    this.#newEventPresenter = this.#createEventPresenter(this.#tripModel.getDefaultEvent(), FormMode.CREATE);
  };

  #updateEventList = () => {
    this.#destroyEventPresenters();
    this.#renderEvents();
  };

  #updateBoard = () => {
    this.#destroyBoard();
    this.#renderBoard();
  };

  #destroyEventPresenters = () => {
    this.#destroyNewEventPresenter();
    this.#eventPresenters.forEach((presenter) => presenter.destroy());
    this.#eventPresenters.clear();
    this.#activeEventId = '';
  };

  #destroyBoard = () => {
    remove(this.#sortComponent);
    remove(this.#eventListComponent);
    remove(this.#noEventsComponent);
    this.#destroyEventPresenters();
  };

  #destroyNewEventPresenter = () => {
    if (this.#newEventPresenter) {
      this.#newEventButtonComponent.enable();
      this.#newEventPresenter.destroy();
      this.#newEventPresenter = null;
    }
  };

  #viewActionHandler = (actionType, updateType, updatedEvent) => {

    switch (actionType) {
      case UserAction.UPDATE_EVENT:
        this.#tripModel.updateEvent(updateType, updatedEvent);
        break;

      case UserAction.CREATE_EVENT:
        this.#tripModel.createEvent(updateType, updatedEvent);
        break;

      case UserAction.CANCEL_EVENT:
        this.#destroyNewEventPresenter();
        if (this.#events.length === 0) {
          this.#renderNoEvents();
        }
        break;

      case UserAction.DELETE_EVENT:
        this.#tripModel.deleteEvent(updateType, updatedEvent);
        break;
    }
  };

  #onModelChangeHandler = (updateType, payload) => {

    this.#events = filterEvents(this.#tripModel.events, this.#tripModel.filterType);

    switch (updateType) {
      case UpdateType.PATCH:
        this.#eventPresenters.get(payload.id).init(payload);
        break;
      case UpdateType.MINOR:
        this.#updateEventList();
        break;

      case UpdateType.MAJOR:
        this.#updateBoard();
        break;

      case UpdateType.FILTER:
        this.#activeSortType = SortType.DAY;
        this.#updateBoard();
        break;

      case UpdateType.INIT:
        this.#isLoading = false;
        remove(this.#noEventsComponent);
        this.#newEventButtonComponent.enable();
        this.#renderBoard();
        break;
    }
  };

  #toggleEventMode = (newEventId = '') => {
    this.#destroyNewEventPresenter();

    const eventId = this.#activeEventId;
    if (this.#activeEventId) {
      this.#eventPresenters.get(eventId).toggleEventView(EventMode.DEFAULT);
      this.#activeEventId = '';
    }

    if (newEventId && (eventId !== newEventId)) {
      this.#eventPresenters.get(newEventId).toggleEventView(EventMode.FORM);
      this.#activeEventId = newEventId;
    }
  };

  #escKeyHandler = (evt) => {
    if ((evt.key === KeyCode.ESC) && (this.#activeEventId || this.#newEventPresenter)) {
      this.#toggleEventMode();
    }
  };

  #eventToggleHandler = ({ target }) => {
    if (target.matches(E.ROLL_UP_BUTTON)) {
      const eventItem = target.closest(E.EVENT_ITEM);
      const eventId = eventItem?.dataset.eventId;
      this.#toggleEventMode(eventId);
    }
  };
}
