(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  var altFill = $('#altFill'), altNum = $('#altNum');
  var layers = $$('.layer');
  var stage = $('#cookStage'), track = $('.cook-track');
  var water = $('#waterRect'), ring = $('#timerRing'), timerTxt = $('#timerTxt');
  var badge = $('#cookBadge'), bar = $('#cookBar');
  var photo = $('#storyPhoto img');
  var sticky = $('.sticky-buy');
  var MAX_ALT = 5642;
  var ticking = false;
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

  function update() {
    ticking = false;
    var y = window.scrollY, h = window.innerHeight;
    var docH = document.documentElement.scrollHeight - h;
    var p = docH > 0 ? clamp(y / docH, 0, 1) : 0;
    altFill.style.height = (p * 100) + '%';
    altNum.textContent = fmt(Math.round(p * MAX_ALT));
    if (!reduce && y < h * 1.3) {
      layers.forEach(function (l) { l.style.transform = 'translate3d(0,' + (y * parseFloat(l.dataset.speed)) + 'px,0)'; });
    }
    if (track) {
      var r = track.getBoundingClientRect();
      var cp = clamp(-r.top / (r.height - h), 0, 1);
      var step = cp < 0.3 ? 1 : cp < 0.66 ? 2 : 3;
      if (+stage.dataset.step !== step) { stage.dataset.step = step; badge.textContent = 'Шаг ' + step + ' из 3'; }
      bar.style.width = (cp * 100) + '%';
      var wl = step === 1 ? 250 - cp / 0.3 * 40 : 210;
      water.setAttribute('y', wl.toFixed(1));
      var tp = step === 1 ? 0 : step === 2 ? (cp - 0.3) / 0.36 : 1;
      ring.style.strokeDashoffset = (276.5 * (1 - tp)).toFixed(1);
      var left = Math.round(300 * (1 - tp));
      timerTxt.textContent = step === 3 ? '4-6 мин' : Math.floor(left / 60) + ':' + ('0' + (left % 60)).slice(-2);
      timerTxt.setAttribute('font-size', step === 3 ? 22 : 30);
    }
    if (photo && !reduce) {
      var pr = photo.parentElement.getBoundingClientRect();
      if (pr.bottom > 0 && pr.top < h) {
        var k = (pr.top + pr.height / 2 - h / 2) / h;
        photo.style.transform = 'translate3d(0,' + (k * -60).toFixed(1) + 'px,0)';
      }
    }
    if (sticky) sticky.classList.toggle('show', y > h * 0.8);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  var DISHES = {
    borsch: { name: 'Борщ', video: 'assets/video/borsch.mp4', poster: 'assets/img/borsch-poster.jpg',
      desc: 'Картофельные хлопья, лук, морковь, свёкла, капуста, сушёный томат, паприка и зелень. Для насыщенного вкуса добавьте тушёнку.',
      big: '160 г', small: '80 г', nutri: 'На 160 г: 506 ккал, белки 17 г, жиры 11,5 г, углеводы 82,5 г.',
      steps: ['Высыпать пакет в холодную воду: пакет на 1 л готового блюда в 0,8-1 л, на 2 л в 1,8-2 л.', 'Дать постоять 5 минут, чтобы овощи напитались.', 'Довести до кипения на среднем огне и варить 4-6 минут, посолить по вкусу. Тушёнку можно добавить перед закипанием.'] },
    harcho: { name: 'Харчо', video: 'assets/video/harcho.mp4', poster: 'assets/img/harcho-poster.jpg',
      desc: 'Густой пряный суп, который хорошо согревает после долгого дня на холоде. Готовится так же, как борщ.',
      big: '180 г', small: '100 г', nutri: '',
      steps: ['Высыпать пакет в холодную воду: пакет на 1 л готового блюда в 0,8-1 л, на 2 л в 1,8-2 л.', 'Дать постоять 5 минут.', 'Довести до кипения и варить 4-6 минут. Вместо воды можно взять готовый бульон.'] },
    goroh: { name: 'Гороховый крем-суп', video: 'assets/video/goroh.mp4', poster: 'assets/img/goroh-poster.jpg',
      desc: 'Нежный гороховый суп-пюре. По желанию в процессе варки добавьте копчёности.',
      big: '240 г', small: '120 г', nutri: '',
      steps: ['Высыпать пакет в холодную воду (большой в 1,4 л, маленький в 0,7-0,8 л) и тщательно перемешать.', 'Оставить на 5 минут.', 'Довести до кипения и варить 3-5 минут, постоянно помешивая, чтобы не подгорело.'] },
    ragu: { name: 'Гороховое рагу с овощами', video: 'assets/video/ragu.mp4', poster: 'assets/img/ragu-poster.jpg',
      desc: 'Густое сытное блюдо, которое хорошо идёт с консервированной тушёнкой.',
      big: '320 г', small: '160 г', nutri: '',
      steps: ['Часть пакета с овощами засыпать в холодную воду (большой в 1,8 л, малый в 0,9 л), подождать 5 минут.', 'Варить на среднем огне 4-6 минут.', 'Постоянно помешивая, внести вторую часть пакета и мешать до однородной массы. Соль, специи и тушёнку добавить по вкусу.'] }
  };
  var video = $('#dishVideo'), phone = $('.phone'), info = $('.dish-info');
  var tabs = $$('.dish-tabs button');
  function setDish(k, animate) {
    var d = DISHES[k];
    tabs.forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.k === k)); });
    $('#dishName').textContent = d.name; $('#dishDesc').textContent = d.desc;
    $('#sizeBigW').textContent = d.big; $('#sizeSmallW').textContent = d.small;
    var n = $('#dishNutri'); n.textContent = d.nutri; n.style.display = d.nutri ? '' : 'none';
    $('#dishSteps').innerHTML = d.steps.map(function (s) { return '<li><span>' + s + '</span></li>'; }).join('');
    video.poster = d.poster; video.src = d.video; video.load(); playIfVisible();
    if (animate) { info.classList.remove('swap'); void info.offsetWidth; info.classList.add('swap'); }
  }
  tabs.forEach(function (b) { b.addEventListener('click', function () { setDish(b.dataset.k, true); }); });
  var userPaused = false;
  function playIfVisible() {
    if (userPaused || reduce) return;
    var r = phone.getBoundingClientRect();
    if (r.bottom > 0 && r.top < window.innerHeight) { var pr = video.play(); if (pr && pr.catch) pr.catch(function () {}); }
  }
  $('#phonePlay').addEventListener('click', function () {
    if (video.paused) { userPaused = false; video.play(); phone.classList.remove('is-paused'); }
    else { userPaused = true; video.pause(); phone.classList.add('is-paused'); }
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) playIfVisible(); else video.pause(); }); }, { threshold: 0.4 }).observe(phone);
  }
  setDish('borsch', false);
})();
