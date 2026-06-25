const tracks=[
 {name:'US 13 Dragway',city:'Delmar, DE',lat:38.4566,lon:-75.5613,elev:50,schedule:'https://www.us13dragway.com/'},
 {name:'Maple Grove Raceway',city:'Mohnton, PA',lat:40.2087,lon:-75.9681,elev:548,schedule:'https://www.maplegroveraceway.com/'},
 {name:'Cecil County Dragway',city:'Rising Sun, MD',lat:39.6767,lon:-76.0585,elev:320,schedule:'https://cecilcountydragway.com/'},
 {name:'Capitol Raceway',city:'Crofton, MD',lat:39.0454,lon:-76.7058,elev:150,schedule:'https://www.capitolraceway.com/'},
 {name:'Mason-Dixon Dragway',city:'Boonsboro, MD',lat:39.5449,lon:-77.6858,elev:580,schedule:'https://www.masondixondragway.com/'},
 {name:'Virginia Motorsports Park',city:'Dinwiddie, VA',lat:37.1652,lon:-77.4931,elev:140,schedule:'https://racevmp.com/'}
];
function saturationVaporPressure(tempC){return 6.1078*Math.pow(10,(7.5*tempC)/(237.3+tempC));}
function estimateDA(tempC,pressureHpa,rh,elevFt){
 const tempF=tempC*9/5+32;
 const pressureInHg=pressureHpa*0.0295299830714;
 const stationAlt=elevFt;
 const pressureAlt=(29.92-pressureInHg)*1000+stationAlt;
 const isaTempC=15-(stationAlt*0.0019812);
 const vapor=saturationVaporPressure(tempC)*(rh/100);
 const virtualTempC=(tempC+273.15)/(1-0.378*(vapor/pressureHpa))-273.15;
 const da=pressureAlt+118.8*(virtualTempC-isaTempC);
 return {da:Math.round(da),tempF:Math.round(tempF),pressureInHg:pressureInHg.toFixed(2)};
}
function wxCode(code){const map={0:'Clear',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',48:'Rime fog',51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',61:'Light rain',63:'Rain',65:'Heavy rain',71:'Light snow',73:'Snow',75:'Heavy snow',80:'Rain showers',81:'Showers',82:'Heavy showers',95:'Thunderstorm'};return map[code]||'Conditions';}
async function loadWeather(){
 const grid=document.getElementById('trackGrid');
 grid.innerHTML='<article class="track-card loading">Loading track weather and DA...</article>';
 const cards=await Promise.all(tracks.map(async t=>{
  try{
   const url=`https://api.open-meteo.com/v1/forecast?latitude=${t.lat}&longitude=${t.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,surface_pressure&timezone=auto`;
   const r=await fetch(url); const data=await r.json(); const c=data.current;
   const da=estimateDA(c.temperature_2m,c.surface_pressure,c.relative_humidity_2m,t.elev);
   return `<article class="track-card"><h3>${t.name}</h3><div class="track-meta">${t.city} · Elev. ${t.elev} ft · ${wxCode(c.weather_code)}</div><div class="track-metrics"><div><span>Temp</span><strong>${da.tempF}°F</strong></div><div><span>Humidity</span><strong>${c.relative_humidity_2m}%</strong></div><div><span>Wind</span><strong>${Math.round(c.wind_speed_10m)} mph</strong></div><div><span>Est. DA</span><strong>${da.da.toLocaleString()} ft</strong></div></div><div class="track-meta">Pressure ${da.pressureInHg} inHg · updated ${new Date(c.time).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}</div><div class="links"><a class="mini-link" href="${t.schedule}" target="_blank" rel="noopener">Schedule</a><a class="mini-link" href="https://forecast.weather.gov/MapClick.php?lat=${t.lat}&lon=${t.lon}" target="_blank" rel="noopener">NWS</a></div></article>`;
  }catch(e){return `<article class="track-card"><h3>${t.name}</h3><div class="track-meta">Weather unavailable right now.</div><div class="links"><a class="mini-link" href="${t.schedule}" target="_blank" rel="noopener">Schedule</a></div></article>`}
 }));
 grid.innerHTML=cards.join('');
}
function updateCountdown(){
 const target=new Date('2026-08-14T09:00:00-04:00').getTime();
 const diff=Math.max(0,target-Date.now());
 const d=Math.floor(diff/86400000); const h=Math.floor(diff%86400000/3600000); const m=Math.floor(diff%3600000/60000); const s=Math.floor(diff%60000/1000);
 document.getElementById('days').textContent=d;document.getElementById('hours').textContent=h;document.getElementById('minutes').textContent=m;document.getElementById('seconds').textContent=s;
}
document.getElementById('refreshWeather')?.addEventListener('click',loadWeather);
updateCountdown(); setInterval(updateCountdown,1000); loadWeather();
const photos=[...document.querySelectorAll('.hero-photo')];
const dots=[...document.querySelectorAll('.photo-dots span')];
let photoIndex=0;
function showPhoto(i){
 if(!photos.length) return;
 photos[photoIndex].classList.remove('active');
 dots[photoIndex]?.classList.remove('active');
 photoIndex=(i+photos.length)%photos.length;
 photos[photoIndex].classList.add('active');
 dots[photoIndex]?.classList.add('active');
}
dots.forEach((dot,i)=>dot.addEventListener('click',()=>showPhoto(i)));
setInterval(()=>showPhoto(photoIndex+1),6000);
