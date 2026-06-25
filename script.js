const tracks = [
  { name:'US 13 Dragway', city:'Delmar, DE', lat:38.472, lon:-75.560, elev:50, schedule:'https://www.us13dragway.com/' },
  { name:'Maryland International Raceway', city:'Mechanicsville, MD', lat:38.395, lon:-76.847, elev:90, schedule:'https://goracemir.com/' },
  { name:'Cecil County Dragway', city:'Rising Sun, MD', lat:39.692, lon:-76.061, elev:320, schedule:'https://cecilcountydragway.com/' },
  { name:'Maple Grove Raceway', city:'Mohnton, PA', lat:40.210, lon:-75.994, elev:550, schedule:'https://www.maplegroveraceway.com/' },
  { name:'Atco Dragway Area', city:'Atco, NJ', lat:39.769, lon:-74.887, elev:110, schedule:'https://www.nhra.com/tracks' },
  { name:'Virginia Motorsports Park', city:'Dinwiddie, VA', lat:37.165, lon:-77.521, elev:145, schedule:'https://racevmp.com/' }
];

function estimateDA(tempF, humidity, pressureHpa, elevationFt){
  const tempC = (tempF - 32) * 5/9;
  const pressureInHg = pressureHpa * 0.0295299830714;
  const stationPressure = pressureInHg;
  const standardPressure = 29.92 * Math.pow(1 - 0.0000068753 * elevationFt, 5.2559);
  const pressureAltitude = elevationFt + 1000 * (standardPressure - stationPressure);
  const isaTempC = 15 - (1.98 * elevationFt / 1000);
  const dewPenalty = Math.max(0, humidity - 35) * 4;
  return Math.round(pressureAltitude + 120 * (tempC - isaTempC) + dewPenalty);
}

function buildTrackCards(){
  const list = document.getElementById('track-list');
  if(!list) return;
  list.innerHTML = tracks.map(t => `
    <article class="track-card">
      <span class="pill">Track</span>
      <h3>${t.name}</h3>
      <p>${t.city}</p>
      <div class="meta">
        <span>Approx. elevation: ${t.elev} ft</span>
        <span>Weather/DA card included below</span>
      </div>
      <div class="button-row">
        <a href="${t.schedule}" target="_blank" rel="noreferrer">Schedule</a>
        <a href="#weather">Weather + DA</a>
      </div>
    </article>
  `).join('');
}

async function loadWeather(){
  const grid = document.getElementById('weather-grid');
  if(!grid) return;
  grid.innerHTML = tracks.map(t => `<article class="weather-card"><h3>${t.name}</h3><p>Loading live conditions…</p></article>`).join('');
  const cards = [...grid.children];
  await Promise.all(tracks.map(async (t, i) => {
    try{
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${t.lat}&longitude=${t.lon}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;
      const res = await fetch(url);
      if(!res.ok) throw new Error('Weather fetch failed');
      const data = await res.json();
      const c = data.current;
      const da = estimateDA(c.temperature_2m, c.relative_humidity_2m, c.surface_pressure, t.elev);
      cards[i].innerHTML = `
        <span class="pill">Live Conditions</span>
        <h3>${t.name}</h3>
        <p>${t.city}</p>
        <div class="weather-metric">
          <div><span>Temp</span><b>${Math.round(c.temperature_2m)}°F</b></div>
          <div><span>Humidity</span><b>${Math.round(c.relative_humidity_2m)}%</b></div>
          <div><span>Wind</span><b>${Math.round(c.wind_speed_10m)} mph</b></div>
          <div><span>Est. DA</span><b>${da.toLocaleString()} ft</b></div>
        </div>
        <div class="button-row"><a href="${t.schedule}" target="_blank" rel="noreferrer">Track Schedule</a></div>
      `;
    }catch(err){
      cards[i].innerHTML = `
        <span class="pill">Track Conditions</span>
        <h3>${t.name}</h3>
        <p>${t.city}</p>
        <p class="error">Live weather did not load in this browser. Track schedule link still works.</p>
        <div class="button-row"><a href="${t.schedule}" target="_blank" rel="noreferrer">Track Schedule</a></div>
      `;
    }
  }));
}

function runCountdown(){
  const el = document.querySelector('.countdown');
  if(!el) return;
  const target = new Date(el.dataset.target).getTime();
  const set = () => {
    const diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff % 86400000 / 3600000);
    const m = Math.floor(diff % 3600000 / 60000);
    const s = Math.floor(diff % 60000 / 1000);
    el.querySelector('[data-days]').textContent = d;
    el.querySelector('[data-hours]').textContent = String(h).padStart(2,'0');
    el.querySelector('[data-minutes]').textContent = String(m).padStart(2,'0');
    el.querySelector('[data-seconds]').textContent = String(s).padStart(2,'0');
  };
  set(); setInterval(set, 1000);
}

document.addEventListener('DOMContentLoaded', () => { buildTrackCards(); loadWeather(); runCountdown(); });
