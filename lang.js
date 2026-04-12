// SVITA — Plan otwarcia gabinetu stomatologicznego w Polsce
// PIVOT 2026-04-12: only PL + EN. One niche (dental), one country (Poland).
// All claims must be verifiable. No "30%", no "1 hour", no fake stats.

window.LABS67_DEFAULT_LANG = 'pl';

window.I18N = {

// ── NAV ──
nav_what:        { pl:"Co dostajesz",   en:"What you get" },
nav_case:        { pl:"Case Świtlicy",  en:"Świtlica case" },
nav_pricing:     { pl:"Cennik",         en:"Pricing" },
nav_faq:         { pl:"FAQ",            en:"FAQ" },
nav_login:       { pl:"Zaloguj",        en:"Log in" },
nav_start:       { pl:"Zacznij plan",   en:"Start plan" },

// ── HERO ──
hero_badge:      { pl:"Tylko stomatologia · tylko Polska · zweryfikowane dane 2026",
                   en:"Dentistry only · Poland only · verified 2026 data" },
hero_title:      { pl:"Plan otwarcia gabinetu stomatologicznego <span class=\"gradient\">w Polsce</span>",
                   en:"Plan for opening a dental practice <span class=\"gradient\">in Poland</span>" },
hero_desc:       { pl:"Realne ceny sprzętu od polskich dystrybutorów. Pensje brutto 2026 według województwa. Lista dokumentów NFZ, sanepid, RTG. Gotowy budżet startu i prognoza ROI w 14 dni — albo zwracamy pieniądze.",
                   en:"Real equipment prices from Polish distributors. Gross 2026 salaries by voivodeship. Document checklist for NFZ, sanepid, X-ray license. Startup budget and ROI forecast in 14 days — or your money back." },
hero_cta:        { pl:"Zamów plan — 199 €",   en:"Order the plan — €199" },
hero_cta_sub:    { pl:"Jednorazowa płatność. Bez subskrypcji.", en:"One-time payment. No subscription." },

// ── HONEST STATUS BAR (replaces fake stats) ──
status_clients:  { pl:"Klientów dzisiaj",         en:"Clients today" },
status_clients_v:{ pl:"1 (Świtlica — nasza)",     en:"1 (Świtlica — ours)" },
status_db:       { pl:"Zweryfikowane pozycje sprzętu", en:"Verified equipment items" },
status_db_v:     { pl:"50+ na 2026-04",            en:"50+ as of 2026-04" },
status_country:  { pl:"Pokrycie",                  en:"Coverage" },
status_country_v:{ pl:"Polska",                    en:"Poland" },

// ── WHAT YOU GET ──
what_label:      { pl:"Co dostajesz",   en:"What you get" },
what_title:      { pl:"6 rozdziałów twojego planu",        en:"6 chapters of your plan" },
what_sub:        { pl:"Każdy rozdział to konkretne liczby, źródła i lista zakupów — nie ogólniki.",
                   en:"Every chapter has concrete numbers, sources and shopping lists — no fluff." },

w1_t: { pl:"1. Lokal",                  en:"1. Premises" },
w1_d: { pl:"Metraż minimum dla NFZ, układ pomieszczeń, wymagania sanepid, średnia stawka czynszu w wybranym mieście (źródło: otodom.pl, gumtree, raporty Colliers 2026).",
        en:"Minimum area for NFZ, room layout, sanepid requirements, average rent in your city (sources: otodom.pl, Gumtree, Colliers 2026 reports)." },

w2_t: { pl:"2. Zespół i ZUS",           en:"2. Team and payroll" },
w2_d: { pl:"Stomatolog, asystent, higienistka, recepcjonista — pensje brutto 2026 z pracuj.pl + składki ZUS i PIT. Gotowe ogłoszenia do publikacji.",
        en:"Dentist, assistant, hygienist, receptionist — gross 2026 salaries from pracuj.pl + ZUS and PIT contributions. Ready-to-publish job posts." },

w3_t: { pl:"3. Sprzęt — realni dostawcy", en:"3. Equipment — real suppliers" },
w3_d: { pl:"Unit dentystyczny, RTG, autoklaw, lampa polimeryzacyjna, fotel — ceny KaVo Polska, Planmeca PL, Dentsply Sirona PL, Henry Schein. Gwarancja, czas dostawy, kontakty handlowca.",
        en:"Dental unit, X-ray, autoclave, curing light, chair — prices from KaVo Polska, Planmeca PL, Dentsply Sirona PL, Henry Schein. Warranty, lead time, sales contact." },

w4_t: { pl:"4. Dokumenty i licencje",   en:"4. Documents and licenses" },
w4_d: { pl:"Wpis do rejestru podmiotów leczniczych, zezwolenie na promieniowanie (RTG) z PAA, decyzja sanepidu, RIDO, RODO. Wzory wniosków + kontakty urzędów dla twojego województwa.",
        en:"Entry into the register of medical entities, X-ray license from PAA, sanepid decision, RIDO, RODO. Application templates + office contacts for your voivodeship." },

w5_t: { pl:"5. Budżet startu",          en:"5. Startup budget" },
w5_d: { pl:"Rozbicie pozycja po pozycji: lokal, remont, sprzęt, dokumenty, marketing, rezerwa płynności na 3 miesiące. PLN, podatki uwzględnione.",
        en:"Line-by-line breakdown: premises, fit-out, equipment, documents, marketing, 3-month liquidity reserve. PLN, taxes included." },

w6_t: { pl:"6. ROI i rentowność",       en:"6. ROI and profitability" },
w6_d: { pl:"Założenia: liczba pacjentów / dzień, średni koszyk, marża. Próg rentowności w miesiącach. Wrażliwość na ±20% w cenach i obłożeniu.",
        en:"Assumptions: patients/day, average ticket, margin. Break-even in months. Sensitivity to ±20% on prices and occupancy." },

// ── HONESTY DISCLAIMER ──
honesty_label:   { pl:"Co tu nie jest sprzedażą",      en:"What we won't sell you" },
honesty_title:   { pl:"Czego ten plan nie zrobi",      en:"What this plan won't do" },
honesty_sub:     { pl:"Jesteśmy nowym narzędziem. Chcemy żebyś wiedział na co się piszesz.",
                   en:"We're a new tool. You should know what you're getting." },
h1_t: { pl:"To nie zastąpi prawnika",   en:"It won't replace a lawyer" },
h1_d: { pl:"Każdy dokument trzeba podpisać u notariusza i sprawdzić u radcy prawnego. Plan zawiera szablony i listę kontaktów — nie poradę prawną.",
        en:"Every document needs notarization and a lawyer's review. The plan has templates and contact lists — not legal advice." },
h2_t: { pl:"Ceny mogą się zmienić",     en:"Prices may shift" },
h2_d: { pl:"Wszystkie liczby pochodzą z konkretnych ofert na 2026-04. Sprzęt podrożeje albo stanieje — w planie podajesz datę i źródło każdej pozycji.",
        en:"Every number comes from a real 2026-04 offer. Equipment prices will move — every line item shows the date and source." },
h3_t: { pl:"Nie wystawiamy faktur",     en:"We don't sell equipment" },
h3_d: { pl:"Nie sprzedajemy sprzętu, nie wynajmujemy lokali, nie zatrudniamy ludzi za ciebie. Linkujemy bezpośrednio do producentów i pośredników.",
        en:"We don't sell equipment, lease premises or hire people for you. We link directly to manufacturers and brokers." },

// ── ŚWITLICA CASE ──
case_label:      { pl:"Pierwszy klient", en:"First client" },
case_title:      { pl:"Świtlica — nasza własna klinika w Bydgoszczy",
                   en:"Świtlica — our own clinic in Bydgoszcz" },
case_sub:        { pl:"Zanim zaczęliśmy sprzedawać plan innym, użyliśmy go u siebie. Wszystkie liczby poniżej są prawdziwe i sprawdzalne.",
                   en:"Before selling the plan to others, we used it on ourselves. Every number below is real and verifiable." },
case_budget:     { pl:"Planowany budżet",       en:"Planned budget" },
case_budget_v:   { pl:"~1 760 000 PLN",         en:"~1,760,000 PLN" },
case_open:       { pl:"Planowane otwarcie",     en:"Planned opening" },
case_open_v:     { pl:"Wrzesień 2026",          en:"September 2026" },
case_city:       { pl:"Miasto",                 en:"City" },
case_city_v:     { pl:"Bydgoszcz",              en:"Bydgoszcz" },
case_format:     { pl:"Format",                 en:"Format" },
case_format_v:   { pl:"3 fotele, NFZ + prywatnie", en:"3 chairs, NFZ + private" },
case_link:       { pl:"Pobierz nasz pełny plan (PDF) →", en:"Download our full plan (PDF) →" },
case_warning:    { pl:"⚠️ Świtlica jeszcze się nie otworzyła. Aktualizujemy ten plan w miarę postępów. To uczciwy work-in-progress, nie marketing.",
                   en:"⚠️ Świtlica hasn't opened yet. We update this plan as we go. Honest work-in-progress, not marketing." },

// ── PRICING ──
pricing_label:   { pl:"Cennik",                 en:"Pricing" },
pricing_title:   { pl:"Jeden plan. Jedna płatność.", en:"One plan. One payment." },
pricing_sub:     { pl:"Bez subskrypcji, bez triala 5 zapytań dziennie, bez taryf PRO/UNLIMITED. Płacisz raz, plan jest twój na zawsze.",
                   en:"No subscriptions, no 5-questions-a-day trials, no PRO/UNLIMITED tiers. Pay once, the plan is yours forever." },
price_main:      { pl:"199 €",                  en:"€199" },
price_main_sub:  { pl:"jednorazowo",            en:"one-time" },
price_includes:  { pl:"W cenie:",               en:"Included:" },
price_inc1:      { pl:"6 rozdziałów planu z liczbami i źródłami",
                   en:"6 plan chapters with numbers and sources" },
price_inc2:      { pl:"Eksport do PDF",          en:"PDF export" },
price_inc3:      { pl:"Linki do realnych dostawców (KaVo, Planmeca, Henry Schein, Dentsply)",
                   en:"Links to real suppliers (KaVo, Planmeca, Henry Schein, Dentsply)" },
price_inc4:      { pl:"Szablony dokumentów NFZ, sanepid, PAA",
                   en:"Document templates: NFZ, sanepid, PAA" },
price_inc5:      { pl:"Aktualizacje cen przez 6 miesięcy",
                   en:"Price updates for 6 months" },
price_inc6:      { pl:"Gwarancja zwrotu w 14 dni bez pytań",
                   en:"14-day no-questions money-back guarantee" },
price_upsell_t:  { pl:"+99 € — konsultacja 30 min",
                   en:"+€99 — 30-minute consultation" },
price_upsell_d:  { pl:"Zoom z założycielem Świtlicy. Konkretne pytania, konkretne odpowiedzi. Nagranie zostaje u ciebie.",
                   en:"Zoom with Świtlica's founder. Specific questions, specific answers. Recording is yours." },
price_cta:       { pl:"Zamów plan",              en:"Order the plan" },

// ── FAQ ──
faq_label:       { pl:"FAQ",                     en:"FAQ" },
faq_title:       { pl:"Pytania bez ściemy",      en:"Questions without BS" },
q1: { pl:"Dlaczego tylko stomatologia w Polsce?",
       en:"Why only dentistry in Poland?" },
a1: { pl:"Bo lepiej zrobić jedną niszę uczciwie niż 24 kraje na pół gwizdka. Inne branże dodamy dopiero po 50 płacących klientach w PL.",
       en:"Because doing one niche honestly beats half-baked support for 24 countries. We'll add others only after 50 paying clients in PL." },
q2: { pl:"Skąd pewność że ceny są prawdziwe?",
       en:"How do you know the prices are real?" },
a2: { pl:"Każda pozycja w planie ma datę i źródło: oferta od dystrybutora, mail od handlowca, cennik z 2026-04. Jeśli źródła nie ma — pozycji w planie nie ma.",
       en:"Every line item in the plan shows a date and source: distributor offer, sales email, 2026-04 price list. If there's no source, there's no line." },
q3: { pl:"Macie inne kliniki które się otworzyły z waszego planu?",
       en:"Do you have other clinics opened with this plan?" },
a3: { pl:"Nie. Świtlica jest pierwsza i jeszcze się otwiera (wrzesień 2026). Jesteśmy całkowicie nowi i się tego nie wstydzimy.",
       en:"No. Świtlica is first and still opening (September 2026). We're brand new and not hiding it." },
q4: { pl:"AI wygeneruje mi plan w godzinę?",
       en:"Will the AI generate my plan in an hour?" },
a4: { pl:"Szkic — tak. Pełny plan z weryfikowanymi liczbami, podpisanymi pytaniami do dostawców i listą dokumentów dla twojego województwa — 14 dni roboczych.",
       en:"Draft — yes. Full plan with verified numbers, supplier inquiries and a per-voivodeship document checklist — 14 business days." },
q5: { pl:"Co jeśli się rozmyślę?",
       en:"What if I change my mind?" },
a5: { pl:"14 dni na zwrot, bez pytań. Piszesz na hello@svita.ai, dostajesz pieniądze z powrotem w 3 dni robocze.",
       en:"14 days for a no-questions refund. Email hello@svita.ai, money back in 3 business days." },
q6: { pl:"Kto za tym stoi?",
       en:"Who's behind this?" },
a6: { pl:"Artem Wialko, CEO LABS67, Bydgoszcz. Otwiera Świtlicę i równolegle buduje SVITA. Stomatolog-przedsiębiorca, nie startupowiec z prezentacją.",
       en:"Artem Wialko, CEO LABS67, Bydgoszcz. Opening Świtlica and building SVITA in parallel. Dentist-entrepreneur, not a pitch-deck founder." },

// ── FOOTER ──
foot_tagline:    { pl:"Jedna nisza. Jedna płatność. Zero ściemy.",
                   en:"One niche. One payment. Zero BS." },

// ── HERO CHAT (kept short, dental-focused) ──
chat_status:     { pl:"online · gotowe do rozmowy",  en:"online · ready to talk" },
chat_welcome:    { pl:"Cześć! Powiedz w którym mieście chcesz otworzyć gabinet i ile masz foteli — pokażę szybki szkic.",
                   en:"Hi! Tell me which city you're opening in and how many chairs — I'll show a quick sketch." },
chat_placeholder:{ pl:"Bydgoszcz, 3 fotele, NFZ + prywatnie",
                   en:"Bydgoszcz, 3 chairs, NFZ + private" },
chat_analyzing:  { pl:"Analizuję...",                en:"Analyzing..." },
chat_cta:        { pl:"Otwórz pełny plan w Dashboard",   en:"Open full plan in Dashboard" },
chat_reply_generic: {
  pl:"✓ Analizuję twój gabinet...\n\n📍 Lokal: liczę metraż wg NFZ\n👥 Zespół: pensje brutto 2026 dla twojego województwa\n🛠 Sprzęt: KaVo / Planmeca / Henry Schein z gwarancją\n📋 Dokumenty: NFZ, sanepid, RTG, RIDO\n💰 Budżet: rozbicie pozycja po pozycji\n📈 ROI: próg rentowności w miesiącach\n\nOtwórz Dashboard żeby zobaczyć pełny plan →",
  en:"✓ Analyzing your practice...\n\n📍 Premises: calculating area per NFZ rules\n👥 Team: gross 2026 salaries for your voivodeship\n🛠 Equipment: KaVo / Planmeca / Henry Schein with warranty\n📋 Documents: NFZ, sanepid, X-ray license, RIDO\n💰 Budget: line-by-line breakdown\n📈 ROI: break-even in months\n\nOpen Dashboard to see the full plan →"
},

};
