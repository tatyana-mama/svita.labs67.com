// ═══════════════ DATA STORE ═══════════════
const DB={
  pickedServices:{},
  pickedRooms:{},
  pickedContractors:{},
  pickedEquip:{},
  pickedStaff:{},
  pickedRenovations:{},
  pickedDocs:{},
  renovations:[
    // ⚡ Электрика
    {id:'e1',name:'Расширение мощности',cat:'Электрика',price:8000},
    {id:'e2',name:'Электрощит 380В',cat:'Электрика',price:4500},
    {id:'e2b',name:'Автоматы и УЗО',cat:'Электрика',price:3200},
    {id:'e3',name:'Кабельные трассы',cat:'Электрика',price:22000},
    {id:'e3b',name:'Разводка по кабинетам',cat:'Электрика',price:14000},
    {id:'e4',name:'Линия электропитания рентген-кабинета',cat:'Электрика',price:4500},
    {id:'e4b',name:'Линия электропитания стерилизаторной',cat:'Электрика',price:3000},
    {id:'e5',name:'Освещение кабинетов',cat:'Электрика',price:18000},
    {id:'e5b',name:'Освещение общих зон',cat:'Электрика',price:8000},
    {id:'e5c',name:'Аварийное освещение',cat:'Электрика',price:4500},
    {id:'e5d',name:'Вывеска световая (электрика)',cat:'Электрика',price:3000},
    {id:'e6',name:'Умный дом Aqara — хабы и контроллеры',cat:'Электрика',price:3500},
    {id:'e6b',name:'Умный дом Aqara — умные розетки',cat:'Электрика',price:2800},
    {id:'e6c',name:'Умный дом Aqara — датчики (движение, дверь, t°)',cat:'Электрика',price:4200},
    {id:'e6d',name:'Умный дом Aqara — Wi-Fi модули',cat:'Электрика',price:3560},
    {id:'e7',name:'Заземление медицинское',cat:'Электрика',price:4500},
    {id:'e8',name:'UPS серверная',cat:'Электрика',price:3500},
    {id:'e8b',name:'UPS рентген-кабинет',cat:'Электрика',price:2500},
    // 🔧 Водоснабжение и канализация
    {id:'w1',name:'Разводка холодного водоснабжения (ХВС)',cat:'Водоснабжение и канализация',price:6000},
    {id:'w1b',name:'Разводка горячего водоснабжения (ГВС)',cat:'Водоснабжение и канализация',price:5500},
    {id:'w1c',name:'Бойлер',cat:'Водоснабжение и канализация',price:6000},
    {id:'w2',name:'Фильтрация воды',cat:'Водоснабжение и канализация',price:2500},
    {id:'w2b',name:'Обратный осмос',cat:'Водоснабжение и канализация',price:2000},
    {id:'w3',name:'Канализация стоматологических кресел',cat:'Водоснабжение и канализация',price:5000},
    {id:'w3b',name:'Канализация стерилизаторной',cat:'Водоснабжение и канализация',price:3500},
    {id:'w3c',name:'Канализация санузлов',cat:'Водоснабжение и канализация',price:3500},
    {id:'w4',name:'Сепаратор амальгамы (NFZ)',cat:'Водоснабжение и канализация',price:4500},
    {id:'w5',name:'Компрессорная станция стоматологическая',cat:'Водоснабжение и канализация',price:8000},
    // 🌀 Вентиляция и кондиционирование
    {id:'v1',name:'Проект вентиляции',cat:'Вентиляция и кондиционирование',price:5000},
    {id:'v1b',name:'Приточная установка с рекуператором',cat:'Вентиляция и кондиционирование',price:18000},
    {id:'v2',name:'Вытяжная система',cat:'Вентиляция и кондиционирование',price:6000},
    {id:'v2b',name:'Воздуховоды и диффузоры',cat:'Вентиляция и кондиционирование',price:8000},
    {id:'v3',name:'Мульти-сплит кондиционирование',cat:'Вентиляция и кондиционирование',price:28000},
    {id:'v3b',name:'Кондиционирование серверной',cat:'Вентиляция и кондиционирование',price:3500},
    {id:'v4',name:'Вентиляция стерилизаторной (принудительная)',cat:'Вентиляция и кондиционирование',price:3500},
    // 📹 Видеонаблюдение и безопасность
    {id:'sec1',name:'Камеры видеонаблюдения',cat:'Видеонаблюдение и безопасность',price:12000},
    {id:'sec1b',name:'Сервер видеонаблюдения (NVR)',cat:'Видеонаблюдение и безопасность',price:6200},
    {id:'sec2',name:'Охранная сигнализация',cat:'Видеонаблюдение и безопасность',price:5000},
    {id:'sec2b',name:'Пожарная сигнализация',cat:'Видеонаблюдение и безопасность',price:4000},
    {id:'sec3',name:'Контроль доступа (двери)',cat:'Видеонаблюдение и безопасность',price:4500},
    {id:'sec4',name:'Домофон + электрозамок входной',cat:'Видеонаблюдение и безопасность',price:2800},
    // 🏗 Отделка и строительные работы
    {id:'f1',name:'Демонтаж старой отделки',cat:'Отделка и строительные работы',price:12000},
    {id:'f2',name:'Стяжка пола',cat:'Отделка и строительные работы',price:14000},
    {id:'f2b',name:'Гидроизоляция',cat:'Отделка и строительные работы',price:4000},
    {id:'f3',name:'Напольное покрытие (медицинский линолеум)',cat:'Отделка и строительные работы',price:22000},
    {id:'f4',name:'Штукатурка стен',cat:'Отделка и строительные работы',price:8000},
    {id:'f4b',name:'Покраска стен (антибактериальная)',cat:'Отделка и строительные работы',price:8000},
    {id:'f5',name:'Потолки подвесные',cat:'Отделка и строительные работы',price:14000},
    {id:'f6',name:'Перегородки / зонирование (гипсокартон)',cat:'Отделка и строительные работы',price:15000},
    {id:'f7',name:'Плитка санузлы',cat:'Отделка и строительные работы',price:5500},
    {id:'f7b',name:'Плитка стерилизаторная',cat:'Отделка и строительные работы',price:3000},
    // 🚪 Двери, окна, фасад
    {id:'d1',name:'Входная дверь',cat:'Двери, окна, фасад',price:5000},
    {id:'d1b',name:'Тамбур входной',cat:'Двери, окна, фасад',price:4000},
    {id:'d1c',name:'Вывеска входная',cat:'Двери, окна, фасад',price:3000},
    {id:'d2',name:'Двери межкомнатные медицинские',cat:'Двери, окна, фасад',price:21000},
    {id:'d3',name:'Дверь рентген-кабинета (свинцовая защита)',cat:'Двери, окна, фасад',price:8000},
    {id:'d4',name:'Окна (замена/тонировка)',cat:'Двери, окна, фасад',price:9000},
    // 🖧 IT-инфраструктура
    {id:'i1',name:'Витая пара Cat6a (прокладка)',cat:'IT-инфраструктура',price:6000},
    {id:'i1b',name:'Патч-панель + коммутатор',cat:'IT-инфраструктура',price:6000},
    {id:'i2',name:'Wi-Fi 6E точки доступа',cat:'IT-инфраструктура',price:5000},
    {id:'i3',name:'NAS + настройка RAID',cat:'IT-инфраструктура',price:8500},
    {id:'i4',name:'Монтаж серверного шкафа 19"',cat:'IT-инфраструктура',price:3500},
    // 🏥 Медицинские коммуникации
    {id:'m1',name:'Подводка сжатого воздуха к креслам',cat:'Медицинские коммуникации',price:7000},
    {id:'m2',name:'Вакуумная (аспирационная) система',cat:'Медицинские коммуникации',price:15000},
    {id:'m3',name:'Рентгензащита стен (баритовая штукатурка / свинец)',cat:'Медицинские коммуникации',price:9000},
    {id:'m4',name:'Трубопровод для дистиллированной воды',cat:'Медицинские коммуникации',price:4000},
    // 🪑 Мебель и встроенные конструкции
    {id:'mb1',name:'Стойка ресепшен',cat:'Мебель и встроенные конструкции',price:5000},
    {id:'mb1b',name:'Рабочее место администратора',cat:'Мебель и встроенные конструкции',price:3000},
    {id:'mb2',name:'Шкафы медицинские для кабинетов',cat:'Мебель и встроенные конструкции',price:14000},
    {id:'mb3',name:'Диваны зоны ожидания',cat:'Мебель и встроенные конструкции',price:5000},
    {id:'mb3b',name:'Столики и стеллажи зоны ожидания',cat:'Мебель и встроенные конструкции',price:4000},
    {id:'mb4',name:'Столы врачебные',cat:'Мебель и встроенные конструкции',price:7000},
    {id:'mb4b',name:'Тумбы медицинские',cat:'Мебель и встроенные конструкции',price:3500},
    {id:'mb5',name:'Шкафчики для персонала (гардероб)',cat:'Мебель и встроенные конструкции',price:4000},
    {id:'mb6',name:'Детская зона (мебель + декор)',cat:'Мебель и встроенные конструкции',price:5000},
    // 🧹 Уборка и санитария
    {id:'sn1',name:'Санитарное оборудование (санузлы пациентов)',cat:'Уборка и санитария',price:6000},
    {id:'sn2',name:'Санузел для маломобильных (по нормативу)',cat:'Уборка и санитария',price:8000},
    {id:'sn3',name:'Санузлы персонала',cat:'Уборка и санитария',price:4500},
    {id:'sn4',name:'Раковины хирургические (локтевой кран)',cat:'Уборка и санитария',price:4500},
    {id:'sn5',name:'Диспенсеры, сушилки, дозаторы',cat:'Уборка и санитария',price:2500},
    // 🔊 Вывеска и навигация
    {id:'sg1',name:'Вывеска фасадная световая',cat:'Вывеска и навигация',price:8000},
    {id:'sg2',name:'Таблички кабинетов',cat:'Вывеска и навигация',price:2000},
    {id:'sg2b',name:'Указатели навигации',cat:'Вывеска и навигация',price:1500},
    {id:'sg3',name:'Информационные стенды (лицензии, прайс)',cat:'Вывеска и навигация',price:2000},
    {id:'sg4',name:'Брендинг интерьера (логотипы, плёнка на стёкла)',cat:'Вывеска и навигация',price:5000},
    // ♿ Доступность
    {id:'ac1',name:'Пандус / подъёмник входной',cat:'Доступность',price:7000},
    {id:'ac2',name:'Расширение дверных проёмов (для колясок)',cat:'Доступность',price:4000},
    {id:'ac3',name:'Тактильная плитка',cat:'Доступность',price:1500},
    {id:'ac3b',name:'Поручни',cat:'Доступность',price:1500},
    {id:'ac4',name:'Кнопка вызова персонала (входная)',cat:'Доступность',price:1500},
    // 🔥 Противопожарная безопасность
    {id:'fp1',name:'Огнезащитная обработка конструкций',cat:'Противопожарная безопасность',price:5000},
    {id:'fp2',name:'Система оповещения и эвакуации',cat:'Противопожарная безопасность',price:6000},
    {id:'fp3',name:'Огнетушители',cat:'Противопожарная безопасность',price:1500},
    {id:'fp3b',name:'Шкафы пожарные',cat:'Противопожарная безопасность',price:1000},
    {id:'fp4',name:'План эвакуации (изготовление + монтаж)',cat:'Противопожарная безопасность',price:1500}
  ],
  zones:[
    {id:'medical',name:'Медицинская',color:'var(--gn)',icon:'🏥'},
    {id:'public',name:'Общественная',color:'var(--ac)',icon:'🏛️'},
    {id:'technical',name:'Техническая',color:'var(--yl)',icon:'⚙️'},
    {id:'service',name:'Служебная',color:'#8b5cf6',icon:'🔒'}
  ],
  zonalities:{
    'Стоматологический':[
      {id:'work',name:'Рабочая зона',desc:'Установка + кресло пациента',icon:'🦷'},
      {id:'doctor-desk',name:'Зона врачебного стола',desc:'Документация, компьютер, снимки',icon:'🖥️'},
      {id:'sink',name:'Зона мойки',desc:'Раковина для мытья рук',icon:'🚿'},
      {id:'entrance',name:'Входная зона',desc:'Дверь, порог, коврик',icon:'🚪'},
      {id:'cabinets',name:'Зона вертикальных шкафов',desc:'Хранение материалов и инструментов',icon:'🗄️'},
      {id:'assistant-storage',name:'Зона хранения ассистента',desc:'Лотки, боксы, расходники ассистента',icon:'📦'},
      {id:'robot-vacuum',name:'Зона робота-пылесоса',desc:'Док-станция и зона движения',icon:'🤖'},
      {id:'xray',name:'Зона рентгена',desc:'Прицельный рентген-аппарат',icon:'📡'},
      {id:'patient-monitor',name:'Зона монитора пациента',desc:'Мониторинг состояния пациента',icon:'💓'},
      {id:'shadowless-lamp',name:'Зона бестеневой лампы',desc:'Операционный светильник',icon:'💡'},
      {id:'whitening-lamp',name:'Зона лампы отбеливания',desc:'Профессиональное отбеливание',icon:'✨'},
      {id:'cam-local',name:'Зона локальных камер',desc:'Внутриротовая / микроскоп камера',icon:'📹'},
      {id:'cam-cctv',name:'Зона камер видеонаблюдения',desc:'Общая камера безопасности',icon:'📷'},
      {id:'cleaning-storage',name:'Зона хранения уборочного инвентаря',desc:'Швабры, дез. средства, контейнеры',icon:'🧹'}
    ]
  },
  rolePlans:{
    owner:{icon:'🏠',name:'Владелец / Заказчик',currency:'PLN',
      trial:{price:0,days:14,label:'Триал 14 дней',features:['1 проект','Обзор этапов','Базовый бюджет','Экспорт PDF (водяной знак)']},
      paid:{price:299,period:'мес',label:'PRO',features:['До 5 проектов','Все 6 этапов','Бюджет + рентабельность','Типы кабинетов / зоны','Экспорт без ограничений','Приоритетная поддержка']},
      unlimited:{price:599,period:'мес',label:'UNLIMITED',features:['Безлимит проектов','Все функции PRO','Подрядчики и КП','Мультипользователи','API доступ','Персональный менеджер']}
    },
    contractor:{icon:'🔧',name:'Подрядчик',currency:'$',
      trial:{price:0,days:14,label:'Триал 14 дней',features:['1 профиль компании','До 5 заявок','1 концепция']},
      paid:{price:49,period:'мес',label:'PRO',features:['Безлимит заявок','Рейтинг и отзывы','Уведомления о тендерах','Портфолио проектов','Аналитика конверсий']},
      unlimited:{price:99,period:'мес',label:'UNLIMITED',features:['Все функции PRO','Приоритет в тендерах','Верифицированный бейдж','Мульти-филиалы','CRM интеграция','Выделенный аккаунт-менеджер']}
    },
    supplier:{icon:'📦',name:'Поставщик',currency:'$',
      trial:{price:0,days:14,label:'Триал 14 дней',features:['До 10 товаров','Базовый каталог','1 категория']},
      paid:{price:59,period:'мес',label:'PRO',features:['Безлимит товаров','Все категории','Интеграция со складом','Тендерные уведомления','Аналитика спроса']},
      unlimited:{price:119,period:'мес',label:'UNLIMITED',features:['Все функции PRO','Premium размещение','API каталога','Автоматические тендеры','Мульти-склад','Персональный менеджер']}
    },
    employee:{icon:'🧑',name:'Сотрудник',currency:'PLN',
      trial:{price:0,days:7,label:'Триал 7 дней',features:['Базовый профиль','Просмотр расписания']},
      paid:{price:49,period:'мес',label:'PRO',features:['Полный профиль','Сертификаты и документы','Расписание + уведомления','Личная статистика','Обучение / курсы']},
      unlimited:{price:99,period:'мес',label:'UNLIMITED',features:['Все функции PRO','Персональный dashboard','Карьерный трек','Менторство','Доступ к курсам','Приоритетная поддержка']}
    }
  },
  users:[
    {id:'USR-001',name:'Администратор',email:'admin@svita.app',role:'admin',plan:'admin',status:'Активен',created:'2026-03-15'},
    {id:'USR-002',name:'Демо-пользователь',email:'demo@svita.app',role:'owner',plan:'trial',status:'Активен',created:'2026-04-01'}
  ],
  cabinetTypes:[
    {id:1,name:'Стоматологический',icon:'🦷',desc:'Стандартный кабинет врача-стоматолога',minArea:12,equipCats:['Стоматологический кабинет — Установки','Стоматологический кабинет — Диагностика','Стоматологический кабинет — Мебель','Стоматологический кабинет — Прочее']},
    {id:2,name:'Хирургический',icon:'🔬',desc:'Имплантация, удаление, хирургические операции',minArea:18,equipCats:['Стоматологический кабинет — Установки','Стоматологический кабинет — Хирургия','Стоматологический кабинет — Мебель']},
    {id:3,name:'Ортодонтический',icon:'🔧',desc:'Брекеты, элайнеры, коррекция прикуса',minArea:12,equipCats:['Стоматологический кабинет — Установки','Стоматологический кабинет — Ортопедия','Стоматологический кабинет — Мебель']},
    {id:4,name:'Рентген',icon:'📡',desc:'Панорамный снимок, КЛКТ, прицельные',minArea:6,equipCats:['Стоматологический кабинет — Рентген']},
    {id:5,name:'Стерилизаторная',icon:'♨️',desc:'Обработка и стерилизация инструментов',minArea:8,equipCats:['Стерилизационная']},
    {id:6,name:'Ресепшен',icon:'🏛️',desc:'Приём, регистрация, ожидание',minArea:15,equipCats:[]},
    {id:7,name:'Серверная',icon:'🖥️',desc:'ИТ-инфраструктура, Jetson, NAS',minArea:4,equipCats:['Техническая комната']},
    {id:8,name:'Санузел',icon:'🚿',desc:'Санузлы для пациентов и персонала',minArea:3,equipCats:['Туалет']}
  ],
  rooms:[
    // Медицинская зона — кабинеты
    {id:1,name:'Кабинет терапии 1',type:'Стоматологический',w:4.2,h:2.9,l:3.8,area:15.96},
    {id:2,name:'Кабинет терапии 2',type:'Стоматологический',w:4.2,h:2.9,l:3.8,area:15.96},
    {id:3,name:'Кабинет терапии 3',type:'Стоматологический',w:4.0,h:2.9,l:3.5,area:14.0},
    {id:4,name:'Кабинет гигиены 1',type:'Стоматологический',w:4.0,h:2.9,l:3.5,area:14.0},
    {id:5,name:'Кабинет гигиены 2',type:'Стоматологический',w:3.8,h:2.9,l:3.5,area:13.3},
    {id:6,name:'Кабинет хирургии',type:'Хирургический',w:5.0,h:2.9,l:4.0,area:20.0},
    {id:7,name:'Кабинет ортодонтии',type:'Ортодонтический',w:4.0,h:2.9,l:3.5,area:14.0},
    {id:8,name:'Кабинет детской стоматологии',type:'Стоматологический',w:4.0,h:2.9,l:3.5,area:14.0},
    {id:9,name:'Кабинет ортопедии / протезирования',type:'Стоматологический',w:4.0,h:2.9,l:3.8,area:15.2},
    {id:10,name:'Кабинет эндодонтии',type:'Стоматологический',w:4.0,h:2.9,l:3.5,area:14.0},
    {id:11,name:'Кабинет отбеливания',type:'Стоматологический',w:3.5,h:2.9,l:3.0,area:10.5},
    // Диагностика
    {id:12,name:'Рентген-кабинет (КЛКТ)',type:'Рентген',w:3.5,h:2.9,l:3.0,area:10.5},
    {id:13,name:'Кабинет 3D-сканирования',type:'Рентген',w:2.5,h:2.9,l:2.5,area:6.25},
    // Техническая зона
    {id:14,name:'Стерилизаторная',type:'Техническая',w:3.5,h:2.9,l:2.5,area:8.75},
    {id:15,name:'Серверная / AI-центр (Jetson)',type:'Техническая',w:2.5,h:2.9,l:2.0,area:5.0},
    {id:16,name:'Зуботехническая лаборатория',type:'Техническая',w:3.0,h:2.9,l:2.5,area:7.5},
    {id:17,name:'Склад расходных материалов',type:'Техническая',w:2.5,h:2.9,l:2.0,area:5.0},
    // Общественная зона
    {id:18,name:'Ресепшен / Администраторская',type:'Общественная',w:6.0,h:2.9,l:4.0,area:24.0},
    {id:19,name:'Зал ожидания',type:'Общественная',w:5.0,h:2.9,l:3.0,area:15.0},
    {id:20,name:'Детская игровая зона',type:'Общественная',w:3.0,h:2.9,l:2.5,area:7.5},
    {id:21,name:'Коридор основной',type:'Общественная',w:12.0,h:2.9,l:1.8,area:21.6},
    {id:22,name:'Санузел (пациенты)',type:'Общественная',w:2.5,h:2.9,l:1.8,area:4.5},
    {id:23,name:'Санузел (маломобильные)',type:'Общественная',w:3.0,h:2.9,l:2.0,area:6.0},
    // Служебная зона
    {id:24,name:'Комната персонала',type:'Служебная',w:3.5,h:2.9,l:3.0,area:10.5},
    {id:25,name:'Кабинет главного врача',type:'Служебная',w:3.5,h:2.9,l:3.0,area:10.5},
    {id:26,name:'Санузел (персонал)',type:'Служебная',w:2.0,h:2.9,l:1.5,area:3.0},
    {id:27,name:'Подсобное / хоз. инвентарь',type:'Служебная',w:2.0,h:2.9,l:1.5,area:3.0},
    {id:28,name:'Гардероб персонала',type:'Служебная',w:2.5,h:2.9,l:2.0,area:5.0}
  ],
  contractors:[
    {id:1,name:'ElectroPolska',spec:'Электрика',city:'Быдгощ',price:'от 80 PLN/м',rating:4.8,phone:'+48 500 111 222'},
    {id:2,name:'AquaInstall',spec:'Водоснабжение',city:'Быдгощ',price:'от 100 PLN/м',rating:4.5,phone:'+48 500 333 444'},
    {id:3,name:'VentKlima',spec:'Вентиляция + кондиционирование',city:'Торунь',price:'от 120 PLN/м',rating:4.7,phone:'+48 500 555 666'}
  ],
  vendorCompanies:[
    {id:'v1',name:'DentPro.pl',desc:'Крупнейший дистрибьютор стоматологического оборудования в Польше',city:'Warszawa',phone:'+48 22 123 4567',website:'dentpro.pl',tags:['Установки','Кресла','Диагностика','Рентген']},
    {id:'v2',name:'Hu-Friedy / Cantel',desc:'Производитель стоматологических инструментов премиум-класса',city:'Chicago (PL dist)',phone:'+48 22 234 5678',website:'hu-friedy.com',tags:['Инструменты','Диагностика','Терапия','Хирургия']},
    {id:'v3',name:'Dentsply Sirona',desc:'Мировой лидер — установки, эндомоторы, материалы, рентген',city:'Warszawa',phone:'+48 22 345 6789',website:'dentsplysirona.com',tags:['Установки','Эндодонтия','Рентген','Материалы']},
    {id:'v4',name:'Planmeca',desc:'Финский производитель — установки, 3D-рентген, CAD/CAM',city:'Helsinki (PL dist)',phone:'+48 22 456 7890',website:'planmeca.com',tags:['Установки','Рентген','CAD/CAM']},
    {id:'v5',name:'NSK Nakanishi',desc:'Японские наконечники, скалеры, микромоторы',city:'Tokyo (PL dist)',phone:'+48 22 567 8901',website:'nsk-dental.com',tags:['Наконечники','Скалеры','Хирургия']},
    {id:'v6',name:'W&H Dentalwerk',desc:'Австрийские стерилизаторы, наконечники, моторы',city:'Wien (PL dist)',phone:'+48 22 678 9012',website:'wh.com',tags:['Стерилизация','Наконечники','Хирургия']},
    {id:'v7',name:'Melag',desc:'Немецкие автоклавы и системы стерилизации',city:'Berlin (PL dist)',phone:'+48 22 789 0123',website:'melag.com',tags:['Стерилизация','Автоклавы']},
    {id:'v8',name:'Cattani',desc:'Итальянские компрессоры, аспираторы, системы подачи воздуха',city:'Parma (PL dist)',phone:'+48 22 890 1234',website:'cattani.com',tags:['Компрессоры','Аспираторы','Инженерия']},
    {id:'v9',name:'Aqara / Lumi',desc:'Умный дом — датчики, розетки, камеры, хабы',city:'Shenzhen (PL dist)',phone:'—',website:'aqara.com',tags:['Умный дом','Датчики','Камеры']},
    {id:'v10',name:'Garrison Dental',desc:'Матричные системы, клинья, инструменты для реставрации',city:'Spring Lake, MI',phone:'—',website:'garrisondental.com',tags:['Терапия','Матрицы','Реставрация']}
  ],
  suppliers:[
    // ═══ 1. СТОМАТОЛОГИЧЕСКИЙ КАБИНЕТ ═══
    // Установки и кресла
    {id:1,name:'KaVo ESTETICA E50',category:'Стоматологический кабинет — Установки',price:35000,supplier:'DentPro.pl',warranty:'24 мес'},
    {id:2,name:'Sirona INTEGO',category:'Стоматологический кабинет — Установки',price:28000,supplier:'Sirona PL',warranty:'24 мес'},
    {id:3,name:'Planmeca Compact i5',category:'Стоматологический кабинет — Установки',price:22000,supplier:'Planmeca',warranty:'24 мес'},
    // Инструменты — диагностика
    {id:32,name:'Зеркало стом. x14 (с увеличением)',category:'Стоматологический кабинет — Диагностика',price:1400,supplier:'Hu-Friedy',warranty:'12 мес'},
    {id:33,name:'Зонд стом. x14',category:'Стоматологический кабинет — Диагностика',price:980,supplier:'Hu-Friedy',warranty:'12 мес'},
    {id:34,name:'Пинцет стом. x14',category:'Стоматологический кабинет — Диагностика',price:840,supplier:'Hu-Friedy',warranty:'12 мес'},
    {id:35,name:'Набор диагностический (зеркало+зонд+пинцет) x7',category:'Стоматологический кабинет — Диагностика',price:2100,supplier:'Hu-Friedy',warranty:'12 мес'},
    {id:36,name:'Периодонтальный зонд Williams x7',category:'Стоматологический кабинет — Диагностика',price:1050,supplier:'Hu-Friedy',warranty:'12 мес'},
    // Инструменты — терапия
    {id:37,name:'Экскаватор (набор x7 кабинетов)',category:'Стоматологический кабинет — Терапия',price:1260,supplier:'Hu-Friedy',warranty:'12 мес'},
    {id:38,name:'Штопфер-гладилка (набор x7)',category:'Стоматологический кабинет — Терапия',price:1400,supplier:'Hu-Friedy',warranty:'12 мес'},
    {id:39,name:'Матричная система (Palodent V3) x7',category:'Стоматологический кабинет — Терапия',price:2800,supplier:'Dentsply Sirona',warranty:'--'},
    {id:40,name:'Клинья деревянные + пластиковые (набор)',category:'Стоматологический кабинет — Терапия',price:600,supplier:'Garrison',warranty:'--'},
    {id:41,name:'Шпатель для замешивания x7',category:'Стоматологический кабинет — Терапия',price:490,supplier:'ASA Dental',warranty:'12 мес'},
    // Инструменты — эндодонтия
    {id:50,name:'Эндомотор X-Smart IQ x7',category:'Стоматологический кабинет — Эндодонтия',price:17500,supplier:'Dentsply Sirona',warranty:'24 мес'},
    {id:51,name:'Файлы ProTaper Gold (набор x7)',category:'Стоматологический кабинет — Эндодонтия',price:4200,supplier:'Dentsply Sirona',warranty:'--'},
    {id:52,name:'Файлы WaveOne Gold (набор x7)',category:'Стоматологический кабинет — Эндодонтия',price:3500,supplier:'Dentsply Sirona',warranty:'--'},
    {id:53,name:'Каналонаполнитель Calamus (обтуратор) x3',category:'Стоматологический кабинет — Эндодонтия',price:6000,supplier:'Dentsply Sirona',warranty:'24 мес'},
    {id:54,name:'Линейка эндо + стопперы (набор)',category:'Стоматологический кабинет — Эндодонтия',price:350,supplier:'VDW',warranty:'--'},
    // Инструменты — хирургия
    {id:42,name:'Щипцы для удаления (набор верх+низ) x3',category:'Стоматологический кабинет — Хирургия',price:4500,supplier:'Medesy',warranty:'24 мес'},
    {id:43,name:'Элеватор (набор прямой+угловой) x3',category:'Стоматологический кабинет — Хирургия',price:2700,supplier:'Medesy',warranty:'24 мес'},
    {id:44,name:'Распатор x3',category:'Стоматологический кабинет — Хирургия',price:1200,supplier:'Hu-Friedy',warranty:'12 мес'},
    {id:45,name:'Кюрета хирургическая x3',category:'Стоматологический кабинет — Хирургия',price:900,supplier:'Hu-Friedy',warranty:'12 мес'},
    {id:46,name:'Набор для имплантации (хир. кассета)',category:'Стоматологический кабинет — Хирургия',price:8500,supplier:'Straumann',warranty:'36 мес'},
    {id:47,name:'Костные ложки x3',category:'Стоматологический кабинет — Хирургия',price:750,supplier:'Medesy',warranty:'12 мес'},
    {id:48,name:'Иглодержатель x3',category:'Стоматологический кабинет — Хирургия',price:1050,supplier:'Hu-Friedy',warranty:'12 мес'},
    {id:49,name:'Ножницы хирургические x3',category:'Стоматологический кабинет — Хирургия',price:900,supplier:'Medesy',warranty:'12 мес'},
    // Инструменты — пародонтология
    {id:55,name:'Кюреты Грейси (набор 7 шт.) x2',category:'Стоматологический кабинет — Пародонтология',price:3600,supplier:'Hu-Friedy',warranty:'12 мес'},
    {id:56,name:'Скейлер ультразвуковой (пьезо) x7',category:'Стоматологический кабинет — Пародонтология',price:10500,supplier:'EMS',warranty:'24 мес'},
    {id:57,name:'Насадки к скейлеру (набор) x7',category:'Стоматологический кабинет — Пародонтология',price:3500,supplier:'EMS',warranty:'--'},
    {id:58,name:'Пародонтальный зонд CP-12 x7',category:'Стоматологический кабинет — Пародонтология',price:700,supplier:'Hu-Friedy',warranty:'12 мес'},
    // Инструменты — ортопедия
    {id:59,name:'Набор для препарирования коронок x7',category:'Стоматологический кабинет — Ортопедия',price:4900,supplier:'Komet',warranty:'--'},
    {id:60,name:'Артикулятор Bio-Art A7 Plus x3',category:'Стоматологический кабинет — Ортопедия',price:4500,supplier:'Bio-Art',warranty:'24 мес'},
    {id:61,name:'Лицевая дуга x2',category:'Стоматологический кабинет — Ортопедия',price:3000,supplier:'Bio-Art',warranty:'24 мес'},
    {id:62,name:'Оттискные ложки (набор перфо) x7',category:'Стоматологический кабинет — Ортопедия',price:1050,supplier:'ASA Dental',warranty:'12 мес'},
    {id:63,name:'Силиконовые оттискные массы (стартовый набор)',category:'Стоматологический кабинет — Ортопедия',price:2800,supplier:'3M ESPE',warranty:'--'},
    // Инструменты — эстетика
    {id:64,name:'Система отбеливания ZOOM WhiteSpeed x2',category:'Стоматологический кабинет — Эстетика',price:8000,supplier:'Philips',warranty:'24 мес'},
    {id:65,name:'Шкала VITA classic x7',category:'Стоматологический кабинет — Эстетика',price:1400,supplier:'VITA',warranty:'--'},
    {id:66,name:'Полировочные диски (Sof-Lex, набор)',category:'Стоматологический кабинет — Эстетика',price:1200,supplier:'3M ESPE',warranty:'--'},
    {id:67,name:'Штрипсы + финишные боры (набор)',category:'Стоматологический кабинет — Эстетика',price:800,supplier:'Komet',warranty:'--'},
    // Микроскопы и оптика
    {id:6,name:'Leica M320',category:'Стоматологический кабинет — Оптика',price:24000,supplier:'Leica Medical',warranty:'24 мес'},
    {id:7,name:'Zeiss EXTARO 300',category:'Стоматологический кабинет — Оптика',price:18000,supplier:'Zeiss',warranty:'24 мес'},
    // Кабинетная мебель
    {id:11,name:'Шкаф мед. ШМ-1 (инструменты)',category:'Стоматологический кабинет — Мебель',price:2800,supplier:'MedFurniture.pl',warranty:'24 мес'},
    {id:12,name:'Тумба мобильная (на кресло)',category:'Стоматологический кабинет — Мебель',price:1500,supplier:'MedFurniture.pl',warranty:'24 мес'},
    {id:15,name:'Стол врача + стул',category:'Стоматологический кабинет — Мебель',price:2200,supplier:'MedFurniture.pl',warranty:'24 мес'},
    {id:73,name:'Тележка инструментальная x7',category:'Стоматологический кабинет — Мебель',price:4900,supplier:'MedFurniture.pl',warranty:'24 мес'},
    {id:74,name:'Табурет врача (с регулировкой) x7',category:'Стоматологический кабинет — Мебель',price:3500,supplier:'Salli',warranty:'24 мес'},
    {id:75,name:'Полка настенная (кабинеты) x7',category:'Стоматологический кабинет — Мебель',price:1400,supplier:'MedFurniture.pl',warranty:'12 мес'},
    {id:72,name:'Контейнер мед. отходов (жёлтый) x7',category:'Стоматологический кабинет — Мебель',price:1050,supplier:'MedWaste.pl',warranty:'--'},
    // Прочее кабинетное
    {id:29,name:'Наконечники (турбина+угловой) x7',category:'Стоматологический кабинет — Прочее',price:21000,supplier:'NSK',warranty:'12 мес'},
    {id:30,name:'Апекслокатор x7',category:'Стоматологический кабинет — Прочее',price:7000,supplier:'Morita',warranty:'24 мес'},
    {id:31,name:'Фотополимерная лампа x7',category:'Стоматологический кабинет — Прочее',price:5600,supplier:'Woodpecker',warranty:'12 мес'},
    {id:68,name:'Кушетка смотровая',category:'Стоматологический кабинет — Прочее',price:1800,supplier:'MedFurniture.pl',warranty:'24 мес'},
    // Рентген (отдельный кабинет, но часть стом. зоны)
    {id:4,name:'VATECH PaX-i3D (КЛКТ)',category:'Стоматологический кабинет — Рентген',price:42000,supplier:'VATECH Europe',warranty:'36 мес'},
    {id:5,name:'MyRay RXDC eXTend (настенный)',category:'Стоматологический кабинет — Рентген',price:8500,supplier:'MyRay',warranty:'24 мес'},
    // Расходники (стартовый набор)
    {id:24,name:'Стартовый набор расходников',category:'Стоматологический кабинет — Расходники',price:15000,supplier:'Henry Schein',warranty:'--'},
    {id:25,name:'Боры + фрезы (комплект)',category:'Стоматологический кабинет — Расходники',price:4000,supplier:'Komet',warranty:'--'},
    {id:26,name:'Эндо файлы (набор)',category:'Стоматологический кабинет — Расходники',price:3500,supplier:'Dentsply Sirona',warranty:'--'},

    // ═══ 2. СТЕРИЛИЗАЦИОННАЯ ═══
    {id:8,name:'Melag Vacuklav 44B+ (автоклав)',category:'Стерилизационная',price:14000,supplier:'Melag.pl',warranty:'24 мес'},
    {id:9,name:'Elma S300 (УЗ мойка)',category:'Стерилизационная',price:4500,supplier:'Elma',warranty:'12 мес'},
    {id:10,name:'MELAseal 200 (запайщик пакетов)',category:'Стерилизационная',price:3200,supplier:'Melag.pl',warranty:'12 мес'},
    {id:76,name:'Термодезинфектор MELAtherm 10',category:'Стерилизационная',price:18000,supplier:'Melag.pl',warranty:'24 мес'},
    {id:77,name:'Дистиллятор воды (для автоклава)',category:'Стерилизационная',price:3500,supplier:'Melag.pl',warranty:'24 мес'},
    {id:78,name:'Стеллаж для стерильных пакетов',category:'Стерилизационная',price:1200,supplier:'MedFurniture.pl',warranty:'12 мес'},
    {id:79,name:'Контейнер для грязного инструмента',category:'Стерилизационная',price:600,supplier:'MedFurniture.pl',warranty:'--'},
    {id:80,name:'Индикаторы стерилизации (набор 1000 шт)',category:'Стерилизационная',price:400,supplier:'3M',warranty:'--'},
    {id:81,name:'Пакеты для стерилизации (рулон 200м)',category:'Стерилизационная',price:350,supplier:'Melag.pl',warranty:'--'},
    {id:17,name:'Стеллаж расходников',category:'Стерилизационная',price:1200,supplier:'MedFurniture.pl',warranty:'12 мес'},

    // ═══ 3. ТЕХНИЧЕСКАЯ КОМНАТА ═══
    {id:27,name:'Компрессор стоматологический',category:'Техническая комната',price:6000,supplier:'Cattani',warranty:'36 мес'},
    {id:28,name:'Аспирационная система',category:'Техническая комната',price:8000,supplier:'Cattani',warranty:'36 мес'},
    {id:19,name:'Сервер (Jetson AGX Orin)',category:'Техническая комната',price:8000,supplier:'NVIDIA',warranty:'24 мес'},
    {id:20,name:'Роутер + точки доступа (Mesh)',category:'Техническая комната',price:3500,supplier:'Ubiquiti',warranty:'24 мес'},
    {id:82,name:'ИБП (UPS) 3000VA',category:'Техническая комната',price:2500,supplier:'APC',warranty:'24 мес'},
    {id:83,name:'Серверный шкаф 12U',category:'Техническая комната',price:1800,supplier:'Ubiquiti',warranty:'24 мес'},
    {id:84,name:'Патч-панель + коммутатор 24 порта',category:'Техническая комната',price:1200,supplier:'Ubiquiti',warranty:'24 мес'},
    {id:18,name:'Aqara Hub M3 (x7)',category:'Техническая комната',price:2100,supplier:'Aqara EU',warranty:'12 мес'},

    // ═══ 4. ТУАЛЕТ ═══
    {id:70,name:'Зеркало настенное x2',category:'Туалет',price:400,supplier:'OfficeDesign',warranty:'--'},
    {id:71,name:'Диспенсер бумажных полотенец x4',category:'Туалет',price:800,supplier:'Tork',warranty:'12 мес'},
    {id:85,name:'Дозатор мыла настенный x4',category:'Туалет',price:400,supplier:'Tork',warranty:'12 мес'},
    {id:86,name:'Сушилка для рук Dyson Airblade x2',category:'Туалет',price:5000,supplier:'Dyson',warranty:'24 мес'},
    {id:87,name:'Корзина для мусора (педальная) x4',category:'Туалет',price:600,supplier:'Brabantia',warranty:'24 мес'},
    {id:88,name:'Ёршик + подставка x2',category:'Туалет',price:100,supplier:'OfficeDesign',warranty:'--'},
    {id:89,name:'Держатель туалетной бумаги x2',category:'Туалет',price:160,supplier:'Tork',warranty:'12 мес'},
    {id:90,name:'Освежитель воздуха автоматический x2',category:'Туалет',price:300,supplier:'Air Wick',warranty:'12 мес'},

    // ═══ 5. КОРИДОРЫ И ЗАЛ ОЖИДАНИЯ ═══
    {id:14,name:'Кресла зал ожидания (секция x3)',category:'Коридоры и зал ожидания',price:3500,supplier:'OfficeDesign',warranty:'12 мес'},
    {id:69,name:'Вешалка напольная',category:'Коридоры и зал ожидания',price:600,supplier:'OfficeDesign',warranty:'12 мес'},
    {id:23,name:'Монитор очереди (TV 43")',category:'Коридоры и зал ожидания',price:1800,supplier:'Samsung',warranty:'24 мес'},
    {id:91,name:'Кулер для воды (горячая/холодная)',category:'Коридоры и зал ожидания',price:1200,supplier:'Brita',warranty:'12 мес'},
    {id:92,name:'Журнальный столик',category:'Коридоры и зал ожидания',price:500,supplier:'OfficeDesign',warranty:'12 мес'},
    {id:93,name:'Стенд информационный (буклеты)',category:'Коридоры и зал ожидания',price:300,supplier:'OfficeDesign',warranty:'--'},
    {id:94,name:'Освещение декоративное (LED-панели)',category:'Коридоры и зал ожидания',price:2000,supplier:'Philips',warranty:'24 мес'},
    {id:95,name:'Навигационные таблички (набор)',category:'Коридоры и зал ожидания',price:400,supplier:'SignPrint.pl',warranty:'--'},
    {id:96,name:'Коврик входной (грязезащитный)',category:'Коридоры и зал ожидания',price:250,supplier:'3M',warranty:'--'},

    // ═══ 6. ЗОНА АДМИНИСТРАТОРА ═══
    {id:13,name:'Стойка ресепшен (L-образная)',category:'Зона администратора',price:8000,supplier:'OfficeDesign',warranty:'36 мес'},
    {id:21,name:'ПК ресепшен + монитор',category:'Зона администратора',price:4500,supplier:'Dell',warranty:'36 мес'},
    {id:22,name:'POS-терминал + принтер чеков',category:'Зона администратора',price:2800,supplier:'Posnet',warranty:'24 мес'},
    {id:97,name:'Принтер МФУ (сканер/копир)',category:'Зона администратора',price:1500,supplier:'HP',warranty:'24 мес'},
    {id:98,name:'Телефон стационарный (IP)',category:'Зона администратора',price:800,supplier:'Yealink',warranty:'24 мес'},
    {id:99,name:'Кресло администратора (эргономичное)',category:'Зона администратора',price:1200,supplier:'OfficeDesign',warranty:'24 мес'},
    {id:16,name:'Шкафчики персонала (x12)',category:'Зона администратора',price:4800,supplier:'OfficeDesign',warranty:'24 мес'},
    {id:100,name:'Сейф для документов',category:'Зона администратора',price:1500,supplier:'Valberg',warranty:'36 мес'},
    {id:101,name:'Шредер для бумаг',category:'Зона администратора',price:600,supplier:'Fellowes',warranty:'24 мес'},

    // ═══ 7. БЕЗОПАСНОСТЬ ═══
    {id:102,name:'Aqara G5 Pro камера x7',category:'Безопасность',price:7000,supplier:'Aqara EU',warranty:'12 мес'},
    {id:103,name:'reCamera x4 (AI-камера)',category:'Безопасность',price:4000,supplier:'Seeed Studio',warranty:'12 мес'},
    {id:104,name:'Охранная сигнализация (комплект)',category:'Безопасность',price:5000,supplier:'Ajax Systems',warranty:'24 мес'},
    {id:105,name:'Пожарная сигнализация (датчики x14)',category:'Безопасность',price:4000,supplier:'Ajax Systems',warranty:'24 мес'},
    {id:106,name:'Огнетушитель CO2 x4',category:'Безопасность',price:800,supplier:'GZWM',warranty:'60 мес'},
    {id:107,name:'Аптечка первой помощи x3',category:'Безопасность',price:450,supplier:'MedKit.pl',warranty:'36 мес'},
    {id:108,name:'Указатели эвакуации (светодиодные) x8',category:'Безопасность',price:1200,supplier:'Beghelli',warranty:'24 мес'},
    {id:109,name:'Замок кодовый (на двери кабинетов) x7',category:'Безопасность',price:2100,supplier:'Aqara EU',warranty:'24 мес'},
    {id:110,name:'Датчик протечки воды x4',category:'Безопасность',price:400,supplier:'Aqara EU',warranty:'12 мес'},

    // ═══ 8. УБОРОЧНЫЙ ИНВЕНТАРЬ ═══
    {id:111,name:'Пылесос проф. Karcher T 15/1',category:'Уборочный инвентарь',price:1800,supplier:'Karcher',warranty:'24 мес'},
    {id:112,name:'Моп + ведро + отжим (набор x2)',category:'Уборочный инвентарь',price:600,supplier:'Vileda Professional',warranty:'12 мес'},
    {id:113,name:'Средства дезинфекции (стартовый набор)',category:'Уборочный инвентарь',price:1200,supplier:'Ecolab',warranty:'--'},
    {id:114,name:'Перчатки одноразовые (коробки x10)',category:'Уборочный инвентарь',price:250,supplier:'Medicom',warranty:'--'},
    {id:115,name:'Мешки для мусора (рулоны x20)',category:'Уборочный инвентарь',price:150,supplier:'Jan Niezbędny',warranty:'--'},
    {id:116,name:'Стеллаж для инвентаря',category:'Уборочный инвентарь',price:400,supplier:'MedFurniture.pl',warranty:'12 мес'},
    {id:117,name:'Таблички "Мокрый пол" x3',category:'Уборочный инвентарь',price:90,supplier:'3M',warranty:'--'},
    {id:118,name:'Контейнер раздельный сбор (3 отсека)',category:'Уборочный инвентарь',price:500,supplier:'Brabantia',warranty:'24 мес'},

    // ═══ НОВЫЕ КАТЕГОРИИ (парсер сессия 2) ═══

    // --- Хирургические лампы ---
    {id:200,name:'KaVo MASTERsun LED (потолочная)',category:'Стоматологический кабинет — Операционные лампы',price:8500,supplier:'KaVo',warranty:'36 мес'},
    {id:201,name:'Planmeca Solanna Vision',category:'Стоматологический кабинет — Операционные лампы',price:7200,supplier:'Planmeca',warranty:'24 мес'},
    {id:202,name:'A-dec 500 LED (потолочная)',category:'Стоматологический кабинет — Операционные лампы',price:9000,supplier:'A-dec',warranty:'36 мес'},
    {id:203,name:'Dabi Atlante Articulux LED',category:'Стоматологический кабинет — Операционные лампы',price:5500,supplier:'Dabi Atlante',warranty:'24 мес'},
    {id:204,name:'Dr. Mach LED 150 (настенная)',category:'Стоматологический кабинет — Операционные лампы',price:4200,supplier:'Dr. Mach',warranty:'24 мес'},
    {id:205,name:'Faro Alya LED (потолочная) x7',category:'Стоматологический кабинет — Операционные лампы',price:28000,supplier:'Faro',warranty:'24 мес'},
    {id:206,name:'Sirona LED-light (встроенная)',category:'Стоматологический кабинет — Операционные лампы',price:3800,supplier:'Dentsply Sirona',warranty:'24 мес'},
    {id:207,name:'Daray X700 LED (мобильная)',category:'Стоматологический кабинет — Операционные лампы',price:3200,supplier:'Daray',warranty:'24 мес'},
    {id:208,name:'Лампа для хирургии (бестеневая) x2',category:'Стоматологический кабинет — Операционные лампы',price:6400,supplier:'Dr. Mach',warranty:'36 мес'},

    // --- Рентгенозащита ---
    {id:210,name:'Фартук свинцовый пациента x7',category:'Стоматологический кабинет — Рентгенозащита',price:7000,supplier:'MAVIG',warranty:'60 мес'},
    {id:211,name:'Фартук свинцовый врача x7',category:'Стоматологический кабинет — Рентгенозащита',price:10500,supplier:'MAVIG',warranty:'60 мес'},
    {id:212,name:'Воротник тиреоидный x14',category:'Стоматологический кабинет — Рентгенозащита',price:4200,supplier:'MAVIG',warranty:'60 мес'},
    {id:213,name:'Ширма рентгенозащитная (мобильная) x2',category:'Стоматологический кабинет — Рентгенозащита',price:8000,supplier:'MAVIG',warranty:'60 мес'},
    {id:214,name:'Стена свинцовая (облицовка рентген-кабинета)',category:'Стоматологический кабинет — Рентгенозащита',price:12000,supplier:'Nuclear Shielding',warranty:'120 мес'},
    {id:215,name:'Дверь рентгенозащитная',category:'Стоматологический кабинет — Рентгенозащита',price:8500,supplier:'Nuclear Shielding',warranty:'120 мес'},
    {id:216,name:'Стекло свинцовое (смотровое окно)',category:'Стоматологический кабинет — Рентгенозащита',price:4500,supplier:'Nuclear Shielding',warranty:'120 мес'},
    {id:217,name:'Очки рентгенозащитные x4',category:'Стоматологический кабинет — Рентгенозащита',price:2800,supplier:'MAVIG',warranty:'36 мес'},
    {id:218,name:'Перчатки рентгенозащитные x2 пары',category:'Стоматологический кабинет — Рентгенозащита',price:1600,supplier:'MAVIG',warranty:'36 мес'},
    {id:219,name:'Дозиметр индивидуальный x4',category:'Стоматологический кабинет — Рентгенозащита',price:2000,supplier:'Polon-Izot',warranty:'12 мес'},

    // --- Прямые наконечники ---
    {id:220,name:'NSK Ti-Max X-SG65L (прямой, LED) x7',category:'Стоматологический кабинет — Наконечники прямые',price:14000,supplier:'NSK',warranty:'12 мес'},
    {id:221,name:'KaVo EXPERTmatic E25L (прямой) x7',category:'Стоматологический кабинет — Наконечники прямые',price:10500,supplier:'KaVo',warranty:'12 мес'},
    {id:222,name:'W&H S-12 (прямой хирургический) x3',category:'Стоматологический кабинет — Наконечники прямые',price:6000,supplier:'W&H',warranty:'12 мес'},
    {id:223,name:'Bien-Air Tornado (микромотор прямой) x7',category:'Стоматологический кабинет — Наконечники прямые',price:17500,supplier:'Bien-Air',warranty:'24 мес'},
    {id:224,name:'NSK Ti-Max X95L (угловой 1:5, LED) x7',category:'Стоматологический кабинет — Наконечники прямые',price:21000,supplier:'NSK',warranty:'12 мес'},
    {id:225,name:'W&H Synea Vision (турбина) x7',category:'Стоматологический кабинет — Наконечники прямые',price:17500,supplier:'W&H',warranty:'12 мес'},
    {id:226,name:'KaVo MASTERtorque M8900L (турбина) x7',category:'Стоматологический кабинет — Наконечники прямые',price:15400,supplier:'KaVo',warranty:'12 мес'},
    {id:227,name:'NSK Pana-Max2 (турбина эконом) x7',category:'Стоматологический кабинет — Наконечники прямые',price:8400,supplier:'NSK',warranty:'12 мес'},
    {id:228,name:'Наконечник эндо (понижающий 16:1) x3',category:'Стоматологический кабинет — Наконечники прямые',price:4500,supplier:'NSK',warranty:'12 мес'},

    // --- Быстросъёмные муфты ---
    {id:230,name:'NSK PTL-CL-LED III (муфта с подсветкой) x7',category:'Стоматологический кабинет — Быстросъёмные муфты',price:7000,supplier:'NSK',warranty:'12 мес'},
    {id:231,name:'KaVo MULTIflex LUX 465 (муфта) x7',category:'Стоматологический кабинет — Быстросъёмные муфты',price:5600,supplier:'KaVo',warranty:'12 мес'},
    {id:232,name:'W&H Roto Quick RQ-24 (муфта) x7',category:'Стоматологический кабинет — Быстросъёмные муфты',price:4900,supplier:'W&H',warranty:'12 мес'},
    {id:233,name:'Bien-Air Unifix (муфта) x7',category:'Стоматологический кабинет — Быстросъёмные муфты',price:6300,supplier:'Bien-Air',warranty:'12 мес'},
    {id:234,name:'Адаптер Midwest/Borden x7',category:'Стоматологический кабинет — Быстросъёмные муфты',price:2100,supplier:'NSK',warranty:'12 мес'},

    // --- УЗ мойки (стерилизационная) ---
    {id:240,name:'Elma S100H (ультразвуковая, 10л)',category:'Стерилизационная — УЗ мойки',price:5500,supplier:'Elma',warranty:'24 мес'},
    {id:241,name:'Bandelin Sonorex Digitec (УЗ, 6л)',category:'Стерилизационная — УЗ мойки',price:3800,supplier:'Bandelin',warranty:'24 мес'},
    {id:242,name:'Coltene BioSonic UC150 (УЗ, 6л)',category:'Стерилизационная — УЗ мойки',price:3200,supplier:'Coltene',warranty:'12 мес'},
    {id:243,name:'L&R Quantrex Q140 (УЗ с подогревом)',category:'Стерилизационная — УЗ мойки',price:4200,supplier:'L&R',warranty:'24 мес'},
    {id:244,name:'Корзина для УЗ мойки (сменная) x3',category:'Стерилизационная — УЗ мойки',price:450,supplier:'Elma',warranty:'--'},
    {id:245,name:'Раствор для УЗ мойки (5л, стартовый)',category:'Стерилизационная — УЗ мойки',price:280,supplier:'Elma',warranty:'--'},

    // --- Термодезинфекторы ---
    {id:250,name:'Miele PG 8591 (термодезинфектор)',category:'Стерилизационная — Термодезинфекция',price:22000,supplier:'Miele Professional',warranty:'24 мес'},
    {id:251,name:'Melag MELAtherm 10 Evolution',category:'Стерилизационная — Термодезинфекция',price:19500,supplier:'Melag.pl',warranty:'24 мес'},
    {id:252,name:'W&H Teon (термодезинфектор компактный)',category:'Стерилизационная — Термодезинфекция',price:16000,supplier:'W&H',warranty:'24 мес'},
    {id:253,name:'Средство для термодезинфектора (стартовый набор)',category:'Стерилизационная — Термодезинфекция',price:800,supplier:'Miele Professional',warranty:'--'},

    // --- Бинокулярные лупы ---
    {id:260,name:'Carl Zeiss EyeMag Pro (3.3x) x4',category:'Стоматологический кабинет — Бинокулярные лупы',price:20000,supplier:'Zeiss',warranty:'24 мес'},
    {id:261,name:'Heine HR 2.5x (с осветителем) x7',category:'Стоматологический кабинет — Бинокулярные лупы',price:21000,supplier:'Heine',warranty:'24 мес'},
    {id:262,name:'Surgitel 3.5x (титановая оправа) x3',category:'Стоматологический кабинет — Бинокулярные лупы',price:13500,supplier:'Surgitel',warranty:'24 мес'},
    {id:263,name:'Orascoptic XV1 (2.5x) x3',category:'Стоматологический кабинет — Бинокулярные лупы',price:9000,supplier:'Orascoptic',warranty:'24 мес'},

    // --- Дистилляторы воды ---
    {id:270,name:'Melag MELAdest 65 (дистиллятор)',category:'Стерилизационная — Дистилляция',price:4200,supplier:'Melag.pl',warranty:'24 мес'},
    {id:271,name:'W&H Multidem (деминерализатор)',category:'Стерилизационная — Дистилляция',price:3500,supplier:'W&H',warranty:'24 мес'},
    {id:272,name:'Liston A 1210 (аквадистиллятор)',category:'Стерилизационная — Дистилляция',price:2800,supplier:'Liston',warranty:'12 мес'},

    // --- Стоматологические микроскопы ---
    {id:280,name:'Carl Zeiss OPMI PROergo (микроскоп)',category:'Стоматологический кабинет — Микроскопы',price:65000,supplier:'Zeiss',warranty:'36 мес'},
    {id:281,name:'Leica M320 F12 (микроскоп + видео)',category:'Стоматологический кабинет — Микроскопы',price:38000,supplier:'Leica Medical',warranty:'36 мес'},

    // --- Система обтурации ---
    {id:290,name:'Dentsply Calamus Dual (обтуратор + инжектор)',category:'Стоматологический кабинет — Обтурация',price:12000,supplier:'Dentsply Sirona',warranty:'24 мес'},

    // --- Лампа отбеливания ---
    {id:295,name:'Philips ZOOM WhiteSpeed (лампа) x2',category:'Стоматологический кабинет — Отбеливание',price:16000,supplier:'Philips',warranty:'24 мес'},

    // ═══ РАСШИРЕНИЕ СУЩЕСТВУЮЩИХ КАТЕГОРИЙ ═══

    // Дополнительные расходники
    {id:300,name:'Композит Filtek Z250 XT (набор 40 шприцев)',category:'Стоматологический кабинет — Расходники',price:6000,supplier:'3M ESPE',warranty:'--'},
    {id:301,name:'Адгезивная система Single Bond Universal (набор)',category:'Стоматологический кабинет — Расходники',price:3500,supplier:'3M ESPE',warranty:'--'},
    {id:302,name:'Анестетики Ubistesin forte (100 карп.)',category:'Стоматологический кабинет — Расходники',price:1200,supplier:'3M ESPE',warranty:'--'},
    {id:303,name:'Шприцы карпульные x14',category:'Стоматологический кабинет — Расходники',price:2800,supplier:'Carl Martin',warranty:'12 мес'},
    {id:304,name:'Иглы карпульные (коробка 100 шт) x5',category:'Стоматологический кабинет — Расходники',price:750,supplier:'Septoject',warranty:'--'},
    {id:305,name:'Перчатки нитриловые (коробки x100) x20',category:'Стоматологический кабинет — Расходники',price:1000,supplier:'Medicom',warranty:'--'},
    {id:306,name:'Маски одноразовые (уп. 50 шт) x20',category:'Стоматологический кабинет — Расходники',price:400,supplier:'Medicom',warranty:'--'},
    {id:307,name:'Слюноотсосы + пылесосы (уп. 100) x10',category:'Стоматологический кабинет — Расходники',price:300,supplier:'TPC Advanced',warranty:'--'},
    {id:308,name:'Салфетки для пациентов (уп. 500) x5',category:'Стоматологический кабинет — Расходники',price:250,supplier:'Medicom',warranty:'--'},
    {id:309,name:'Ватные ролики (уп. 1000) x5',category:'Стоматологический кабинет — Расходники',price:150,supplier:'Medicom',warranty:'--'},
    {id:310,name:'Гуттаперча (набор размеров) x7',category:'Стоматологический кабинет — Расходники',price:1400,supplier:'Dentsply Sirona',warranty:'--'},
    {id:311,name:'Цемент стом. (стеклоиономерный) набор',category:'Стоматологический кабинет — Расходники',price:2000,supplier:'GC',warranty:'--'},
    {id:312,name:'Протравка + бонд (стартовый набор)',category:'Стоматологический кабинет — Расходники',price:1500,supplier:'Ivoclar Vivadent',warranty:'--'},
    {id:313,name:'Дезинфекция поверхностей (канистра 5л) x5',category:'Стоматологический кабинет — Расходники',price:500,supplier:'Ecolab',warranty:'--'},
    {id:314,name:'Стерильные салфетки (уп. 200) x10',category:'Стоматологический кабинет — Расходники',price:400,supplier:'3M',warranty:'--'},

    // Дополнительное освещение
    {id:320,name:'Потолочные LED-панели (кабинеты) x14',category:'Коридоры и зал ожидания — Освещение',price:5600,supplier:'Philips',warranty:'24 мес'},
    {id:321,name:'Светильник аварийный (эвакуационный) x8',category:'Коридоры и зал ожидания — Освещение',price:2400,supplier:'Beghelli',warranty:'24 мес'},
    {id:322,name:'Бактерицидный рециркулятор x7',category:'Стоматологический кабинет — Прочее',price:7000,supplier:'Армед',warranty:'24 мес'},

    // Доп. мебель зал ожидания
    {id:330,name:'Детский уголок (мебель + игрушки)',category:'Коридоры и зал ожидания',price:2500,supplier:'OfficeDesign',warranty:'12 мес'},
    {id:331,name:'TV 55" (зал ожидания)',category:'Коридоры и зал ожидания',price:2800,supplier:'Samsung',warranty:'24 мес'},
    {id:332,name:'Система очередей (электронная, планшет)',category:'Зона администратора',price:3500,supplier:'Q-Matic',warranty:'24 мес'},

    // Доп. IT
    {id:340,name:'NAS Synology DS1823xs+ (48TB)',category:'Техническая комната',price:25000,supplier:'Synology',warranty:'36 мес'},
    {id:341,name:'NVMe SSD 2TB (для Jetson)',category:'Техническая комната',price:1200,supplier:'Samsung',warranty:'60 мес'},
    {id:342,name:'Кабель Cat6a (бухта 305м)',category:'Техническая комната',price:800,supplier:'Ubiquiti',warranty:'--'},
    {id:343,name:'IP-телефоны x7 (кабинеты)',category:'Техническая комната',price:3500,supplier:'Yealink',warranty:'24 мес'}
  ],
  employees:[
    {id:1,name:'Главный врач',spec:'Управление, лицензия NFZ',salary:15000,status:'Вакансия'},
    {id:2,name:'Стоматолог-терапевт',spec:'Полная ставка',salary:12000,status:'Вакансия'},
    {id:3,name:'Стоматолог-терапевт',spec:'Полная ставка',salary:12000,status:'Вакансия'},
    {id:4,name:'Стоматолог-терапевт',spec:'Полная ставка',salary:12000,status:'Вакансия'},
    {id:5,name:'Стоматолог-терапевт',spec:'Полная ставка',salary:12000,status:'Вакансия'},
    {id:6,name:'Хирург-имплантолог',spec:'Полная ставка',salary:14000,status:'Вакансия'},
    {id:7,name:'Хирург-имплантолог',spec:'Полная ставка',salary:14000,status:'Вакансия'},
    {id:8,name:'Гигиенист',spec:'Профилактика',salary:7000,status:'Вакансия'},
    {id:9,name:'Гигиенист',spec:'Профилактика',salary:7000,status:'Вакансия'},
    {id:10,name:'Ассистент',spec:'Полная ставка',salary:5000,status:'Вакансия'},
    {id:11,name:'Ассистент',spec:'Полная ставка',salary:5000,status:'Вакансия'},
    {id:12,name:'Ассистент',spec:'Полная ставка',salary:5000,status:'Вакансия'},
    {id:13,name:'Ассистент',spec:'Полная ставка',salary:5000,status:'Вакансия'},
    {id:14,name:'Администратор',spec:'Ресепшен, запись',salary:5000,status:'Вакансия'},
    {id:15,name:'Администратор',spec:'Ресепшен, запись',salary:5000,status:'Вакансия'},
    {id:16,name:'Стерилизаторщица',spec:'Полная ставка',salary:5000,status:'Вакансия'},
    {id:17,name:'IT / аутсорс',spec:'Частичная ставка',salary:3000,status:'Вакансия'}
  ],
  services:[
    {id:1,name:'Консультация + план лечения',time:'30 мин',price:150},
    {id:2,name:'Профессиональная гигиена',time:'60 мин',price:350},
    {id:3,name:'Пломба композитная',time:'45 мин',price:400},
    {id:4,name:'Эндодонтия (1 канал)',time:'90 мин',price:800},
    {id:5,name:'Имплант (хирургия)',time:'60 мин',price:3500},
    {id:6,name:'Коронка цирконий',time:'2 визита',price:2200},
    {id:7,name:'Виниры E-max',time:'2 визита',price:2800},
    {id:8,name:'Удаление зуба мудрости',time:'45 мин',price:600},
    {id:9,name:'Отбеливание ZOOM',time:'90 мин',price:1500},
    {id:10,name:'Элайнеры (курс)',time:'12-18 мес',price:12000}
  ],
  conceptItems:[],  // works added to project (from concept_items table)
  premises:[]       // real estate from equipment where category=premises
};
let nextId=200;

