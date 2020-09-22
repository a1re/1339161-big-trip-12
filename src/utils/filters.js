import moment from "moment";

export const filters = [
  {id: `everything`, title: `Everything`, isDefault: true, callback: () => true},
  {id: `future`, title: `Future`, isDefault: false, callback: (event) => moment() < moment(event.beginTime)},
  {id: `past`, title: `Past`, isDefault: false, callback: (event) => moment() > moment(event.beginTime)}
];
