import {EventSummaryView} from "../view/event-summary-view.js";
import {EventEditView} from "../view/event-edit-view.js";

import {render, RenderPosition} from "../utils/render.js";
import {EscHandler} from "../utils/common.js";

export class EventPresenter {
  constructor(eventListContainer, event) {
    this._eventListContainer = eventListContainer;
    this._event = event;

    this._eventSummaryComponent = null;
    this._eventEditComponent = null;

    render(
        this._eventListContainer,
        this._createEventSummaryElement(event),
        RenderPosition.BEFOREEND
    );
  }

  /**
   * Создание шаблона отображения сводки о событии для демонстрации в общем
   * списке. Вместе с шаблоном создается также и обработчик открытия события
   * (замена шаблона сводки формой редактирования).
   *
   * @param  {Object} event   - Объект с данными события.
   * @return {Node}           - Шаблон в виде DOM-элемента для размещения.
   */
  _createEventSummaryElement(event) {
    if (this._eventSummaryComponent === null) {
      this._eventSummaryComponent = new EventSummaryView(event);
    }

    this._eventSummaryComponent.openHandler = () => {
      this._eventListContainer.replaceChild(
          this._createEventEditElement(event),
          this._eventSummaryComponent.element
      );
      this._eventSummaryComponent.remove();
    };

    return this._eventSummaryComponent.element;
  }

  /**
   * Создание формы редактрирования события в общем списке. Вместе с формой
   * создаются также обработчики закрытия формы (замена формы шаблономм
   * сводки) и сохранения данных.
   *
   * @param  {Object} event   - Объект с данными события.
   * @return {Node}           - Шаблон в виде DOM-элемента для размещения.
   */
  _createEventEditElement(event) {
    if (this._eventEditComponent === null) {
      this._eventEditComponent = new EventEditView(event);
    }

    const closeEventEdit = () => {
      this._eventListContainer.replaceChild(
          this._createEventSummaryElement(event),
          this._eventEditComponent.element
      );
      this._eventEditComponent.remove();
      closeEventByEsc.unbind();
    };

    const closeEventByEsc = new EscHandler(closeEventEdit);
    this._eventEditComponent.closeHandler = closeEventEdit;
    this._eventEditComponent.submitHandler = closeEventEdit;

    return this._eventEditComponent.element;
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
