import AbstractView from './abstract-view';

const createEventListTemplate = () => (`
  <ul class="trip-events__list">
  </ul>`
);

export default class EventListView extends AbstractView {
  get template() {
    return createEventListTemplate();
  }
}
