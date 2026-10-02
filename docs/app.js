const SAMPLE = [
  {id:'sample-1',title:'첫 번째 이야기',author:'작가 이름',finished:'2026-09-25',genre:'소설',color:'#8b594f',impression:'이곳에 책을 읽고 느낀 점이 펼쳐집니다. 내 책을 추가하면 이 예시가 사라지고 나만의 책장이 만들어져요.',recommendation:'이 이야기가 필요한 사람에게 권해보세요.',review:'이 책을 읽으며 떠오른 생각을 자유롭게 이어서 적습니다. 독후감은 두 번째 페이지부터 시작돼요.'},
  {id:'sample-2',title:'느린 오후의 기록',author:'작가 이름',finished:'2026-08-14',genre:'에세이',color:'#747d63',impression:'잠시 멈춰 서서 생각하게 된 순간을 남겨보세요.',recommendation:'천천히 읽고 싶은 분께 권해요.',review:'나만의 독후감을 여기에 적어보세요.'},
  {id:'sample-3',title:'별빛 아래',author:'작가 이름',finished:'2026-07-03',genre:'인문',color:'#405c70',impression:'읽고 나서 달라진 생각을 적어보세요.',recommendation:'생각을 확장하고 싶은 분께 권해요.',review:'나만의 독후감을 여기에 적어보세요.'},
  {id:'sample-4',title:'오래된 편지',author:'작가 이름',finished:'2026-06-21',genre:'소설',color:'#916d4e',impression:'책을 덮은 뒤에도 남는 감정을 담아보세요.',recommendation:'편지를 좋아하는 분께 권해요.',review:'나만의 독후감을 여기에 적어보세요.'},
  {id:'sample-5',title:'계절의 문장',author:'작가 이름',finished:'2026-05-10',genre:'시',color:'#6a556e',impression:'한 계절을 닮은 책에 대한 이야기를 써보세요.',recommendation:'짧은 시를 좋아하는 분께 권해요.',review:'나만의 독후감을 여기에 적어보세요.'}
];
const $ = selector => document.querySelector(selector);
const dialog = $('#book-dialog');
let books = [];
const safeColor = value => /^#[0-9a-fA-F]{6}$/.test(value || '') ? value : '#6b6152';
const put = (selector, value) => { $(selector).textContent = value ?? ''; };
let review = '';
let pages = [];
let currentPage = 0; // 0: 첫 페이지, 1부터 독후감
function setPage(index){
  currentPage = Math.max(0,Math.min(index,pages.length));
  $('#summary-page').hidden = currentPage!==0;
  $('#review-page').hidden = currentPage===0;
  if(currentPage>0)put('#review-text',pages[currentPage-1]);
  put('#page-indicator',`${currentPage+1} / ${pages.length+1}`);
  $('#prev-page').disabled = currentPage===0;
  $('#next-page').disabled = currentPage===pages.length;
}
function paginate(){
  const area=$('#review-text');
  if(!area.clientWidth || !area.clientHeight)return;
  // Measure the actual rendered text to keep each page within the paper.
  pages=[];
  let remaining=review;
  while(remaining){
    let low=1,high=remaining.length,fit=1;
    while(low<=high){
      const middle=Math.floor((low+high)/2);
      area.textContent=remaining.slice(0,middle);
      if(area.scrollHeight<=area.clientHeight+1){fit=middle;low=middle+1;}
      else high=middle-1;
    }
    if(fit<remaining.length){
      const cut=Math.max(remaining.lastIndexOf(' ',fit),remaining.lastIndexOf('\n',fit));
      if(cut>fit*.55)fit=cut+1;
    }
    pages.push(remaining.slice(0,fit));
    remaining=remaining.slice(fit);
  }
  if(!pages.length)pages=['독후감이 아직 작성되지 않았어요.'];
  setPage(Math.min(currentPage,pages.length));
}
function openBook(book){
  put('#cover-title',book.title);
  put('#cover-author',book.author);
  put('#cover-date',book.finished ? `읽은 날 · ${book.finished}` : '');
  $('#dialog-cover').style.setProperty('--cover',safeColor(book.color));
  const image=$('#cover-image');
  image.hidden=true;
  image.removeAttribute('src');
  $('#cover-placeholder').hidden=false;
  if(typeof book.cover==='string' && book.cover.startsWith('covers/') &&
     book.cover.split('/').every(part=>part && part!=='.' && part!=='..' && !/[\\?#\x00-\x1f]/.test(part))){
    image.onload=()=>{image.hidden=false;$('#cover-placeholder').hidden=true;};
    image.onerror=()=>{image.hidden=true;$('#cover-placeholder').hidden=false;};
    image.src=book.cover.split('/').map(part=>encodeURIComponent(part).replace(/'/g,'%27')).join('/');
  }
  put('#dialog-impression',book.impression);
  put('#dialog-recommendation',book.recommendation);
  review=book.review || '';
  $('#review-page').hidden=false; // 숨김 해제 후 실제 공간을 측정
  $('#summary-page').hidden=true;
  currentPage=0;
  dialog.showModal();
  requestAnimationFrame(paginate);
}
function render(){
  const term = $('#search').value.trim().toLocaleLowerCase();
  const items = books.filter(book => `${book.title} ${book.author}`.toLocaleLowerCase().includes(term));
  const mode = $('#sort').value;
  items.sort((a,b) => mode==='title' ? a.title.localeCompare(b.title,'ko') : mode==='oldest' ? (a.finished||'').localeCompare(b.finished||'') : (b.finished||'').localeCompare(a.finished||''));
  put('#book-count',`${books.length}권의 이야기`);
  const container = $('#shelves'); container.replaceChildren();
  if(!items.length){const message=document.createElement('div');message.className='empty';message.textContent=books.length?'찾는 책이 아직 책장에 없어요.':'아직 꽂힌 책이 없어요. 첫 독후감을 추가해보세요.';container.append(message);return;}
  for(let i=0;i<items.length;i+=12){
    const row=document.createElement('div');row.className='shelf-row';
    for(const [j,book] of items.slice(i,i+12).entries()){
      const button=document.createElement('button');button.className='book';button.type='button';
      button.setAttribute('aria-label',`${book.title}, ${book.author} 독후감 보기`);
      button.style.setProperty('--cover',safeColor(book.color));
      button.style.setProperty('--w',`${34+(i+j)%4*6}px`);
      button.style.setProperty('--h',`${181+(i+j)*17%49}px`);
      const title=document.createElement('span');title.className='book-title';title.textContent=book.title;
      const author=document.createElement('span');author.className='book-author';author.textContent=book.author;
      button.append(title,author);button.addEventListener('click',()=>openBook(book));row.append(button);
    }
    container.append(row);
  }
}
async function load(){
  if(window.BOOKCASE_DATA && Array.isArray(window.BOOKCASE_DATA.books)){
    const data=window.BOOKCASE_DATA;
    books=data.books;
    for(const [selector,key] of [['#site-title','title'],['#site-subtitle','subtitle'],['#site-footer','footer']]){
      if(typeof data.config?.[key]==='string')put(selector,data.config[key]);
    }
    document.title=data.config?.title||document.title;
    render();
    return;
  }
  try{const response=await fetch('site-config.json');if(response.ok){const config=await response.json();for(const [selector,key] of [['#site-title','title'],['#site-subtitle','subtitle'],['#site-footer','footer']])if(typeof config[key]==='string')put(selector,config[key]);document.title=config.title||document.title;}}catch(error){console.warn('사이트 설정을 불러오지 못했습니다.',error);}
  try{const response=await fetch('books.json');if(!response.ok)throw new Error('책 목록 없음');const data=await response.json();if(!Array.isArray(data))throw new Error('책 목록 형식 오류');books=data;}catch(error){books=SAMPLE;console.info('샘플 책장을 표시합니다.',error);}
  render();
}
$('#search').addEventListener('input',render);$('#sort').addEventListener('change',render);
$('#prev-page').addEventListener('click',()=>setPage(currentPage-1));
$('#next-page').addEventListener('click',()=>setPage(currentPage+1));
window.addEventListener('resize',()=>{if(dialog.open)paginate();});
$('#close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
load();
