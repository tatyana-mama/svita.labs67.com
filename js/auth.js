// ═══════════════ AUTH SYSTEM (Supabase Auth) ═══════════════
let currentRole='admin';
let currentUser=null;
const ROLE_COLORS={admin:'linear-gradient(135deg,var(--ac),#8b5cf6)',owner:'linear-gradient(135deg,var(--gn),#059669)',contractor:'linear-gradient(135deg,var(--or),var(--yl))',supplier:'linear-gradient(135deg,#8b5cf6,#d946ef)',employee:'linear-gradient(135deg,#06b6d4,var(--ac))'};
const ROLE_NAMES={admin:'Администратор',owner:'Владелец',contractor:'Подрядчик',supplier:'Поставщик',employee:'Сотрудник'};

// ═══════════════ BUSINESS TYPES ═══════════════
const BIZ_TYPES={
  dental:{icon:'🦷',name:'Стоматология',color:'#06b6d4',subtypes:[
    {id:'dental_general',name:'Общая стоматология',desc:'Терапия, хирургия, ортопедия'},
    {id:'dental_cosmo',name:'Стоматология + Косметология',desc:'Стоматология с кабинетом косметолога'},
    {id:'dental_kids',name:'Детская стоматология',desc:'Специализация на детях'},
    {id:'dental_ortho',name:'Ортодонтическая клиника',desc:'Брекеты, элайнеры, исправление прикуса'},
    {id:'dental_implant',name:'Имплантология',desc:'Имплантация и протезирование'},
    {id:'dental_premium',name:'Премиум клиника',desc:'VIP-обслуживание, полный спектр'}
  ]},
  coffee:{icon:'☕',name:'Кофейня',color:'#92400e',subtypes:[
    {id:'coffee_classic',name:'Классическая кофейня',desc:'Кофе, напитки, лёгкие снеки'},
    {id:'coffee_bakery',name:'Кофейня-пекарня',desc:'Свежая выпечка + кофе'},
    {id:'coffee_confection',name:'Кофейня-кондитерская',desc:'Торты, десерты, кофе'},
    {id:'coffee_island',name:'Кофе-остров',desc:'Островная стойка в ТЦ'},
    {id:'coffee_cowork',name:'Кофейня-коворкинг',desc:'Рабочее пространство + кофе'},
    {id:'coffee_roastery',name:'Кофейня-обжарка',desc:'Своя обжарка, specialty coffee'}
  ]},
  beauty:{icon:'💅',name:'Салон красоты',color:'#d946ef',subtypes:[
    {id:'beauty_general',name:'Универсальный салон',desc:'Парикмахер, маникюр, косметология'},
    {id:'beauty_barber',name:'Барбершоп',desc:'Мужские стрижки и бритьё'},
    {id:'beauty_nail',name:'Ногтевая студия',desc:'Маникюр, педикюр, nail-art'},
    {id:'beauty_cosmo',name:'Косметологическая клиника',desc:'Инъекции, лазер, аппаратная косметология'}
  ]},
  fitness:{icon:'💪',name:'Фитнес',color:'#ea580c',subtypes:[
    {id:'fit_gym',name:'Тренажёрный зал',desc:'Зал со свободными весами и тренажёрами'},
    {id:'fit_studio',name:'Фитнес-студия',desc:'Групповые занятия, йога, пилатес'},
    {id:'fit_crossfit',name:'CrossFit бокс',desc:'Функциональный тренинг'},
    {id:'fit_martial',name:'Зал единоборств',desc:'Бокс, MMA, борьба'}
  ]},
  food:{icon:'🍕',name:'Общепит',color:'#dc2626',subtypes:[
    {id:'food_restaurant',name:'Ресторан',desc:'Полноценная кухня, зал, бар'},
    {id:'food_fast',name:'Фастфуд',desc:'Быстрая еда, конвейер'},
    {id:'food_dark',name:'Dark kitchen',desc:'Кухня только на доставку'},
    {id:'food_bar',name:'Бар',desc:'Напитки, закуски, атмосфера'}
  ]}
};
let currentBizType=null; // e.g. 'dental'
let currentBizSubtype=null; // e.g. 'dental_general'

// ═══════════════ BIZ-SPECIFIC DATA PRESETS ═══════════════
const BIZ_DATA={
  coffee:{
    employees:[
      {id:1,name:'Управляющий',spec:'Менеджмент, закупки, персонал',salary:7000,status:'Вакансия'},
      {id:2,name:'Бариста (старший)',spec:'Полная ставка, обучение',salary:5500,status:'Вакансия'},
      {id:3,name:'Бариста',spec:'Полная ставка',salary:4500,status:'Вакансия'},
      {id:4,name:'Бариста',spec:'Полная ставка',salary:4500,status:'Вакансия'},
      {id:5,name:'Бариста',spec:'Полная ставка',salary:4500,status:'Вакансия'},
      {id:6,name:'Кондитер',spec:'Десерты, выпечка',salary:5500,status:'Вакансия'},
      {id:7,name:'Помощник кухни',spec:'Подготовка, мойка',salary:4200,status:'Вакансия'},
      {id:8,name:'Кассир',spec:'Обслуживание гостей',salary:4200,status:'Вакансия'},
      {id:9,name:'Уборщик',spec:'Частичная ставка',salary:3000,status:'Вакансия'}
    ],
    services:[
      // Горячие напитки
      {id:1,name:'Эспрессо',time:'2 мин',price:12},{id:2,name:'Американо',time:'3 мин',price:14},
      {id:3,name:'Капучино',time:'3 мин',price:16},{id:4,name:'Латте',time:'3 мин',price:18},
      {id:5,name:'Флэт Уайт',time:'3 мин',price:18},{id:6,name:'Раф',time:'4 мин',price:20},
      {id:7,name:'Мокко',time:'4 мин',price:20},{id:8,name:'Какао',time:'3 мин',price:16},
      {id:9,name:'Горячий шоколад',time:'3 мин',price:18},{id:10,name:'Матча латте',time:'3 мин',price:22},
      {id:11,name:'Чай (заварной)',time:'5 мин',price:14},{id:12,name:'Бамбл (эспрессо+апельсин)',time:'3 мин',price:20},
      // Холодные напитки
      {id:20,name:'Айс латте',time:'3 мин',price:20},{id:21,name:'Айс американо',time:'2 мин',price:16},
      {id:22,name:'Колд брю',time:'2 мин',price:18},{id:23,name:'Фраппе',time:'4 мин',price:22},
      {id:24,name:'Лимонад',time:'3 мин',price:16},{id:25,name:'Смузи',time:'4 мин',price:22},
      {id:26,name:'Милкшейк',time:'4 мин',price:24},
      // Десерты
      {id:40,name:'Круассан',time:'—',price:14},{id:41,name:'Чизкейк',time:'—',price:20},
      {id:42,name:'Тирамису',time:'—',price:22},{id:43,name:'Брауни',time:'—',price:16},
      {id:44,name:'Маффин',time:'—',price:12},{id:45,name:'Булочка с корицей',time:'—',price:14},
      {id:46,name:'Эклер',time:'—',price:16},{id:47,name:'Панини / сэндвич',time:'5 мин',price:24},
      {id:48,name:'Тост с авокадо',time:'5 мин',price:26},{id:49,name:'Гранола с йогуртом',time:'—',price:22}
    ],
    rooms:[
      {id:1,name:'Зал для гостей (основной)',type:'Гостевая',w:8.0,h:2.9,l:6.0,area:48.0},
      {id:2,name:'Барная стойка',type:'Рабочая',w:4.0,h:2.9,l:2.0,area:8.0},
      {id:3,name:'Кухня / Зона подготовки',type:'Рабочая',w:4.0,h:2.9,l:3.0,area:12.0},
      {id:4,name:'Кондитерский цех',type:'Рабочая',w:3.5,h:2.9,l:3.0,area:10.5},
      {id:5,name:'Моечная',type:'Техническая',w:2.5,h:2.9,l:2.0,area:5.0},
      {id:6,name:'Склад / Хранение',type:'Техническая',w:3.0,h:2.9,l:2.0,area:6.0},
      {id:7,name:'Холодильная камера',type:'Техническая',w:2.0,h:2.9,l:1.5,area:3.0},
      {id:8,name:'Санузел (гости)',type:'Общественная',w:2.5,h:2.9,l:1.8,area:4.5},
      {id:9,name:'Санузел (персонал)',type:'Служебная',w:2.0,h:2.9,l:1.5,area:3.0},
      {id:10,name:'Раздевалка персонала',type:'Служебная',w:2.5,h:2.9,l:2.0,area:5.0},
      {id:11,name:'Терраса / Летняя зона',type:'Гостевая',w:6.0,h:0,l:4.0,area:24.0},
      {id:12,name:'Зона самообслуживания',type:'Гостевая',w:2.0,h:2.9,l:1.5,area:3.0}
    ],
    cabinetTypes:[
      {id:1,name:'Гостевой зал',icon:'☕',desc:'Основная зона обслуживания гостей',minArea:20,equipCats:['Мебель для зала']},
      {id:2,name:'Барная стойка',icon:'🍵',desc:'Зона приготовления напитков',minArea:6,equipCats:['Кофейное оборудование','Барное оборудование']},
      {id:3,name:'Кухня',icon:'🍳',desc:'Зона подготовки еды и десертов',minArea:8,equipCats:['Кухонное оборудование']},
      {id:4,name:'Кондитерский цех',icon:'🧁',desc:'Производство десертов и выпечки',minArea:8,equipCats:['Кондитерское оборудование']},
      {id:5,name:'Моечная',icon:'🧽',desc:'Мойка посуды',minArea:4,equipCats:['Моечное оборудование']},
      {id:6,name:'Склад',icon:'📦',desc:'Хранение сырья и расходников',minArea:4,equipCats:[]},
      {id:7,name:'Санузел',icon:'🚿',desc:'Санузлы для гостей и персонала',minArea:3,equipCats:[]},
      {id:8,name:'Терраса',icon:'☀️',desc:'Летняя зона обслуживания',minArea:10,equipCats:['Мебель для террасы']}
    ],
    zones:[
      {id:'guest',name:'Гостевая',color:'var(--gn)',icon:'☕'},
      {id:'work',name:'Рабочая',color:'var(--ac)',icon:'🔧'},
      {id:'technical',name:'Техническая',color:'var(--yl)',icon:'⚙️'},
      {id:'service',name:'Служебная',color:'#8b5cf6',icon:'🔒'}
    ],
    suppliers:[
      // Кофейное оборудование
      {id:1,name:'Кофемашина профессиональная (2 группы)',category:'Кофейное оборудование',price:25000,supplier:'La Marzocco',warranty:'24 мес'},
      {id:2,name:'Кофемолка (on-demand)',category:'Кофейное оборудование',price:6000,supplier:'Mahlkönig',warranty:'24 мес'},
      {id:3,name:'Кофемолка для фильтра',category:'Кофейное оборудование',price:4000,supplier:'Mahlkönig',warranty:'24 мес'},
      {id:4,name:'Пуровер станция (V60 / Chemex)',category:'Кофейное оборудование',price:800,supplier:'Hario',warranty:'12 мес'},
      {id:5,name:'Колд-брю система',category:'Кофейное оборудование',price:2500,supplier:'Toddy',warranty:'12 мес'},
      {id:6,name:'Питчер для молока (набор)',category:'Кофейное оборудование',price:400,supplier:'Motta',warranty:'—'},
      {id:7,name:'Темпер калиброванный',category:'Кофейное оборудование',price:350,supplier:'Pullman',warranty:'—'},
      {id:8,name:'Весы бариста',category:'Кофейное оборудование',price:500,supplier:'Acaia',warranty:'12 мес'},
      // Барное оборудование
      {id:10,name:'Холодильник барный',category:'Барное оборудование',price:4500,supplier:'Liebherr',warranty:'24 мес'},
      {id:11,name:'Льдогенератор',category:'Барное оборудование',price:5000,supplier:'Brema',warranty:'24 мес'},
      {id:12,name:'Блендер профессиональный',category:'Барное оборудование',price:3000,supplier:'Vitamix',warranty:'24 мес'},
      {id:13,name:'Соковыжималка',category:'Барное оборудование',price:2500,supplier:'Santos',warranty:'12 мес'},
      {id:14,name:'Витрина холодильная (десерты)',category:'Барное оборудование',price:8000,supplier:'ISA',warranty:'24 мес'},
      {id:15,name:'Сиропница (6 позиций)',category:'Барное оборудование',price:600,supplier:'—',warranty:'—'},
      {id:16,name:'Чайник электрический с гусиным носом',category:'Барное оборудование',price:500,supplier:'Fellow',warranty:'12 мес'},
      // Кухонное оборудование
      {id:20,name:'Духовой шкаф конвекционный',category:'Кухонное оборудование',price:12000,supplier:'Unox',warranty:'24 мес'},
      {id:21,name:'Расстоечный шкаф',category:'Кухонное оборудование',price:6000,supplier:'—',warranty:'24 мес'},
      {id:22,name:'Тостер / гриль-пресс',category:'Кухонное оборудование',price:2000,supplier:'—',warranty:'12 мес'},
      {id:23,name:'Микроволновая печь',category:'Кухонное оборудование',price:1500,supplier:'—',warranty:'12 мес'},
      {id:24,name:'Стол разделочный нерж.',category:'Кухонное оборудование',price:2500,supplier:'—',warranty:'—'},
      // Кондитерское оборудование
      {id:30,name:'Миксер планетарный',category:'Кондитерское оборудование',price:5000,supplier:'KitchenAid',warranty:'24 мес'},
      {id:31,name:'Шоколадный фонтан / темперирующая машина',category:'Кондитерское оборудование',price:3000,supplier:'—',warranty:'12 мес'},
      {id:32,name:'Холодильный стол кондитерский',category:'Кондитерское оборудование',price:7000,supplier:'—',warranty:'24 мес'},
      // Моечное оборудование
      {id:35,name:'Посудомоечная машина',category:'Моечное оборудование',price:8000,supplier:'Winterhalter',warranty:'24 мес'},
      {id:36,name:'Мойка 2-секционная нерж.',category:'Моечное оборудование',price:3000,supplier:'—',warranty:'—'},
      // Мебель для зала
      {id:40,name:'Столы (комплект 10 шт)',category:'Мебель для зала',price:12000,supplier:'—',warranty:'—'},
      {id:41,name:'Стулья (комплект 30 шт)',category:'Мебель для зала',price:15000,supplier:'—',warranty:'—'},
      {id:42,name:'Диваны / банкетки',category:'Мебель для зала',price:10000,supplier:'—',warranty:'—'},
      {id:43,name:'Барные стулья (8 шт)',category:'Мебель для зала',price:6000,supplier:'—',warranty:'—'},
      {id:44,name:'Вешалка / гардероб',category:'Мебель для зала',price:2000,supplier:'—',warranty:'—'},
      // Мебель для террасы
      {id:50,name:'Столы уличные (6 шт)',category:'Мебель для террасы',price:6000,supplier:'—',warranty:'—'},
      {id:51,name:'Стулья уличные (18 шт)',category:'Мебель для террасы',price:7200,supplier:'—',warranty:'—'},
      {id:52,name:'Зонты / маркизы',category:'Мебель для террасы',price:4000,supplier:'—',warranty:'—'},
      // IT и POS
      {id:60,name:'POS-терминал + ПО',category:'IT и POS',price:5000,supplier:'—',warranty:'12 мес'},
      {id:61,name:'Планшет для заказов',category:'IT и POS',price:2000,supplier:'—',warranty:'12 мес'},
      {id:62,name:'Wi-Fi роутер для гостей',category:'IT и POS',price:800,supplier:'—',warranty:'24 мес'},
      {id:63,name:'Экран меню (дисплей)',category:'IT и POS',price:3000,supplier:'—',warranty:'24 мес'},
      {id:64,name:'Аудиосистема (колонки + усилитель)',category:'IT и POS',price:4000,supplier:'—',warranty:'24 мес'}
    ],
    renovations:[
      // Электрика
      {id:'ce1',name:'Электрощит + автоматы',cat:'Электрика',price:5000},
      {id:'ce2',name:'Кабельные трассы',cat:'Электрика',price:8000},
      {id:'ce3',name:'Разводка по зонам (бар, кухня, зал)',cat:'Электрика',price:10000},
      {id:'ce4',name:'Освещение зала (дизайнерское)',cat:'Электрика',price:12000},
      {id:'ce5',name:'Освещение рабочих зон',cat:'Электрика',price:5000},
      {id:'ce6',name:'Вывеска световая',cat:'Электрика',price:4000},
      // Водоснабжение
      {id:'cw1',name:'Разводка ХВС/ГВС',cat:'Водоснабжение',price:6000},
      {id:'cw2',name:'Бойлер',cat:'Водоснабжение',price:4000},
      {id:'cw3',name:'Фильтрация воды (бар)',cat:'Водоснабжение',price:3000},
      {id:'cw4',name:'Канализация (кухня + моечная)',cat:'Водоснабжение',price:5000},
      {id:'cw5',name:'Жироуловитель',cat:'Водоснабжение',price:3500},
      // Вентиляция
      {id:'cv1',name:'Проект вентиляции',cat:'Вентиляция',price:4000},
      {id:'cv2',name:'Приточно-вытяжная установка',cat:'Вентиляция',price:14000},
      {id:'cv3',name:'Вытяжной зонт (кухня)',cat:'Вентиляция',price:6000},
      {id:'cv4',name:'Кондиционирование зала',cat:'Вентиляция',price:12000},
      // Отделка
      {id:'cf1',name:'Демонтаж старой отделки',cat:'Отделка',price:8000},
      {id:'cf2',name:'Стяжка пола',cat:'Отделка',price:8000},
      {id:'cf3',name:'Напольное покрытие (плитка + дерево)',cat:'Отделка',price:18000},
      {id:'cf4',name:'Штукатурка стен',cat:'Отделка',price:6000},
      {id:'cf5',name:'Декоративная отделка стен',cat:'Отделка',price:10000},
      {id:'cf6',name:'Потолки',cat:'Отделка',price:8000},
      {id:'cf7',name:'Плитка кухня + санузлы',cat:'Отделка',price:8000},
      // Двери, окна, фасад
      {id:'cd1',name:'Входная дверь (стеклянная)',cat:'Двери и фасад',price:6000},
      {id:'cd2',name:'Фасад (витрина, оклейка)',cat:'Двери и фасад',price:8000},
      {id:'cd3',name:'Вывеска фасадная',cat:'Двери и фасад',price:6000},
      // Безопасность
      {id:'cs1',name:'Камеры видеонаблюдения',cat:'Безопасность',price:6000},
      {id:'cs2',name:'Пожарная сигнализация',cat:'Безопасность',price:4000},
      {id:'cs3',name:'Охранная сигнализация',cat:'Безопасность',price:3000},
      // Мебель встроенная
      {id:'cm1',name:'Барная стойка (изготовление)',cat:'Мебель встроенная',price:15000},
      {id:'cm2',name:'Стеллажи и полки',cat:'Мебель встроенная',price:5000},
      {id:'cm3',name:'Зона кассы',cat:'Мебель встроенная',price:4000},
      // Пожарная безопасность
      {id:'cfp1',name:'Огнетушители',cat:'Пожарная безопасность',price:1000},
      {id:'cfp2',name:'План эвакуации',cat:'Пожарная безопасность',price:1200},
      {id:'cfp3',name:'Система оповещения',cat:'Пожарная безопасность',price:3000}
    ],
    vendorCompanies:[
      {id:'cv1',name:'La Marzocco',desc:'Итальянские эспрессо-машины премиум-класса',city:'Firenze',phone:'—',website:'lamarzocco.com',tags:['Кофемашины']},
      {id:'cv2',name:'Mahlkönig',desc:'Немецкие профессиональные кофемолки',city:'Hamburg',phone:'—',website:'mahlkoenig.com',tags:['Кофемолки']},
      {id:'cv3',name:'Winterhalter',desc:'Профессиональные посудомоечные машины',city:'Stuttgart',phone:'—',website:'winterhalter.com',tags:['Моечное']},
      {id:'cv4',name:'Unox',desc:'Конвекционные печи для выпечки',city:'Padova',phone:'—',website:'unox.com',tags:['Печи','Выпечка']},
      {id:'cv5',name:'Hario',desc:'Оборудование для альтернативного заваривания',city:'Tokyo',phone:'—',website:'hario.co.jp',tags:['Пуровер','Фильтр']}
    ]
  }
};

// Apply biz-type data to DB
function applyBizData(type){
  const data=BIZ_DATA[type];
  if(!data)return;
  DB.employees=JSON.parse(JSON.stringify(data.employees||DB.employees));
  DB.services=JSON.parse(JSON.stringify(data.services||DB.services));
  DB.rooms=JSON.parse(JSON.stringify(data.rooms||DB.rooms));
  DB.suppliers=JSON.parse(JSON.stringify(data.suppliers||DB.suppliers));
  DB.zones=JSON.parse(JSON.stringify(data.zones||DB.zones));
  DB.cabinetTypes=JSON.parse(JSON.stringify(data.cabinetTypes||DB.cabinetTypes));
  if(data.renovations)DB.renovations=JSON.parse(JSON.stringify(data.renovations));
  if(data.vendorCompanies)DB.vendorCompanies=JSON.parse(JSON.stringify(data.vendorCompanies));
  // Reset picked items (new concept = clean slate)
  DB.pickedStaff={};DB.pickedEquip={};DB.pickedServices={};DB.pickedRooms={};
  DB.pickedContractors={};DB.pickedRenovations={};DB.pickedDocs={};
}

// ═══════════════ AI (Jetson AGX Orin — Ollama qwen2.5:32b via Edge Function) ═══════════════
const AI_URL='https://scyraai-desktop.tail2060da.ts.net/functions/v1/ai-concept';
const AI_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzc1NTA4NjM0LCJleHAiOjE5MzMxODg2MzR9.4l7IBV5SjC8qZ4iJ-oMdLHP-sPP3O7Ab7eWS3PGkKi8';

let _aiGenTimer=null;
async function generateAIConcept(){
  const inp=document.getElementById('aiConceptInput');
  const btn=document.getElementById('aiGenBtn');
  const status=document.getElementById('aiGenStatus');
  const preview=document.getElementById('aiPreview');
  const desc=inp?.value?.trim();
  if(!desc){status.textContent='Опишите концепцию';status.style.color='var(--rd)';return}
  btn.disabled=true;
  if(preview)preview.style.display='none';
  // Animated progress
  let dots=0;let secs=0;
  const msgs=['Анализирую концепцию','Подбираю сотрудников','Формирую меню/услуги','Подбираю оборудование','Рассчитываю помещения','Составляю ремонтные работы','Финализирую'];
  status.innerHTML='<div style="display:flex;align-items:center;gap:8px"><div class="ai-spin"></div><span id="aiMsg">Отправляю на Jetson...</span></div><div style="margin-top:6px"><div style="height:3px;background:var(--bd);border-radius:2px;overflow:hidden"><div id="aiBar" style="height:100%;width:0%;background:linear-gradient(90deg,#8b5cf6,#3b82f6);transition:width 0.5s"></div></div><span id="aiTime" style="font-size:9px;color:var(--tx3)">0 сек</span></div>';
  _aiGenTimer=setInterval(()=>{
    secs++;
    const bar=document.getElementById('aiBar');
    const msg=document.getElementById('aiMsg');
    const time=document.getElementById('aiTime');
    if(time)time.textContent=secs+' сек';
    const pct=Math.min(95,secs*2.5);
    if(bar)bar.style.width=pct+'%';
    if(msg&&secs%5===0){const i=Math.min(Math.floor(secs/5),msgs.length-1);msg.textContent=msgs[i]+'...';}
  },1000);

  const prompt=`Ты — эксперт по открытию бизнеса в Польше. Пользователь описал концепцию: "${desc}"

Сгенерируй полную структуру для конструктора бизнеса. Ответ СТРОГО в JSON (без markdown, без \`\`\`):
{
  "name": "Название концепции",
  "employees": [{"id":1,"name":"Должность","spec":"Описание","salary":число_PLN,"status":"Вакансия"}],
  "services": [{"id":1,"name":"Название","time":"время","price":число_PLN}],
  "rooms": [{"id":1,"name":"Название помещения","type":"Тип зоны","w":ширина,"h":высота,"l":длина,"area":площадь}],
  "suppliers": [{"id":1,"name":"Название оборудования","category":"Категория","price":число_PLN,"supplier":"Производитель","warranty":"срок"}],
  "renovations": [{"id":"r1","name":"Название работы","cat":"Категория","price":число_PLN}],
  "cabinetTypes": [{"id":1,"name":"Тип помещения","icon":"emoji","desc":"Описание","minArea":число,"equipCats":["категория оборудования"]}],
  "zones": [{"id":"zone_id","name":"Название","color":"CSS цвет","icon":"emoji"}]
}

Правила:
- Цены в PLN, реалистичные для Польши 2026
- employees: 5-15 человек, реальные зарплаты
- services/меню: 15-50 позиций с ценами
- rooms: 8-15 помещений с реальными размерами
- suppliers/оборудование: 20-60 позиций, реальные бренды и цены
- renovations: 15-30 работ по категориям
- cabinetTypes: 5-10 типов помещений
- zones: 3-5 функциональных зон

ТОЛЬКО JSON, ничего больше.`;

  try{
    const res=await fetch(AI_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+AI_KEY},
      body:JSON.stringify({prompt,mode:'generate'})
    });
    const data=await res.json();
    if(data.error)throw new Error(data.error);
    const text=data.text;
    if(!text)throw new Error('Пустой ответ от AI');
    const jsonMatch=text.match(/\{[\s\S]*\}/);
    if(!jsonMatch)throw new Error('AI не вернул JSON');
    const clean=jsonMatch[0].replace(/```json?\n?/g,'').replace(/```/g,'').trim();
    const concept=JSON.parse(clean);
    _aiConcept=concept;
    clearInterval(_aiGenTimer);
    const bar=document.getElementById('aiBar');if(bar)bar.style.width='100%';
    // Show preview card
    const empCost=concept.employees?.reduce((s,e)=>s+(e.salary||0),0)||0;
    const equipCost=concept.suppliers?.reduce((s,e)=>s+(e.price||0),0)||0;
    const renoCost=concept.renovations?.reduce((s,e)=>s+(e.price||0),0)||0;
    status.innerHTML='<div style="color:var(--gn);font-weight:600;margin-bottom:8px">✓ Концепция «'+esc(concept.name||desc)+'» готова за '+secs+' сек</div>';
    if(preview){
      preview.style.display='block';
      preview.innerHTML='<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px">'+
        '<div style="background:var(--bg);border:1px solid var(--bd);border-radius:8px;padding:10px">'+
          '<div style="font-weight:600;margin-bottom:4px">👥 Сотрудники</div>'+
          '<div style="font-size:18px;font-weight:700">'+(concept.employees?.length||0)+'</div>'+
          '<div style="color:var(--tx3);font-size:10px">ФОТ '+Math.round(empCost/1000)+'k PLN/мес</div>'+
        '</div>'+
        '<div style="background:var(--bg);border:1px solid var(--bd);border-radius:8px;padding:10px">'+
          '<div style="font-weight:600;margin-bottom:4px">📋 Услуги/Меню</div>'+
          '<div style="font-size:18px;font-weight:700">'+(concept.services?.length||0)+'</div>'+
          '<div style="color:var(--tx3);font-size:10px">позиций</div>'+
        '</div>'+
        '<div style="background:var(--bg);border:1px solid var(--bd);border-radius:8px;padding:10px">'+
          '<div style="font-weight:600;margin-bottom:4px">🏗 Помещения</div>'+
          '<div style="font-size:18px;font-weight:700">'+(concept.rooms?.length||0)+'</div>'+
          '<div style="color:var(--tx3);font-size:10px">'+(concept.rooms?.reduce((s,r)=>s+(r.area||0),0)||0)+' м²</div>'+
        '</div>'+
        '<div style="background:var(--bg);border:1px solid var(--bd);border-radius:8px;padding:10px">'+
          '<div style="font-weight:600;margin-bottom:4px">⚙️ Оборудование</div>'+
          '<div style="font-size:18px;font-weight:700">'+(concept.suppliers?.length||0)+'</div>'+
          '<div style="color:var(--tx3);font-size:10px">'+Math.round(equipCost/1000)+'k PLN</div>'+
        '</div>'+
        '<div style="background:var(--bg);border:1px solid var(--bd);border-radius:8px;padding:10px">'+
          '<div style="font-weight:600;margin-bottom:4px">🔧 Ремонт</div>'+
          '<div style="font-size:18px;font-weight:700">'+(concept.renovations?.length||0)+'</div>'+
          '<div style="color:var(--tx3);font-size:10px">'+Math.round(renoCost/1000)+'k PLN</div>'+
        '</div>'+
        '<div style="background:var(--bg);border:1px solid var(--bd);border-radius:8px;padding:10px">'+
          '<div style="font-weight:600;margin-bottom:4px">📊 Итого старт</div>'+
          '<div style="font-size:18px;font-weight:700">'+Math.round((equipCost+renoCost)/1000)+'k</div>'+
          '<div style="color:var(--tx3);font-size:10px">PLN инвестиции</div>'+
        '</div>'+
      '</div>';
    }
    const applyBtn=document.getElementById('aiApplyBtn');
    if(applyBtn)applyBtn.style.display='block';
  }catch(e){
    clearInterval(_aiGenTimer);
    console.error('[AI]',e);
    status.innerHTML='<span style="color:var(--rd)">✗ Ошибка: '+esc(e.message||'не удалось разобрать ответ')+'</span>';
  }
  btn.disabled=false;btn.textContent='✨ Сгенерировать';
}

let _aiConcept=null;

async function applyAIConcept(){
  if(!_aiConcept)return;
  const applyBtn=document.getElementById('aiApplyBtn');
  if(applyBtn){applyBtn.disabled=true;applyBtn.textContent='Применяю...';}
  // Apply to DB
  if(_aiConcept.employees)DB.employees=_aiConcept.employees;
  if(_aiConcept.services)DB.services=_aiConcept.services;
  if(_aiConcept.rooms)DB.rooms=_aiConcept.rooms;
  if(_aiConcept.suppliers)DB.suppliers=_aiConcept.suppliers;
  if(_aiConcept.renovations)DB.renovations=_aiConcept.renovations;
  if(_aiConcept.cabinetTypes)DB.cabinetTypes=_aiConcept.cabinetTypes;
  if(_aiConcept.zones)DB.zones=_aiConcept.zones;
  // Reset picked
  DB.pickedStaff={};DB.pickedEquip={};DB.pickedServices={};DB.pickedRooms={};
  DB.pickedContractors={};DB.pickedRenovations={};DB.pickedDocs={};
  // Auto-pick all employees
  DB.employees.forEach(e=>{DB.pickedStaff[String(e.id)]={qty:1}});
  savePicked();
  // Save to Supabase
  const cname=_aiConcept.name||'AI концепция';
  await createConcept(cname,'ai');
  // Update sidebar
  updateBizUI();
  closeModal();
  buildSidebar();renderAll();recalc();
  toast('Концепция «'+(_aiConcept.name||'AI')+'» создана и сохранена','gn');
  _aiConcept=null;
}

// Show biz type selector (modal from within app)
function showBizSelector(){
  let html='<div style="padding:24px;max-width:520px;margin:auto">';
  html+='<div style="font-size:16px;font-weight:700;margin-bottom:4px">Выберите концепцию</div>';
  html+='<div style="font-size:11px;color:var(--tx3);margin-bottom:16px">Выберите из готовых шаблонов или сгенерируйте AI</div>';

  // AI Generator section
  html+='<div style="background:linear-gradient(135deg,rgba(139,92,246,0.08),rgba(59,130,246,0.08));border:1px solid rgba(139,92,246,0.2);border-radius:12px;padding:14px;margin-bottom:16px">';
  html+='<div style="font-size:12px;font-weight:700;color:#8b5cf6;margin-bottom:8px">✨ AI-генератор концепций</div>';
  html+='<textarea id="aiConceptInput" placeholder="Опишите вашу идею: например, кофейня-пекарня на 40 мест в Варшаве с авторскими десертами и specialty coffee..." style="width:100%;height:60px;background:var(--bg);border:1px solid var(--bd);border-radius:8px;color:var(--tx);font-family:var(--f);font-size:12px;padding:10px;resize:vertical;box-sizing:border-box"></textarea>';
  html+='<div style="display:flex;gap:8px;margin-top:8px;align-items:center">';
  html+='<button id="aiGenBtn" class="btn pr" style="padding:8px 16px;font-size:11px" onclick="generateAIConcept()">✨ Сгенерировать</button>';
  html+='<div id="aiGenStatus" style="font-size:10px;color:var(--tx3);flex:1"></div>';
  html+='</div>';
  html+='<div id="aiPreview" style="display:none;margin-top:10px"></div>';
  html+='<button id="aiApplyBtn" class="btn" style="display:none;width:100%;margin-top:8px;padding:10px;font-size:12px;background:linear-gradient(135deg,#8b5cf6,#3b82f6);color:#fff;border:none;font-weight:700;border-radius:8px;cursor:pointer" onclick="applyAIConcept()">🚀 Применить и начать работу</button>';
  html+='</div>';

  // Saved concepts from Supabase
  if(userConcepts&&userConcepts.length){
    html+='<div style="font-size:11px;font-weight:600;color:var(--tx3);margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">Мои концепции:</div>';
    html+='<div style="margin-bottom:16px;max-height:160px;overflow-y:auto">';
    userConcepts.forEach(cp=>{
      const d=cp.data||{};
      const bizIcon=d.bizType&&BIZ_TYPES[d.bizType]?BIZ_TYPES[d.bizType].icon:'📝';
      const date=new Date(cp.updated_at||cp.created_at).toLocaleDateString('ru');
      const isCurrent=window._currentConceptId===cp.id;
      html+=`<div onclick="closeModal();loadConceptById('${cp.id}')" style="display:flex;align-items:center;gap:10px;padding:10px 12px;cursor:pointer;border:1px solid ${isCurrent?'var(--ac)':'var(--bd)'};border-radius:10px;background:${isCurrent?'var(--acbg)':'var(--sf2)'};margin-bottom:4px;transition:all .2s">
<div style="font-size:20px">${bizIcon}</div>
<div style="flex:1;min-width:0">
<div style="font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--tx)">${esc(cp.name)}${isCurrent?' <span style="color:var(--gn);font-size:9px">● АКТИВНАЯ</span>':''}</div>
<div style="font-size:10px;color:var(--tx3)">${d.employees?.length||0} сотр. · ${d.services?.length||0} услуг · ${date}</div>
</div></div>`;
    });
    html+='</div>';
  }

  // Ready templates
  html+='<div style="font-size:11px;font-weight:600;color:var(--tx3);margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">Новая из шаблона:</div>';
  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">';
  Object.entries(BIZ_TYPES).forEach(([key,bt])=>{
    const sel=currentBizType===key;
    html+=`<div onclick="pickBizType('${key}')" style="padding:14px;cursor:pointer;border:2px solid ${sel?bt.color:'var(--bd)'};border-radius:12px;background:${sel?bt.color+'15':'var(--sf2)'};text-align:center;transition:all .2s" data-btype="${key}">
<div style="font-size:32px;margin-bottom:4px">${bt.icon}</div>
<div style="font-size:13px;font-weight:700;color:${sel?bt.color:'var(--tx)'}">${bt.name}</div>
<div style="font-size:10px;color:var(--tx3);margin-top:2px">${bt.subtypes.length} форматов</div></div>`;
  });
  html+='</div>';
  // Subtypes
  html+='<div id="bizModalSubs" style="display:none;margin-bottom:16px"></div>';
  html+='<div style="display:flex;gap:8px">';
  html+='<button class="btn" style="flex:1;padding:10px" onclick="closeModal()">Отмена</button>';
  html+='<button class="btn pr" style="flex:1;padding:10px" onclick="confirmBizChange()">Применить шаблон</button>';
  html+='</div></div>';
  // Reuse existing modal system
  document.getElementById('modalTitle').textContent='Концепция';
  document.getElementById('modalFields').innerHTML=html;
  const ms=document.getElementById('modalSave');
  if(ms)ms.style.display='none'; // hide default save button
  document.getElementById('modalBg').classList.add('vis');
  // If type already selected, show subtypes
  if(currentBizType)pickBizType(currentBizType);
}

let _pendingBizType=null,_pendingBizSub=null;

function pickBizType(key){
  _pendingBizType=key;
  _pendingBizSub=null;
  const bt=BIZ_TYPES[key];
  // Highlight selected type
  document.querySelectorAll('[data-btype]').forEach(el=>{
    const isSel=el.dataset.btype===key;
    el.style.borderColor=isSel?bt.color:'var(--bd)';
    el.style.background=isSel?bt.color+'15':'var(--sf2)';
    el.querySelector('div:nth-child(2)').style.color=isSel?bt.color:'var(--tx)';
  });
  // Render subtypes
  const subs=document.getElementById('bizModalSubs');
  let h='<div style="font-size:12px;font-weight:600;margin-bottom:8px;color:var(--tx2)">'+bt.name+' — формат:</div>';
  bt.subtypes.forEach(st=>{
    const sel=currentBizSubtype===st.id;
    h+=`<div onclick="pickBizSub('${st.id}')" data-bsub="${st.id}" style="padding:8px 12px;cursor:pointer;border:1px solid ${sel?bt.color:'var(--bd)'};border-radius:8px;background:${sel?bt.color+'12':'var(--sf2)'};margin-bottom:4px;transition:all .2s">
<div style="font-size:12px;font-weight:600;color:${sel?bt.color:'var(--tx)'}">${st.name}</div>
<div style="font-size:10px;color:var(--tx3)">${st.desc}</div></div>`;
  });
  subs.innerHTML=h;subs.style.display='block';
}

function pickBizSub(id){
  _pendingBizSub=id;
  const bt=BIZ_TYPES[_pendingBizType];
  document.querySelectorAll('[data-bsub]').forEach(el=>{
    const isSel=el.dataset.bsub===id;
    el.style.borderColor=isSel?bt.color:'var(--bd)';
    el.style.background=isSel?bt.color+'12':'var(--sf2)';
    el.querySelector('div').style.color=isSel?bt.color:'var(--tx)';
  });
}

async function confirmBizChange(){
  if(!_pendingBizType)return;
  const changed=_pendingBizType!==currentBizType;
  currentBizType=_pendingBizType;
  currentBizSubtype=_pendingBizSub;
  localStorage.setItem('svita_biz_type',currentBizType);
  if(currentBizSubtype)localStorage.setItem('svita_biz_subtype',currentBizSubtype);
  // Apply data if changed
  if(changed){
    if(currentBizType!=='dental'&&BIZ_DATA[currentBizType]){
      applyBizData(currentBizType);
    }else if(currentBizType==='dental'){
      location.reload();return;
    }
    // Auto-pick employees
    DB.employees.forEach(e=>{DB.pickedStaff[String(e.id)]={qty:1}});
    savePicked();
    // Save to Supabase
    const bt=BIZ_TYPES[currentBizType];
    const sub=currentBizSubtype?bt.subtypes.find(s=>s.id===currentBizSubtype):null;
    const cname=sub?sub.name:bt.name;
    await createConcept(cname,'template');
  }
  updateBizUI();
  closeModal();
  buildSidebar();renderAll();recalc();
}

function updateBizUI(){
  const btn=document.getElementById('sideBizBtn');
  const icon=document.getElementById('sideBizIcon');
  const name=document.getElementById('sideBizName');
  const tag=document.getElementById('sideTag');
  // Only show for admin/owner
  if(!btn)return;
  if(!['admin','owner'].includes(currentRole)){btn.style.display='none';return}
  btn.style.display='block';
  if(currentBizType&&BIZ_TYPES[currentBizType]){
    const bt=BIZ_TYPES[currentBizType];
    const sub=currentBizSubtype?bt.subtypes.find(s=>s.id===currentBizSubtype):null;
    btn.style.borderColor=bt.color+'40';
    if(icon)icon.textContent=bt.icon;
    if(name)name.textContent=sub?sub.name:bt.name;
    if(tag)tag.textContent=bt.icon+' '+(sub?sub.name:bt.name);
  }else{
    if(icon)icon.textContent='🏢';
    if(name)name.textContent='Выбрать концепцию';
    if(tag)tag.textContent='Конструктор бизнеса';
  }
}

// Save current or create new concept
async function saveOrCreateConcept(){
  if(window._currentConceptId){
    // Update existing
    await saveCurrentConcept();
    toast('Концепция сохранена','gn');
    await loadConcepts();
  }else{
    // No active concept — create new
    const name=prompt('Название концепции:','Моя концепция');
    if(!name)return;
    await createConcept(name,'manual');
  }
}

// Start fresh new concept
async function newConcept(){
  // Save current first if exists
  if(window._currentConceptId){
    await saveCurrentConcept();
  }
  // Ask for name
  const name=prompt('Название новой концепции:');
  if(!name)return;
  // Reset workspace to defaults
  window._currentConceptId=null;
  window._currentConceptName=null;
  currentBizType=null;currentBizSubtype=null;
  localStorage.removeItem('svita_biz_type');
  localStorage.removeItem('svita_biz_subtype');
  // Show biz selector for new concept
  showBizSelector();
}

function showLogin(){
  document.getElementById('loginStep1').style.display='block';
  document.getElementById('loginStep2').style.display='none';
  document.getElementById('loginRegister').style.display='none';
  document.getElementById('loginVerify').style.display='none';
  document.getElementById('loginError').textContent='';
}
function showRegister(){
  document.getElementById('loginStep1').style.display='none';
  document.getElementById('loginStep2').style.display='none';
  document.getElementById('loginRegister').style.display='block';
  document.getElementById('loginVerify').style.display='none';
  document.getElementById('regError').textContent='';
}

async function loginCheck(){
  const email=document.getElementById('loginEmail').value.trim().toLowerCase();
  const pass=document.getElementById('loginPass').value;
  if(!email||!pass){document.getElementById('loginError').textContent='Введите email и пароль';return}
  if(!sb){document.getElementById('loginError').textContent='Supabase не загружен';return}
  if(!rateLimit('login',5,600000)){document.getElementById('loginError').textContent='Слишком много попыток. Подождите 10 минут.';return}
  document.getElementById('loginError').textContent='Входим...';
  const{data,error}=await sb.rpc('verify_password',{p_email:email,p_password:pass});
  if(error){document.getElementById('loginError').textContent='Ошибка сервера';return}
  if(!data||!data.ok){document.getElementById('loginError').textContent='Неверный email или пароль';return}
  const isAdmin=data.role==='superadmin'||data.role==='admin';
  currentUser={email:data.email,name:data.name||data.email.split('@')[0],isAdmin,emailConfirmed:true,id:data.id};
  localStorage.setItem('svita_session',JSON.stringify(currentUser));
  proceedToRoleSelect();
}

async function registerUser(){
  const email=document.getElementById('regEmail').value.trim().toLowerCase();
  const pass=document.getElementById('regPass').value;
  const name=email.split('@')[0];
  if(!email||!pass){document.getElementById('regError').textContent='Заполните все поля';return}
  if(pass.length<8){document.getElementById('regError').textContent='Пароль минимум 6 символов';return}
  if(!sb){document.getElementById('regError').textContent='Supabase не загружен';return}
  if(!rateLimit('register',3,600000)){document.getElementById('regError').textContent='Слишком много попыток. Подождите 10 минут.';return}
  document.getElementById('regError').textContent='Регистрируем...';
  const{data,error}=await sb.rpc('register_user',{p_email:email,p_password:pass,p_name:name,p_role:'viewer'});
  if(error){document.getElementById('regError').textContent='Ошибка сервера';return}
  if(!data||!data.ok){document.getElementById('regError').textContent=data?.error||'Ошибка регистрации';return}
  document.getElementById('regError').style.color='var(--gn)';
  document.getElementById('regError').textContent='Аккаунт создан! Войдите с вашим email и паролем.';
}

async function resendVerification(){
  const email=document.getElementById('verifyEmail').textContent;
  if(!sb||!email)return;
  const btn=document.getElementById('resendBtn');
  btn.textContent='Отправляем...';btn.disabled=true;
  const{error}=await sb.auth.resend({type:'signup',email,options:{emailRedirectTo:location.origin+location.pathname}});
  btn.textContent=error?'Ошибка: '+error.message:'Отправлено повторно!';
  setTimeout(()=>{btn.textContent='Отправить повторно';btn.disabled=false},4000);
}

async function oauthLogin(provider){
  if(!sb)return;
  const{error}=await sb.auth.signInWithOAuth({provider,options:{redirectTo:location.origin+location.pathname}});
  if(error)document.getElementById('loginError').textContent=error.message;
}

// ═══ RATE LIMITING (client-side UX only — Supabase Auth handles server-side) ═══
const _rl={};
function rateLimit(key,maxAttempts,windowMs){
  const now=Date.now();
  if(!_rl[key])_rl[key]=[];
  _rl[key]=_rl[key].filter(t=>now-t<windowMs);
  if(_rl[key].length>=maxAttempts)return false;
  _rl[key].push(now);
  return true;
}

// ═══ AUDIT LOG ═══
function logAction(action,entityType,entityId,metadata){
  if(!sb||!currentUser)return;
  sb.from('audit_logs').insert({user_id:currentUser.id,action,entity_type:entityType||null,entity_id:entityId||null,metadata:metadata||{}}).then(()=>{});
}

// ═══ FORGOT / RESET PASSWORD ═══
function showForgotPassword(){
  hideAllLoginSteps();
  document.getElementById('loginForgot').style.display='block';
  document.getElementById('forgotError').textContent='';
  document.getElementById('forgotEmail').value=document.getElementById('loginEmail')?.value||'';
}

async function sendResetLink(){
  const email=document.getElementById('forgotEmail').value.trim().toLowerCase();
  if(!email){document.getElementById('forgotError').textContent='Введите email';document.getElementById('forgotError').style.color='var(--rd)';return}
  if(!rateLimit('forgot',3,300000)){document.getElementById('forgotError').textContent='Слишком много попыток. Подождите 5 минут.';document.getElementById('forgotError').style.color='var(--rd)';return}
  const btn=document.getElementById('forgotBtn');
  btn.textContent='Отправляем...';btn.disabled=true;
  const{error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname+'?type=recovery'});
  if(error){
    document.getElementById('forgotError').textContent=error.message;
    document.getElementById('forgotError').style.color='var(--rd)';
  }else{
    document.getElementById('forgotError').textContent='Ссылка отправлена на '+email+'. Проверьте почту.';
    document.getElementById('forgotError').style.color='var(--gn)';
  }
  btn.textContent='Отправить ссылку';btn.disabled=false;
}

async function resetPassword(){
  const p1=document.getElementById('resetPass1').value;
  const p2=document.getElementById('resetPass2').value;
  if(!p1||p1.length<8){document.getElementById('resetError').textContent='Минимум 8 символов';document.getElementById('resetError').style.color='var(--rd)';return}
  if(p1!==p2){document.getElementById('resetError').textContent='Пароли не совпадают';document.getElementById('resetError').style.color='var(--rd)';return}
  const btn=document.getElementById('resetBtn');
  btn.textContent='Сохраняем...';btn.disabled=true;
  const{error}=await sb.auth.updateUser({password:p1});
  if(error){
    document.getElementById('resetError').textContent=error.message;
    document.getElementById('resetError').style.color='var(--rd)';
  }else{
    document.getElementById('resetError').textContent='Пароль обновлён! Входим...';
    document.getElementById('resetError').style.color='var(--gn)';
    setTimeout(()=>{restoreSession()},1000);
  }
  btn.textContent='Сохранить пароль';btn.disabled=false;
}

async function proceedToRoleSelect(){
  // Check if user already completed onboarding (has role in profiles)
  if(sb&&currentUser&&!currentUser.isAdmin){
    const{data:prof}=await sb.from('profiles').select('role,profile_complete,phone,company').eq('email',currentUser.email).single();
    if(prof&&prof.profile_complete&&prof.role){
      // Profile complete — skip onboarding, go straight to app
      currentRole=prof.role;
      currentUser.phone=prof.phone||'';
      currentUser.company=prof.company||'';
      localStorage.setItem('svita_role',currentRole);
      enterApp();
      return;
    }
  }
  // Admin — show role select (old flow)
  if(currentUser.isAdmin){
    hideAllLoginSteps();
    document.getElementById('loginStep2').style.display='block';
    document.getElementById('loginUserName').textContent=currentUser.name;
    const badge=document.getElementById('emailBadge');
    if(badge)badge.innerHTML=currentUser.emailConfirmed?'<span style="color:var(--gn)">&#10003; Email подтверждён</span>':'<span style="color:var(--or)">&#9888; Email не подтверждён</span>';
    document.getElementById('roleOptAdmin').style.display='flex';
    document.querySelector('[data-role="admin"]').classList.add('sel');
    currentRole='admin';
    return;
  }
  // New user or incomplete profile — show onboarding
  showOnboarding();
}

function hideAllLoginSteps(){
  ['loginStep1','loginRegister','loginVerify','loginStep2','loginOnboard','loginForgot','loginReset'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.style.display='none';
  });
}

function showOnboarding(){
  hideAllLoginSteps();
  document.getElementById('loginOnboard').style.display='block';
  document.getElementById('obError').textContent='';
}

let obSelectedRole=null;
function selectObRole(el){
  document.querySelectorAll('#obRoles .login-role').forEach(r=>r.classList.remove('sel'));
  el.classList.add('sel');
  obSelectedRole=el.dataset.role;
}

async function completeOnboarding(){
  if(!obSelectedRole){document.getElementById('obError').textContent='Выберите роль';return}
  document.getElementById('obError').textContent='Сохраняем...';
  const name=currentUser.name||currentUser.email.split('@')[0];
  currentRole=obSelectedRole;
  // Save to Supabase profiles (role is permanent, rest filled in profile)
  if(sb){
    await sb.from('profiles').upsert({
      email:currentUser.email,
      display_name:name,
      role:currentRole,
      profile_complete:true,
      last_login:new Date().toISOString()
    },{onConflict:'email'});
    await sb.auth.updateUser({data:{name,role:currentRole,profile_complete:true}});
    // Create subscription if not exists
    await sb.from('subscriptions').upsert({user_id:currentUser.id},{onConflict:'user_id'});
  }
  localStorage.setItem('svita_role',currentRole);
  // Owner — show biz type selection; others — go straight to app
  if(currentRole==='owner'){
    document.getElementById('loginOnboard').style.display='none';
    document.getElementById('loginStep25').style.display='block';
    renderBizTypes();
  }else{
    enterApp();
  }
}

function selectRole(el){
  document.querySelectorAll('#loginRoles .login-role').forEach(r=>r.classList.remove('sel'));
  el.classList.add('sel');
  currentRole=el.dataset.role;
}

function afterRoleSelect(){
  if(!currentRole||!currentUser)return;
  // Suppliers, contractors, employees — skip biz type, go straight to app
  if(['contractor','supplier','employee'].includes(currentRole)){
    enterApp();return;
  }
  // Admin/owner — show business type selection
  document.getElementById('loginStep2').style.display='none';
  document.getElementById('loginStep25').style.display='block';
  renderBizTypes();
  // Restore saved biz type
  const saved=localStorage.getItem('svita_biz_type');
  const savedSub=localStorage.getItem('svita_biz_subtype');
  if(saved&&BIZ_TYPES[saved]){
    selectBizType(saved);
    if(savedSub)selectBizSubtype(savedSub);
  }
}

function renderBizTypes(){
  const c=document.getElementById('bizTypeCards');
  let html='';
  Object.entries(BIZ_TYPES).forEach(([key,bt])=>{
    html+=`<div class="login-role" style="padding:12px;cursor:pointer;border:2px solid ${currentBizType===key?bt.color:'var(--bd)'};border-radius:12px;background:${currentBizType===key?bt.color+'12':'var(--sf2)'};transition:all .2s" onclick="selectBizType('${key}')" data-biz="${key}">
<div style="font-size:28px;margin-bottom:4px">${bt.icon}</div>
<div style="font-size:12px;font-weight:700;color:${currentBizType===key?bt.color:'var(--tx)'}">${bt.name}</div>
</div>`;
  });
  c.innerHTML=html;
}

function selectBizType(key){
  currentBizType=key;
  currentBizSubtype=null;
  renderBizTypes();
  const bt=BIZ_TYPES[key];
  const wrap=document.getElementById('bizSubtypeWrap');
  const cards=document.getElementById('bizSubtypeCards');
  document.getElementById('bizSubtypeLabel').textContent=bt.name+' — формат';
  let html='';
  bt.subtypes.forEach(st=>{
    html+=`<div class="login-role" style="padding:10px 14px;cursor:pointer;border:1px solid ${currentBizSubtype===st.id?bt.color:'var(--bd)'};border-radius:10px;background:${currentBizSubtype===st.id?bt.color+'12':'var(--sf2)'};display:flex;align-items:center;gap:10px;transition:all .2s" onclick="selectBizSubtype('${st.id}')" data-sub="${st.id}">
<div><div style="font-size:12px;font-weight:600;color:${currentBizSubtype===st.id?bt.color:'var(--tx)'}">${st.name}</div>
<div style="font-size:10px;color:var(--tx3)">${st.desc}</div></div></div>`;
  });
  cards.innerHTML=html;
  wrap.style.display='block';
}

function selectBizSubtype(id){
  currentBizSubtype=id;
  const bt=BIZ_TYPES[currentBizType];
  const cards=document.getElementById('bizSubtypeCards');
  cards.querySelectorAll('.login-role').forEach(el=>{
    const isSel=el.dataset.sub===id;
    el.style.borderColor=isSel?bt.color:'var(--bd)';
    el.style.background=isSel?bt.color+'12':'var(--sf2)';
    el.querySelector('div>div').style.color=isSel?bt.color:'var(--tx)';
  });
}

function enterApp(){
  if(!currentRole||!currentUser)return;
  // Apply business-type data if not dental (dental = default DB)
  if(currentBizType&&currentBizType!=='dental'&&BIZ_DATA[currentBizType]){
    applyBizData(currentBizType);
  }
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('appContainer').style.display='flex';
  const _sa=document.getElementById('sideAvatar'),_sn=document.getElementById('sideName'),_sr=document.getElementById('sideRole');
  if(_sa){_sa.style.background=ROLE_COLORS[currentRole];_sa.textContent=currentUser.name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase()}
  if(_sn)_sn.textContent=currentUser.name;
  if(_sr)_sr.textContent=ROLE_NAMES[currentRole];
  document.getElementById('roleLabel').textContent=ROLE_NAMES[currentRole];
  document.getElementById('roleLabel').style.background=currentRole==='admin'?'rgba(59,130,246,.1)':currentRole==='contractor'?'rgba(249,115,22,.1)':currentRole==='supplier'?'rgba(139,92,246,.1)':currentRole==='employee'?'rgba(6,182,212,.1)':'rgba(34,197,94,.1)';
  document.getElementById('roleLabel').style.color=currentRole==='admin'?'var(--ac2)':currentRole==='contractor'?'var(--or)':currentRole==='supplier'?'#d946ef':currentRole==='employee'?'#06b6d4':'var(--gn)';
  updateTopUser();
  logAction('login','auth',null,{method:'session',role:currentRole});
  // Save role + biz type in localStorage
  localStorage.setItem('svita_role',currentRole);
  if(currentBizType){localStorage.setItem('svita_biz_type',currentBizType)}
  if(currentBizSubtype){localStorage.setItem('svita_biz_subtype',currentBizSubtype)}
  // Update sidebar biz type button and tag
  updateBizUI();
  // Track session + update profile + sync to DB.users
  if(sb&&currentUser.email){
    sb.from('user_sessions').insert({email:currentUser.email,user_agent:navigator.userAgent}).then(()=>{});
    sb.from('profiles').upsert({email:currentUser.email,display_name:currentUser.name,role:currentRole,last_login:new Date().toISOString()},{onConflict:'email'}).then(()=>{}).catch(()=>{});
    sb.from('page_views').insert({page:'/dashboard',user_agent:navigator.userAgent,referrer:document.referrer||null}).then(()=>{});
    // Ensure current user is in DB.users
    if(!DB.users.find(u=>u.email===currentUser.email)){
      DB.users.push({id:genUserId(),name:currentUser.name,email:currentUser.email,role:currentRole,plan:'trial',status:'Активен',created:new Date().toISOString().slice(0,10)});
    }
  }
  // Restore property card state (per-user) with legacy migration
  let savedProp=uGet('svita_property');
  if(!savedProp){const oldKey=uKeyOld('svita_property');savedProp=localStorage.getItem(oldKey);if(savedProp){uSet('svita_property',savedProp)}}
  if(!savedProp){savedProp=localStorage.getItem('svita_property');if(savedProp){uSet('svita_property',savedProp)}}
  // Cross-user property fallback removed — security
  if(savedProp){try{activeProperty=JSON.parse(savedProp)}catch(e){activeProperty=null}}
  else{activeProperty=currentRole==='admin'?{...DEFAULT_PROPERTY}:null}
  migrateLocalStorageKeys(currentUser.id);
  loadPicked();loadBusinessModel();
  // Auto-pick all default employees if pickedStaff is empty (first launch)
  if(!Object.keys(DB.pickedStaff||{}).length&&currentRole==='admin'){
    DB.employees.forEach(e=>{DB.pickedStaff[String(e.id)]={qty:1}});
    savePicked();
  }
  // Apply saved staff edits from pickedStaff onto DB.employees
  Object.entries(DB.pickedStaff||{}).forEach(([id,over])=>{
    if(over.name||over.salary||over.spec||over.status){
      const e=DB.employees.find(x=>String(x.id)===String(id));
      if(e)Object.assign(e,over);
      else DB.employees.push({id:id,...over});
    }
  });
  achUnlocked=new Set(JSON.parse(uGet('svita_ach')||'[]'));
  try{itemImages=JSON.parse(uGet('svita_images')||'{}')}catch(e){itemImages={}}
  fpInit();
  buildSidebar();
  renderAll();
  recalc();
  nav('overview');
  loadSupabaseData();
  // Onboarding for first-time users (not admin)
  if(currentRole!=='admin'&&!uGet('svita_onboarded')){setTimeout(startOnboarding,500)}
}

async function logout(){
  logAction('logout','auth');
  currentUser=null;currentRole=null;
  // Clear in-memory data to prevent bleed between accounts
  PICKED_KEYS.forEach(k=>{DB[k]={}});
  activeProperty=null;
  if(FP){FP.rooms=[];FP.elements=[];if(typeof fpDraw==='function')fpDraw()}
  achUnlocked=new Set();itemImages={};
  window._currentConceptId=null;window._currentConceptName=null;
  localStorage.removeItem('svita_role');
  localStorage.removeItem('svita_session');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('appContainer').style.display='none';
  showLogin();
  document.getElementById('loginEmail').value='';
  document.getElementById('loginPass').value='';
}

function updateTopUser(){
  if(!currentUser)return;
  const initials=currentUser.name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
  const bg=ROLE_COLORS[currentRole]||'var(--ac)';
  document.getElementById('topAvatar').style.background=bg;
  document.getElementById('topAvatar').textContent=initials;
  document.getElementById('topUserName').textContent=currentUser.name;
  document.getElementById('topUserRole').textContent=ROLE_NAMES[currentRole]||currentRole;
  // Proton-style dropdown
  const ma=document.getElementById('topMenuAvatar');
  if(ma){ma.style.background=bg;ma.textContent=initials}
  const mn=document.getElementById('topMenuName');
  if(mn)mn.textContent=currentUser.name;
  const me=document.getElementById('topMenuEmail');
  if(me)me.textContent=currentUser.email||'';
  const mp=document.getElementById('topMenuPlan');
  if(mp){const plan=currentUser.plan||'trial';const plans={trial:{t:'TRIAL',bg:'var(--sf2)',c:'var(--tx3)'},pro:{t:'PRO',bg:'linear-gradient(135deg,#3b82f6,#6366f1)',c:'#fff'},unlimited:{t:'UNLIMITED',bg:'linear-gradient(135deg,#c9a96e,#e8c97a)',c:'#000'}};const p=plans[plan]||plans.trial;mp.textContent=p.t;mp.style.background=p.bg;mp.style.color=p.c}
}

function showProfileModal(){
  document.getElementById('topUser').classList.remove('open');
  const u=currentUser;if(!u)return;
  const html=`<div class="modal-field"><label>Имя</label><input id="mf_profName" value="${u.name||''}" style="background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:10px;color:var(--tx);font-family:var(--f);font-size:13px;width:100%"></div>
<div class="modal-field"><label>Email</label><input value="${u.email||''}" disabled style="background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:10px;color:var(--tx3);font-family:var(--f);font-size:13px;width:100%"></div>
<div class="modal-field"><label>Телефон</label><input id="mf_profPhone" value="${u.phone||''}" placeholder="+48 500 000 000" style="background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:10px;color:var(--tx);font-family:var(--f);font-size:13px;width:100%"></div>
<div class="modal-field"><label>Компания</label><input id="mf_profCompany" value="${u.company||''}" placeholder="Название" style="background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:10px;color:var(--tx);font-family:var(--f);font-size:13px;width:100%"></div>
<div class="modal-field"><label>Роль <span style="font-size:9px;color:var(--tx3);font-weight:400">(нельзя изменить)</span></label><input value="${ROLE_NAMES[currentRole]||''}" disabled style="background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:10px;color:var(--tx3);font-family:var(--f);font-size:13px;width:100%"></div>`;
  document.getElementById('modalTitle').textContent='Профиль';
  document.getElementById('modalFields').innerHTML=html;
  document.getElementById('modalSave').onclick=()=>{
    const newName=document.getElementById('mf_profName').value.trim();
    const phone=document.getElementById('mf_profPhone').value.trim();
    const company=document.getElementById('mf_profCompany').value.trim();
    if(newName){
      currentUser.name=newName;
      currentUser.phone=phone;
      currentUser.company=company;
      updateTopUser();
      const _sa2=document.getElementById('sideAvatar');if(_sa2)_sa2.textContent=newName.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
      const _sn2=document.getElementById('sideName');if(_sn2)_sn2.textContent=newName;
      if(sb)sb.from('profiles').upsert({email:currentUser.email,display_name:newName,phone,company},{onConflict:'email'}).then(()=>{});
    }
    closeModal();
  };
  document.getElementById('modalBg').classList.add('vis');
}

document.addEventListener('click',function(e){
  const tu=document.getElementById('topUser');
  if(tu&&!tu.contains(e.target))tu.classList.remove('open');
});

// Auto-restore session from localStorage — with server re-validation
(async function restoreSession(){
  try{
    const saved=localStorage.getItem('svita_session');
    if(!saved)return;
    const u=JSON.parse(saved);
    if(!u||!u.email||!u.id)return;
    // Re-validate session against server (non-blocking — if server down, use cached)
    currentUser=u;
    if(sb){
      try{
        const{data}=await sb.from('profiles').select('id,email,name,role').eq('email',u.email).single();
        if(data){
          const isAdmin=data.role==='superadmin'||data.role==='admin';
          currentUser={email:data.email,name:data.name||data.email.split('@')[0],isAdmin,emailConfirmed:true,id:data.id||u.id};
          localStorage.setItem('svita_session',JSON.stringify(currentUser));
        }
      }catch(e){/* server unreachable — use cached session */}
    }
    // Restore biz type
    const sBiz=localStorage.getItem('svita_biz_type');
    const sBizSub=localStorage.getItem('svita_biz_subtype');
    if(sBiz&&BIZ_TYPES[sBiz]){currentBizType=sBiz;currentBizSubtype=sBizSub||null}
    const role=localStorage.getItem('svita_role');
    if(role){
      currentRole=role;
      setTimeout(()=>{enterApp()},50);
    }else if(currentUser.isAdmin){
      currentRole='admin';
      localStorage.setItem('svita_role','admin');
      setTimeout(()=>{enterApp()},50);
    }else{
      setTimeout(()=>{showOnboarding()},50);
    }
  }catch(e){console.error('[SVITA] restoreSession error',e)}
})();

function toggleMobileSidebar(){
  const s=document.getElementById('sidebar');
  const o=document.getElementById('mobOverlay');
  s.classList.toggle('mob-open');
  o.classList.toggle('vis');
}
function buildSidebar(){
  const n=document.getElementById('sideNav');
  let html='<div class="si act" data-nav="overview"><span class="ico">&#9673;</span><span class="sl">Обзор</span></div>';

  if(currentRole==='admin'||currentRole==='owner'){
    html+='<div class="side-sec">Аналитика</div>';
    html+='<div class="si" data-nav="budget"><span class="ico">&#128176;</span><span class="sl">Бюджет</span></div>';
    html+='<div class="si" data-nav="profit"><span class="ico">&#128200;</span><span class="sl">Рентабельность</span></div>';
    html+='<div class="si" data-nav="zones"><span class="ico">&#127968;</span><span class="sl">Зоны</span></div>';
    const _ctIcon=currentBizType==='dental'?'🏥':'🏢';
    const _ctLabel=currentBizType==='dental'?'Стоимость кабинетов':'Стоимость помещений';
    html+='<div class="si" data-nav="cabinet-types"><span class="ico">'+_ctIcon+'</span><span class="sl">'+_ctLabel+'</span><span class="sb wip">'+getPickedRoomsList().length+'</span></div>';
  }

  if(currentRole==='admin'||currentRole==='owner'){
    html+='<div class="side-sec">Базы данных</div>';
    const _pr=Object.keys(DB.pickedRenovations||{}).length;
    const _pe=Object.keys(DB.pickedEquip||{}).length;
    const _ps=Object.keys(DB.pickedStaff||{}).length;
    const _pd=Object.keys(DB.pickedDocs||{}).length;
    html+='<div class="si si-clr" style="--si-clr:#3b82f6" data-nav="db-premises"><span class="ico">&#127970;</span><span class="sl">Помещения</span><span class="sb wip">'+DB.premises.length+'</span></div>';
    html+='<div class="si si-clr" style="--si-clr:#f59e0b" data-nav="db-renovations"><span class="ico">&#128736;</span><span class="sl">Модернизация</span><span class="sb wip">'+(DB.renovations.length+DB.services.length)+'</span>'+(_pr?'<span class="sb ok">&#10003;'+_pr+'</span>':'')+'</div>';
    html+='<div class="si si-clr" style="--si-clr:#8b5cf6" data-nav="db-suppliers"><span class="ico">&#128230;</span><span class="sl">Оборудование</span><span class="sb wip">'+DB.suppliers.length+'</span>'+(_pe?'<span class="sb ok">&#10003;'+_pe+'</span>':'')+'</div>';
    html+='<div class="si si-clr" style="--si-clr:#06b6d4" data-nav="db-employees"><span class="ico">&#129489;</span><span class="sl">Сотрудники</span><span class="sb wip">'+DB.employees.length+'</span>'+(_ps?'<span class="sb ok">&#10003;'+_ps+'</span>':'')+'</div>';
    html+='<div class="si si-clr" style="--si-clr:#ef4444" data-nav="db-docs"><span class="ico">&#128203;</span><span class="sl">Документация</span><span class="sb wip">'+ADMIN_DOC_ITEMS.length+'</span>'+(_pd?'<span class="sb ok">&#10003;'+_pd+'</span>':'')+'</div>';
    html+='<div style="border-top:1px solid var(--bd);margin:8px 16px"></div>';
    const canContractors=currentRole==='admin'||userSubscription.contractors_access;
    html+='<div class="si'+(canContractors?'':' locked')+'" data-nav="'+(canContractors?'db-contractors':'upgrade-gate')+'"><span class="ico">&#128736;</span><span class="sl">Подрядчики</span>'+(canContractors?'<span class="sb wip">'+DB.contractors.length+'</span>':'<span class="sb" style="background:rgba(201,169,110,.15);color:#c9a96e;font-size:8px">&#128274; Unlimited</span>')+'</div>';
    html+='<div class="si'+(canContractors?'':' locked')+'" data-nav="'+(canContractors?'db-vendor-companies':'upgrade-gate')+'"><span class="ico">&#127970;</span><span class="sl">Поставщики</span>'+(canContractors?'<span class="sb wip">'+(DB.vendorCompanies||[]).length+'</span>':'<span class="sb" style="background:rgba(201,169,110,.15);color:#c9a96e;font-size:8px">&#128274; Unlimited</span>')+'</div>';
  }
  if(currentRole==='admin'){
    html+='<div class="side-sec">Администрирование</div>';
    html+='<div class="si" data-nav="users"><span class="ico">&#128101;</span><span class="sl">Пользователи</span><span class="sb wip">'+DB.users.length+'</span></div>';
  }

  if(currentRole==='contractor'){
    html+='<div class="side-sec">Мои данные</div>';
    html+='<div class="si" data-nav="contractor-works"><span class="ico">&#128736;</span><span class="sl">Доступные работы</span></div>';
    html+='<div class="si" data-nav="contractor-proposals"><span class="ico">&#128196;</span><span class="sl">Мои предложения</span></div>';
  }
  if(currentRole==='supplier'){
    html+='<div class="side-sec">Мои данные</div>';
    html+='<div class="si" data-nav="db-suppliers"><span class="ico">&#128230;</span><span class="sl">Мой каталог</span></div>';
  }
  if(currentRole==='employee'){
    html+='<div class="side-sec">Мой профиль</div>';
    html+='<div class="si" data-nav="db-employees"><span class="ico">&#129489;</span><span class="sl">Мои данные</span></div>';
  }

  n.innerHTML=html;
  n.querySelectorAll('[data-nav]').forEach(el=>{el.addEventListener('click',()=>nav(el.dataset.nav))});
  // Show/hide tab bar
  document.getElementById('tabBar').style.display=(currentRole==='admin'||currentRole==='owner')?'flex':'none';
}

