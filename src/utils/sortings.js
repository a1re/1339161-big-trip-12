export const sortings = [
  {id: `event`, title: `Event`, isGrouped: true, isDefault: true, callback: (eventA, eventB) => {
    return eventA.beginTime.valueOf() - eventB.beginTime.valueOf();
  }},
  {id: `time`, title: `Time`, isGrouped: false, isDefault: false, callback: (eventA, eventB) => {
    const durationA = eventA.endTime.valueOf() - eventA.beginTime.valueOf();
    const durationB = eventB.endTime.valueOf() - eventB.beginTime.valueOf();
    return durationB - durationA;
  }},
  {id: `price`, title: `Price`, isGrouped: false, isDefault: false, callback: (eventA, eventB) => {
    return eventB.price - eventA.price;
  }}
];
