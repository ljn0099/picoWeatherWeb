// ====== Configuration ======
const API_HOST = 'https://api.picoweather.net'; // API hostname variable

// ====== Initialize Flatpickr ======
const granularitySelect = document.getElementById('granularitySelect');
const startInput = document.getElementById('startTimestamp');
const endInput = document.getElementById('endTimestamp');

// Function to get current date/time in YYYY-MM-DD HH:mm format
function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// Function to get date/time 6 hours ago in YYYY-MM-DD HH:mm format
function getSixHoursAgoDateTime() {
  const now = new Date();
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  const year = sixHoursAgo.getFullYear();
  const month = String(sixHoursAgo.getMonth() + 1).padStart(2, '0');
  const day = String(sixHoursAgo.getDate()).padStart(2, '0');
  const hours = String(sixHoursAgo.getHours()).padStart(2, '0');
  const minutes = String(sixHoursAgo.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// Set default values in inputs
const startDefault = getSixHoursAgoDateTime();
const endDefault = getCurrentDateTime();

startInput.value = startDefault;
endInput.value = endDefault;

let startPicker = flatpickr(startInput, {
  enableTime: true,
  dateFormat: "Y-m-d H:i",
  time_24hr: true,
  locale: "es",
  defaultDate: startDefault
});

let endPicker = flatpickr(endInput, {
  enableTime: true,
  dateFormat: "Y-m-d H:i",
  time_24hr: true,
  locale: "es",
  defaultDate: endDefault
});

// ====== Timezones ======
const timezoneSelect = document.getElementById('timezone');
const timezones = Intl.supportedValuesOf("timeZone");
timezones.forEach(tz => {
  const option = document.createElement('option');
  option.value = tz;
  option.text = tz.replace("_", " ");
  timezoneSelect.appendChild(option);
});
timezoneSelect.value = Intl.DateTimeFormat().resolvedOptions().timeZone;

// ====== Stations ======
const stationSelect = document.getElementById('stationSelect');
fetch(`${API_HOST}/stations`)
  .then(res => res.json())
  .then(stations => {
    let options = '';
    stations.forEach(station => {
      options += `<option value="${station.uuid}">${station.name}</option>`;
    });
    stationSelect.innerHTML = options;
  })
  .catch(err => console.error('Error loading stations:', err));

// ====== Fields by granularity ======
const fieldsByGranularity = {
  raw: 'temperature,humidity,pressure,lux,uvi,wind_speed,wind_direction,gust_speed,gust_direction,rainfall,solar_irradiance',
  hour: 'avg_temperature,avg_humidity,avg_pressure,sum_rainfall,stddev_rainfall,avg_wind_speed,avg_wind_direction,stddev_wind_speed,max_gust_speed,max_gust_direction,avg_lux,avg_uvi,avg_solar_irradiance',
  day: 'max_temperature,min_temperature,avg_temperature,stddev_temperature,max_humidity,min_humidity,avg_humidity,stddev_humidity,max_pressure,min_pressure,avg_pressure,sum_rainfall,stddev_rainfall,avg_wind_speed,avg_wind_direction,stddev_wind_speed,max_gust_speed,max_gust_direction,max_lux,avg_lux,max_uvi,avg_uvi,avg_solar_irradiance,wind_run',
  month: 'max_temperature,min_temperature,avg_temperature,stddev_temperature,max_humidity,min_humidity,avg_humidity,stddev_humidity,max_pressure,min_pressure,avg_pressure,sum_rainfall,stddev_rainfall,avg_wind_speed,avg_wind_direction,stddev_wind_speed,max_gust_speed,max_gust_direction,max_lux,avg_lux,max_uvi,avg_uvi,avg_solar_irradiance',
  year: 'max_temperature,min_temperature,avg_temperature,stddev_temperature,max_humidity,min_humidity,avg_humidity,stddev_humidity,max_pressure,min_pressure,avg_pressure,sum_rainfall,stddev_rainfall,avg_wind_speed,avg_wind_direction,stddev_wind_speed,max_gust_speed,max_gust_direction,max_lux,avg_lux,max_uvi,avg_uvi,avg_solar_irradiance'
};

// ====== Field names and units mapping ======
const fieldMap = {
  // Temperature fields
  temperature: { label: "Temperature", unit: "°C" },
  avg_temperature: { label: "Avg. temperature", unit: "°C" },
  max_temperature: { label: "Max. temperature", unit: "°C" },
  min_temperature: { label: "Min. temperature", unit: "°C" },
  stddev_temperature: { label: "Temperature std. deviation", unit: "°C" },
  
  // Humidity fields
  humidity: { label: "Humidity", unit: "%" },
  avg_humidity: { label: "Avg. humidity", unit: "%" },
  max_humidity: { label: "Max. humidity", unit: "%" },
  min_humidity: { label: "Min. humidity", unit: "%" },
  stddev_humidity: { label: "Humidity std. deviation", unit: "%" },
  
  // Pressure fields
  pressure: { label: "Pressure", unit: "hPa" },
  avg_pressure: { label: "Avg. pressure", unit: "hPa" },
  max_pressure: { label: "Max. pressure", unit: "hPa" },
  min_pressure: { label: "Min. pressure", unit: "hPa" },
  
  // Lux fields
  lux: { label: "Luminosity", unit: "lx" },
  avg_lux: { label: "Avg. luminosity", unit: "lx" },
  max_lux: { label: "Max. luminosity", unit: "lx" },
  
  // UV Index fields
  uvi: { label: "UV Index", unit: "" },
  avg_uvi: { label: "Avg. UV Index", unit: "" },
  max_uvi: { label: "Max. UV Index", unit: "" },
  
  // Wind speed fields
  wind_speed: { label: "Wind speed", unit: "km/h" },
  avg_wind_speed: { label: "Avg. wind speed", unit: "km/h" },
  stddev_wind_speed: { label: "Wind speed std. deviation", unit: "km/h" },
  
  // Wind direction fields
  wind_direction: { label: "Wind direction", unit: "°" },
  avg_wind_direction: { label: "Avg. wind direction", unit: "°" },
  
  // Gust fields
  gust_speed: { label: "Gust speed", unit: "km/h" },
  max_gust_speed: { label: "Max. gust speed", unit: "km/h" },
  gust_direction: { label: "Gust direction", unit: "°" },
  max_gust_direction: { label: "Max. gust direction", unit: "°" },
  
  // Rainfall fields
  rainfall: { label: "Rainfall", unit: "mm" },
  sum_rainfall: { label: "Total rainfall", unit: "mm" },
  stddev_rainfall: { label: "Rainfall std. deviation", unit: "mm" },
  
  // Solar irradiance fields
  solar_irradiance: { label: "Solar irradiance", unit: "W/m2" },
  avg_solar_irradiance: { label: "Avg. solar irradiance", unit: "W/m2" },
  
  // Wind run field
  wind_run: { label: "Wind run", unit: "km" }
};

// ====== Field selector with Choices.js ======
const fieldsSelect = document.getElementById('fieldsSelect');
const choices = new Choices(fieldsSelect, {
  removeItemButton: true,
  searchEnabled: true,
  shouldSort: false
});

function updateFieldsOptions(granularity) {
  if (granularity === 'mixed') {
    const allFields = Object.keys(fieldMap);
    choices.clearStore();
    const newChoices = allFields.map(f => ({ value: f, label: fieldMap[f].label, selected: true }));
    choices.setChoices(newChoices, 'value', 'label', true);
    return;
  }

  const fields = fieldsByGranularity[granularity].split(',');
  choices.clearStore();
  const newChoices = fields.map(f => ({ value: f, label: (fieldMap[f]?.label || f.replace(/_/g, ' ')), selected: true }));
  choices.setChoices(newChoices, 'value', 'label', true);
}

// Initialize fields on page load
updateFieldsOptions(granularitySelect.value);

// Function to adjust flatpickr based on granularity
function updatePickersForGranularity(gran) {
  switch (gran) {
    case 'raw':
      startPicker.set('enableTime', true); startPicker.set('dateFormat', "Y-m-d H:i");
      endPicker.set('enableTime', true); endPicker.set('dateFormat', "Y-m-d H:i");
      break;
    case 'hour':
      startPicker.set('enableTime', true); startPicker.set('dateFormat', "Y-m-d H:00");
      endPicker.set('enableTime', true); endPicker.set('dateFormat', "Y-m-d H:00");
      break;
    case 'day':
      startPicker.set('enableTime', false); startPicker.set('dateFormat', "Y-m-d");
      endPicker.set('enableTime', false); endPicker.set('dateFormat', "Y-m-d");
      break;
    case 'month':
      startPicker.set('enableTime', false); startPicker.set('dateFormat', "Y-m");
      endPicker.set('enableTime', false); endPicker.set('dateFormat', "Y-m");
      break;
    case 'year':
      startPicker.set('enableTime', false); startPicker.set('dateFormat', "Y");
      endPicker.set('enableTime', false); endPicker.set('dateFormat', "Y");
      break;
    case 'mixed':
      startPicker.set('enableTime', true); startPicker.set('dateFormat', "Y-m-d H:i");
      endPicker.set('enableTime', true); endPicker.set('dateFormat', "Y-m-d H:i");
      break;
  }
}

// ====== Apply on page load ======
updatePickersForGranularity(granularitySelect.value);

// ====== Also when changing granularity ======
granularitySelect.addEventListener('change', () => {
  const gran = granularitySelect.value;
  updateFieldsOptions(gran);
  updatePickersForGranularity(gran);
});

function normalizeDateForGranularity(value, granularity, isStart=true) {
  if (!value) return '';
  let d;
  switch(granularity) {
    case 'month': {
      // Add first or last day of the month
      const [year, month] = value.split('-').map(Number);
      const day = isStart ? 1 : new Date(year, month, 0).getDate(); // last day of month
      d = new Date(year, month-1, day, isStart ? 0 : 23, isStart ? 0 : 59, isStart ? 0 : 59);
      break;
    }
    case 'year': {
      const year = Number(value);
      const month = isStart ? 0 : 11;
      const day = isStart ? 1 : 31;
      d = new Date(year, month, day, isStart ? 0 : 23, isStart ? 0 : 59, isStart ? 0 : 59);
      break;
    }
    default:
      d = new Date(value);
  }
  return d.toISOString(); // full UTC format
}

// ====== Messages ======
function showMessage(type, text) {
  const messagesDiv = document.getElementById('messages');
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.role = "alert";
  alertDiv.innerHTML = `
    ${text}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  messagesDiv.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 5000);
}

// ====== Rendering using _gran to display granularity ======
function renderDataWithGranularity(dataArray) {
  const resultsDiv = document.getElementById('results');       
  resultsDiv.innerHTML = ''; 
  if (dataArray.length === 0) {                                             
    resultsDiv.innerHTML = '<p>No data for this range.</p>';
    return;                             
  }                              

  const granColors = {
    raw: '#fdae61',    // orange
    hour: '#66c2a5',   // teal
    day: '#3288bd',    // blue
    month: '#d53e4f',  // red
    year: '#9e9ac8'    // purple
  };

  // Light background colors for card
  const cardBgColors = {
    raw: '#fff3e0',    // light orange
    hour: '#e0f7f1',   // light teal
    day: '#e6f0ff',    // light blue
    month: '#fde0e0',  // light red
    year: '#d6cfea'    // light purple
  };

  dataArray.forEach(item => {                                             
    const card = document.createElement('div'); 
    card.className = 'card shadow-sm';

    // Assign light background based on granularity
    card.style.backgroundColor = cardBgColors[item._gran] || '#f0f0f0';

    // Label and color for badge
    const granLabel = item._gran === 'raw' ? 'Raw' :
                      item._gran === 'hour' ? 'Hourly' :
                      item._gran === 'day' ? 'Daily' :
                      item._gran === 'month' ? 'Monthly' :
                      item._gran === 'year' ? 'Yearly' :
                      'Unknown';

    const badgeColor = granColors[item._gran] || '#888';

    const badgeHTML = `<span class="gran-badge" style="
      background-color: ${badgeColor}; 
      color: white;
      padding: 4px 8px; 
      border-radius: 6px; 
      font-size: 0.75rem;
      margin-left: 8px;
      font-weight: 600;
      display: inline-block;
    ">${granLabel}</span>`;

    let innerHTML = `<div class="card-body">                      
      <h6 class="card-subtitle mb-2">
        ${item.period_start} → ${item.period_end} ${badgeHTML}
      </h6>                                                                        
      <div class="row g-2">`;                            

    for (const [key, value] of Object.entries(item)) {
      if (key === 'period_start' || key === 'period_end' || key === '_gran') continue;
      const field = fieldMap[key];                                
      const label = field ? field.label : key.replace(/_/g, ' ');
      const unit = field ? field.unit : '';                                         
      let displayValue = (!isNaN(value) && value !== null) ? Number(value).toFixed(2) : value;
      innerHTML += `<div class="col-12 col-sm-6 col-lg-3"><strong>${label}:</strong> ${displayValue} ${unit}</div>`;
    }                                                

    innerHTML += `</div></div>`;                      
    card.innerHTML = innerHTML;                 
    resultsDiv.appendChild(card);                                                
  });                                                  
}

// ====== Search data ======
document.getElementById('searchBtn').addEventListener('click', async () => {
  const stationId = stationSelect.value;
  const timezone = timezoneSelect.value;
  const granularity = granularitySelect.value;
  const start = normalizeDateForGranularity(startInput.value, granularity, true);
  const end = normalizeDateForGranularity(endInput.value, granularity, false);

  if (!stationId || !timezone || !start || !end) {
    showMessage('warning', 'Please select station, timezone and date range.');
    return;
  }

  const selectedOptions = Array.from(fieldsSelect.selectedOptions).map(opt => opt.value);
  if (selectedOptions.length === 0) {
    showMessage('warning', 'You must select at least one field.');
    return;
  }
  const fields = selectedOptions.join(',');

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = ''; // Clear results before searching

  // ======= MIXED logic =======
  if (granularity === 'mixed') {
    const dailyUrl = new URL(`${API_HOST}/stations/${stationId}/data`);
    dailyUrl.searchParams.append('timezone', timezone);
    dailyUrl.searchParams.append('start_time', start);
    dailyUrl.searchParams.append('end_time', end);
    dailyUrl.searchParams.append('granularity', 'day');
    dailyUrl.searchParams.append('fields', fields);

    const hourlyUrl = new URL(`${API_HOST}/stations/${stationId}/data`);
    hourlyUrl.searchParams.append('timezone', timezone);
    hourlyUrl.searchParams.append('start_time', start);
    hourlyUrl.searchParams.append('end_time', end);
    hourlyUrl.searchParams.append('granularity', 'hour');
    hourlyUrl.searchParams.append('fields', fields);

    const rawUrl = new URL(`${API_HOST}/stations/${stationId}/data`);
    rawUrl.searchParams.append('timezone', timezone);
    rawUrl.searchParams.append('start_time', start);
    rawUrl.searchParams.append('end_time', end);
    rawUrl.searchParams.append('granularity', 'raw');
    rawUrl.searchParams.append('fields', fields);

    try {
      const [dailyData, hourlyData, rawData] = await Promise.all([
        fetch(dailyUrl).then(r => r.json()),
        fetch(hourlyUrl).then(r => r.json()),
        fetch(rawUrl).then(r => r.json())
      ]);

      const combined = [];

      // 1. Sort days descending
      const sortedDaily = dailyData.sort((a, b) => 
        new Date(b.period_start) - new Date(a.period_start)
      );

      // 2. Sort hourly descending
      const sortedHourly = hourlyData.sort((a, b) => 
        new Date(b.period_start) - new Date(a.period_start)
      );

      // 3. Sort raw descending
      const sortedRaw = rawData.sort((a, b) => 
        new Date(b.period_start) - new Date(a.period_start)
      );

      // 4. For each day
      sortedDaily.forEach(day => {
        // Add daily summary first
        combined.push({ ...day, _gran: 'day' });

        const dayStart = new Date(day.period_start);
        const dayEnd = new Date(day.period_end);

        // 5. For each hour within this day
        sortedHourly.forEach(hour => {
          const hourStart = new Date(hour.period_start);
          if (hourStart >= dayStart && hourStart < dayEnd) {
            // Add hourly summary
            combined.push({ ...hour, _gran: 'hour' });

            // 6. Find and add ALL raw data within this specific hour
            const hourStartTime = hourStart.getTime();
            const hourEndTime = new Date(hour.period_end).getTime();

            sortedRaw.forEach(raw => {
              const rawStart = new Date(raw.period_start);
              const rawStartTime = rawStart.getTime();
              
              // If raw data is within this exact hour
              if (rawStartTime >= hourStartTime && rawStartTime < hourEndTime) {
                combined.push({ ...raw, _gran: 'raw' });
              }
            });
          }
        });
      });

      // 7. Render
      renderDataWithGranularity(combined);

    } catch (err) {
      console.error(err);
      showMessage('danger', 'Error fetching mixed data.');
    }

    return;
  }

  // ======= Normal logic for raw/hour/day/month/year =======
  const url = new URL(`${API_HOST}/stations/${stationId}/data`);
  url.searchParams.append('timezone', timezone);
  url.searchParams.append('start_time', start);
  url.searchParams.append('end_time', end);
  url.searchParams.append('granularity', granularity);
  url.searchParams.append('fields', fields);

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Server response error');
    const data = await res.json();
    // Sort descending for non-mixed granularities
    data.sort((a, b) => new Date(b.period_start) - new Date(a.period_start));
    renderDataWithGranularity(data.map(d => ({ ...d, _gran: granularity })));
  } catch (err) {
    console.error(err);
    showMessage('danger', 'Error fetching data.');
  }
});
