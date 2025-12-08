(function(){
  const scroller = document.getElementById('servicesScroll');
  if(!scroller) return;

  const leftBtn = document.querySelector('.scroll-btn.left');
  const rightBtn = document.querySelector('.scroll-btn.right');

  const getCardWidth = () => {
    const first = scroller.querySelector('.service-card');
    if(!first) return 260;
    const style = getComputedStyle(first);
    const gap = parseFloat(getComputedStyle(scroller).gap || 16) || 16;
    return Math.round(first.getBoundingClientRect().width + gap);
  };

  const updateButtons = () => {
    const max = scroller.scrollWidth - scroller.clientWidth;
    leftBtn.disabled = scroller.scrollLeft <= 10;
    rightBtn.disabled = scroller.scrollLeft >= max - 10;
    leftBtn.style.opacity = leftBtn.disabled ? '0.35' : '1';
    rightBtn.style.opacity = rightBtn.disabled ? '0.35' : '1';
  };

  // Smooth scroll helper
  const smoothTo = (x) => scroller.scrollTo({left:x, behavior:'smooth'});

  leftBtn.addEventListener('click', () => {
    smoothTo(Math.max(0, scroller.scrollLeft - getCardWidth()*2));
  });
  rightBtn.addEventListener('click', () => {
    smoothTo(Math.min(scroller.scrollWidth, scroller.scrollLeft + getCardWidth()*2));
  });

  // Drag to scroll (pointer events)
  let isDown = false, startX, startScroll;
  scroller.addEventListener('pointerdown', (e)=>{
    isDown = true;
    scroller.setPointerCapture(e.pointerId);
    scroller.classList.add('is-dragging');
    startX = e.clientX;
    startScroll = scroller.scrollLeft;
  });
  scroller.addEventListener('pointermove', (e)=>{
    if(!isDown) return;
    const dx = e.clientX - startX;
    scroller.scrollLeft = startScroll - dx;
  });
  const endDrag = (e)=>{
    if(!isDown) return;
    isDown = false;
    try{ scroller.releasePointerCapture && scroller.releasePointerCapture(e.pointerId); }catch(e){}
    scroller.classList.remove('is-dragging');
    snapToNearest();
  };
  scroller.addEventListener('pointerup', endDrag);
  scroller.addEventListener('pointercancel', endDrag);

  // Wheel -> horizontal scroll
  scroller.addEventListener('wheel', (e)=>{
    if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){
      e.preventDefault();
      scroller.scrollLeft += e.deltaY;
    }
  }, {passive:false});

  // Snap to nearest card after scroll ends (debounce)
  let scrollTimeout = null;
  scroller.addEventListener('scroll', ()=>{
    updateButtons();
    if(scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(()=>snapToNearest(), 120);
  }, {passive:true});

  function snapToNearest(){
    const w = getCardWidth();
    if(!w) return;
    const index = Math.round(scroller.scrollLeft / w);
    smoothTo(index * w);
  }

  // Keyboard support
  scroller.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowLeft') { e.preventDefault(); smoothTo(Math.max(0, scroller.scrollLeft - getCardWidth())); }
    if(e.key === 'ArrowRight') { e.preventDefault(); smoothTo(Math.min(scroller.scrollWidth, scroller.scrollLeft + getCardWidth())); }
    if(e.key === 'Home') { e.preventDefault(); smoothTo(0); }
    if(e.key === 'End') { e.preventDefault(); smoothTo(scroller.scrollWidth); }
  });

  // Resize observer to keep buttons state accurate
  const ro = new ResizeObserver(()=> updateButtons());
  ro.observe(scroller);
  window.addEventListener('load', updateButtons);
  window.addEventListener('resize', ()=> setTimeout(updateButtons, 120));

  // Initial state
  updateButtons();
})();

(function(){
  // Mobile nav toggle and smooth anchor scrolling + active link observer
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  if(navToggle && navMenu){
    navToggle.addEventListener('click', ()=>{
      const open = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Smooth scroll for internal anchors
  document.addEventListener('click', (e)=>{
    const a = e.target.closest('a[href^="#"]');
    if(!a) return;
    const href = a.getAttribute('href');
    if(href === '#' || href === '') return;
    const target = document.querySelector(href);
    if(target){
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth', block:'start'});
      // close mobile menu if open
      if(navMenu && navMenu.classList.contains('open')){
        navMenu.classList.remove('open');
        navToggle && navToggle.setAttribute('aria-expanded','false');
      }
    }
  });

  // Highlight nav link for section in view
  const sections = Array.from(document.querySelectorAll('section[id]'));
  if(sections.length && navLinks.length){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        const id = entry.target.id;
        const link = document.querySelector('.nav-link[href="#'+id+'"]');
        if(link){
          link.classList.toggle('active', entry.isIntersecting);
        }
      });
    },{root:null,rootMargin:'-20% 0px -60% 0px',threshold:0});
    sections.forEach(s=> io.observe(s));
  }
})();
