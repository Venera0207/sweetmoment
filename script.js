
(() => {
  "use strict";

  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const fmt = n => new Intl.NumberFormat("ru-RU").format(n);
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const icon = {
    cart:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 8h12l-1.1 12H7.1Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><path d="M10 12v4M14 12v4"/></svg>',
    plus:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
    minus:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>',
    trash:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M9.5 7V4.5h5V7"/><path d="m6.5 7 1 13h9l1-13"/><path d="M10 11v5M14 11v5"/></svg>',
    check:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m4.5 12.5 5 5L19.5 7"/></svg>',
    star:'<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.8l2.6 5.5 6 .7-4.4 4.1 1.2 5.9-5.4-3-5.4 3 1.2-5.9L3.4 9l6-.7Z"/></svg>'
  };

  const makeFrames = (base, alt) => [
    {src:`photos/${base}-1.jpg`, label:"Общий вид", alt:`${alt}: общий вид`},
    {src:`photos/${base}-2.jpg`, label:"Детали", alt:`${alt}: в разрезе`},
    {src:`photos/${base}-3.jpg`, label:"Подача", alt:`${alt}: подача`}
  ];

  const products = [
    {id:"medovik",name:"Медовик «Девять коржей»",weight:"1 кг · 8–10 порций",desc:"Медовые коржи, сметанный крем, карамельная крошка",price:1690,unit:"₽ / кг",tag:"Хит недели",frames:makeFrames("medovik","Медовик")},
    {id:"truffle",name:"Торт «Шоколадный трюфель»",weight:"1 кг · 8 порций",desc:"Бельгийский шоколад 70%, ганаш и вишнёвое конфи",price:2190,unit:"₽ / кг",tag:"",frames:makeFrames("truffle","Шоколадный трюфель")},
    {id:"cupcakes",name:"Капкейки ваниль–малина",weight:"набор 6 шт",desc:"Воздушный бисквит, сливочный крем, ягода внутри",price:990,unit:"₽ / набор",tag:"",frames:makeFrames("cupcakes","Капкейки")},
    {id:"eclairs",name:"Эклеры карамель–фундук",weight:"набор 5 шт",desc:"Заварное тесто, крем на сливках, солёная карамель",price:890,unit:"₽ / набор",tag:"Новинка",frames:makeFrames("eclairs","Эклеры")},
    {id:"macarons",name:"Макаронс ассорти",weight:"набор 9 шт",desc:"Миндальная мука и шесть авторских вкусов",price:790,unit:"₽ / набор",tag:"",frames:makeFrames("macarons","Макаронс")}
  ];

  const reviews = [
    {name:"Анна Ковалёва",meta:"Медовик, 3 кг",rating:5,initials:"АК",tone:"#EED4A9",fg:"#885625",text:"Торт исчез со стола за двадцать минут — коржи тончайшие, крем нежный и совсем не приторный. Привезли ровно к началу праздника."},
    {name:"Дмитрий Соколов",meta:"корпоративный заказ · 40 эклеров",rating:5,initials:"ДС",tone:"rgba(111,138,79,.25)",fg:"#482E1B",text:"Брали эклеры на день рождения компании. Коллеги до сих пор спрашивают, где заказывали. Солёная карамель — отдельный вид искусства."},
    {name:"Мария и Сергей",meta:"свадебный торт · 3 яруса",rating:5,initials:"МС",tone:"rgba(194,85,56,.18)",fg:"#C25538",text:"Свадебный торт стал главным украшением вечера — и по виду, и по вкусу. Каждую деталь декора согласовали очень внимательно."},
    {name:"Елена Прохорова",meta:"макаронс и капкейки",rating:4,initials:"ЕП",tone:"#E8D3AF",fg:"#5F3F26",text:"Дочка в восторге от макаронс, фисташковый — лучший в городе! Хочется только ещё больше вкусов в ассортименте."}
  ];

  const findProduct = id => products.find(p => p.id === id);
  const stars = rating => Array.from({length:5},(_,i)=>`<span class="${i<rating?"star-on":"star-off"}">${icon.star}</span>`).join("");

  // ---------- images ----------
  function wireImages(root=document){
    $$("img[data-ph]",root).forEach(img=>{
      if(img.dataset.wired) return;
      img.dataset.wired="1";
      img.addEventListener("error",()=>{
        const box=document.createElement("div");
        box.className="image-fallback";
        box.textContent=img.dataset.ph||"SweetMoment";
        img.replaceWith(box);
      },{once:true});
    });
  }

  // ---------- toast ----------
  function toast(message){
    const el=document.createElement("div");
    el.className="toast";
    el.innerHTML=`<span>${icon.check}</span><span>${message}</span>`;
    $("#toasts").append(el);
    setTimeout(()=>el.classList.add("out"),2800);
    setTimeout(()=>el.remove(),3200);
  }

  // ---------- reveal ----------
  function initReveal(){
    const els=$$(".reveal:not(.revealed)");
    if(reduceMotion || !("IntersectionObserver" in window)){els.forEach(e=>e.classList.add("revealed"));return;}
    const io=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        const delay=entry.target.dataset.revealDelay;
        if(delay)entry.target.style.transitionDelay=`${delay}ms`;
        entry.target.classList.add("revealed");
        io.unobserve(entry.target);
      });
    },{threshold:.12,rootMargin:"0px 0px -35px"});
    els.forEach(e=>io.observe(e));
  }

  // ---------- header ----------
  function initHeader(){
    const header=$("#siteHeader"), burger=$("#burger");
    const sync=()=>{
      header.classList.toggle("scrolled",scrollY>10);
      document.body.classList.toggle("menu-visible",header.classList.contains("menu-open"));
    };
    addEventListener("scroll",sync,{passive:true});
    burger.addEventListener("click",()=>{
      const open=header.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded",String(open));
      $("#burgerIcon").innerHTML=open?'<path d="M6 6l12 12M18 6 6 18"/>':'<path d="M4 7h16M4 12h16M4 17h10"/>';
      sync();
    });
    document.addEventListener("click",e=>{
      const link=e.target.closest("[data-scroll]");
      if(!link)return;
      const target=$("#"+link.dataset.scroll);
      if(target)target.scrollIntoView({behavior:reduceMotion?"auto":"smooth",block:"start"});
      header.classList.remove("menu-open");
      burger.setAttribute("aria-expanded","false");
      $("#burgerIcon").innerHTML='<path d="M4 7h16M4 12h16M4 17h10"/>';
      sync();
    });
  }

  // ---------- marquee ----------
  function initTicker(){
    const names=["Медовик","Тирамису","Эклеры","Макаронс","Капкейки","Чизкейк","Прага","Павлова","Круассаны","Тарты"];
    const content=names.map(n=>`<b>${n}</b><span aria-hidden="true">✦</span>`).join("");
    $("#tickerTrack").innerHTML=`<div class="ticker-half">${content}</div><div class="ticker-half" aria-hidden="true">${content}</div>`;
  }

  // ---------- products ----------
  function renderProducts(){
    const grid=$("#productGrid");
    grid.innerHTML=products.map((p,i)=>{
      const f=p.frames[0];
      return `<article class="card reveal" data-reveal-delay="${i*80}">
        <button class="card-media" data-gallery="${p.id}" aria-label="Открыть 3 фото: ${p.name}">
          <img src="${f.src}" data-ph="${p.name}" alt="${f.alt}" loading="lazy">
          ${p.tag?`<span class="card-tag">${p.tag}</span>`:""}
          <span class="card-zoom">${icon.cart} 3 фото</span>
        </button>
        <div class="card-body">
          <h3>${p.name}</h3><p class="card-weight">${p.weight}</p><p class="card-desc">${p.desc}</p>
          <div class="card-foot"><p class="price">${fmt(p.price)} ₽ <small>${p.unit}</small></p>
          <button class="btn btn-add" data-add="${p.id}">${icon.cart} В корзину</button></div>
        </div>
      </article>`;
    }).join("")+`<article class="card-cta reveal">
      <span class="ico">${icon.check}</span><h3>Торт на заказ</h3>
      <p>Ярусы, надписи, любимые вкусы — соберём десерт по вашему эскизу.</p>
      <button class="btn btn-dark" data-scroll="order">Обсудить заказ</button>
    </article>`;
    wireImages(grid);initReveal();
  }

  // ---------- reviews ----------
  function renderReviews(){
    $("#ratingStars").innerHTML=stars(5);
    $("#reviewGrid").innerHTML=reviews.map((r,i)=>`<figure class="review-card reveal" data-reveal-delay="${i*100}">
      <span class="review-tape"></span><span class="review-stars" aria-label="Оценка ${r.rating} из 5">${stars(r.rating)}</span>
      <blockquote>${r.text}</blockquote>
      <figcaption class="review-author"><span class="avatar" style="background:${r.tone};color:${r.fg}">${r.initials}</span>
      <span><b>${r.name}</b><small>${r.meta}</small></span></figcaption>
    </figure>`).join("");
    initReveal();
  }

  // ---------- gallery ----------
  const gallery={product:null,index:0,touchX:null};
  const galleryEl=$("#gallery"), stage=$("#galleryStage");

  function renderGalleryFrame(){
    const p=gallery.product,f=p.frames[gallery.index];
    stage.querySelector(".frame")?.remove();
    const frame=document.createElement("div");
    frame.className="frame";
    frame.innerHTML=`<img src="${f.src}" data-ph="${p.name}" alt="${f.alt}">`;
    stage.prepend(frame);wireImages(frame);
    $("#galleryTitle").textContent=p.name;
    $("#galleryCounter").textContent=`Кадр ${gallery.index+1} из ${p.frames.length} · ${f.label}`;
    $("#frameLabelText").textContent=f.label;
    $("#galleryPrice").textContent=`${fmt(p.price)} ₽`;
    $("#galleryUnit").textContent=p.unit;
    $("#frameDots").innerHTML=p.frames.map((x,i)=>`<button type="button" class="${i===gallery.index?"active":""}" data-frame="${i}" aria-label="Кадр ${i+1}: ${x.label}"></button>`).join("");
  }
  function openGallery(id){
    gallery.product=findProduct(id);gallery.index=0;renderGalleryFrame();
    galleryEl.classList.add("open");document.body.classList.add("modal-open");
    $("#closeGallery").focus();
  }
  function closeGallery(){
    galleryEl.classList.remove("open");document.body.classList.remove("modal-open");
  }
  function moveFrame(delta){
    if(!gallery.product)return;
    gallery.index=(gallery.index+delta+gallery.product.frames.length)%gallery.product.frames.length;
    renderGalleryFrame();
  }
  $("#closeGallery").addEventListener("click",closeGallery);
  $("#galleryBackdrop").addEventListener("click",closeGallery);
  $("#framePrev").addEventListener("click",()=>moveFrame(-1));
  $("#frameNext").addEventListener("click",()=>moveFrame(1));
  $("#frameDots").addEventListener("click",e=>{const b=e.target.closest("[data-frame]");if(b){gallery.index=+b.dataset.frame;renderGalleryFrame();}});
  stage.addEventListener("touchstart",e=>gallery.touchX=e.changedTouches[0].clientX,{passive:true});
  stage.addEventListener("touchend",e=>{
    if(gallery.touchX==null)return;
    const dx=e.changedTouches[0].clientX-gallery.touchX;
    if(Math.abs(dx)>45)moveFrame(dx<0?1:-1);
    gallery.touchX=null;
  },{passive:true});
  addEventListener("keydown",e=>{
    if(galleryEl.classList.contains("open")){
      if(e.key==="Escape")closeGallery();
      if(e.key==="ArrowLeft")moveFrame(-1);
      if(e.key==="ArrowRight")moveFrame(1);
    }
  });

  // ---------- cart ----------
  const CART_KEY="sweetmoment-cart-v2";
  let cart=[];
  try{cart=JSON.parse(localStorage.getItem(CART_KEY)||"[]").filter(x=>findProduct(x.id)&&Number(x.qty)>0).map(x=>({id:x.id,qty:Math.floor(x.qty)}));}catch{}
  const saveCart=()=>{try{localStorage.setItem(CART_KEY,JSON.stringify(cart));}catch{}};
  const totals=()=>cart.reduce((a,x)=>{const p=findProduct(x.id);a.count+=x.qty;a.total+=p.price*x.qty;return a},{count:0,total:0});

  function addToCart(id){
    const row=cart.find(x=>x.id===id);
    if(row)row.qty++;else cart.push({id,qty:1});
    saveCart();renderCart();toast(`«${findProduct(id).name}» добавлен в корзину`);
  }
  function changeQty(id,delta){
    const row=cart.find(x=>x.id===id);if(!row)return;
    row.qty=Math.max(0,row.qty+delta);
    if(!row.qty)cart=cart.filter(x=>x.id!==id);
    saveCart();renderCart();
  }
  function renderCart(){
    const t=totals(),badge=$("#cartCount");
    badge.hidden=!t.count;badge.textContent=t.count;
    $("#drawerCount").textContent=`· ${t.count} шт`;
    $("#drawerTotal").textContent=`${fmt(t.total)} ₽`;
    $("#shipNote").textContent=t.count?(t.total>=2000?"Доставка по городу — бесплатно ✓":`До бесплатной доставки — ${fmt(2000-t.total)} ₽`):"";
    $("#drawerFoot").style.display=t.count?"block":"none";
    $("#drawerList").innerHTML=!t.count?`<div class="cart-empty"><span class="ico">${icon.cart}</span><b>Пока пусто</b><p>Добавьте что-нибудь вкусное с витрины.</p><button class="btn btn-dark" data-scroll="catalog">К витрине</button></div>`:
      `<ul>${cart.map(x=>{const p=findProduct(x.id),f=p.frames[0];return `<li>
      <img src="${f.src}" alt="${f.alt}" data-ph="${p.name}"><div><div class="d-top"><p class="d-name">${p.name}</p><button class="d-remove" data-remove="${p.id}" aria-label="Удалить">${icon.trash}</button></div>
      <p class="d-weight">${p.weight}</p><div class="d-row"><span class="qty"><button data-dec="${p.id}" aria-label="Уменьшить">${icon.minus}</button><b>${x.qty}</b><button data-inc="${p.id}" aria-label="Увеличить">${icon.plus}</button></span><span class="d-price">${fmt(p.price*x.qty)} ₽</span></div></div></li>`}).join("")}</ul>`;
    wireImages($("#drawerList"));
    $("#summaryWrap").innerHTML=!t.count?`<p class="summary-empty">Корзина пока пуста — выберите десерт на витрине.</p>`:
      `<ul class="summary-list">${cart.map(x=>{const p=findProduct(x.id);return `<li><img src="${p.frames[0].src}" alt=""><span class="s-name">${p.name}<small>${x.qty} × ${fmt(p.price)} ₽</small></span><span class="s-price">${fmt(p.price*x.qty)} ₽</span><button class="s-remove" data-remove="${p.id}" aria-label="Удалить">${icon.trash}</button></li>`}).join("")}</ul>
      <div class="summary-total"><span>Итого</span><b>${fmt(t.total)} ₽</b></div><p class="summary-note">${t.total>=2000?"Доставка по городу — бесплатно":"Доставка по городу — 300 ₽, от 2 000 ₽ — бесплатно"}</p>`;
  }
  function openCart(){document.body.classList.add("cart-open");$("#cartBtn").setAttribute("aria-expanded","true");$("#closeCart").focus();}
  function closeCart(){document.body.classList.remove("cart-open");$("#cartBtn").setAttribute("aria-expanded","false");}

  document.addEventListener("click",e=>{
    const add=e.target.closest("[data-add]");if(add){addToCart(add.dataset.add);const old=add.innerHTML;add.innerHTML=icon.check+" Добавлено";add.classList.add("added");setTimeout(()=>{add.innerHTML=old;add.classList.remove("added")},1000);return;}
    const inc=e.target.closest("[data-inc]"),dec=e.target.closest("[data-dec]"),remove=e.target.closest("[data-remove]");
    if(inc){changeQty(inc.dataset.inc,1);return} if(dec){changeQty(dec.dataset.dec,-1);return}
    if(remove){cart=cart.filter(x=>x.id!==remove.dataset.remove);saveCart();renderCart();}
    const g=e.target.closest("[data-gallery]");if(g)openGallery(g.dataset.gallery);
  });
  $("#cartBtn").addEventListener("click",openCart);$("#closeCart").addEventListener("click",closeCart);$("#drawerBackdrop").addEventListener("click",closeCart);
  $("#checkoutBtn").addEventListener("click",()=>{closeCart();$("#order").scrollIntoView({behavior:reduceMotion?"auto":"smooth"});toast("Проверьте заказ и отправьте заявку");});
  addEventListener("keydown",e=>{if(e.key==="Escape"&&document.body.classList.contains("cart-open"))closeCart();});

  // ---------- form ----------
  function initForm(){
    const form=$("#orderForm");
    ["fName","fPhone"].forEach(id=>$(id).addEventListener("input",()=>$(id).closest(".field").classList.remove("invalid")));
    $("#fConsent").addEventListener("change",()=>$("#fieldConsent").classList.remove("invalid"));
    form.addEventListener("submit",e=>{
      e.preventDefault();
      const name=$("#fName").value.trim(), phone=$("#fPhone").value.trim(), digits=phone.replace(/\D/g,""), consent=$("#fConsent").checked;
      const okName=name.length>=2, okPhone=digits.length>=10&&digits.length<=12;
      $("#fieldName").classList.toggle("invalid",!okName);$("#fieldPhone").classList.toggle("invalid",!okPhone);$("#fieldConsent").classList.toggle("invalid",!consent);
      if(!(okName&&okPhone&&consent)){(document.querySelector(".field.invalid input,.consent.invalid input"))?.focus();return;}
      const btn=$("#submitBtn");btn.disabled=true;$("#submitLabel").textContent="Отправляем…";
      setTimeout(()=>{btn.disabled=false;$("#submitLabel").textContent="Отправить заявку";form.reset();cart=[];saveCart();renderCart();toast("Заявка отправлена — это демонстрационный прототип");},700);
    });
  }

  // ---------- init ----------
  document.addEventListener("DOMContentLoaded",()=>{
    initHeader();initTicker();renderProducts();renderReviews();renderCart();initForm();initReveal();wireImages();
  });
})();
