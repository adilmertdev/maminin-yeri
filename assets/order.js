/* Maminin Yeri · WhatsApp sipariş formu
   Sunucuya hiçbir veri gönderilmez. Sepet yalnızca bu cihazın tarayıcısında (localStorage) tutulur;
   ad/telefon/adres kaydedilmez, sadece WhatsApp mesajına yazılır. */
(function(){
  var WA_NUMBER='905426477210';
  var KEY='maminin-yeri-sepet-v1';
  var FOOD=[
    {id:'hamburger',name:'Hamburger + patates',img:'hero-hamburger',tag:'İmza',v:5},
    {id:'balik',name:'Balık ekmek',img:'balik-ekmek'},
    {id:'kofte',name:'Köfte ekmek',img:'kofte-ekmek'},
    {id:'sucuk',name:'Sucuk ekmek',img:'sucuk-ekmek'},
    {id:'tavuk',name:'Tavuk ekmek',img:'tavuk-ekmek'},
    {id:'porsiyon',name:'Porsiyon servis',img:'porsiyon'},
    {id:'patates',name:'Patates',img:'patates'},
    {id:'waffle',name:'Kovada waffle',img:'waffle'}
  ];
  var DRINK=[
    {id:'salgam-acili',name:'Şalgam (acılı)',ico:'🌶️'},
    {id:'salgam-acisiz',name:'Şalgam (acısız)',ico:'🥕'},
    {id:'cola-turka',name:'Cola Turka',ico:'🥤'},
    {id:'camlica',name:'Çamlıca (gazoz)',ico:'🫧'},
    {id:'ayran',name:'Ayran',ico:'🥛'},
    {id:'su',name:'Su',ico:'💧'},
    {id:'meyve-suyu',name:'Teneke meyve suyu',ico:'🧃'}
  ];
  var ALL={}; FOOD.concat(DRINK).forEach(function(p){ALL[p.id]=p;});
  var MAX=20;

  var state=load();
  function load(){ try{ var s=JSON.parse(localStorage.getItem(KEY)||'{}'); return {q:s.q||{},n:s.n||{}}; }catch(e){ return {q:{},n:{}}; } }
  function save(){ try{ localStorage.setItem(KEY,JSON.stringify(state)); }catch(e){} }

  function esc(t){ return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  function row(p,isFood){
    var media=isFood?'<img src="img/thumb-'+p.img+'.webp'+(p.v?'?v='+p.v:'')+'" alt="" width="72" height="72" loading="lazy" decoding="async">':'<span class="ico" aria-hidden="true">'+p.ico+'</span>';
    var note=isFood?'<input class="inote" data-note="'+p.id+'" maxlength="80" placeholder="Bu ürüne not (örn. soğansız)" aria-label="'+esc(p.name)+' için not">':'';
    return '<li class="item" data-id="'+p.id+'">'+media+
      '<div class="item__main"><span class="item__name">'+esc(p.name)+(p.tag?' <em class="mini">'+p.tag+'</em>':'')+'</span>'+note+'</div>'+
      '<div class="step" role="group" aria-label="'+esc(p.name)+' adedi">'+
        '<button type="button" class="step__b" data-dec="'+p.id+'" aria-label="Azalt">−</button>'+
        '<output class="step__n" data-qty="'+p.id+'" aria-live="polite">0</output>'+
        '<button type="button" class="step__b" data-inc="'+p.id+'" aria-label="Artır">+</button>'+
      '</div></li>';
  }
  var foodEl=document.getElementById('items-food'), drinkEl=document.getElementById('items-drink');
  if(!foodEl) return;
  foodEl.innerHTML=FOOD.map(function(p){return row(p,true);}).join('');
  drinkEl.innerHTML=DRINK.map(function(p){return row(p,false);}).join('');

  function total(){ var t=0; for(var k in state.q) t+=state.q[k]; return t; }
  function setQty(id,v){ v=Math.max(0,Math.min(MAX,v)); if(v) state.q[id]=v; else { delete state.q[id]; } save(); render(); }

  function render(){
    document.querySelectorAll('.item').forEach(function(li){
      var id=li.getAttribute('data-id'), q=state.q[id]||0;
      li.classList.toggle('is-on',q>0);
      li.querySelector('[data-qty]').textContent=q;
      var n=li.querySelector('[data-note]'); if(n && document.activeElement!==n) n.value=state.n[id]||'';
    });
    var t=total();
    document.getElementById('cart-count').textContent=t;
    document.querySelectorAll('[data-cart-n]').forEach(function(e){ e.textContent=t; e.hidden=!t; });
    var fc=document.getElementById('fcart'); if(fc) fc.hidden=!t;
    var sum=document.getElementById('summary');
    var lines=Object.keys(ALL).filter(function(id){return state.q[id];}).map(function(id){
      return '<li><span>'+state.q[id]+' × '+esc(ALL[id].name)+'</span>'+(state.n[id]?'<small>'+esc(state.n[id])+'</small>':'')+'</li>';
    });
    sum.innerHTML=lines.length?lines.join(''):'<li class="summary__empty">Henüz ürün seçmediniz.</li>';
  }

  var toastT;
  function toast(msg){ var t=document.getElementById('toast'); t.textContent=msg; t.classList.add('on'); clearTimeout(toastT); toastT=setTimeout(function(){t.classList.remove('on');},1800); }

  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-inc],[data-dec],[data-add]'); if(!b) return;
    var id;
    if((id=b.getAttribute('data-inc'))) setQty(id,(state.q[id]||0)+1);
    else if((id=b.getAttribute('data-dec'))) setQty(id,(state.q[id]||0)-1);
    else if((id=b.getAttribute('data-add'))){
      setQty(id,(state.q[id]||0)+1); toast('✓ '+ALL[id].name+' sepete eklendi');
      if(b.hasAttribute('data-go')) document.getElementById('siparis').scrollIntoView({behavior:'smooth'});
    }
  });
  document.addEventListener('input',function(e){
    var id=e.target.getAttribute && e.target.getAttribute('data-note'); if(!id) return;
    var v=e.target.value.trim(); if(v) state.n[id]=v; else delete state.n[id]; save(); render();
  });
  document.getElementById('cart-clear').addEventListener('click',function(){ state={q:{},n:{}}; save(); render(); });

  // Teslimat türü -> adres zorunluluğu
  var form=document.getElementById('order-form'), addrWrap=document.getElementById('addr-wrap'), addr=document.getElementById('f-addr');
  function deliv(){ return (form.querySelector('input[name="teslimat"]:checked')||{}).value||'Paket servis'; }
  function syncAddr(){ var pk=deliv()==='Paket servis'; addrWrap.hidden=!pk; addr.required=pk; }
  form.addEventListener('change',function(e){ if(e.target.name==='teslimat') syncAddr(); });
  syncAddr();

  // TR telefon: cep (5xx) veya sabit (2xx-4xx), 10 hane; başında 0 / 90 / +90 olabilir
  function normPhone(v){
    var d=String(v).replace(/\D/g,'');
    if(d.indexOf('90')===0 && d.length===12) d=d.slice(2);
    if(d.charAt(0)==='0' && d.length===11) d=d.slice(1);
    if(!/^[2-5]\d{9}$/.test(d)) return null;
    return '0'+d.slice(0,3)+' '+d.slice(3,6)+' '+d.slice(6,8)+' '+d.slice(8);
  }

  function buildMessage(f){
    var L=[];
    L.push('🍔 *Maminin Yeri · Yeni Sipariş*','');
    function block(title,list){
      var ls=list.filter(function(p){return state.q[p.id];});
      if(!ls.length) return;
      L.push('*'+title+'*');
      ls.forEach(function(p){ L.push('• '+state.q[p.id]+' × '+p.name+(state.n[p.id]?' _('+state.n[p.id]+')_':'')); });
      L.push('');
    }
    block('Yiyecekler',FOOD); block('İçecekler',DRINK);
    L.push((f.teslimat==='Paket servis'?'🛵':'🏃')+' *Teslimat:* '+f.teslimat);
    L.push('👤 *Ad:* '+f.ad);
    L.push('📞 *Telefon:* '+f.tel);
    if(f.teslimat==='Paket servis') L.push('📍 *Adres:* '+f.adres);
    if(f.not) L.push('📝 *Not:* '+f.not);
    L.push('','Siteden gönderildi.');
    return L.join('\n');
  }

  form.addEventListener('submit',function(e){
    e.preventDefault();
    var err=document.getElementById('order-err'); err.textContent='';
    form.querySelectorAll('.invalid').forEach(function(x){x.classList.remove('invalid');});
    var name=document.getElementById('f-name'), phone=document.getElementById('f-phone'), note=document.getElementById('f-note');
    var f={teslimat:deliv(),ad:name.value.trim(),tel:normPhone(phone.value),adres:addr.value.trim(),not:note.value.trim()};
    var problems=[], first=null;
    function bad(el,msg){ problems.push(msg); if(el){ el.classList.add('invalid'); first=first||el; } }
    if(!total()) bad(null,'En az 1 ürün seçin.');
    if(f.ad.length<2) bad(name,'Adınızı yazın.');
    if(!f.tel) bad(phone,'Geçerli bir telefon numarası yazın (örn. 0532 123 45 67).');
    if(f.teslimat==='Paket servis' && f.adres.length<8) bad(addr,'Paket servis için açık adres yazın.');
    if(problems.length){ err.textContent=problems.join(' '); (first||document.getElementById('items-food')).focus&&(first||document.getElementById('summary')).scrollIntoView({block:'center',behavior:'smooth'}); if(first) first.focus({preventScroll:true}); return; }
    phone.value=f.tel;
    var msg=buildMessage(f);
    var url='https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(msg);
    window.__lastOrder={url:url,message:msg};
    if(/[?&]test=1/.test(location.search)) return;
    var mobile=window.matchMedia('(pointer: coarse)').matches;
    if(mobile){ location.href=url; } else { var w=window.open(url,'_blank','noopener'); if(!w) location.href=url; }
  });

  render();
})();
