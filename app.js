/* Тоша — справочник продуктов и блюд (примерные значения, ккал на 100 г или 100 мл).
   Строка: эмодзи | название | ккал на 100 | порция | как называется порция | единица (мл, если жидкость)
   Свои продукты можно добавлять сюда же, по одной строке. Значения усреднённые: в магазинных продуктах и разных рецептах они отличаются. */
(function (root) {
  'use strict';
  const RAW = `
🍎|Яблоко|52|180|1 среднее
🍌|Банан|89|120|1 средний
🍊|Апельсин|47|150|1 средний
🍊|Мандарин|53|80|1 шт
🍐|Груша|57|170|1 средняя
🍑|Персик|39|150|1 средний
🍑|Нектарин|44|140|1 средний
🍑|Абрикос|48|35|1 шт
🍑|Слива|46|40|1 шт
🍇|Виноград|69|100|горсть
🥝|Киви|61|75|1 шт
🍍|Ананас|50|100|ломтик
🍉|Арбуз|30|300|ломоть
🍈|Дыня|34|250|ломоть
🥭|Манго|60|200|1 плод
🍎|Гранат|83|150|1 небольшой
🍊|Хурма|70|170|1 шт
🍊|Грейпфрут|42|250|1 шт
🍋|Лимон|29|60|1 шт
🥑|Авокадо|160|150|1 плод
🍓|Клубника|32|150|стакан
🍓|Малина|52|100|горсть
🫐|Черника|57|100|горсть
🍒|Смородина|44|100|горсть
🍒|Вишня|52|100|горсть
🍒|Черешня|63|100|горсть
🍓|Ежевика|43|100|горсть
🍓|Клюква|46|50|горсть
🍇|Курага|241|30|горсть
🍇|Изюм|299|30|горсть
🍇|Чернослив|240|30|4–5 шт
🍇|Финики|277|30|3 шт
🍇|Инжир сушёный|249|30|2 шт
🥗|Сухофрукты|250|30|горсть
🥒|Огурец|15|100|1 шт
🍅|Помидор|20|120|1 средний
🫑|Перец болгарский|27|150|1 шт
🥕|Морковь|35|80|1 шт
🥬|Капуста белая|27|150|порция
🥦|Брокколи|34|150|порция
🥦|Цветная капуста|30|150|порция
🥔|Картофель отварной|82|200|2 средних
🥔|Картофель жареный|192|200|порция
🥔|Картофельное пюре|106|200|порция
🍟|Картофель фри|312|120|порция
🍠|Батат|86|200|1 шт
🥗|Свёкла варёная|49|100|порция
🥒|Кабачок|24|200|порция
🍆|Баклажан|24|200|порция
🧅|Лук репчатый|41|50|1 небольшая
🧄|Чеснок|143|5|2 зубчика
🥬|Шпинат|23|50|горсть
🥬|Салат листовой|14|50|горсть
🌿|Зелень (укроп, петрушка)|40|20|пучок
🥗|Редис|19|50|5 шт
🎃|Тыква|26|200|порция
🌽|Кукуруза варёная|123|150|1 початок
🌽|Кукуруза консервированная|58|100|порция
🥫|Горошек зелёный консервированный|55|80|порция
🍄|Шампиньоны|27|100|порция
🍄|Грибы жареные|110|100|порция
🥬|Сельдерей|16|50|стебель
🥗|Спаржа|20|100|порция
🫒|Оливки, маслины|115|30|8 шт
🫘|Фасоль варёная|127|150|порция
🫘|Чечевица варёная|116|150|порция
🫘|Нут варёный|164|150|порция
🫛|Горох варёный|118|150|порция
🧈|Тофу|76|100|порция
🥣|Хумус|166|50|2 ложки
🍚|Гречка варёная|110|200|порция
🍚|Рис белый варёный|130|200|порция
🍚|Рис бурый варёный|111|200|порция
🍝|Макароны варёные|158|200|порция
🥣|Овсянка на воде|88|250|порция
🥣|Овсянка на молоке|102|250|порция
🥣|Манная каша на молоке|98|250|порция
🥣|Пшённая каша|90|250|порция
🍚|Перловка варёная|109|200|порция
🍚|Булгур варёный|83|200|порция
🍚|Кускус варёный|112|200|порция
🍚|Киноа варёная|120|150|порция
🥣|Мюсли|360|50|порция
🥣|Хлопья кукурузные|357|30|порция
🥣|Гранола|450|40|порция
🥣|Овсяные хлопья сухие|366|40|порция
🍞|Хлеб белый|266|30|ломтик
🍞|Хлеб ржаной|214|30|ломтик
🍞|Хлеб цельнозерновой|247|30|ломтик
🍞|Батон|262|30|ломтик
🫓|Лаваш|236|80|лист
🫓|Тортилья|300|60|1 шт
🥐|Круассан|406|60|1 шт
🥐|Булочка сдобная|300|80|1 шт
🍞|Хлебцы|310|10|1 шт
🥯|Бублик|250|90|1 шт
🫓|Пита|275|60|1 шт
🥞|Блины|230|50|1 шт
🥞|Оладьи|236|40|1 шт
🧀|Сырники|220|50|1 шт
🥟|Вареники с картошкой|180|150|порция
🥟|Вареники с творогом|200|150|порция
🥟|Пельмени варёные|235|150|порция
🥟|Хинкали|200|80|1 шт
🥟|Манты|190|100|1 шт
🥟|Пирожок с капустой жареный|250|80|1 шт
🥟|Пирожок печёный с картошкой|230|80|1 шт
🥟|Беляш|270|120|1 шт
🥟|Чебурек|300|120|1 шт
🥚|Яйцо варёное|155|50|1 шт
🍳|Яичница из двух яиц|196|110|порция
🍳|Омлет|154|150|порция
🥚|Яйцо перепелиное|158|10|1 шт
🥛|Молоко 2,5%|52|200|стакан|мл
🥛|Молоко 3,2%|60|200|стакан|мл
🥛|Молоко 1,5%|47|200|стакан|мл
🥛|Кефир 1%|40|200|стакан|мл
🥛|Кефир 2,5%|53|200|стакан|мл
🥛|Ряженка 4%|67|200|стакан|мл
🥛|Айран|40|250|стакан|мл
🥣|Йогурт натуральный|68|125|1 баночка
🥣|Йогурт фруктовый|90|125|1 баночка
🥣|Греческий йогурт|97|150|порция
🥣|Творог 5%|121|150|порция
🥣|Творог 9%|159|150|порция
🥣|Творог обезжиренный|71|150|порция
🥄|Сметана 20%|206|30|2 ложки
🥄|Сметана 15%|158|30|2 ложки
🥄|Сливки 10%|118|30|2 ложки
🧀|Сыр твёрдый|360|30|ломтик
🧀|Сыр моцарелла|280|50|порция
🧀|Сыр плавленый|290|20|1 треугольник
🧀|Сыр фета|264|50|порция
🧀|Брынза|260|50|порция
🧀|Рикотта|174|50|порция
🧀|Творожный сыр|250|30|2 ложки
🧈|Масло сливочное|717|10|1 ложка на хлеб
🍦|Мороженое пломбир|227|70|шарик
🍦|Мороженое эскимо|270|65|1 шт
🍫|Глазированный сырок|407|45|1 шт
🥫|Сгущёнка|328|20|1 ложка
🍗|Куриная грудка варёная|137|150|1 филе
🍗|Куриное филе жареное|165|150|1 филе
🍗|Куриное бедро запечённое|210|150|1 шт
🍗|Куриная голень запечённая|190|100|1 шт
🍗|Индейка запечённая|150|150|порция
🥩|Говядина варёная|254|100|порция
🥩|Стейк говяжий жареный|250|150|1 шт
🥩|Свинина запечённая|300|100|порция
🥩|Свиная отбивная|280|120|1 шт
🥩|Гуляш говяжий|145|200|порция
🥩|Бефстроганов|190|200|порция
🍖|Шашлык|280|150|порция
🥓|Ветчина|145|30|ломтик
🌭|Колбаса варёная|250|30|ломтик
🌭|Колбаса копчёная|400|20|ломтик
🌭|Сосиски варёные|270|50|1 шт
🥓|Бекон жареный|540|15|ломтик
🥩|Куриная печень отварная|137|100|порция
🍔|Котлета куриная паровая|150|80|1 шт
🍔|Котлета мясная жареная|260|80|1 шт
🍖|Тефтели|200|60|1 шт
🥬|Голубцы|100|150|1–2 шт
🍚|Плов с говядиной|190|250|порция
🍝|Макароны по-флотски|220|250|порция
🍣|Лосось запечённый|230|150|1 стейк
🍣|Сёмга слабосолёная|200|50|2 ломтика
🐟|Треска запечённая|100|150|порция
🐟|Минтай варёный|90|150|порция
🐟|Горбуша запечённая|160|150|порция
🐟|Скумбрия запечённая|220|150|порция
🐟|Сельдь солёная|217|80|1 кусок
🐟|Тунец консервированный|100|80|полбанки
🐟|Шпроты|363|50|4 шт
🦑|Кальмар варёный|110|100|порция
🦐|Креветки варёные|95|100|порция
🫙|Красная икра|250|20|1 ложка
🐟|Рыбные палочки|220|30|1 шт
🍲|Борщ|50|300|тарелка
🍲|Щи|40|300|тарелка
🍲|Куриный суп с лапшой|40|300|тарелка
🍲|Гороховый суп|66|300|тарелка
🍲|Уха|45|300|тарелка
🍲|Солянка|95|300|тарелка
🍲|Грибной крем-суп|70|300|тарелка
🍲|Овощной суп-пюре|45|300|тарелка
🍲|Окрошка|52|300|тарелка
🍲|Рассольник|45|300|тарелка
🍲|Харчо|90|300|тарелка
🥗|Оливье|180|200|порция
🥗|Винегрет|100|150|порция
🥗|Салат Цезарь с курицей|170|200|порция
🥗|Греческий салат|110|200|порция
🥗|Салат из свежих овощей с маслом|70|200|порция
🥗|Селёдка под шубой|190|150|порция
🥗|Крабовый салат|140|150|порция
🥗|Капустный салат|60|150|порция
🥕|Морковь по-корейски|115|50|порция
🍔|Чизбургер|255|120|1 шт
🍗|Наггетсы|270|100|5–6 шт
🍕|Пицца Маргарита|250|110|1 кусок
🍕|Пицца Пепперони|290|110|1 кусок
🌯|Шаурма с курицей|210|300|1 шт
🌭|Хот-дог|270|150|1 шт
🥪|Сэндвич с курицей|230|200|1 шт
🥪|Бутерброд с колбасой и сыром|300|80|1 шт
🍣|Суши (ролл)|140|30|1 кусочек
🍣|Ролл Филадельфия|180|30|1 кусочек
🍜|Рамен|120|450|миска
🍝|Паста карбонара|190|300|порция
🍝|Паста болоньезе|150|300|порция
🍝|Паста с томатным соусом|130|300|порция
🍝|Лазанья|160|300|порция
🍚|Ризотто|140|250|порция
🍫|Шоколад молочный|535|25|2–3 дольки
🍫|Шоколад тёмный|540|25|2–3 дольки
🍬|Шоколадная конфета|480|12|1 шт
🍪|Печенье овсяное|437|25|1 шт
🍪|Печенье сахарное|450|10|1 шт
🧇|Вафли|520|30|1 шт
🍪|Пряник|350|40|1 шт
🍬|Зефир|300|30|1 шт
🍬|Пастила|320|30|1 шт
🍬|Мармелад|300|30|3 шт
🍬|Халва|520|30|кусочек
🍯|Мёд|330|20|1 ложка
🍬|Сахар|400|5|1 чайная ложка
🍯|Варенье|260|20|1 ложка
🍯|Джем|250|20|1 ложка
🍰|Торт|400|100|кусок
🍰|Эклер|330|70|1 шт
🍰|Чизкейк|320|120|кусок
🧁|Кекс|380|60|1 шт
🧁|Булочка с корицей|360|80|1 шт
🍫|Шоколадная паста|540|20|1 ложка
🥜|Арахисовая паста|590|20|1 ложка
🍿|Попкорн|380|30|горсть
🥔|Чипсы|540|30|горсть
🍞|Сухарики|420|30|горсть
🍘|Крекер|430|20|3–4 шт
🍫|Батончик мюсли|400|30|1 шт
🍫|Протеиновый батончик|350|50|1 шт
🌻|Семечки подсолнечные|580|30|горсть
🥜|Грецкие орехи|654|30|горсть
🥜|Миндаль|579|30|горсть
🥜|Фундук|628|30|горсть
🥜|Кешью|553|30|горсть
🥜|Арахис|567|30|горсть
🥜|Фисташки|560|30|горсть
🥜|Кедровые орехи|673|30|горсть
🌱|Семена чиа|486|15|1 ложка
🌱|Семена льна|534|10|1 ложка
🎃|Тыквенные семечки|559|30|горсть
🌱|Кунжут|573|10|1 ложка
💧|Вода|0|250|стакан|мл
🍵|Чай без сахара|1|250|чашка|мл
🍵|Чай с сахаром|20|250|чашка|мл
☕|Кофе чёрный|2|200|чашка|мл
☕|Американо|2|250|чашка|мл
☕|Эспрессо|2|30|1 шот|мл
☕|Кофе с молоком|35|200|чашка|мл
☕|Капучино|50|250|чашка|мл
☕|Латте|50|300|стакан|мл
☕|Флэт уайт|55|200|чашка|мл
☕|Какао на молоке|80|200|чашка|мл
☕|Горячий шоколад|100|250|чашка|мл
🧃|Сок апельсиновый|45|200|стакан|мл
🧃|Сок яблочный|46|200|стакан|мл
🧃|Сок томатный|18|200|стакан|мл
🥤|Компот|60|200|стакан|мл
🥤|Морс|50|200|стакан|мл
🥤|Кисель|56|200|стакан|мл
🥤|Газировка (кола, лимонад)|42|330|банка|мл
🥤|Энергетик|45|250|банка|мл
🍺|Пиво|43|500|бутылка|мл
🍷|Вино красное сухое|85|150|бокал|мл
🍷|Вино белое сухое|80|150|бокал|мл
🥂|Шампанское|76|150|бокал|мл
🥃|Водка|235|50|рюмка|мл
🥃|Виски|250|40|порция|мл
🥤|Смузи фруктовый|60|300|стакан|мл
🥤|Протеиновый коктейль|80|300|порция|мл
🥥|Кокосовая вода|20|250|стакан|мл
🥤|Квас|27|250|стакан|мл
🥛|Соевое молоко|54|200|стакан|мл
🥛|Миндальное молоко|24|200|стакан|мл
🥛|Овсяное молоко|45|200|стакан|мл
🫒|Масло подсолнечное|899|10|1 ложка|мл
🫒|Масло оливковое|898|10|1 ложка|мл
🥫|Майонез|620|15|1 ложка
🥫|Кетчуп|100|15|1 ложка
🥫|Горчица|80|10|1 чайная ложка
🥫|Соевый соус|60|15|1 ложка|мл
🥫|Томатная паста|80|20|1 ложка
🥫|Песто|450|20|1 ложка
🥑|Гуакамоле|160|50|2 ложки
🥩|Отбивная свиная жареная в кляре|290|130|1 шт
🥩|Отбивная куриная в кляре|210|120|1 шт
🥩|Отбивная куриная в панировке|230|120|1 шт
🥩|Отбивная говяжья жареная|240|120|1 шт
🥩|Шницель свиной в панировке|290|150|1 шт
🥩|Шницель куриный в панировке|235|150|1 шт
🥩|Мясо по-французски (свинина, сыр, майонез)|250|200|порция
🥩|Курица с картошкой в духовке|140|300|порция
🍗|Курица запечённая с кожей|220|150|порция
🍗|Крылья куриные запечённые|230|100|3 шт
🍗|Куриная грудка в сливочном соусе|150|200|порция
🍗|Куриная грудка в сырной корочке|190|180|1 шт
🍗|Куриный шашлык|190|150|порция
🍗|Курица тушёная с овощами|120|250|порция
🍗|Курица карри с рисом|150|300|порция
🍔|Котлета домашняя из говядины и свинины|250|80|1 шт
🍔|Котлета куриная жареная|200|80|1 шт
🍔|Котлета из индейки|170|80|1 шт
🍔|Котлета рыбная жареная|170|80|1 шт
🍔|Котлеты в томатном соусе|180|150|2 шт
🍖|Тефтели в сметанном соусе|190|200|порция
🍖|Ёжики мясные с рисом|170|150|2–3 шт
🥬|Голубцы ленивые|150|200|порция
🫑|Перец фаршированный|120|250|1–2 шт
🍆|Кабачки фаршированные|110|250|порция
🍅|Помидоры фаршированные запечённые|110|200|порция
🍲|Жаркое по-домашнему (мясо, картошка)|160|300|порция
🍲|Картошка тушёная с мясом|140|300|порция
🍲|Картошка тушёная с грибами|100|300|порция
🍲|Рагу овощное|70|250|порция
🍲|Рагу с курицей и овощами|110|300|порция
🍲|Тушёная капуста|75|200|порция
🍲|Тушёная капуста с мясом|110|250|порция
🍲|Бигус|120|250|порция
🥔|Драники|230|60|1 шт
🥔|Картофельная запеканка с фаршем|160|250|порция
🥔|Картофель запечённый в духовке|110|200|порция
🥔|Картофель по-деревенски|150|200|порция
🥔|Картофельное пюре с молоком и маслом|120|200|порция
🥔|Жареная картошка с луком|180|200|порция
🍝|Макароны с сыром|200|250|порция
🍝|Макароны с котлетой|190|300|порция
🍝|Макароны с тушёнкой|200|250|порция
🍝|Спагетти с курицей в сливках|170|300|порция
🍚|Рис с курицей и овощами|140|300|порция
🍚|Гречка с мясом|150|300|порция
🍚|Гречка с грибами|120|250|порция
🍚|Гречка с курицей|140|300|порция
🍚|Гречка по-купечески|170|300|порция
🍚|Плов с курицей|170|250|порция
🍚|Рис с овощами|120|250|порция
🍚|Рис с яйцом|150|200|порция
🥘|Жульен с курицей и грибами|180|150|порция
🥘|Запеканка мясная с овощами|150|250|порция
🥘|Запеканка из цветной капусты с сыром|110|200|порция
🥘|Запеканка из кабачков|90|200|порция
🥘|Лазанья домашняя|170|300|порция
🥘|Овощная запеканка с сыром|100|250|порция
🧀|Запеканка творожная|180|150|порция
🍳|Яичница с колбасой|230|150|порция
🍳|Яичница с помидорами|150|150|порция
🍳|Омлет с сыром и ветчиной|190|150|порция
🍳|Шакшука|110|250|порция
🥞|Кабачковые оладьи|140|50|1 шт
🥞|Блинчики с творогом|190|70|1 шт
🥞|Блинчики с мясом|200|80|1 шт
🥞|Блины с мясом|200|80|1 шт
🥞|Сырники со сметаной|240|100|2 шт
🥞|Оладьи со сметаной|250|100|3 шт
🐟|Рыба в кляре жареная|220|150|порция
🐟|Рыба тушёная с овощами|110|200|порция
🐟|Рыба запечённая с картошкой|120|300|порция
🐟|Минтай жареный в муке|150|150|порция
🐟|Хек запечённый|95|150|порция
🐟|Горбуша тушёная в сметане|140|150|порция
🐟|Лосось на пару|180|150|порция
🥗|Салат из курицы с овощами|120|200|порция
🥗|Салат с тунцом и яйцом|140|200|порция
🥗|Салат с помидорами и сыром|120|200|порция
🥗|Салат со сметаной (огурцы, помидоры)|65|200|порция
🥗|Салат из свёклы с чесноком и майонезом|140|120|порция
🥗|Салат мимоза|190|150|порция
🥗|Салат из пекинской капусты с кукурузой|80|200|порция
🥗|Овощной салат с курицей и авокадо|130|250|порция
🍲|Суп куриный с картошкой и вермишелью|45|300|тарелка
🍲|Суп куриный с картошкой и рисом|50|300|тарелка
🍲|Суп с фрикадельками|55|300|тарелка
🍲|Суп мясной с картошкой и овощами|60|300|тарелка
🍲|Суп гороховый с копчёностями|85|300|тарелка
🍲|Суп гороховый без мяса|55|300|тарелка
🍲|Суп фасолевый|65|300|тарелка
🍲|Суп чечевичный|70|300|тарелка
🍲|Суп чечевичный с курицей|75|300|тарелка
🍲|Суп рисовый|40|300|тарелка
🍲|Суп овощной|35|300|тарелка
🍲|Суп овощной с мясом|55|300|тарелка
🍲|Суп с грибами и картошкой|40|300|тарелка
🍲|Суп грибной со сливками|85|300|тарелка
🍲|Суп сырный|75|300|тарелка
🍲|Суп сырный с курицей|85|300|тарелка
🍲|Суп томатный|50|300|тарелка
🍲|Суп-пюре тыквенный|55|300|тарелка
🍲|Суп-пюре тыквенный со сливками|80|300|тарелка
🍲|Суп-пюре из брокколи|45|300|тарелка
🍲|Суп-пюре из цветной капусты|45|300|тарелка
🍲|Суп-пюре из чечевицы|75|300|тарелка
🍲|Суп-пюре из кабачков|40|300|тарелка
🍲|Суп-лапша домашняя|50|300|тарелка
🍲|Суп молочный с вермишелью|75|250|тарелка
🍲|Суп с галушками|70|300|тарелка
🍲|Суп с клёцками|65|300|тарелка
🍲|Суп с рыбными консервами|60|300|тарелка
🍲|Суп рыбный из горбуши|50|300|тарелка
🍲|Суп из сёмги|65|300|тарелка
🍲|Щи свежие с мясом|45|300|тарелка
🍲|Щи кислые (из квашеной капусты)|35|300|тарелка
🍲|Щи зелёные со щавелем|35|300|тарелка
🍲|Борщ со сметаной|75|300|тарелка
🍲|Борщ с говядиной|60|300|тарелка
🍲|Борщ вегетарианский|35|300|тарелка
🍲|Свекольник холодный|45|300|тарелка
🍲|Капустняк|50|300|тарелка
🍲|Окрошка на квасе|45|300|тарелка
🍲|Окрошка на кефире|55|300|тарелка
🍲|Бульон куриный|15|250|чашка
🍲|Бульон мясной|20|250|чашка
🍲|Шурпа|70|300|тарелка
🍲|Лагман|110|350|тарелка
🍲|Суп-харчо с рисом|90|300|тарелка
🍲|Минестроне|45|300|тарелка
🍲|Том ям|55|300|тарелка
🍲|Мисо-суп|35|200|чашка
🍲|Гаспачо|45|250|тарелка
🍲|Суп с вермишелью|45|300|тарелка
`;
  const norm = s => String(s).toLowerCase().replace(/ё/g, 'е');
  const LIST = RAW.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
    const p = l.split('|');
    return { emoji: p[0], name: p[1], k100: +p[2], g: +p[3], label: p[4] || 'порция', unit: p[5] === 'мл' ? 'мл' : 'г', n: norm(p[1]) };
  });

  /* Поиск: каждое слово запроса должно быть началом слова в названии; сначала совпадения с начала названия */
  function search(q, limit) {
    q = norm(q).trim();
    if (q.length < 2) return [];
    const SYN = { картошк: 'картофел', томат: 'помидор', булк: 'булочк', творож: 'творог', куриц: 'курин', макарон: 'макарон' };
    const toks = q.split(/\s+/).filter(Boolean).map(t => { for (const k in SYN) if (t.indexOf(k) === 0) return SYN[k]; return t; }), out = [];
    for (const f of LIST) {
      const words = f.n.split(/[\s,()\-–]+/).filter(Boolean);
      if (!toks.every(t => words.some(w => w.indexOf(t) === 0))) continue;
      out.push({ f, score: (f.n.indexOf(q) === 0 ? 0 : 1) * 100 + f.n.length });
    }
    out.sort((a, b) => a.score - b.score);
    return out.slice(0, limit || 8).map(x => x.f);
  }
  const kcalFor = (f, amount) => Math.round(f.k100 * amount / 100);
  const api = { LIST, search, kcalFor, norm };
  root.ToshaFoods = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof self !== 'undefined' ? self : this);

/* Тоша — интерфейс и состояние. Все данные только в localStorage этого телефона. */
(() => {
  'use strict';
  const C = window.ToshaCore;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const KEY = 'tosha.v1';
  const todayKey = () => C.dayKey(new Date());
  const plural = (n, f) => { const a = Math.abs(n) % 100, b = a % 10; return (a > 10 && a < 20) ? f[2] : b > 1 && b < 5 ? f[1] : b === 1 ? f[0] : f[2]; };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  /* ---------- Состояние ---------- */
  function fresh() {
    return { v: 1, pet: 'hamster', petChosen: false, petsTried: ['hamster'], flags: { taps: 0 }, ach: {}, xp: 0, days: {}, fired: {}, notifLog: {}, lastMoveAt: Date.now(), current: null, reroll: 0, custom: { quests: [], phrases: [], colors: {}, workouts: [] }, settings: C.defaultSettings() };
  }
  function migrate(o) {
    const base = fresh(), def = C.defaultSettings();
    const s = Object.assign(def, o.settings || {});
    if (!Array.isArray(s.meals) || !s.meals.length) s.meals = C.defaultSettings().meals;
    const cu = Object.assign({ quests: [], phrases: [], colors: {}, workouts: [] }, o.custom || {});
    const r = Object.assign(base, o, { settings: s, custom: cu });
    const SP = (window.ToshaPets && window.ToshaPets.SPECIES) || {};
    if (r.pet === 'blob') r.pet = 'hamster';          // старый «комочек» стал хомяком
    if (!SP[r.pet]) r.pet = 'hamster';
    if (cu.colors && cu.colors.blob) { cu.colors.hamster = cu.colors.blob; delete cu.colors.blob; }
    r.flags = Object.assign({ taps: 0 }, o.flags || {});
    r.ach = o.ach || {};
    r.petsTried = Array.from(new Set((o.petsTried || []).map(x => x === 'blob' ? 'hamster' : x).concat([r.pet])));
    return r;
  }
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) return migrate(JSON.parse(raw)); } catch (e) { console.warn(e); }
    return fresh();
  }
  let S = load();
  let reg = null, mealSel = autoMeal(new Date()), deferredInstall = null, recent = [];

  /* ---------- Android-приложение (Capacitor): настоящие запланированные уведомления ---------- */
  const CAP = window.Capacitor, NATIVE = !!(CAP && CAP.isNativePlatform && CAP.isNativePlatform());
  const plug = n => (CAP && CAP.Plugins && CAP.Plugins[n]) || null;
  let nativePerm = 'prompt', schedT = null;
  async function nativeCheck() {
    const LN = plug('LocalNotifications'); if (!LN) return;
    try { nativePerm = (await LN.checkPermissions()).display; } catch (e) { /* нет плагина */ }
  }
  async function nativeAsk() {
    const LN = plug('LocalNotifications'); if (!LN) return;
    try { nativePerm = (await LN.requestPermissions()).display; } catch (e) { /* ок */ }
    renderPerm(); reschedule();
  }
  function reschedule() {
    if (!NATIVE) return;
    clearTimeout(schedT); schedT = setTimeout(doSchedule, 1200);
  }
  async function doSchedule() {
    const LN = plug('LocalNotifications'); if (!LN) return;
    try {
      const pend = await LN.getPending();
      if (pend.notifications && pend.notifications.length) await LN.cancel({ notifications: pend.notifications.map(n => ({ id: n.id })) });
      await nativeCheck();
      if (nativePerm !== 'granted' || !S.settings.notify) return;
      await LN.createChannel({ id: 'tosha-quiet', name: 'Тихие напоминания', importance: 2, vibration: false, visibility: 1 });
      await LN.createChannel({ id: 'tosha-sound', name: 'Напоминания со звуком', importance: 3, vibration: true, visibility: 1 });
      const now = new Date(), plan = C.planSchedule(C.buildCtx(S, now), now, 3);
      if (!plan.length) return;
      await LN.schedule({ notifications: plan.map(p => ({
        id: p.id, title: p.title, body: p.body, schedule: { at: new Date(p.at), allowWhileIdle: true },
        channelId: S.settings.silent ? 'tosha-quiet' : 'tosha-sound', extra: { kind: p.kind, mealId: p.mealId || '', questId: p.questId || '' }
      })) });
    } catch (e) { console.warn('Планирование уведомлений:', e); }
  }

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { console.warn(e); }
    mirror(); reschedule();
  }
  function save() { persist(); checkAch(); }
  function mirror() {
    if (!window.indexedDB) return;
    C.idbSet('snapshot', C.buildCtx(S, new Date())).catch(() => {});
  }
  const getDay = k => S.days[k || todayKey()] || { meals: [], water: 0, quests: [], workouts: [] };
  const day = () => { const k = todayKey(); const d = S.days[k] || (S.days[k] = { meals: [], water: 0, quests: [], workouts: [] }); if (!d.workouts) d.workouts = []; return d; };
  const kcalOf = d => d.meals.reduce((a, m) => a + m.kcal, 0);
  const allQuests = () => C.QUESTS.concat(S.custom.quests);
  const qById = id => C.questById(id, allQuests());

  /* ---------- Мелочи ---------- */
  let toastT;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400);
  }
  function addXp(n) {
    const before = C.level(S.xp); S.xp += n; const after = C.level(S.xp);
    if (after > before) { levelUp = (before < 2 && after >= 2) ? 'hatch' : (before < 8 && after >= 8) ? 'crown' : ((before < 3 && after >= 3) || (before < 5 && after >= 5)) ? 'evolve' : 'levelup'; react(levelUp); toast(before < 2 && after >= 2 ? S.settings.petName + ' вылупился! 🐣 Уровень 2' : 'Новый уровень: ' + after + ' 🎉'); }
    else toast('+' + n + ' XP');
  }
  function autoMeal(now) { const m = C.minutesOf(now); return m < 630 ? 'b' : m < 900 ? 'l' : m < 1260 ? 'd' : 's'; }
  const MEAL_ICON = { b: '🥣', l: '🍲', d: '🍝', s: '🍎' };
  function mealName(id) {
    if (id === 's') return 'Перекус';
    const m = S.settings.meals.find(x => x.id === id); return m ? m.name : 'Еда';
  }
  function go(tab) {
    if (tab !== 'ws' && AN) { const w = $('#wsStage .pet-svg'); if (w) AN.stop(w); }
    if (tab !== 'sport' && AN) { const w = $('#sportStage .pet-svg'); if (w) AN.stop(w); }
    $$('.tab').forEach(s => s.classList.toggle('active', s.id === 'tab-' + tab));
    $$('.tabbar button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
    window.scrollTo(0, 0);
    if (tab === 'ws') renderWorkshop();
    if (tab === 'sport') { sportKey = ''; renderSport(); }
  }

  /* ---------- Питомец ---------- */
  const PHRASES = {
    neutral: ['Привет! Я тут, никуда не спешу 🙂', 'Как день? Расскажешь, что ел(а)?', 'Можно просто посидеть вместе. А можно размяться!'],
    happy: ['Сегодня у нас хороший день!', 'Ты молодец. Правда.', 'Мне нравится, как мы сегодня идём.'],
    hungry: ['Кажется, самое время записать приём пищи.', 'Мой живот урчит. А твой?', 'Поешь, а потом запишем 🙂'],
    sleepy: ['Zzz… Тихие часы. Отдыхай и ты.', 'Спим. Увидимся утром.'],
    excited: ['Ура! Так держать!', 'Вот это да!', 'Ещё одна маленькая победа!']
  };
  function mood(now) {
    const s = S.settings, min = C.minutesOf(now);
    if (C.isQuiet(min, s.quietStart, s.quietEnd)) return 'sleepy';
    const d = getDay(), logged = {}; d.meals.forEach(m => { logged[m.meal] = true; });
    for (const m of s.meals) { const t = C.toMin(m.time); if (min >= t + 30 && min < t + 240 && !logged[m.id]) return 'hungry'; }
    return (d.meals.length + d.quests.length + (d.water > 0 ? 1 : 0)) >= 3 ? 'happy' : 'neutral';
  }
  const P = window.ToshaPets, AN = window.ToshaAnim;
  let petKey = '', pendingReact = null, levelUp = false, reactT = null, autoAnim = null, tapN = -1;
  const colorsOf = id => (S.custom.colors || {})[id];
  const petSvg = (id, m, lvl, o) => P.svg(id, m, lvl, Object.assign({ colors: colorsOf(id) }, o || {}));
  const curSvg = () => $('#petBox .pet-svg');
  const phrasesFor = m => PHRASES[m].concat(m === 'neutral' || m === 'happy' ? S.custom.phrases : []);
  const moodAnim = m => m === 'sleepy' ? 'sleep' : m === 'hungry' ? 'hungry' : null;
  function react(name) {
    pendingReact = levelUp || name;
    clearTimeout(reactT); reactT = setTimeout(flushReact, 40);
  }
  function flushReact() {
    const svg = curSvg(), name = pendingReact; pendingReact = null;
    if (name && name === levelUp) levelUp = false;
    if (!svg || !AN) return;
    if (name) AN.play(svg, name, AN.LIB[name] && AN.LIB[name].group === 'sport' ? { loop: false } : undefined);
    else if (autoAnim) { const a = autoAnim; autoAnim = null; AN.play(svg, a, { for: 9000 }); }
  }
  function renderPet() {
    const now = new Date(), lvl = C.level(S.xp), m = mood(now);
    const cur = C.xpForLevel(lvl), nxt = C.xpForLevel(lvl + 1), pct = Math.round((S.xp - cur) / (nxt - cur) * 100);
    const st = C.streak(S.days, todayKey());
    const phrase = C.pick(phrasesFor(m), m + ':' + Math.floor(Date.now() / 1200000));
    const key = [S.pet, m, lvl, pct, st, phrase, S.settings.petName, JSON.stringify(colorsOf(S.pet) || '')].join('|');
    if (key === petKey) return;   // ничего не изменилось: не перерисовываем, чтобы анимация не прерывалась
    petKey = key; autoAnim = moodAnim(m);
    $('#petBox').innerHTML =
      `<div class="bubble">${esc(phrase)}</div>
       <div class="petwrap" data-act="petTap" aria-label="Погладить ${esc(S.settings.petName)}">${petSvg(S.pet, m, lvl, { label: S.settings.petName })}</div>
       <div class="petname">${esc(S.settings.petName)} <span class="pill">ур. ${lvl}</span>${st > 0 ? ` <span class="pill">🔥 ${st}</span>` : ''}</div>
       <div class="xpbar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
       <div class="muted small">${S.xp - cur} из ${nxt - cur} XP до следующего уровня</div>
       <div style="margin-top:10px"><button class="chip" data-act="goPets">🔄 Сменить питомца</button></div>`;
    if (!pendingReact) { clearTimeout(reactT); reactT = setTimeout(flushReact, 60); }
  }
  function renderPicker() {
    const html = Object.keys(P.SPECIES).map(id => `<button type="button" class="pick ${id === S.pet ? 'on' : ''}" data-act="pickPet" data-p="${id}" aria-pressed="${id === S.pet}">${petSvg(id, 'neutral', 2, { mini: true, label: P.SPECIES[id].title })}${P.SPECIES[id].title}</button>`).join('');
    $('#pickMore').innerHTML = html;
    $('#pickHome').hidden = !!S.petChosen;
    if (!S.petChosen) $('#pickHomeGrid').innerHTML = html;
  }

  /* ---------- Задание ---------- */
  function renderQuest() {
    const q = S.current && qById(S.current.questId);
    $('#questBox').innerHTML = q
      ? `<div class="qhead">Мини-задание</div>
         <div class="qbody"><div class="qemoji">${q.emoji}</div><div><div class="qtext">${esc(q.text)}</div><div class="muted small">≈ ${q.dur} · +${q.xp} XP</div></div></div>
         <div class="row"><button class="btn" data-act="questDone">Сделал(а)!</button><button class="btn ghost" data-act="questSwap">Другое</button></div>`
      : `<div class="qhead">Мини-задание</div>
         <p class="muted">Пока заданий нет. Хочешь что-нибудь лёгкое?</p>
         <button class="btn" data-act="questNew" style="width:100%">Дай задание</button>`;
  }
  function newQuest() {
    S.reroll = (S.reroll || 0) + 1;
    const q = C.pickQuest(todayKey(), 100 + S.reroll, S.current && S.current.questId, allQuests());
    S.current = { questId: q.id, ts: Date.now() };
  }

  /* ---------- Кольца, вода, неделя ---------- */
  function ring(frac, size, stroke, color, l1, l2) {
    const r = (size - stroke) / 2, c = 2 * Math.PI * r, f = Math.min(1, Math.max(0, frac)), h = size / 2;
    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="ring" role="img" aria-label="${esc(l1)} ${esc(l2 || '')}">
      <circle cx="${h}" cy="${h}" r="${r}" fill="none" stroke="var(--line)" stroke-width="${stroke}"/>
      <circle cx="${h}" cy="${h}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${(c * f).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${h} ${h})"/>
      <text x="50%" y="${l2 ? size * 0.5 : size * 0.54}" text-anchor="middle" class="ringtxt">${esc(l1)}</text>
      ${l2 ? `<text x="50%" y="${size * 0.67}" text-anchor="middle" class="ringsub">${esc(l2)}</text>` : ''}</svg>`;
  }
  function renderFoodMini() {
    const k = kcalOf(getDay()), g = S.settings.goal;
    $('#foodMini').innerHTML = `<div class="qhead">Еда</div>${ring(k / g, 104, 11, k > g * 1.1 ? 'var(--pet)' : 'var(--teal)', String(k), 'из ' + g)}
      <div style="margin-top:10px"><button class="btn sm" data-act="goFood" style="width:100%">Записать</button></div>`;
  }
  function renderWater() {
    const w = getDay().water, g = S.settings.waterGoal, n = Math.max(g, w);
    $('#waterBox').innerHTML = `<div class="qhead">Вода</div>
      <div class="drops" aria-hidden="true">${Array.from({ length: Math.min(n, 15) }, (_, i) => `<i class="${i < w ? 'on' : ''}">💧</i>`).join('')}</div>
      <div class="row"><button class="btn ghost round" data-act="waterMinus" aria-label="Минус стакан">−</button>
      <div class="stat"><b>${w} / ${g}</b></div>
      <button class="btn round" data-act="waterPlus" aria-label="Плюс стакан">+</button></div>`;
  }
  function renderWeek() {
    const st = C.streak(S.days, todayKey()), cells = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 864e5), k = C.dayKey(d), ok = C.qualifies(S.days[k]);
      cells.push(`<div class="${ok ? 'ok' : ''} ${i === 0 ? 'today' : ''}"><span>${ok ? '✓' : ''}</span>${d.toLocaleDateString('ru-RU', { weekday: 'short' })}</div>`);
    }
    $('#weekBox').innerHTML = `<div class="qhead">Серия дней</div>
      <b>${st > 0 ? '🔥 ' + st + ' ' + plural(st, ['день', 'дня', 'дней']) + ' подряд' : 'Начнём новую серию сегодня'}</b>
      <div class="muted small">День засчитывается, когда набралось 3 действия: запись еды, задание или вода.</div>
      <div class="week">${cells.join('')}</div>`;
  }

  /* ---------- Еда ---------- */
  const REFS = [['🍎 яблоко', 80], ['🍌 банан', 100], ['🥚 яйцо', 75], ['🍞 ломтик хлеба', 80], ['🥪 бутерброд', 250],
    ['🥣 порция каши', 250], ['🍝 порция пасты', 450], ['🍕 кусок пиццы', 280], ['☕ латте', 150], ['🍫 шоколадка', 130]];
  function recentList() {
    const map = new Map();
    for (const k of Object.keys(S.days).sort().reverse().slice(0, 14)) {
      for (const m of S.days[k].meals) {
        if (!m.name) continue;
        const id = m.name.toLowerCase() + '|' + m.kcal, o = map.get(id) || { name: m.name, kcal: m.kcal, n: 0 };
        o.n++; map.set(id, o);
      }
    }
    return Array.from(map.values()).sort((a, b) => b.n - a.n).slice(0, 8);
  }
  /* ---------- Поиск продуктов при вводе ---------- */
  const FD = window.ToshaFoods;
  let foodSel = null, sugList = [];
  function hideSug() { $('#foodSug').hidden = true; }
  function clearFoodSel() { foodSel = null; $('#gramsRow').hidden = true; }
  function renderSug() {
    const q = $('#fName').value.trim();
    if (!FD || q.length < 2) { hideSug(); return; }
    const nq = FD.norm(q), seen = {};
    sugList = [];
    recentList().forEach(r => { if (FD.norm(r.name).indexOf(nq) !== -1 && !seen[r.name]) { seen[r.name] = 1; sugList.push({ recent: r }); } });
    FD.search(q, 14).forEach(f => { sugList.push({ f }); });
    sugList = sugList.slice(0, 14);
    if (!sugList.length) { hideSug(); return; }
    $('#foodSug').innerHTML = sugList.map((s, i) => s.recent
      ? `<button type="button" data-act="sugPick" data-i="${i}"><span>🕘</span><span class="sn">${esc(s.recent.name)}</span><span class="sk">${s.recent.kcal} ккал</span></button>`
      : `<button type="button" data-act="sugPick" data-i="${i}"><span>${s.f.emoji}</span><span class="sn">${esc(s.f.name)}</span><span class="sk">${FD.kcalFor(s.f, s.f.g)} ккал · ${s.f.label}</span></button>`).join('');
    $('#foodSug').hidden = false;
  }
  function pickFood(i) {
    const s = sugList[i]; if (!s) return;
    hideSug();
    if (s.recent) { clearFoodSel(); $('#fName').value = s.recent.name; $('#fKcal').value = s.recent.kcal; return; }
    foodSel = s.f; $('#fName').value = s.f.name; $('#fGrams').value = s.f.g;
    $('#gramsLbl').textContent = s.f.unit === 'мл' ? 'Миллилитры' : 'Граммы';
    $('#gramsRow').hidden = false; calcFromGrams();
  }
  function calcFromGrams() {
    if (!foodSel) return;
    const g = Number($('#fGrams').value);
    if (g > 0) $('#fKcal').value = FD.kcalFor(foodSel, g);
    $('#gramsHint').textContent = foodSel.k100 + ' ккал на 100 ' + foodSel.unit + ' · примерно';
  }
  $('#fName').addEventListener('input', () => {
    if (foodSel && $('#fName').value !== foodSel.name) clearFoodSel();
    renderSug();
  });
  $('#fName').addEventListener('keydown', e => { if (e.key === 'Escape') hideSug(); });
  $('#fGrams').addEventListener('input', calcFromGrams);
  document.addEventListener('click', e => { if (!e.target.closest('#foodSug,#fName')) hideSug(); });

  function renderFood() {
    const d = getDay(), k = kcalOf(d), g = S.settings.goal, left = g - k;
    $('#foodRing').innerHTML = ring(k / g, 160, 14, k > g * 1.1 ? 'var(--pet)' : 'var(--teal)', String(k), 'из ' + g + ' ккал') +
      `<p class="center muted" style="margin:10px 0 0">${k === 0 ? 'Пока ничего не записано' : left >= 0 ? 'Осталось примерно ' + left + ' ккал' : 'Чуть выше цели. Это нормально, завтра новый день 🙂'}</p>`;
    const meals = S.settings.meals.concat([{ id: 's', name: 'Перекус' }]);
    $('#mealChips').innerHTML = meals.map(m => `<button type="button" class="chip ${m.id === mealSel ? 'on' : ''}" data-act="meal" data-m="${m.id}">${MEAL_ICON[m.id] || '🍽'} ${esc(m.name)}</button>`).join('');
    $('#kcalChips').innerHTML = [100, 200, 300, 400, 500, 700].map(v => `<button type="button" class="chip" data-act="kcalChip" data-v="${v}">${v}</button>`).join('');
    $('#refChips').innerHTML = REFS.map((r, i) => `<button type="button" class="chip" data-act="refChip" data-i="${i}">${r[0]} · ${r[1]}</button>`).join('');
    recent = recentList();
    $('#recent').innerHTML = recent.length ? `<div class="qhead" style="margin-top:12px">Недавнее</div><div class="chips">${recent.map((r, i) => `<button type="button" class="chip" data-act="recentChip" data-i="${i}">${esc(r.name)} · ${r.kcal}</button>`).join('')}</div>` : '';
    $('#entries').innerHTML = d.meals.length
      ? d.meals.slice().sort((a, b) => a.ts - b.ts).map(m => `<div class="entry"><span class="t">${new Date(m.ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
          <span class="n">${MEAL_ICON[m.meal] || '🍽'} ${esc(m.name || mealName(m.meal))}</span><span class="k">${m.kcal}</span>
          <button class="x" data-act="delEntry" data-id="${m.id}" aria-label="Удалить запись">×</button></div>`).join('')
      : '<p class="muted">Здесь появятся записи за сегодня.</p>';
  }


  /* ---------- Тренировки ---------- */
  /* Справочник видов спорта: id, эмодзи, название, анимация питомца, MET (нагрузка). Свои виды добавляются на вкладке «Спорт». */
  const SPORTS = [
    ['walk', '🚶', 'Ходьба', 'walk', 3.5], ['fastwalk', '🚶‍♀️', 'Быстрая ходьба', 'walk', 4.8], ['run', '🏃', 'Бег', 'run', 9],
    ['bike', '🚴', 'Велосипед', 'bike', 7], ['swim', '🏊', 'Плавание', 'swim', 6], ['yoga', '🧘', 'Йога', 'yoga', 2.5],
    ['warmup', '🤸', 'Разминка', 'warmup', 3], ['stretch', '🙆', 'Растяжка', 'stretch', 2.3], ['gym', '🏋️', 'Спортзал (штанга)', 'gym', 5],
    ['kettle', '🔔', 'Гири', 'kettle', 8], ['iceskate', '⛸️', 'Коньки', 'iceskate', 7], ['roller', '🛼', 'Роликовые коньки', 'roller', 7],
    ['rope', '🪢', 'Скакалка', 'rope', 11], ['squats', '🦵', 'Приседания', 'squats', 5], ['dance', '💃', 'Танцы', 'dance', 5],
    ['football', '⚽', 'Футбол', 'football', 7], ['basket', '🏀', 'Баскетбол', 'jump', 6.5], ['volley', '🏐', 'Волейбол', 'jump', 4],
    ['tennis', '🎾', 'Теннис', 'jump', 7], ['hike', '🥾', 'Поход', 'walk', 6], ['stairs', '🪜', 'Подъём по лестнице', 'walk', 6],
    ['ski', '🎿', 'Лыжи', 'iceskate', 7.5], ['aerobics', '🤾', 'Аэробика', 'dance', 6.5], ['hiit', '⚡', 'Интервальная тренировка', 'jump', 8]
  ];
  const CW_EMOJI = ['🏅', '🏃', '🚴', '🏊', '🧘', '🏋️', '⚽', '🎾', '🏓', '🥊', '🧗', '🏄', '🤸', '💃', '🛹', '🎯'];
  const CW_ANIMS = [['run', 'Бег'], ['walk', 'Ходьба'], ['bike', 'Велосипед'], ['swim', 'Плавание'], ['yoga', 'Йога'], ['warmup', 'Разминка'], ['stretch', 'Растяжка'], ['gym', 'Штанга'], ['kettle', 'Гири'], ['iceskate', 'Коньки'], ['roller', 'Ролики'], ['rope', 'Скакалка'], ['squats', 'Приседания'], ['dance', 'Танцы'], ['football', 'Мяч'], ['jump', 'Прыжки']];
  const kgOf = () => Math.min(250, Math.max(30, Number(S.settings.weight) || 65));
  const allSports = () => SPORTS.map(s => ({ id: s[0], emoji: s[1], name: s[2], anim: s[3], kcalMin: s[4] * kgOf() * 0.0175 }))
    .concat(S.custom.workouts.map(w => ({ id: w.id, emoji: w.emoji, name: w.name, anim: w.anim, kcalMin: w.kcalMin, own: true })));
  const sportById = id => allSports().find(s => s.id === id);
  let sportSel = 'walk', kcalManual = false, sportKey = '';
  const wKcalFor = (sp, min) => Math.round(sp.kcalMin * min);
  function playSport() {
    const svg = $('#sportStage .pet-svg'), sp = sportById(sportSel);
    if (svg && AN && sp) AN.play(svg, sp.anim, { loop: true });
  }
  function recalcW() {
    const sp = sportById(sportSel), min = Number($('#wMin').value);
    if (sp && min > 0 && !kcalManual) $('#wKcal').value = wKcalFor(sp, min);
    $('#wHint').textContent = sp ? '≈ ' + Math.round(sp.kcalMin * 10) / 10 + ' ккал в минуту при весе ' + kgOf() + ' кг. Это ориентир, не точный счётчик.' : '';
  }
  function renderSport() {
    if (!sportById(sportSel)) sportSel = 'walk';
    const sp = sportById(sportSel), lvl = Math.max(2, C.level(S.xp));
    const key = [S.pet, sportSel, lvl, JSON.stringify(colorsOf(S.pet) || '')].join('|');
    if (key !== sportKey) {
      sportKey = key;
      $('#sportStage').innerHTML = petSvg(S.pet, 'happy', lvl, { label: S.settings.petName });
      playSport();
    }
    const d = AN && AN.LIB[sp.anim];
    $('#sportName').textContent = sp.emoji + ' ' + sp.name;
    $('#sportDesc').textContent = d ? d.desc : '';
    $('#sportChips').innerHTML = allSports().map(s => `<button type="button" class="chip sp ${s.id === sportSel ? 'on' : ''}" data-act="sportPick" data-id="${esc(s.id)}">${esc(s.emoji)} ${esc(s.name)}</button>`).join('');
    $('#wMinChips').innerHTML = [10, 15, 20, 30, 45, 60].map(v => `<button type="button" class="chip" data-act="wMinChip" data-v="${v}">${v} мин</button>`).join('');
    recalcW();
    const ws = getDay().workouts || [], tm = ws.reduce((a, w) => a + w.min, 0), tk = ws.reduce((a, w) => a + (w.kcal || 0), 0);
    $('#wToday').innerHTML = ws.length
      ? ws.slice().sort((a, b) => a.ts - b.ts).map(w => `<div class="entry"><span class="t">${new Date(w.ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span><span class="n">${esc(w.emoji || '🏅')} ${esc(w.name)} · ${w.min} мин</span><span class="k">${w.kcal || 0}</span><button class="x" data-act="delWorkout" data-id="${w.id}" aria-label="Удалить тренировку">×</button></div>`).join('') +
        `<p class="muted small" style="margin-top:8px">Итого: ${tm} мин · ≈ ${tk} ккал потрачено. Из дневной нормы калории не вычитаются.</p>`
      : '<p class="muted">Сегодня пока без тренировок. Лёгкая прогулка тоже считается.</p>';
    const bars = []; let mx = 30;
    for (let i = 6; i >= 0; i--) { const dd = new Date(Date.now() - i * 864e5), k = C.dayKey(dd), m = ((S.days[k] || {}).workouts || []).reduce((a, w) => a + w.min, 0); mx = Math.max(mx, m); bars.push({ dd, m, today: i === 0 }); }
    $('#wWeek').innerHTML = `<div class="wbars">${bars.map(b => `<div class="${b.today ? 'on' : ''}"><b>${b.m || ''}</b><i style="height:${Math.max(4, Math.round(b.m / mx * 70))}px"></i>${b.dd.toLocaleDateString('ru-RU', { weekday: 'short' })}</div>`).join('')}</div>
      <p class="muted small">Минут движения за день. За неделю: ${bars.reduce((a, b) => a + b.m, 0)} мин.</p>`;
    $('#cwEmoji').innerHTML = CW_EMOJI.map(e => `<option>${e}</option>`).join('');
    if (!$('#cwAnim').options.length) $('#cwAnim').innerHTML = CW_ANIMS.map(a => `<option value="${a[0]}">${a[1]}</option>`).join('');
    $('#custList').innerHTML = S.custom.workouts.length
      ? S.custom.workouts.map(w => `<div class="entry"><span class="n">${esc(w.emoji)} ${esc(w.name)}</span><span class="k">${Math.round(w.kcalMin * 10) / 10}/мин</span><button class="x" data-act="cwDel" data-id="${w.id}" aria-label="Удалить вид тренировки">×</button></div>`).join('')
      : '';
    const wt = $('[data-s="weight"]'); if (wt && document.activeElement !== wt) wt.value = S.settings.weight;
  }
  $('#wMin').addEventListener('input', recalcW);
  $('#wKcal').addEventListener('input', () => { kcalManual = $('#wKcal').value !== ''; });
  $('#sportForm').addEventListener('submit', e => {
    e.preventDefault();
    const sp = sportById(sportSel), min = Math.round(Number($('#wMin').value));
    if (!sp || !(min > 0 && min <= 600)) { toast('Укажи минуты от 1 до 600'); return; }
    const k = Math.round(Number($('#wKcal').value));
    const d = day();
    d.workouts.push({ id: uid(), ts: Date.now(), act: sp.id, name: sp.name, emoji: sp.emoji, min, kcal: k >= 0 && $('#wKcal').value !== '' ? k : wKcalFor(sp, min) });
    if (d.workouts.length <= 3) addXp(Math.min(40, Math.max(5, Math.round(min / 2)))); else toast('Записано. Молодец!');
    $('#wMin').value = ''; $('#wKcal').value = ''; kcalManual = false;
    react(sp.anim); save(); renderAll(); playSport();
  });
  $('#custForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#cwName').value.trim().slice(0, 24), kcalMin = Number($('#cwKcal').value);
    if (!name || !(kcalMin > 0 && kcalMin <= 30)) { toast('Введи название и ккал в минуту'); return; }
    const id = 'w_' + uid();
    S.custom.workouts.push({ id, emoji: $('#cwEmoji').value, name, anim: $('#cwAnim').value, kcalMin });
    sportSel = id; $('#cwName').value = ''; $('#cwKcal').value = '';
    save(); sportKey = ''; renderSport(); renderAch(); toast('Тренировка добавлена');
  });

  /* ---------- Достижения ---------- */
  let inAch = false; const achOpen = {};
  const achEx = () => ({ todayKey: todayKey(), petCount: Object.keys(P.SPECIES).length });
  function checkAch(silent) {
    if (inAch || !C.evalAch || !P) return;
    inAch = true;
    try {
      const got = C.evalAch(S, achEx()).list.filter(a => a.done && !S.ach[a.id]);
      if (got.length) {
        const now = Date.now(); got.forEach(a => { S.ach[a.id] = now; });
        persist();
        if (!silent) {
          toast(got.length === 1 ? '🏅 Достижение: ' + got[0].title : '🏅 Новые достижения: ' + got.map(a => a.title).join(', '));
          react('surprise');
          renderAch();
        }
      }
    } finally { inAch = false; }
  }
  function renderAch() {
    const ev = C.evalAch(S, achEx()), by = {};
    ev.list.forEach(a => { (by[a.group] = by[a.group] || []).push(a); });
    $('#achCount').textContent = ev.list.filter(a => a.done).length + ' из ' + ev.list.length;
    $('#achList').innerHTML = C.ACH_GROUPS.map(g => {
      const L = by[g.id] || [], n = L.filter(a => a.done).length;
      const rows = L.map(a => `<div class="ach ${a.done ? 'done' : 'lock'}"><span class="em">${a.emoji}</span>
        <div class="t"><b>${esc(a.title)}</b><span>${esc(a.desc)}</span>${!a.done && a.target > 1 ? `<div class="bar"><i style="width:${Math.round(a.value / a.target * 100)}%"></i></div>` : ''}</div>
        <span class="r">${a.done ? '✓' : a.target > 1 ? a.value + '/' + a.target : '🔒'}</span></div>`).join('');
      return `<details class="agrp" data-g="${g.id}" ${achOpen[g.id] ? 'open' : ''}><summary><b>${esc(g.title)}</b> <span class="pill">${n}/${L.length}</span></summary>${rows}</details>`;
    }).join('');
  }
  $('#achList').addEventListener('toggle', e => { const d = e.target; if (d && d.dataset && d.dataset.g) achOpen[d.dataset.g] = d.open; }, true);

  /* ---------- Тема оформления ---------- */
  const MODES = [['auto', 'Как в телефоне'], ['light', 'Светлая'], ['dark', 'Тёмная']];
  const PALS = [['peach', 'Персик', '#d94f30'], ['mint', 'Мята', '#137a57'], ['lavender', 'Лаванда', '#6a4fc2'], ['ocean', 'Море', '#1b6fb5']];
  const mqDark = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function applyTheme() {
    const st = S.settings, mode = st.themeMode || 'auto';
    const dark = mode === 'dark' || (mode !== 'light' && !!(mqDark && mqDark.matches));
    const d = document.documentElement;
    d.dataset.theme = dark ? 'dark' : 'light'; d.dataset.pal = st.palette || 'peach'; d.style.colorScheme = dark ? 'dark' : 'light';
    const bg = getComputedStyle(d).getPropertyValue('--bg').trim(), m = document.querySelector('meta[name="theme-color"]');
    if (m && bg) m.setAttribute('content', bg);
  }
  if (mqDark && mqDark.addEventListener) mqDark.addEventListener('change', () => { if ((S.settings.themeMode || 'auto') === 'auto') applyTheme(); });
  function renderThemeUi() {
    const st = S.settings;
    $('#themeMode').innerHTML = MODES.map(m => `<button type="button" class="chip ${(st.themeMode || 'auto') === m[0] ? 'on' : ''}" data-act="themeMode" data-v="${m[0]}" aria-pressed="${(st.themeMode || 'auto') === m[0]}">${m[1]}</button>`).join('');
    $('#themePal').innerHTML = PALS.map(p => `<button type="button" class="swatch ${(st.palette || 'peach') === p[0] ? 'on' : ''}" data-act="themePal" data-v="${p[0]}" aria-pressed="${(st.palette || 'peach') === p[0]}"><i style="--c:${p[2]}"></i>${p[1]}</button>`).join('');
  }
  function setTheme(k, v) { S.settings[k] = v; S.flags.theme = true; applyTheme(); renderThemeUi(); save(); }

  /* ---------- Уведомления ---------- */
  const standalone = () => NATIVE || matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  function permText() {
    if (NATIVE) return nativePerm === 'granted' ? 'Разрешены ✓' : nativePerm === 'denied' ? 'Запрещены в настройках телефона' : 'Ещё не разрешены';
    if (!('Notification' in window)) return 'Не поддерживаются, напоминания покажутся внутри приложения';
    const p = Notification.permission;
    return p === 'granted' ? 'Разрешены ✓' : p === 'denied' ? 'Запрещены в настройках телефона' : 'Ещё не разрешены';
  }
  function renderPerm() {
    let h = '';
    if (!standalone()) {
      h += `<div class="card tip"><b>Поставь Тошу на экран</b>
        <p class="muted small">Так он открывается как обычное приложение и надёжнее присылает напоминания.</p>
        ${deferredInstall ? '<button class="btn" data-act="install">Установить</button>' : '<p class="small">Меню браузера ⋮ → «Установить приложение» или «Добавить на главный экран».</p>'}</div>`;
    }
    if (NATIVE && S.settings.notify) {
      if (nativePerm === 'prompt' || nativePerm === 'prompt-with-rationale') {
        h += `<div class="card tip"><b>Тихие напоминания</b><p class="muted small">Тоша напомнит о еде и разминке без звука и не чаще нескольких раз в день. Разрешить уведомления?</p>
          <button class="btn" data-act="askPerm">Разрешить</button></div>`;
      } else if (nativePerm === 'denied') {
        h += `<div class="card tip"><p class="small" style="margin:0">Уведомления выключены в настройках телефона (Настройки → Приложения → Тоша → Уведомления).</p></div>`;
      }
    } else if ('Notification' in window && S.settings.notify) {
      if (Notification.permission === 'default') {
        h += `<div class="card tip"><b>Тихие напоминания</b><p class="muted small">Тоша напомнит о еде и разминке без звука и не чаще нескольких раз в день. Разрешить уведомления?</p>
          <button class="btn" data-act="askPerm">Разрешить</button></div>`;
      } else if (Notification.permission === 'denied') {
        h += `<div class="card tip"><p class="small" style="margin:0">Уведомления выключены в настройках телефона. Тоша всё равно будет подсказывать, пока приложение открыто.</p></div>`;
      }
    }
    $('#permBox').innerHTML = h;
    $('#permStatus').textContent = permText();
  }
  async function askPerm() {
    if (NATIVE) { await nativeAsk(); if (nativePerm === 'granted') toast('Готово! Тоша будет напоминать тихо'); return; }
    if (!('Notification' in window)) return;
    const p = await Notification.requestPermission();
    if (p === 'granted') { toast('Готово! Тоша будет напоминать тихо'); registerPeriodic(); }
    renderPerm();
  }
  async function registerPeriodic() {
    try {
      if (!reg || !('periodicSync' in reg)) return;
      const st = await navigator.permissions.query({ name: 'periodic-background-sync' });
      if (st.state === 'granted') await reg.periodicSync.register('tosha-check', { minInterval: 60 * 60 * 1000 });
    } catch (e) { /* не страшно: напоминания придут, когда приложение открыто */ }
  }
  async function showSystem(due) {
    const opts = C.notifOptions(due, S.settings);
    try {
      if (reg && reg.showNotification) await reg.showNotification(due.title, opts);
      else new Notification(due.title, opts);
    } catch (e) { console.warn(e); }
  }
  function showNudge(due) {
    const btn = due.kind === 'meal' ? `<button class="btn sm" data-act="nudgeGo" data-tab="food" data-meal="${esc(due.mealId)}">Записать</button>`
      : due.kind === 'summary' ? '<button class="btn sm" data-act="nudgeGo" data-tab="food">Итог</button>'
      : '<button class="btn sm" data-act="nudgeGo" data-tab="home" data-glow="1">Смотреть</button>';
    const el = $('#nudge'); el.hidden = false;
    el.innerHTML = `<div><b>${esc(due.title)}</b><div>${esc(due.body)}</div></div>${btn}<button class="x" data-act="nudgeClose" aria-label="Закрыть">×</button>`;
  }
  async function fire(due, now) {
    const ctx = C.buildCtx(S, now);
    C.markFired(ctx, due, now);
    S.fired = C.pruneFired(ctx.fired, now.getTime());
    S.notifLog[ctx.dayKey] = ctx.notifToday;
    S.lastMoveAt = ctx.lastMoveAt;
    const old = C.dayKey(new Date(now.getTime() - 7 * 864e5));
    Object.keys(S.notifLog).forEach(k => { if (k < old) delete S.notifLog[k]; });
    if (due.kind === 'move') S.current = { questId: due.questId, ts: now.getTime() };
    save();
    if (document.visibilityState === 'visible') { showNudge(due); renderAll(); } else await showSystem(due);
  }
  async function tick() {
    const now = new Date(), vis = document.visibilityState === 'visible';
    const canSys = !vis && 'Notification' in window && Notification.permission === 'granted';
    if (vis || canSys) {
      const due = C.computeDue(C.buildCtx(S, now), now);
      if (due) await fire(due, now);
    }
    if (vis) renderPet();
  }
  async function syncFromIdb() {
    try {
      if (!window.indexedDB) return;
      const snap = await C.idbGet('snapshot'); if (!snap) return;
      let ch = false;
      for (const k of Object.keys(snap.fired || {})) if (!S.fired[k] || S.fired[k] < snap.fired[k]) { S.fired[k] = snap.fired[k]; ch = true; }
      const cur = S.notifLog[snap.dayKey] || [], merged = Array.from(new Set(cur.concat(snap.notifToday || []))).sort();
      if (merged.length !== cur.length) { S.notifLog[snap.dayKey] = merged; ch = true; }
      if ((snap.lastMoveAt || 0) > (S.lastMoveAt || 0)) { S.lastMoveAt = snap.lastMoveAt; ch = true; }
      if (snap.currentQuestId && (!S.current || S.current.questId !== snap.currentQuestId) && snap.lastMoveAt > (S.current ? S.current.ts : 0)) {
        S.current = { questId: snap.currentQuestId, ts: snap.lastMoveAt }; ch = true;
      }
      if (ch) save();
    } catch (e) { /* нет снимка: ничего страшного */ }
  }

  /* ---------- Действия ---------- */
  const A = {
    questDone() {
      const q = S.current && qById(S.current.questId); if (!q) return;
      day().quests.push({ id: q.id, ts: Date.now() });
      if (q.water) day().water++;
      S.current = null; S.lastMoveAt = Date.now();
      addXp(q.xp); react('cheer'); save(); renderAll();
    },
    questSwap() { newQuest(); save(); renderQuest(); },
    questNew() { newQuest(); save(); renderQuest(); },
    waterPlus() { const d = day(); d.water++; if (d.water <= S.settings.waterGoal) addXp(2); else toast('Достаточно воды 💧 Отдохни'); react('drinkOk'); save(); renderAll(); },
    waterMinus() { const d = day(); if (d.water > 0) d.water--; save(); renderAll(); },
    goFood() { go('food'); },
    goPets() { go('more'); const el = $('#pickMore'); if (el) el.scrollIntoView({ block: 'center' }); },
    pickPet(t) {
      const id = t.dataset.p; if (!P.SPECIES[id]) return;
      S.pet = id; S.petChosen = true;
      if (S.petsTried.indexOf(id) < 0) S.petsTried.push(id);
      const defaults = Object.keys(P.SPECIES).map(k => P.SPECIES[k].name);
      if (!S.settings.petName || defaults.indexOf(S.settings.petName) >= 0) S.settings.petName = P.SPECIES[id].name;
      save(); fillSettings(); renderAll(); react('greet');
      toast('Теперь с тобой ' + S.settings.petName + ' 🐾');
    },
    petTap() {
      const svg = curSvg(); if (!svg || !AN) return;
      const list = [['happy'], ['greet'], ['dance', { for: 3200 }], ['excited']]; tapN = (tapN + 1) % list.length;
      AN.play(svg, list[tapN][0], list[tapN][1] || {});
      S.flags.taps = (S.flags.taps || 0) + 1; save();
    },
    themeMode(t) { setTheme('themeMode', t.dataset.v); },
    themePal(t) { setTheme('palette', t.dataset.v); },
    wsSp(t) { WS.sp = t.dataset.p; renderWsTop(); },
    wsAnim(t) { WS.anim = t.dataset.a; renderWsTop(); },
    wsPlay() { playWs(); },
    colReset() { if (S.custom.colors[WS.sp]) { delete S.custom.colors[WS.sp]; colorsChanged(); } },
    cqDel(t) { S.custom.quests = S.custom.quests.filter(q => q.id !== t.dataset.id); if (S.current && S.current.questId === t.dataset.id) S.current = null; save(); renderCustomQuests(); renderQuest(); },
    meal(t) { mealSel = t.dataset.m; renderFood(); },
    kcalChip(t) { $('#fKcal').value = t.dataset.v; },
    sugPick(t) { pickFood(+t.dataset.i); },
    gramsMul(t) { if (!foodSel) return; const g = Math.max(1, Math.round(foodSel.g * Number(t.dataset.m))); $('#fGrams').value = g; calcFromGrams(); },
    refChip(t) { const r = REFS[+t.dataset.i]; clearFoodSel(); $('#fName').value = r[0].replace(/^\S+\s/, ''); $('#fKcal').value = r[1]; },
    recentChip(t) { const r = recent[+t.dataset.i]; if (r) { clearFoodSel(); $('#fName').value = r.name; $('#fKcal').value = r.kcal; } },
    sportPick(t) { sportSel = t.dataset.id; kcalManual = false; $('#wKcal').value = ''; sportKey = ''; renderSport(); },
    wMinChip(t) { $('#wMin').value = t.dataset.v; kcalManual = false; recalcW(); },
    delWorkout(t) { const d = day(); d.workouts = d.workouts.filter(w => w.id !== t.dataset.id); save(); renderAll(); toast('Запись удалена'); },
    cwDel(t) { S.custom.workouts = S.custom.workouts.filter(w => w.id !== t.dataset.id); if (sportSel === t.dataset.id) sportSel = 'walk'; sportKey = ''; save(); renderSport(); },
    delEntry(t) { const d = day(); d.meals = d.meals.filter(m => m.id !== t.dataset.id); save(); renderAll(); toast('Запись удалена'); },
    askPerm,
    async testNotif() {
      if (NATIVE) {
        if (nativePerm !== 'granted') await nativeAsk();
        const LN = plug('LocalNotifications');
        if (nativePerm === 'granted' && LN) {
          try { await LN.createChannel({ id: 'tosha-quiet', name: 'Тихие напоминания', importance: 2, vibration: false, visibility: 1 }); } catch (e) { /* ок */ }
          await LN.schedule({ notifications: [{ id: 9999, title: S.settings.petName + ' на связи 🐾', body: 'Так выглядят тихие напоминания.', schedule: { at: new Date(Date.now() + 3000), allowWhileIdle: true }, channelId: 'tosha-quiet', extra: { kind: 'test' } }] });
          toast('Отправлю через 3 секунды, сверни приложение');
        }
        return;
      }
      if (!('Notification' in window)) { toast('Этот браузер не поддерживает уведомления'); return; }
      if (Notification.permission !== 'granted') await askPerm();
      if (Notification.permission === 'granted') {
        await showSystem({ title: S.settings.petName + ' на связи 🐾', body: 'Так выглядят тихие напоминания.', tag: 'tosha-test', kind: 'test' });
        toast('Отправил, смотри в шторке');
      }
    },
    install() { if (deferredInstall) { deferredInstall.prompt(); deferredInstall = null; renderPerm(); } },
    nudgeGo(t) {
      $('#nudge').hidden = true;
      if (t.dataset.meal) mealSel = t.dataset.meal;
      go(t.dataset.tab); renderFood();
      if (t.dataset.glow) { const q = $('#questBox'); q.classList.add('glow'); setTimeout(() => q.classList.remove('glow'), 3500); }
    },
    nudgeClose() { $('#nudge').hidden = true; },
    async export() {
      S.flags.backup = true; save();
      if (NATIVE && plug('Filesystem') && plug('Share')) {
        try {
          const name = 'tosha-backup-' + todayKey() + '.json';
          const w = await plug('Filesystem').writeFile({ path: name, data: JSON.stringify(S, null, 1), directory: 'CACHE', encoding: 'utf8' });
          await plug('Share').share({ title: 'Копия Тоши', url: w.uri, dialogTitle: 'Сохранить копию' });
        } catch (e) { toast('Не получилось поделиться файлом'); }
        return;
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }));
      a.download = 'tosha-backup-' + todayKey() + '.json'; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    },
    import() { $('#importFile').click(); },
    reset() {
      if (!confirm('Удалить все записи и начать с нуля? Это нельзя отменить.')) return;
      S = fresh(); save(); fillSettings(); renderAll(); toast('Начинаем сначала');
    }
  };
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-act],[data-tab]'); if (!t) return;
    if (t.dataset.act) { const f = A[t.dataset.act]; if (f) f(t, e); } else go(t.dataset.tab);
  });

  $('#foodForm').addEventListener('submit', e => {
    e.preventDefault();
    const kcal = Math.round(Number($('#fKcal').value));
    if (!(kcal > 0 && kcal <= 5000)) { toast('Введи калории от 1 до 5000'); return; }
    const d = day();
    let nm = $('#fName').value.trim();
    if (foodSel && !$('#gramsRow').hidden && Number($('#fGrams').value) > 0) nm += ' · ' + Number($('#fGrams').value) + ' ' + foodSel.unit;
    d.meals.push({ id: uid(), ts: Date.now(), name: nm, kcal, meal: mealSel });
    if (d.meals.length <= 6) addXp(5); else toast('Записано');
    $('#fKcal').value = ''; $('#fName').value = ''; clearFoodSel(); hideSug();
    react('happy'); save(); renderAll();
  });

  /* ---------- Настройки ---------- */
  function fillSettings() {
    $$('[data-s]').forEach(el => {
      const v = S.settings[el.dataset.s];
      if (el.dataset.t === 'bool') el.checked = !!v; else el.value = v;
    });
    $$('[data-meal]').forEach(el => { const m = S.settings.meals.find(x => x.id === el.dataset.meal); if (m) el.value = m.time; });
  }
  document.addEventListener('change', e => {
    const el = e.target.closest('[data-s],[data-meal]'); if (!el) return;
    if (el.dataset.meal) {
      const m = S.settings.meals.find(x => x.id === el.dataset.meal);
      if (m && el.value) m.time = el.value;
    } else {
      const k = el.dataset.s, t = el.dataset.t; let v;
      if (t === 'bool') v = el.checked;
      else if (t === 'num') { v = Number(el.value); if (!Number.isFinite(v)) v = S.settings[k]; v = Math.round(Math.min(+el.dataset.max, Math.max(+el.dataset.min, v))); el.value = v; }
      else if (t === 'sel') v = Number(el.value);
      else if (k === 'petName') { v = el.value.trim().slice(0, 16) || 'Тоша'; el.value = v; if (Object.keys(P.SPECIES).map(x => P.SPECIES[x].name).concat(['Тоша']).indexOf(v) < 0) S.flags.renamed = true; }
      else v = el.value || S.settings[k];
      S.settings[k] = v;
    }
    save(); renderAll();
  });
  $('#importFile').addEventListener('change', async e => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    try {
      const o = JSON.parse(await f.text());
      if (!o || typeof o !== 'object' || !o.days || !o.settings) throw new Error('bad');
      if (!confirm('Заменить текущие данные копией из файла?')) return;
      S = migrate(o); save(); fillSettings(); renderAll(); toast('Копия загружена');
    } catch (err) { toast('Не получилось прочитать файл'); }
  });

  /* ---------- Мастерская ---------- */
  const WS = { sp: null, anim: 'happy', speed: 1, loop: false };
  function playWs() {
    const svg = $('#wsStage .pet-svg'), d = AN && AN.LIB[WS.anim]; if (!svg || !d) return;
    AN.play(svg, WS.anim, { speed: WS.speed, loop: WS.loop ? true : undefined, for: (d.loop && !WS.loop) ? 6000 : undefined });
  }
  function fillColors() {
    const sp = P.SPECIES[WS.sp], c = colorsOf(WS.sp) || {};
    $('#colPet').value = c.pet || sp.c.pet; $('#colLight').value = c.light || sp.c.light;
  }
  function renderWsTop() {
    if (!AN) return;
    WS.sp = WS.sp || S.pet;
    $('#wsSpecies').innerHTML = Object.keys(P.SPECIES).map(id => `<button type="button" class="chip ${id === WS.sp ? 'on' : ''}" data-act="wsSp" data-p="${id}">${esc(P.SPECIES[id].title)}</button>`).join('');
    $('#wsList').innerHTML = AN.GROUPS.map(g => `<div class="qhead" style="margin-top:10px">${g.title}</div><div class="chips">${AN.list().filter(a => a.group === g.id).map(a => `<button type="button" class="chip ${a.id === WS.anim ? 'on' : ''}" data-act="wsAnim" data-a="${a.id}">${a.emoji} ${esc(a.title)}</button>`).join('')}</div>`).join('');
    $('#wsStage').innerHTML = petSvg(WS.sp, 'neutral', Math.max(2, C.level(S.xp)), { label: P.SPECIES[WS.sp].title });
    const d = AN.LIB[WS.anim]; $('#wsDesc').textContent = d ? d.title + ': ' + d.desc : '';
    fillColors(); playWs();
  }
  function renderCustomQuests() {
    $('#cqList').innerHTML = S.custom.quests.length
      ? S.custom.quests.map(q => `<div class="entry"><span class="n">${esc(q.emoji)} ${esc(q.text)}</span><span class="k">+${q.xp}</span><button class="x" data-act="cqDel" data-id="${q.id}" aria-label="Удалить задание">×</button></div>`).join('')
      : '<p class="muted small">Своих заданий пока нет. Добавь первое ниже: Тоша будет предлагать его вместе со своими.</p>';
  }
  function renderWorkshop() { renderWsTop(); renderCustomQuests(); $('#cpText').value = S.custom.phrases.join('\n'); }
  function colorsChanged() { save(); petKey = ''; renderPet(); renderPicker(); renderWsTop(); }
  $('#colPet').addEventListener('change', () => { S.custom.colors[WS.sp] = { pet: $('#colPet').value, light: $('#colLight').value }; colorsChanged(); });
  $('#colLight').addEventListener('change', () => { S.custom.colors[WS.sp] = { pet: $('#colPet').value, light: $('#colLight').value }; colorsChanged(); });
  $('#wsSpeed').addEventListener('input', e => { WS.speed = parseFloat(e.target.value) || 1; $('#wsSpeedV').textContent = WS.speed.toFixed(1).replace('.', ',') + '×'; });
  $('#wsSpeed').addEventListener('change', playWs);
  $('#wsLoop').addEventListener('change', e => { WS.loop = e.target.checked; playWs(); });
  $('#cqForm').addEventListener('submit', e => {
    e.preventDefault();
    const text = $('#cqText').value.trim().slice(0, 60); if (!text) { toast('Напиши, что нужно сделать'); return; }
    if (S.custom.quests.length >= 30) { toast('Достаточно: максимум 30 своих заданий'); return; }
    const emoji = Array.from($('#cqEmoji').value.trim() || '⭐').slice(0, 2).join('');
    S.custom.quests.push({ id: 'u_' + uid(), emoji, text, dur: $('#cqDur').value, xp: Number($('#cqXp').value) || 10 });
    save(); renderCustomQuests(); $('#cqText').value = ''; $('#cqEmoji').value = ''; toast('Задание добавлено');
  });
  $('#cpText').addEventListener('change', e => {
    S.custom.phrases = e.target.value.split('\n').map(x => x.trim().slice(0, 80)).filter(Boolean).slice(0, 30);
    save(); petKey = ''; renderPet(); toast('Фразы сохранены');
  });

  /* ---------- Запуск ---------- */
  function renderAll() { renderPet(); renderPicker(); renderPerm(); renderQuest(); renderFoodMini(); renderWater(); renderWeek(); renderFood(); renderAch(); renderThemeUi(); if ($('#tab-sport').classList.contains('active')) renderSport(); }
  function navTo(d) {
    if (d.kind === 'meal') { if (d.mealId) mealSel = d.mealId; go('food'); renderFood(); }
    else if (d.kind === 'summary') go('food');
    else go('home');
    syncFromIdb().then(renderAll);
  }
  async function initSW() {
    if (NATIVE) { nativeCheck().then(() => { renderPerm(); reschedule(); }); return; }
    if (!('serviceWorker' in navigator)) return;
    try {
      await navigator.serviceWorker.register('sw.js');
      reg = await navigator.serviceWorker.ready;
      navigator.serviceWorker.addEventListener('message', ev => { if (ev.data && ev.data.type === 'nav') navTo(ev.data); });
      registerPeriodic(); mirror();
    } catch (e) { console.warn('Service worker недоступен (нужен https):', e); }
  }
  if (NATIVE && plug('LocalNotifications')) {
    plug('LocalNotifications').addListener('localNotificationActionPerformed', ev => { const x = ev.notification && ev.notification.extra; if (x && x.kind && x.kind !== 'test') navTo(x); });
  }
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; renderPerm(); });
  window.addEventListener('appinstalled', () => { deferredInstall = null; renderPerm(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    if (reg && reg.getNotifications) reg.getNotifications().then(ns => ns.forEach(n => n.close())).catch(() => {});
    syncFromIdb().then(() => { renderAll(); tick(); });
  });

  (async function init() {
    try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) { /* ок */ }
    applyTheme();
    fillSettings();
    await syncFromIdb();
    checkAch(true);
    const p = new URLSearchParams(location.search);
    if (p.get('from')) { navTo({ kind: p.get('from'), mealId: p.get('meal') }); history.replaceState(null, '', location.pathname); }
    else if (p.get('tab') === 'ws') { go('ws'); history.replaceState(null, '', location.pathname); }
    renderAll();
    save();
    initSW();
    tick();
    setInterval(tick, 30000);
  })();
})();
