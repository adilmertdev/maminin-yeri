(function(){
  var root=document.documentElement, shoot=root.classList.contains('shoot');

  // Saydam -> dolu üst menü
  var nav=document.querySelector('.nav');
  function onScroll(){ nav.classList.toggle('is-solid', window.scrollY>40); }
  onScroll(); window.addEventListener('scroll',onScroll,{passive:true});

  // Kaydırınca beliren öğeler
  var els=document.querySelectorAll('.reveal');
  if(shoot || !('IntersectionObserver' in window)){
    els.forEach(function(e){e.classList.add('in');});
  } else {
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target);} });
    },{rootMargin:'0px 0px -8% 0px',threshold:.08});
    els.forEach(function(e){io.observe(e);});
  }

  // Ekran görüntüsü modu: tembel yüklemeyi kapat
  if(shoot){ document.querySelectorAll('[loading="lazy"]').forEach(function(e){e.loading='eager';}); }

  // Açık / kapalı durumu (her gün 11:30–23:00, Türkiye saati)
  var OPEN=11*60+30, CLOSE=23*60;
  var now=new Date(new Date().toLocaleString('en-US',{timeZone:'Europe/Istanbul'}));
  var d=now.getDay(), cur=now.getHours()*60+now.getMinutes();
  var row=document.querySelector('.days li[data-day="'+d+'"]'); if(row) row.classList.add('today');
  var el=document.getElementById('open-now');
  if(el){
    var open=cur>=OPEN&&cur<CLOSE;
    el.textContent=open?'Şu an açık · 23:00\u2019e kadar':(cur<OPEN?'Şu an kapalı · Bugün 11:30\u2019da açılıyor':'Şu an kapalı · Yarın 11:30\u2019da açılıyor');
    el.className='status '+(open?'open':'closed');
  }
})();
