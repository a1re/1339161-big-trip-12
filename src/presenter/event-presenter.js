import {EventSummaryView} from "../view/event-summary-view.js";
import {EventEditView} from "../view/event-edit-view.js";

import {render, RenderPosition} from "../utils/render.js";
import {EscHandler} from "../utils/common.js";

export class EventPresenter {
  constructor(eventListContainer, event, updateEventData) {
    this._eventListContainer = eventListContainer;
    this._event = event;
    this._updateEventData = updateEventData;

    this._eventSummaryComponent = null;
    this._eventEditComponent = null;
    this._closeEventByEsc = null;

    this._handleFavoriteClick = this._handleFavoriteClick.bind(this);
    this._handleEventEditClose = this._handleEventEditClose.bind(this);
    this._handleFormSubmit = this._handleFormSubmit.bind(this);

    render(
        this._eventListContainer,
        this._createEventSummaryElement(event),
        RenderPosition.BEFOREEND
    );
  }

  /**
   * Перерисовка карточки с новыми данными
   *
   * @param  {Object} event - Объект с новыми данными.
   * @return {void}
   */
  reset(event) {
    this._event = event;

    if (this._eventListContainer.contains(this._eventSummaryComponent.element)) {
      const previousEventSummaryComponent = this._eventSummaryComponent;
      this._eventListContainer.replaceChild(
          this._createEventSummaryElement(event),
          previousEventSummaryComponent.element
      );
      previousEventSummaryComponent.remove();
    }

    if (this._eventListContainer.contains(this._eventEditComponent.element)) {
      if (this._closeEventByEsc) {
        this._closeEventByEsc.unbind();
        this._closeEventByEsc = null;
      }
      const previousEventEditComponent = this._eventEditComponent;
      this._eventListContainer.replaceChild(
          this._createEventEditElement(event),
          previousEventEditComponent.element
      );
      previousEventEditComponent.remove();
    }
  }

  /**
   * Создание шаблона отображения сводки о событии для демонстрации в общем
   * списке. Вместе с шаблоном создается также и обработчик открытия события
   * (замена шаблона сводки формой редактирования).
   *
   * @return {Node}           - Шаблон в виде DOM-элемента для размещения.
   */
  _createEventSummaryElement() {
    this._eventSummaryComponent = new EventSummaryView(this._event);

    this._eventSummaryComponent.openHandler = () => {
      this._eventListContainer.replaceChild(
          this._createEventEditElement(this._event),
          this._eventSummaryComponent.element
      );
      this._eventSummaryComponent.remove();
    };

    return this._eventSummaryComponent.element;
  }

  /**
   * Создание формы редактрирования события на основе отоббражения. Вместе
   * с формой создаются также обработчики закрытия формы (замена формы
   * шаблоном сводки) и сохранения данных.
   *
   * @return {Node}           - Шаблон в виде DOM-элемента для размещения.
   */
  _createEventEditElement() {
    this._eventEditComponent = new EventEditView(this._event);

    this._closeEventByEsc = new EscHandler(this._handleEventEditClose);
    this._eventEditComponent.closeHandler = this._handleEventEditClose;
    this._eventEditComponent.submitHandler = this._handleFormSubmit;
    this._eventEditComponent.toggleFavoriteHandler = this._handleFavoriteClick;

    return this._eventEditComponent.element;
  }

  /**
   * Обработчик закрытия формы регистрации. При закрытии также снимает
   * обработчик нажатия на Esc.
   *
   * @return {void}
   */
  _handleEventEditClose() {
    this._eventListContainer.replaceChild(
        this._createEventSummaryElement(this._event),
        this._eventEditComponent.element
    );
    this._eventEditComponent.remove();
    this._closeEventByEsc.unbind();
    this._closeEventByEsc = null;
  }

  /**
   * Обработчик нажатия на кнопку «Добавить в избранное».
   *
   * @return {void}
   */
  _handleFavoriteClick() {
    this._updateEventData(
        Object.assign({}, this._event, {isFavorite: !this._event.isFavorite})
    );
  }

  /**
   * Обработчик сохранения данных формы
   *
   * @param  {Object} eventData - Данные формы для сохранения
   * @return {void}
   */
  _handleFormSubmit(eventData) {
    this._handleEventEditClose();
    this._updateEventData(eventData);
  }

  /**
   * Удаление события с обеими формами представления (сводки и редактрирования).
   *
   * @return {void}
   */
  destroy() {
    if (this._eventEditComponent) {
      this._eventEditComponent.remove();
    }
    if (this._eventSummaryComponent) {
      this._eventSummaryComponent.remove();
    }
  }
}
