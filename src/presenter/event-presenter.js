import EventSummaryView from "../view/event-summary-view.js";
import EventFormView from "../view/event-form-view.js";

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
   * @param  {Object} destinationsModel     - Модель для работы с городами.
   * @param  {Object} typesModel            - Модель для работы с типами событий.
   * @param  {Object} offersModel           - Модель для работы с спец. предложениями.
   * @param  {Function} switchAllEventsMode - Метод переключючения режима всех
   *                                          событий маршрута.
   */
  constructor(eventListContainer, eventData, eventsModel, destinationsModel, typesModel, offersModel, switchAllEventsMode) {
    this._eventListContainer = eventListContainer;
    this._event = eventData;

    this._eventsModel = eventsModel;
    this._destinationsModel = destinationsModel;
    this._typesModel = typesModel;
    this._offersModel = offersModel;
    this._switchAllEventsMode = switchAllEventsMode;

    this._mode = EventMode.SUMMARY;

    this._eventSummaryComponent = null;
    this._eventFormComponent = null;
    this._closeFormByEsc = null;

    this._toggleFavorite = this._toggleFavorite.bind(this);
    this._closeEventForm = this._closeEventForm.bind(this);
    this._submitForm = this._submitForm.bind(this);
    this._delete = this._delete.bind(this);

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
      if (this._closeFormByEsc) {
        this._closeFormByEsc.unbind();
        this._closeFormByEsc = null;
      }
      const previousEventFormComponent = this._eventFormComponent;
      this._eventListContainer.replaceChild(
          this._createElement(EventMode.EDITING),
          previousEventFormComponent.element
      );
      previousEventFormComponent.remove();
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
      if (this._mode === EventMode.EDITING) {
        this._closeEventForm();
      } else {
        this._eventListContainer.replaceChild(
            this._createElement(eventMode),
            this._eventSummaryComponent.element
        );
      }
    }
  }

  /**
   * Удаление события с обеими формами представления (сводки и редактрирования).
   */
  destroy() {
    if (this._mode === EventMode.EDITING) {
      this._eventFormComponent.remove();
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
      this._eventFormComponent = new EventFormView(
          this._typesModel.getList(),
          this._offersModel.getList(),
          this._destinationsModel.getList(),
          this._event
      );

      this._closeFormByEsc = new EscHandler(this._closeEventForm);
      this._eventFormComponent.closeHandler = this._closeEventForm;
      this._eventFormComponent.submitHandler = this._submitForm;
      this._eventFormComponent.deleteHandler = this._delete;
      this._eventFormComponent.toggleFavoriteHandler = this._toggleFavorite;
      this._mode = EventMode.EDITING;

      return this._eventFormComponent.element;
    }

    // По умочанию — режим EventMode.SUMMARY
    this._eventSummaryComponent = new EventSummaryView(
        this._typesModel.getById(this._event.type),
        this._event
    );

    this._eventSummaryComponent.openHandler = () => {
      this._switchAllEventsMode(EventMode.SUMMARY);

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
  _closeEventForm() {
    this._eventListContainer.replaceChild(
        this._createElement(EventMode.SUMMARY),
        this._eventFormComponent.element
    );
    this._eventFormComponent.remove();
    this._closeFormByEsc.unbind();
    this._closeFormByEsc = null;
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
    this._closeEventForm();

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

  /**
   * Удаение события.
   */
  _delete() {
    this._closeEventForm();

    this._eventsModel.delete(UpdateMode.MINOR, this._event);
  }
}
