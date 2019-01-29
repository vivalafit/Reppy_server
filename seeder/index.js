const models = require('../models');

const SEED = {
    Location: [
        {city: 'Киев', country: 'Украина'},
        {city: 'Харьков', country: 'Украина'},
        {city: 'Львов', country: 'Украина'},
        {city: 'Одесса', country: 'Украина'}
    ],
  User: [
    {name: 'Иван', lastName: 'Петров', email: 'user1@test.com', tel: '380991234567', password: 'password123',
        avatar: [{
            "mimetype": "image/png",
            "encoding": "7bit",
            "destination": "./avatars/",
            "filename": "avatar-1539299747248.jpg",
            "fieldname": "avatar",
            "originalname": "screen-01.51.14[10.10.2018].png",
            "path": "avatars\\avatar-1539299747248.jpg",
            "size": 209211
        }],
     checked: true, active: true, rating: 85, locationId: '2'},
    {name: 'Николай', lastName: 'Васильев', email: 'user2@test.com', tel: '380668901234', password: 'password123',
        avatar: [{
            "mimetype": "image/png",
            "encoding": "7bit",
            "destination": "./avatars/",
            "filename": "avatar-1539299747248.jpg",
            "fieldname": "avatar",
            "originalname": "screen-01.51.14[10.10.2018].png",
            "path": "avatars\\avatar-1539299747248.jpg",
            "size": 209211
        }],
     checked: true, active: true, rating: 73, locationId: '4'},
    {name: 'Денис', lastName: 'Шевченко', email: 'user3@test.com', tel: '380668901233', password: 'password123',
        avatar: [{
            "mimetype": "image/png",
            "encoding": "7bit",
            "destination": "./avatars/",
            "filename": "avatar-1539299747248.jpg",
            "fieldname": "avatar",
            "originalname": "screen-01.51.14[10.10.2018].png",
            "path": "avatars\\avatar-1539299747248.jpg",
            "size": 209211
        }],
     checked: true, active: true, rating: 65, locationId: '3'},
    {name: 'Дмитрий', lastName: 'Сковорода', email: 'user4@test.com', tel: '380668901232', password: 'password123',
        avatar: [{
            "mimetype": "image/png",
            "encoding": "7bit",
            "destination": "./avatars/",
            "filename": "avatar-1539299747248.jpg",
            "fieldname": "avatar",
            "originalname": "screen-01.51.14[10.10.2018].png",
            "path": "avatars\\avatar-1539299747248.jpg",
            "size": 209211
        }],
     checked: true, active: true, rating: 91, locationId: '1'},
    {name: 'Владислав', lastName: 'Кулиш', email: 'user5@test.com', tel: '380668901231', password: 'password123',
        avatar: [{
            "mimetype": "image/png",
            "encoding": "7bit",
            "destination": "./avatars/",
            "filename": "avatar-1539299747248.jpg",
            "fieldname": "avatar",
            "originalname": "screen-01.51.14[10.10.2018].png",
            "path": "avatars\\avatar-1539299747248.jpg",
            "size": 209211
        }],
     checked: true, active: true, rating: 56, locationId: '3'}
  ],
  Category: [
      {title: 'Бетонные работы', description: 'Заливка бетоном пола, выливание конструкций'},
      {title: 'Земляные работы', description: 'Перекопка, выкопка ям'},
      {title: 'Бурение скважин', description: 'Бурение скважин от 20м'},
      {title: 'Сварочные работы', description: 'Сварка любого типа и сложности'},
      {title: 'Строительство гаража', description: 'Строительство гаража для любых нужд'},
      {title: 'Сантехнические работы', description: 'Замена труб, проведение нового трубопровода и т.д.'},
      {title: 'Укладка плитки', description: 'Укладка плитка в квартире, частном доме, на улице'},
      {title: 'Установка электропроводки', description: 'Проводка, розетки, счетчики'},
      {title: 'Установка дверей и окон', description: 'Установка в квартирах, частных домах, погребах, жилых домах'},
  ],
  UserCategory: [
      {categoryId: '1', userId: '1'},
      {categoryId: '2', userId: '2'},
      {categoryId: '3', userId: '3'},
      {categoryId: '4', userId: '4'},
      {categoryId: '5', userId: '5'},
      {categoryId: '6', userId: '1'},
      {categoryId: '7', userId: '2'},
      {categoryId: '8', userId: '3'},
      {categoryId: '9', userId: '4'},
      {categoryId: '1', userId: '5'}
  ],
  Post: [
      {title: 'Залить бетоном пол', description: 'Залить пол на первом этаже, 100м2', price: '10000',
       attachments: '', status: 'open', customerId: '1', locationId: '4', address: 'Kyiv, obolon', startingDate: '2018-12-31 23:59:59'},
      {title: 'Пробурить скважину на 100м', description: 'Пробурить скважину в частном доме', price: '15000',
       attachments: '', status: 'open', customerId: '1', locationId: '3', address: 'Kyiv, obolon', startingDate: '2018-12-31 23:59:59'},
      {title: 'Перекопать огород', description: 'Помочь бабушке с перекопкой огорода', price: '1000',
       attachments: '', status: 'open', customerId: '1', locationId: '2', address: 'Kyiv, obolon', startingDate: '2018-12-31 23:59:59'},
      {title: 'Построить гараж', description: 'Гараж с ямой для ремонта собственного авто', price: '30000',
       attachments: '', status: 'in work', customerId: '1', executorId: '2', locationId: '1', address: 'Kyiv, obolon', startingDate: '2018-12-31 23:59:59'},
      {title: 'Сварить систему выхлопа', description: 'Сварить паука для ЗАЗ-968М', price: '2000',
       attachments: '', status: 'in work', customerId: '1', executorId: '2', locationId: '2', address: 'Kyiv, obolon', startingDate: '2018-12-31 23:59:59'},
      {title: 'Скважина для питьевой воды', description: 'Нужна скважина с питьевой водой', price: '13000',
       attachments: '', status: 'in work', customerId: '1', executorId: '2', locationId: '3', address: 'Kyiv, obolon', startingDate: '2018-12-31 23:59:59'},
      {title: 'Выкопать погреб в гараже', description: 'Гараж в Киеве, нужно выкопать погреб', price: '5000',
       attachments: '', status: 'completed', customerId: '1', executorId: '2', locationId: '4', address: 'Kyiv, obolon', startingDate: '2018-12-31 23:59:59'},
      {title: 'Сварить трубы', description: 'Приварить две трубы', price: '900',
       attachments: '', status: 'completed', customerId: '1', executorId: '2', locationId: '1', address: 'Kyiv, obolon', startingDate: '2018-12-31 23:59:59'},
      {title: 'Вылить бетонный каркас', description: 'Нужно вылить из бетона каркас маленькой лестницы', price: '8000',
       attachments: '', status: 'completed', customerId: '1', executorId: '2', locationId: '3', address: 'Kyiv, obolon', startingDate: '2018-12-31 23:59:59'},
      {title: 'Починить кран', description: 'Протекает кран в квартире', price: '200',
       attachments: '', status: 'open', customerId: '3', locationId: '1', address: 'Kyiv, obolon', startingDate: '2018-12-31 23:59:59'},
      {title: 'Положить плитку на кухне', description: 'Кухня в частном доме, 20м2', price: '1000',
       attachments: '', status: 'open', customerId: '4', locationId: '2', address: 'Kyiv, obolon', startingDate: '2018-12-31 23:59:59'},
      {title: 'Поставить 5 розеток', description: 'Сделать проводку и поставить розетке в комнате', price: '600',
       attachments: '', status: 'open', customerId: '5', locationId: '3', address: 'Kyiv, obolon', startingDate: '2018-12-31 23:59:59'},
      {title: 'Поменять стеклопакеты', description: '10 окон в квартире, с двойного на тройной стеклопакеты', price: '5000',
       attachments: '', status: 'open', customerId: '3', locationId: '4', address: 'Kyiv, obolon', startingDate: '2018-12-31 23:59:59'}
  ],
  PostCategory: [
      {categoryId: '1', postId: '1'},
      {categoryId: '3', postId: '2'},
      {categoryId: '2', postId: '3'},
      {categoryId: '5', postId: '4'},
      {categoryId: '4', postId: '5'},
      {categoryId: '3', postId: '6'},
      {categoryId: '5', postId: '7'},
      {categoryId: '4', postId: '8'},
      {categoryId: '1', postId: '9'},
      {categoryId: '6', postId: '10'},
      {categoryId: '7', postId: '11'},
      {categoryId: '8', postId: '12'},
      {categoryId: '9', postId: '13'},
  ],
  Request: [
      {comment: 'Занимаю заливкой бетона более 10 лет', postId: '1', userId: '2'},
      {comment: 'Приезжаю на место, даю свои рекомендации', postId: '2', userId: '2'},
      {comment: 'Часто помогаю своей бабушке, по этому сделаю все в лучшем виде', postId: '3', userId: '2'}
  ],
  Review: [
      {comment: 'Работа выполнена отлично', positive: true, postId: '7', userId: '2'},
      {comment: 'Сделано все быстро и качественно', positive: true, postId: '8', userId: '2'},
      {comment: 'Каркас выглядит идеально', positive: true, postId: '9', userId: '2'}
  ],
  Faq: [
      {question: 'Где я нахожусь?', answer: 'Вы попали на Reppy - портал услуг по ремонту и строительству. Здесь найдётся всё, что было так трудно и долго искать ранее!'},
      {question: 'Сколько областей охватывает Reppy?', answer: '22 области. Неподвластна временно оккупируемая территория Украины (АР Крым, Донецкая и Луганская области).'},
      {question: 'Как работает Reppy для заказчика и исполнителя?', answer: 'С помощью портала клиенты и работники регистрируют аккаунты и создают объявления на досках объявлений для поиска друг друга по определённым критериям.'},
      {question: 'Что можно размещать на доске объявлений?', answer: 'Заказчик создаёт заявку с максимально изложенными деталями об объекте и нуждающихся специалистах. Исполнитель размещает заявку с перечнем работ, которые может выполнить.'},
      {question: 'Я заинтересовался специалистом. Как связаться?', answer: 'Связь с требуемым специалистом происходит по звонку, а в дальнейшем будет расширена до обмена сообщениями.'}
  ]
};

module.exports = () => {
  let modelsPromise = new Promise(resolve => resolve());

  for(let modelName in SEED){
    modelsPromise = modelsPromise.then(() => models[modelName].count()
      .then(c => {
        let recordsPromise = new Promise(resolve => resolve());
        if(c == 0) {
          let modelRecords = SEED[modelName];
          for(let index in modelRecords){
            let modelRecord = modelRecords[index];
            recordsPromise = recordsPromise.then(
              () => models[modelName].create(modelRecord)
            );
          }
        }
        return recordsPromise;
      }));
  }

  return modelsPromise;
};
