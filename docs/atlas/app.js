'use strict';
const gods=window.ATLAS_GODS, sources=window.ATLAS_SOURCES;
const $=s=>document.querySelector(s);
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let selected='zeus', filter='all', query='', showVariants=false, mapReady=false, tourStep=0;
const icons={
 bolt:'<path d="M29 3 12 27h13l-3 18 17-27H26z"/>',
 crown:'<path d="m6 14 8 8 10-13 10 13 8-8-5 23H11zM11 31h26"/><circle cx="6" cy="12" r="2"/><circle cx="24" cy="7" r="2"/><circle cx="42" cy="12" r="2"/>',
 trident:'<path d="M24 5v39M11 11v10c0 9 26 9 26 0V11M7 15l4-7 4 7M20 10l4-7 4 7M33 15l4-7 4 7"/>',
 lyre:'<path d="M10 8c10 2 8 11 4 18-5 12 25 12 20 0-4-7-6-16 4-18M14 15h20M18 16v19M24 16v21M30 16v19M14 40h20"/><circle cx="9" cy="6" r="3"/><circle cx="39" cy="6" r="3"/>',
 bow:'<path d="M14 5c29 8 29 30 0 38L14 5ZM8 24h35m-6-5 6 5-6 5M14 24 8 18m6 6-6 6"/>',
 staff:'<path d="M24 11v33M15 17c-14-10-3-17 7-7M33 17c14-10 3-17-7-7M13 19c-3 10 23 8 23 17 0 7-13 7-17 3M35 19c3 10-23 8-23 17 0 7 13 7 17 3"/><circle cx="24" cy="7" r="3"/>',
 shell:'<path d="M9 34C-6 15 10 5 17 11 20 2 28 2 31 11c7-6 23 4 8 23l-9 6H18zM24 10v29M16 14l5 24M32 14l-5 24M9 20l9 18M39 20l-9 18M18 42h12"/>',
 owl:'<path d="m10 8 7 5c4-2 10-2 14 0l7-5-2 12c7 20-31 20-24 0zM19 39l-4 5m4-5 3 5m7-5-3 5m3-5 4 5M21 26l3 4 3-4"/><circle cx="17" cy="21" r="6"/><circle cx="31" cy="21" r="6"/><circle cx="17" cy="21" r="1"/><circle cx="31" cy="21" r="1"/>',
 vine:'<path d="M26 16c-1-8 6-14 13-10-3 8-9 8-13 10M24 14c-3-7-8-8-12-6M26 10v9"/><circle cx="17" cy="22" r="5"/><circle cx="27" cy="22" r="5"/><circle cx="37" cy="22" r="5"/><circle cx="22" cy="31" r="5"/><circle cx="32" cy="31" r="5"/><circle cx="27" cy="40" r="5"/>',
 pipes:'<path d="M6 11h7v29H6zM13 10h7v26h-7zM20 9h7v22h-7zM27 8h7v18h-7zM34 7h7v15h-7zM6 17h35"/>',
 spear:'<path d="M12 43 35 11m-6-4L42 3l-1 13-6-5zM14 35l6 4M8 41l7 5M13 9l14 17M10 5l10 6-5 5z"/>',
 grain:'<path d="M24 44V9M24 13C14 13 12 7 15 3c6 0 9 4 9 10ZM24 22c-11 0-14-6-11-11 8 1 11 5 11 11ZM24 32C13 32 10 26 13 21c8 1 11 5 11 11ZM24 18c10 0 13-6 10-11-7 1-10 5-10 11ZM24 28c11 0 14-6 11-11-8 1-11 5-11 11ZM24 38c11 0 14-6 11-11-8 1-11 5-11 11Z"/>',
 hammer:'<path d="m9 9 19-4 9 8-12 6-10-1zM23 20l-5 23 7 2 5-28M7 41h34M9 35h30l-5 6H14z"/>',
 flame:'<path d="M26 3c5 14-4 16-2 22 5-1 8-7 8-11 20 21 6 28-7 28S0 32 14 17c-1 7 3 10 6 11-3-10 6-13 6-25ZM24 42c-10-8-5-13 0-18 0 9 9 11 0 18Z"/>',
 key:'<circle cx="17" cy="13" r="9"/><circle cx="17" cy="13" r="3"/><path d="M23 20 41 38l-5 5-5-5 3-3-5-5-3 3-5-5"/>'
};
const pin='<svg viewBox="0 0 16 20" aria-hidden="true"><path d="M14 7c0 5-6 11-6 11S2 12 2 7a6 6 0 1 1 12 0Z"/><circle cx="8" cy="7" r="2"/></svg>';
const tour=[
 {god:'zeus',title:'An island hides a future king.'},
 {god:'hera',title:'A queen beneath a sacred tree.'},
 {god:'apollo',title:'A little island welcomes Leto.'},
 {god:'hermes',title:'A newborn with a talent for trouble.'},
 {god:'aphrodite',title:'Love arrives from the sea.'},
 {god:'athena',title:'Wisdom has a startling beginning.'},
 {god:'dionysus',title:'The god who was born twice.'},
 {god:'hestia',title:'Some beginnings have no pin.'}
];
function matches(g){return (filter==='all'||(filter==='mapped')===g.mapped)&&(!query||[g.name,g.greek,g.domain,g.place,g.region,g.summary,...g.sites.map(s=>s.place)].join(' ').toLowerCase().includes(query));}
function visibleGods(){return gods.filter(matches);}
function renderList(){
 const result=visibleGods();
 $('#god-list').innerHTML=result.map(g=>`<button class="god-chip ${g.id===selected?'active':''}" data-god="${g.id}" aria-pressed="${g.id===selected}"><span class="chip-dot ${g.mapped?'':'unplaced'}" aria-hidden="true"></span>${g.name}</button>`).join('');
 $('#result-count').textContent=`${result.length} ${result.length===1?'story':'stories'} to explore`;
 $('#empty-results').hidden=result.length>0;
 $('#god-list').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{selectGod(b.dataset.god);if(innerWidth<=720)$('#story-panel').scrollIntoView({behavior:reduceMotion?'instant':'smooth',block:'start'});}));
 $('#previous-god').disabled=!result.length;$('#next-god').disabled=!result.length;
}
function selectGod(id,{updateHash=true}={}){
 const g=gods.find(g=>g.id===id);if(!g)return;
 selected=id;
 $('#story').innerHTML=`<div class="story-top"><span>THE DIVINE ORIGINS</span><span>${String(gods.indexOf(g)+1).padStart(2,'0')}</span></div><div class="story-symbol" aria-hidden="true"><svg viewBox="0 0 48 48">${icons[g.symbol]}</svg></div><h2 class="god-title">${g.name}<span class="greek-name" lang="el">${g.greek}</span></h2><p class="god-domain">${g.domain}</p><h3 class="place-title">${pin}${g.place}</h3><p class="region">${g.region}</p><span class="status-badge">${g.badge}</span><p class="story-body">${g.summary}</p><div class="tradition-note"><h3>${g.noteTitle}</h3><p>${g.note}</p></div><div class="source-links"><span>READ THE ANCIENT ACCOUNT</span>${g.sources.map(([key,label])=>`<a href="${sources[key].url}" target="_blank" rel="noopener noreferrer">${label}</a>`).join('')}</div>`;
 $('#god-index').textContent=`${String(gods.indexOf(g)+1).padStart(2,'0')} / ${gods.length}`;
 renderList();if(mapReady)renderMarkers();
 if(updateHash){try{history.replaceState(null,'',`#${id}`);}catch{}}
}
function applyFilter(){
 const result=visibleGods();
 document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b.dataset.filter===filter);b.setAttribute('aria-pressed',String(b.dataset.filter===filter));});
 if(result.length&&!result.some(g=>g.id===selected))selectGod(result[0].id);else{renderList();if(mapReady)renderMarkers();}
}
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;applyFilter();}));
$('#search').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();applyFilter();});
function stepGod(direction){const result=visibleGods();if(!result.length)return;const i=result.findIndex(g=>g.id===selected);selectGod(result[(i+direction+result.length)%result.length].id);}
$('#previous-god').addEventListener('click',()=>stepGod(-1));$('#next-god').addEventListener('click',()=>stepGod(1));
$('#variants').addEventListener('change',e=>{showVariants=e.target.checked;if(mapReady)renderMarkers();});
$('#tour-next').addEventListener('click',()=>{
 tourStep=(tourStep+1)%tour.length;filter='all';query='';$('#search').value='';applyFilter();selectGod(tour[tourStep].god);
 $('#tour-number').textContent=`${String(tourStep+1).padStart(2,'0')} / 08`;$('#tour-title').textContent=tour[tourStep].title;
 $('#tour-next').innerHTML=`${tourStep===tour.length-1?'Start again':'Next story'} <span aria-hidden="true">→</span>`;
 if(mapReady)resetMap();
});
const dialog=$('#sources-dialog');
$('#source-list').innerHTML=Object.values(sources).map(s=>`<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label} ↗</a>`).join('');
$('#sources-open').addEventListener('click',()=>dialog.showModal());$('#method-open').addEventListener('click',()=>dialog.showModal());$('#sources-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(gods.some(g=>g.id===id)){filter='all';query='';$('#search').value='';selectGod(id,{updateHash:false});applyFilter();}});

const W=940,H=600;
let svg,world,markerLayer,routeLayer,projection,zoom,tritonisInset;
function resetMap(){svg.transition().duration(reduceMotion?0:350).call(zoom.transform,d3.zoomIdentity);}
async function initMap(){
 try{
  if(!window.d3)throw new Error('The map library could not load.');
  svg=d3.select('#map');
  projection=d3.geoMercator().center([26.2,36.7]).scale(2850).translate([W/2,H/2]).clipExtent([[0,0],[W,H]]);
  const [land,tritonisLand]=await Promise.all([d3.json('data/land-full.geojson'),d3.json('data/land-tritonis.geojson')]);
  svg.append('defs').append('clipPath').attr('id','map-clip').append('rect').attr('width',W).attr('height',H);
  world=svg.append('g').attr('clip-path','url(#map-clip)').append('g');
  const path=d3.geoPath(projection);
  world.append('path').datum(d3.geoGraticule().step([2,2])()).attr('class','graticule').attr('d',path);
  world.append('g').selectAll('path').data(land.features).join('path').attr('class','land').attr('d',path);
  const labels=[['G R E E C E',[22.35,39.75],'geo-label'],['A N A T O L I A',[30.0,39.6],'geo-label'],['Aegean Sea',[25.1,38.75],'sea-label'],['Mediterranean Sea',[28.7,34.4],'sea-label'],['CRETE',[24.65,35.05],'island-label'],['CYPRUS',[33.3,35.35],'island-label'],['PELOPONNESE',[21.7,36.9],'island-label'],['IONIAN SEA',[20.2,37.4],'island-label']];
  world.append('g').selectAll('text').data(labels).join('text').attr('class',d=>d[2]).attr('transform',d=>`translate(${projection(d[1])})`).text(d=>d[0]);
  const refs=[['Athens',[23.73,37.98]],['Olympus',[22.35,40.08]]];
  const reference=world.append('g');
  refs.forEach(([name,c])=>{const [x,y]=projection(c);reference.append('circle').attr('cx',x).attr('cy',y).attr('r',2).attr('class','reference');reference.append('text').attr('x',x+7).attr('y',y+3).attr('class','reference-label').text(name);});
  routeLayer=world.append('g');markerLayer=world.append('g');
  const compass=svg.append('g').attr('transform','translate(877,56)').attr('aria-hidden','true');
  compass.append('path').attr('class','compass').attr('d','M0,-19 4,0 0,17 -4,0Z M-13,0H13');compass.append('path').attr('d','M0,-19 4,0H0Z').attr('fill','#7e947f');compass.append('text').attr('class','compass-letter').attr('x',-4).attr('y',-28).text('N');
  svg.append('text').attr('class','svg-caption').attr('x',W-22).attr('y',H-15).attr('text-anchor','end').text('GSHHG · FULL-RESOLUTION COASTLINES');
  // Context only: no asserted coordinate or lake outline for Lake Tritonis.
  tritonisInset=svg.append('g').attr('transform','translate(24,400)').attr('display','none').attr('aria-label','Athena at Lake Tritonis, ancient North Africa; exact lake site uncertain');
  tritonisInset.append('rect').attr('width',242).attr('height',158).attr('fill','#f5f0e4').attr('stroke','#b5b9a8');
  tritonisInset.append('text').attr('x',12).attr('y',23).attr('fill','#263d33').attr('font-size',12).attr('font-weight',700).text('ATHENA · LAKE TRITONIS');
  const insetProjection=d3.geoMercator().center([16,35]).scale(560).translate([121,88]).clipExtent([[8,35],[234,131]]);
  tritonisInset.append('path').datum(tritonisLand).attr('d',d3.geoPath(insetProjection)).attr('fill','#e9e4d5').attr('stroke','#68715e').attr('stroke-width',.65);
  tritonisInset.append('text').attr('x',121).attr('y',122).attr('text-anchor','middle').attr('fill','#6d7566').attr('font-size',9).text('NORTH AFRICA');
  tritonisInset.append('text').attr('x',12).attr('y',147).attr('fill','#6d7566').attr('font-size',10).text('Ancient Libya · lake location uncertain');
  zoom=d3.zoom().extent([[0,0],[W,H]]).scaleExtent([1,5]).translateExtent([[-W*.2,-H*.2],[W*1.2,H*1.2]]).filter(e=>(!e.ctrlKey||e.type==='wheel')&&!e.button&&(e.type!=='wheel'||e.ctrlKey)).on('zoom',e=>{world.attr('transform',e.transform);});
  svg.call(zoom).on('dblclick.zoom',null);
  $('#zoom-in').addEventListener('click',()=>svg.transition().duration(reduceMotion?0:250).call(zoom.scaleBy,1.5));
  $('#zoom-out').addEventListener('click',()=>svg.transition().duration(reduceMotion?0:250).call(zoom.scaleBy,1/1.5));
  $('#reset-map').addEventListener('click',resetMap);
  mapReady=true;renderMarkers();$('#map-loading').hidden=true;
 }catch(error){
  $('#map-loading').textContent='The map could not load. Every story is available below.';
  document.querySelectorAll('.map-controls button').forEach(b=>b.disabled=true);
  console.error(error);
 }
}
function renderMarkers(){
 const allSites=new Map();
 const filtered=visibleGods();
 tritonisInset.attr('display',showVariants&&selected==='athena'&&filtered.some(g=>g.id==='athena')?null:'none');
 filtered.forEach(g=>g.sites.filter(s=>!s.inset&&(!s.alt||showVariants)).forEach(s=>{
  if(!allSites.has(s.key))allSites.set(s.key,{...s,gods:[]});allSites.get(s.key).gods.push(g.id);
 }));
 routeLayer.selectAll('*').remove();
 if(showVariants&&filtered.some(g=>g.id==='aphrodite')){
  const c=projection([22.99,36.26]),p=projection([32.414,34.755]);
  routeLayer.append('path').attr('class','myth-route').attr('d',`M${c} C${c[0]+140},${c[1]+100} ${p[0]-190},${p[1]+70} ${p}`);
 }
 markerLayer.selectAll('*').remove();
 const arr=[...allSites.values()].sort((a,b)=>Number(a.gods.includes(selected))-Number(b.gods.includes(selected)));
 arr.forEach(s=>{
  const [x,y]=projection(s.coords),active=s.gods.includes(selected),unplaced=!gods.find(g=>g.id===selected).mapped;
  const group=markerLayer.append('g').attr('class',`marker${active?' selected':''}${unplaced?' dimmed':''}`).attr('transform',`translate(${x},${y})`).attr('role','button').attr('tabindex',0).attr('aria-label',`${s.label}: ${s.place}${s.alt?', additional tradition':''}`).attr('aria-pressed',String(active));
  const choose=()=>{if(s.gods.length>1&&active){selectGod(s.gods[(s.gods.indexOf(selected)+1)%s.gods.length]);}else selectGod(s.gods[0]);};
  group.on('click',e=>{e.stopPropagation();choose();}).on('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}});
  group.append('title').text(`${s.label} · ${s.place}`);
  group.append('circle').attr('r',17).attr('fill','transparent');
  if(s.type==='regional')group.append('circle').attr('r',23).attr('class','region-ring');
  if(active){group.append('circle').attr('class','selection-ring').attr('r',13);group.append('circle').attr('class','selection-ring').attr('r',18).attr('opacity',.25);}
  if(['arrival','infancy'].includes(s.type))group.append('path').attr('class','arrival-marker').attr('d','M0,-7 7,0 0,7 -7,0Z');
  else group.append('circle').attr('r',s.alt?5:6).attr('class',s.type==='variant'?'variant-marker':'birth-marker');
  const align=s.dx<0?'end':'start',endX=s.dx+(s.dx<0?4:-4),endY=s.dy-5;
  group.append('path').attr('class','marker-leader').attr('d',`M${s.dx<0?-7:7},0 Q${endX*.5},${endY*.4} ${endX},${endY}`);
  const label=group.append('text').attr('class','marker-label').attr('text-anchor',align).attr('x',s.dx).attr('y',s.dy);
  label.append('tspan').text(s.label);
  label.append('tspan').attr('class','marker-place').attr('x',s.dx).attr('dy',innerWidth<=720?29:14).text(s.place);
 });
}
document.querySelector('[data-filter="all"] span').textContent=gods.length;
document.querySelector('[data-filter="mapped"] span').textContent=gods.filter(g=>g.mapped).length;
document.querySelector('[data-filter="unplaced"] span').textContent=gods.filter(g=>!g.mapped).length;
const initial=location.hash.slice(1);selectGod(gods.some(g=>g.id===initial)?initial:'zeus',{updateHash:false});initMap();
window.matchMedia('(max-width:720px)').addEventListener('change',()=>{if(mapReady)renderMarkers();});
