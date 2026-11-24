// Данные соответствуют начальному наполнению university_bot_database.sql.
// При добавлении новых записей в MySQL этот статический каталог нужно обновлять
// либо подключить отдельный API-сервер для динамической загрузки данных.
const catalog = [
  { code:"spec_physmath", name:"ФизМат (Физика + Математика)", cities:[
    {code:"city_msk",name:"Москва",universities:[{code:"uni_msu_phys",name:"МГУ им. М.В. Ломоносова (Физический факультет)"},{code:"uni_mipt",name:"МФТИ (Физтех)"}]},
    {code:"city_spb",name:"Санкт-Петербург",universities:[{code:"uni_spbu_phys",name:"СПбГУ (Физический факультет)"},{code:"uni_itmo_phys",name:"ИТМО (Физико-технический факультет)"}]},
    {code:"city_sam",name:"Самара",universities:[{code:"uni_samara_phys",name:"Самарский университет (Физфак)"},{code:"uni_samgtu",name:"Самарский государственный технический университет (СамГТУ)"}]}
  ]},
  { code:"spec_chembio", name:"ХимБио (Биология + Химия)", cities:[
    {code:"city_msk",name:"Москва",universities:[{code:"uni_msu_chem",name:"МГУ им. М.В. Ломоносова (Химический факультет)"},{code:"uni_sechenov",name:"Первый МГМУ им. И.М. Сеченова"}]},
    {code:"city_spb",name:"Санкт-Петербург",universities:[{code:"uni_spbu_bio",name:"СПбГУ (Биологический факультет)"},{code:"uni_pavlov",name:"Первый СПбГМУ им. И.П. Павлова"}]},
    {code:"city_sam",name:"Самара",universities:[{code:"uni_samgmu",name:"Самарский государственный медицинский университет (СамГМУ)"},{code:"uni_samara_bio",name:"Самарский университет (Биофак)"}]}
  ]},
  { code:"spec_it", name:"IT (Информатика + Математика)", cities:[
    {code:"city_msk",name:"Москва",universities:[{code:"uni_bauman",name:"МГТУ им. Н.Э. Баумана"},{code:"uni_hse_it",name:"НИУ ВШЭ (Факультет компьютерных наук)"}]},
    {code:"city_spb",name:"Санкт-Петербург",universities:[{code:"uni_itmo_it",name:"ИТМО (Факультет информационных технологий)"},{code:"uni_spbu_it",name:"СПбГУ (Факультет прикладной математики — процессов управления)"}]},
    {code:"city_sam",name:"Самара",universities:[{code:"uni_samara_it",name:"Самарский университет (ИТ-направления)"},{code:"uni_pguti",name:"ПГУТИ (Телекоммуникации и информатика)"}]}
  ]}
];

const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }
const specialtySelect = document.getElementById("specialty");
const citySelect = document.getElementById("city");
const universitySelect = document.getElementById("university");
const sendButton = document.getElementById("sendButton");
const summary = document.getElementById("summary");

function fillSelect(select, items, placeholder) {
  select.innerHTML = "";
  const first = document.createElement("option"); first.value = ""; first.textContent = placeholder; select.appendChild(first);
  items.forEach(item => { const option = document.createElement("option"); option.value = item.code; option.textContent = item.name; select.appendChild(option); });
}
function selectedSpecialty() { return catalog.find(item => item.code === specialtySelect.value); }
function selectedCity() { return selectedSpecialty()?.cities.find(item => item.code === citySelect.value); }
function updateSummary() {
  const specialty = selectedSpecialty(); const city = selectedCity();
  const university = city?.universities.find(item => item.code === universitySelect.value);
  sendButton.disabled = !(specialty && city && university);
  summary.replaceChildren();
  const icon = document.createElement("span"); icon.className = "summary-icon";
  const text = document.createElement("p");
  if (specialty && city && university) { icon.textContent = "✓"; text.textContent = `${specialty.name} · ${city.name} · ${university.name}`; }
  else { icon.textContent = "✦"; text.textContent = "После выбора направления, города и вуза здесь появится краткое описание вашего выбора."; }
  summary.append(icon,text);
}
fillSelect(specialtySelect,catalog,"Выберите направление");
specialtySelect.addEventListener("change",() => {
  const specialty = selectedSpecialty(); fillSelect(citySelect,specialty ? specialty.cities : [],"Выберите город");
  citySelect.disabled = !specialty; fillSelect(universitySelect,[],"Сначала выберите город"); universitySelect.disabled = true; updateSummary();
});
citySelect.addEventListener("change",() => {
  const city = selectedCity(); fillSelect(universitySelect,city ? city.universities : [],"Выберите университет");
  universitySelect.disabled = !city; updateSummary();
});
universitySelect.addEventListener("change",updateSummary);
sendButton.addEventListener("click",() => {
  const specialty = selectedSpecialty(); const city = selectedCity();
  const university = city?.universities.find(item => item.code === universitySelect.value);
  if (!specialty || !city || !university) return;
  const payload = {action:"university_selection",specialty_code:specialty.code,city_code:city.code,university_code:university.code};
  if (tg) tg.sendData(JSON.stringify(payload));
  else { alert("Чтобы отправить выбор боту, откройте страницу через Telegram."); console.log("Telegram Web App payload:",payload); }
});
