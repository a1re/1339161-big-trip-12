import {getRandomInt} from "../utils/common.js";

const titles = [
  `Add luggage`, `Comfort class`, `Add meal`,
  `Choose seats`, `Travel by train`, `Add breakfast`,
  `Book tickets`, `Lunch in the city`
];

const getRandomOffers = () => {
  const randomTitles = titles.slice().sort(() => Math.random() - 0.5);
  const randomAmount = getRandomInt(0, randomTitles.length);
  const randomOffers = [];

  for (let i = 0; i < randomAmount; i++) {
    randomOffers.push({
      title: randomTitles[i],
      price: getRandomInt(5, 100)
    });
  }

  return randomOffers;
};

export const generateOffers = (typeList) => {
  const offers = [];
  typeList.forEach((type) => {
    offers.push({type: type.id, offers: getRandomOffers()});
  });
  return offers;
};


