import EventSummaryView from "../view/event-summary-view.js";
import EventEditView from "../view/event-edit-view.js";

import {render, RenderPosition} from "../utils/render.js";
import {EscHandler} from "../utils/common.js";
import {UpdateMode, EventMode} from "../const.js";

export default class EventPresenter {
  /**
   * Конструктор презентера. Заведение экземпляров отображений и установка
   * ключевого узла DOM для рендеринга компонентов.
   *
   * @param  {Node} eventListContainer      - Контейнер для вставки события
   * @param  {Object} eventData             - Объект с данными события
   * @param  {Observer} eventsModel         - Модель для работы с событиями.
   * @param  {Observer} offersModel         - Модель для работы с спец. предложениями.
   * @param  {Function} switchAllEventsMode - Метод переключючения режима всех
   *                                          событий маршрута.
   */
  constructor(eventListContainer, eventData, eventsModel, offersModel, switchAllEventsMode) {
    this._eventListContainer = eventListContainer;
    this._event = eventData;
    this._eventsModel = eventsModel;
    this._offersModel = offersModel;
    this._switchAllEventsMode = switchAllEventsMode;

    this._mode = EventMode.SUMMARY;

    this._eventSummaryComponent = null;
    this._eventEditComponent = null;
    this._closeEventByEsc = null;

    this._toggleFavorite = this._toggleFavorite.bind(this);
    this._closeEventEdit = this._closeEventEdit.bind(this);
    this._submitForm = this._submitForm.bind(this);

    render(
        this._eventListContainer,
        this._createElement(EventMode.SUMMARY),
        RenderPosition.BEFOREEND
    );
  }

  /**
   * Перерисовка карточки с новыми данными.
   *
   * @param  {Object} eventData - Объект с новыми данными.
   */
  refresh(eventData) {
    this._event = eventData;

    if (this._mode === EventMode.SUMMARY) {
      const previousEventSummaryComponent = this._eventSummaryComponent;
      this._eventListContainer.replaceChild(
          this._createElement(EventMode.SUMMARY),
          previousEventSummaryComponent.element
      );
      previousEventSummaryComponent.remove();
    }

    if (this._mode === EventMode.EDITING) {
      if (this._closeEventByEsc) {
        this._closeEventByEsc.unbind();
        this._closeEventByEsc = null;
      }
      const previousEventEditComponent = this._eventEditComponent;
      this._eventListContainer.replaceChild(
          this._createElement(EventMode.EDITING),
          previousEventEditComponent.element
      );
      previousEventEditComponent.remove();
    }
  }

  /**
   * Переключает событие в нужный режим (должен соответствовать одному
   * из значений перечисления EventMode).
   *
   * @param  {String} eventMode - Режим отображения.
   */
  switchMode(eventMode) {
    if (this._mode !== eventMode) {
      const currentComponent = (this._mode === EventMode.EDITING)
        ? this._eventEditComponent.element
        : this._eventSummaryComponent.element;

      this._eventListContainer.replaceChild(
          this._createElement(eventMode),
          currentComponent
      );
    }
  }

  /**
   * Удаление события с обеими формами представления (сводки и редактрирования).
   */
  destroy() {
    if (this._mode === EventMode.EDITING) {
      this._eventEditComponent.remove();
    }
    if (this._mode === EventMode.SUMMARY) {
      this._eventSummaryComponent.remove();
    }
  }

  /**
   * Создание отображения о событии в соответствии с текущим режимом (должен
   * соответствовать одному из значений перечисления EventMode).
   *
   *  Вместе с отображением создается также и обработчики открытия/закрытия
   *  формы редактирования.
   *
   * @param  {String} eventMode - Режим отображения.
   * @return {Node}             - Шаблон в виде DOM-элемента для размещения.
   */
  _createElement(eventMode) {
    if (eventMode === EventMode.EDITING) {
      this._switchAllEventsMode(EventMode.SUMMARY);

      this._eventEditComponent = new EventEditView(
          this._event,
          this._offersModel.getList()
      );

      this._closeEventByEsc = new EscHandler(this._closeEventEdit);
      this._eventEditComponent.closeHandler = this._closeEventEdit;
      this._eventEditComponent.submitHandler = this._submitForm;
      this._eventEditComponent.toggleFavoriteHandler = this._toggleFavorite;
      this._mode = EventMode.EDITING;

      return this._eventEditComponent.element;
    }


    // По умочанию — режим EventMode.SUMMARY
    this._eventSummaryComponent = new EventSummaryView(
        this._event,
        this._offersModel.getList(this._event.isTransport)
    );

    this._eventSummaryComponent.openHandler = () => {
      this._eventListContainer.replaceChild(
          this._createElement(EventMode.EDITING),
          this._eventSummaryComponent.element
      );
      this._eventSummaryComponent.remove();
    };

    this._mode = EventMode.SUMMARY;

    return this._eventSummaryComponent.element;
  }

  /**
   * Обработчик закрытия формы регистрации. При закрытии также снимает
   * обработчик нажатия на Esc.
   */
  _closeEventEdit() {
    this._eventListContainer.replaceChild(
        this._createElement(EventMode.SUMMARY),
        this._eventEditComponent.element
    );
    this._eventEditComponent.remove();
    this._closeEventByEsc.unbind();
    this._closeEventByEsc = null;
  }

  /**
   * Обработчик нажатия на кнопку «Добавить в избранное».
   */
  _toggleFavorite() {
    this._event = Object.assign({}, this._event,
        {
          isFavorite: !this._event.isFavorite
        }
    );

    this._eventsModel.update(UpdateMode.PATCH, Object.assign({}, this._event));
  }

  /**
   * Cохранение данных формы
   *
   * @param  {Object} eventData - Данные формы для сохранения.
   */
  _submitForm(eventData) {
    this._closeEventEdit();

    this._eventsModel.update(UpdateMode.MINOR, Object.assign({}, this._event,
        {
          type: eventData.type,
          city: eventData.city,
          beginTime: eventData.beginTime,
          endTime: eventData.endTime,
          price: parseInt(eventData.price, 10),
          offers: eventData.offers
        }
    ));
  }
}
