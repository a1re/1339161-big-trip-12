import EventSummaryView from "../view/event-summary-view.js";
import EventEditView from "../view/event-edit-view.js";

import {render, RenderPosition} from "../utils/render.js";
import {EscHandler} from "../utils/common.js";

const Mode = {
  SUMMARY: `SUMMARY`,
  EDITING: `EDITING`
};

export default class EventPresenter {
  constructor(eventListContainer, eventData, updateEventData, resetAllEvents) {
    this._eventListContainer = eventListContainer;
    this._event = eventData;
    this._updateEventData = updateEventData;
    this._resetAllEvents = resetAllEvents;

    this._mode = Mode.SUMMARY;

    this._eventSummaryComponent = null;
    this._eventEditComponent = null;
    this._closeEventByEsc = null;

    this._toggleFavorite = this._toggleFavorite.bind(this);
    this._closeEventEdit = this._closeEventEdit.bind(this);
    this._submitForm = this._submitForm.bind(this);

    render(
        this._eventListContainer,
        this._createEventSummaryElement(eventData),
        RenderPosition.BEFOREEND
    );
  }

  /**
   * Перерисовка карточки с новыми данными
   *
   * @param  {Object} eventData - Объект с новыми данными.
   * @return {void}
   */
  update(eventData) {
    this._event = eventData;

    if (this._mode === Mode.SUMMARY) {
      const previousEventSummaryComponent = this._eventSummaryComponent;
      this._eventListContainer.replaceChild(
          this._createEventSummaryElement(eventData),
          previousEventSummaryComponent.element
      );
      previousEventSummaryComponent.remove();
    }

    if (this._mode === Mode.EDITING) {
      if (this._closeEventByEsc) {
        this._closeEventByEsc.unbind();
        this._closeEventByEsc = null;
      }
      const previousEventEditComponent = this._eventEditComponent;
      this._eventListContainer.replaceChild(
          this._createEventEditElement(eventData),
          previousEventEditComponent.element
      );
      previousEventEditComponent.remove();
    }
  }

  /**
   * Сброс состояния события. Если событие было открыто в виде формы
   * редактирования, то оно вренется в формат сводки.
   *
   * @return {void}
   */
  reset() {
    if (this._mode !== Mode.SUMMARY) {
      this._eventListContainer.replaceChild(
          this._createEventSummaryElement(this._event),
          this._eventEditComponent.element
      );
    }
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

    this._mode = Mode.SUMMARY;

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
    this._resetAllEvents();

    this._eventEditComponent = new EventEditView(this._event);

    this._closeEventByEsc = new EscHandler(this._closeEventEdit);
    this._eventEditComponent.closeHandler = this._closeEventEdit;
    this._eventEditComponent.submitHandler = this._submitForm;
    this._eventEditComponent.toggleFavoriteHandler = this._toggleFavorite;
    this._mode = Mode.EDITING;

    return this._eventEditComponent.element;
  }

  /**
   * Обработчик закрытия формы регистрации. При закрытии также снимает
   * обработчик нажатия на Esc.
   *
   * @return {void}
   */
  _closeEventEdit() {
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
  _toggleFavorite() {
    this._event = Object.assign({}, this._event,
        {
          isFavorite: !this._event.isFavorite
        }
    );
    this._updateEventData(Object.assign({}, this._event), false);
  }

  /**
   * Cохранение данных формы
   *
   * @param  {Object} eventData - Данные формы для сохранения
   * @return {void}
   */
  _submitForm(eventData) {
    this._closeEventEdit();
    this._updateEventData(Object.assign({}, this._event,
        {
          type: eventData.type,
          city: eventData.city,
          price: parseInt(eventData.price, 10),
          offers: eventData.offers
        }
    ));
  }
}
