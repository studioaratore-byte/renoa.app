/* ============================================================
   RENOA — 랜딩페이지 인터랙션
   외부 라이브러리 없이 바닐라 JS
   ============================================================ */
(function(){
  "use strict";

  document.documentElement.classList.remove('no-js');

  /* ---- 헤더 스크롤 상태 ---- */
  var header = document.getElementById('siteHeader');
  function onScroll(){
    if(window.scrollY > 24){ header.classList.add('scrolled'); }
    else{ header.classList.remove('scrolled'); }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---- 모바일 메뉴 토글 ---- */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  toggle.addEventListener('click', function(){
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.addEventListener('click', function(e){
    if(e.target.tagName === 'A'){ links.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); }
  });

  /* ---- 스크롤 등장 (IntersectionObserver) — 항상 fail-open ---- */
  var reveals = document.querySelectorAll('.reveal');
  function showAll(){ reveals.forEach(function(el){ el.classList.add('in'); }); }
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, {threshold:0.16, rootMargin:'0px 0px -8% 0px'});
    reveals.forEach(function(el){ io.observe(el); });
    // 화면에 이미 들어와 있는(첫 화면) 요소는 즉시 노출
    requestAnimationFrame(function(){
      reveals.forEach(function(el){
        var r = el.getBoundingClientRect();
        if(r.top < window.innerHeight && r.bottom > 0){ el.classList.add('in'); io.unobserve(el); }
      });
    });
    // 안전 타이머: 어떤 이유로든 IO가 동작하지 않으면 1.2초 뒤 전부 노출
    setTimeout(showAll, 1200);
  } else {
    showAll();
  }

  /* ---- 숫자 카운트업 ---- */
  function animateCount(el){
    var target = parseInt(el.getAttribute('data-count'),10);
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1400, start = performance.now();
    function fmt(n){ return n >= 1000 ? n.toLocaleString('ko-KR') : n; }
    function tick(now){
      var p = Math.min((now-start)/dur, 1);
      var eased = 1 - Math.pow(1-p, 3);
      var val = Math.round(target * eased);
      el.innerHTML = fmt(val) + '<span class="suffix">'+suffix+'</span>';
      if(p < 1){ requestAnimationFrame(tick); }
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll('[data-count]');
  if('IntersectionObserver' in window){
    var cIO = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ animateCount(en.target); cIO.unobserve(en.target); }
      });
    }, {threshold:0.6});
    counters.forEach(function(el){ cIO.observe(el); });
    // 안전 타이머: IO가 동작하지 않으면 아직 0인 카운터를 직접 실행
    setTimeout(function(){
      counters.forEach(function(el){ if(/^0\D*$/.test(el.textContent.trim())){ animateCount(el); } });
    }, 1500);
  } else {
    counters.forEach(animateCount);
  }

  /* ---- 신장 케어 지수 카드 애니메이션 ---- */
  var card = document.getElementById('scoreCard');
  var scored = false;
  function runScore(){
    if(scored) return;
    scored = true;
    // 링
    var prog = document.getElementById('scoreProg');
    var C = 2 * Math.PI * 52; // 326.7
    var pct = 82/100;
    requestAnimationFrame(function(){
      prog.style.strokeDashoffset = (C * (1 - pct)).toFixed(1);
    });
    // 숫자
    var numEl = document.getElementById('scoreNum');
    var startN = performance.now();
    (function run(now){
      var p = Math.min((now-startN)/1500, 1);
      var e = 1 - Math.pow(1-p,3);
      numEl.textContent = Math.round(82*e);
      if(p<1) requestAnimationFrame(run);
    })(startN);
    // 영양소 바 + %
    document.querySelectorAll('.nutrient').forEach(function(n, i){
      var t = parseInt(n.getAttribute('data-target'),10);
      var fill = n.querySelector('.fill');
      var pcEl = n.querySelector('.pc');
      setTimeout(function(){ fill.style.width = t + '%'; }, 120 + i*140);
      var s = performance.now();
      function nrun(now){
        var p = Math.min((now-s)/1300, 1);
        var e = 1 - Math.pow(1-p,3);
        pcEl.textContent = Math.round(t*e) + '%';
        if(p<1) requestAnimationFrame(nrun);
      }
      setTimeout(function(){ requestAnimationFrame(nrun); }, 120 + i*140);
    });
  }
  if(card){
    if('IntersectionObserver' in window){
      var sIO = new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if(en.isIntersecting){ runScore(); sIO.unobserve(en.target); }
        });
      }, {threshold:0.4});
      sIO.observe(card);
      // 안전 타이머: IO가 동작하지 않아도 지수 카드가 0에 멈추지 않도록 (scored 가드로 중복 방지)
      setTimeout(runScore, 1600);
    } else {
      runScore();
    }
  }

  /* ---- 히어로 칩 마우스 패럴럭스 ---- */
  var visual = document.querySelector('.hero-visual');
  var chips = document.querySelectorAll('.float-chip');
  var phone = document.getElementById('phone');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(visual && !reduce && window.matchMedia('(pointer:fine)').matches){
    visual.addEventListener('mousemove', function(e){
      var r = visual.getBoundingClientRect();
      var dx = (e.clientX - r.left - r.width/2) / r.width;
      var dy = (e.clientY - r.top - r.height/2) / r.height;
      chips.forEach(function(c){
        var depth = parseFloat(c.getAttribute('data-depth')) || 18;
        c.style.transform = 'translate('+(dx*depth).toFixed(1)+'px,'+(dy*depth).toFixed(1)+'px)';
      });
      if(phone){ phone.style.transform = 'rotateY('+(dx*5).toFixed(2)+'deg) rotateX('+(-dy*5).toFixed(2)+'deg)'; }
    });
    visual.addEventListener('mouseleave', function(){
      chips.forEach(function(c){ c.style.transform=''; });
      if(phone){ phone.style.transform=''; }
    });
  }

  /* ---- 단계 칩 토글 ---- */
  var pills = document.getElementById('stagePills');
  if(pills){
    pills.addEventListener('click', function(e){
      var b = e.target.closest('.sp');
      if(!b) return;
      pills.querySelectorAll('.sp').forEach(function(p){ p.classList.remove('active'); });
      b.classList.add('active');
    });
  }
})();
