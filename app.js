// ====== Inicializar Flatpickr ======
const granularitySelect = document.getElementById('granularitySelect');
const startInput = document.getElementById('startTimestamp');
const endInput = document.getElementById('endTimestamp');

// Función para obtener fecha actual en formato YYYY-MM-DD HH:mm
function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// Función para obtener fecha hace 6 horas en formato YYYY-MM-DD HH:mm
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

// Establecer valores iniciales en los inputs
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

// ====== Estaciones ======
const stationSelect = document.getElementById('stationSelect');
fetch('https://api.picoweather.net/stations')
  .then(res => res.json())
  .then(stations => {
    let options = '';
    stations.forEach(station => {
      options += `<option value="${station.uuid}">${station.name}</option>`;
    });
    stationSelect.innerHTML = options;
  })
  .catch(err => console.error('Error cargando estaciones:', err));

// ====== Fields por granularidad ======
const fieldsByGranularity = {
  raw: 'temperature,humidity,pressure,lux,uvi,wind_speed,wind_direction,gust_speed,gust_direction,rainfall,solar_irradiance',
  hour: 'avg_temperature,avg_humidity,avg_pressure,sum_rainfall,stddev_rainfall,avg_wind_speed,avg_wind_direction,stddev_wind_speed,max_gust_speed,max_gust_direction,avg_lux,avg_uvi,avg_solar_irradiance',
  day: 'max_temperature,min_temperature,avg_temperature,stddev_temperature,max_humidity,min_humidity,avg_humidity,stddev_humidity,max_pressure,min_pressure,avg_pressure,sum_rainfall,stddev_rainfall,avg_wind_speed,avg_wind_direction,stddev_wind_speed,max_gust_speed,max_gust_direction,max_lux,avg_lux,max_uvi,avg_uvi,avg_solar_irradiance,wind_run',
  month: 'max_temperature,min_temperature,avg_temperature,stddev_temperature,max_humidity,min_humidity,avg_humidity,stddev_humidity,max_pressure,min_pressure,avg_pressure,sum_rainfall,stddev_rainfall,avg_wind_speed,avg_wind_direction,stddev_wind_speed,max_gust_speed,max_gust_direction,max_lux,avg_lux,max_uvi,avg_uvi,avg_solar_irradiance',
  year: 'max_temperature,min_temperature,avg_temperature,stddev_temperature,max_humidity,min_humidity,avg_humidity,stddev_humidity,max_pressure,min_pressure,avg_pressure,sum_rainfall,stddev_rainfall,avg_wind_speed,avg_wind_direction,stddev_wind_speed,max_gust_speed,max_gust_direction,max_lux,avg_lux,max_uvi,avg_uvi,avg_solar_irradiance'
};

// ====== Mapeo de nombres y unidades ======
const fieldMap = {
  temperature: { label: "Temperatura", unit: "°C" },
  avg_temperature: { label: "Temperatura media", unit: "°C" },
  max_temperature: { label: "Máx. temperatura", unit: "°C" },
  min_temperature: { label: "Mín. temperatura", unit: "°C" },
  humidity: { label: "Humedad", unit: "%" },
  avg_humidity: { label: "Humedad media", unit: "%" },
  max_humidity: { label: "Humedad máxima", unit: "%" },
  min_humidity: { label: "Humedad mínima", unit: "%" },
  pressure: { label: "Presión", unit: "hPa" },
  avg_pressure: { label: "Presión media", unit: "hPa" },
  max_pressure: { label: "Presión máxima", unit: "hPa" },
  min_pressure: { label: "Presión mínima", unit: "hPa" },
  lux: { label: "Luminosidad", unit: "lx" },
  avg_lux: { label: "Luminosidad media", unit: "lx" },
  uvi: { label: "Índice UV", unit: "" },
  avg_uvi: { label: "Índice UV medio", unit: "" },
  wind_speed: { label: "Velocidad viento", unit: "m/s" },
  avg_wind_speed: { label: "Velocidad media viento", unit: "m/s" },
  wind_direction: { label: "Dirección viento", unit: "°" },
  avg_wind_direction: { label: "Dirección media viento", unit: "°" },
  gust_speed: { label: "Ráfaga", unit: "m/s" },
  max_gust_speed: { label: "Ráfaga máxima", unit: "m/s" },
  gust_direction: { label: "Dirección ráfaga", unit: "°" },
  max_gust_direction: { label: "Dirección ráfaga máxima", unit: "°" },
  rainfall: { label: "Lluvia", unit: "mm" },
  sum_rainfall: { label: "Lluvia total", unit: "mm" },
  stddev_rainfall: { label: "Desviación lluvia", unit: "mm" },
  solar_irradiance: { label: "Irradiancia solar", unit: "W/m²" },
  avg_solar_irradiance: { label: "Irradiancia solar media", unit: "W/m²" },
  wind_run: { label: "Wind run", unit: "km"}
};

// ====== Selector de fields con Choices.js ======
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

// Inicializar fields al cargar la página
updateFieldsOptions(granularitySelect.value);

// Función para ajustar flatpickr según granularidad
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

// ====== Aplicar al cargar la página ======
updatePickersForGranularity(granularitySelect.value);

// ====== También al cambiar granularidad ======
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
      // Añadir primer día o último día del mes
      const [year, month] = value.split('-').map(Number);
      const day = isStart ? 1 : new Date(year, month, 0).getDate(); // último día del mes
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
  return d.toISOString(); // formato completo UTC
}

// ====== Mensajes ======
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

// ====== Renderizado usando _gran para mostrar la granularidad ======
function renderDataWithGranularity(dataArray) {
  const resultsDiv = document.getElementById('results');       
  resultsDiv.innerHTML = ''; 
  if (dataArray.length === 0) {                                             
    resultsDiv.innerHTML = '<p>No hay datos para este rango.</p>';
    return;                             
  }                              

  const granColors = {
    raw: '#fdae61',    // naranja
    hour: '#66c2a5',   // verde azulado
    day: '#3288bd',    // azul
    month: '#d53e4f',  // rojo intenso
    year: '#9e9ac8'    // morado
  };

  // Colores claritos para fondo del card
  const cardBgColors = {
    raw: '#fff3e0',    // naranja clarito
    hour: '#e0f7f1',   // verde clarito
    day: '#e6f0ff',    // azul clarito
    month: '#fde0e0',  // rojo clarito
    year: '#d6cfea'    // morado clarito
  };

  dataArray.forEach(item => {                                             
    const card = document.createElement('div'); 
    card.className = 'card shadow-sm';

    // Asignar fondo clarito según granularidad
    card.style.backgroundColor = cardBgColors[item._gran] || '#f0f0f0';

    // Label y color para badge
    const granLabel = item._gran === 'raw' ? 'Raw' :
                      item._gran === 'hour' ? 'Horario' :
                      item._gran === 'day' ? 'Diario' :
                      item._gran === 'month' ? 'Mensual' :
                      item._gran === 'year' ? 'Anual' :
                      'Desconocido';

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

// ====== Buscar datos ======
document.getElementById('searchBtn').addEventListener('click', async () => {
  const stationId = stationSelect.value;
  const timezone = timezoneSelect.value;
  const granularity = granularitySelect.value;
  const start = normalizeDateForGranularity(startInput.value, granularity, true);
  const end = normalizeDateForGranularity(endInput.value, granularity, false);

  if (!stationId || !timezone || !start || !end) {
    showMessage('warning', 'Por favor selecciona estación, zona horaria y rango de fechas.');
    return;
  }

  const selectedOptions = Array.from(fieldsSelect.selectedOptions).map(opt => opt.value);
  if (selectedOptions.length === 0) {
    showMessage('warning', 'Debes seleccionar al menos un campo.');
    return;
  }
  const fields = selectedOptions.join(',');

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = ''; // Limpiar resultados antes de buscar

  // ======= Lógica MIXED =======
  if (granularity === 'mixed') {
    const dailyUrl = new URL(`https://api.picoweather.net/stations/${stationId}/data`);
    dailyUrl.searchParams.append('timezone', timezone);
    dailyUrl.searchParams.append('start_time', start);
    dailyUrl.searchParams.append('end_time', end);
    dailyUrl.searchParams.append('granularity', 'day');
    dailyUrl.searchParams.append('fields', fields);

    const hourlyUrl = new URL(`https://api.picoweather.net/stations/${stationId}/data`);
    hourlyUrl.searchParams.append('timezone', timezone);
    hourlyUrl.searchParams.append('start_time', start);
    hourlyUrl.searchParams.append('end_time', end);
    hourlyUrl.searchParams.append('granularity', 'hour');
    hourlyUrl.searchParams.append('fields', fields);

    const rawUrl = new URL(`https://api.picoweather.net/stations/${stationId}/data`);
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

      // 1. Ordenar días descendente
      const sortedDaily = dailyData.sort((a, b) => 
        new Date(b.period_start) - new Date(a.period_start)
      );

      // 2. Ordenar horarios descendente
      const sortedHourly = hourlyData.sort((a, b) => 
        new Date(b.period_start) - new Date(a.period_start)
      );

      // 3. Ordenar raw descendente
      const sortedRaw = rawData.sort((a, b) => 
        new Date(b.period_start) - new Date(a.period_start)
      );

      // 4. Para cada día
      sortedDaily.forEach(day => {
        // Añadir el resumen diario primero
        combined.push({ ...day, _gran: 'day' });

        const dayStart = new Date(day.period_start);
        const dayEnd = new Date(day.period_end);

        // 5. Para cada horario dentro de este día
        sortedHourly.forEach(hour => {
          const hourStart = new Date(hour.period_start);
          if (hourStart >= dayStart && hourStart < dayEnd) {
            // Añadir el resumen horario
            combined.push({ ...hour, _gran: 'hour' });

            // 6. Buscar y añadir TODOS los raw dentro de esta hora específica
            const hourStartTime = hourStart.getTime();
            const hourEndTime = new Date(hour.period_end).getTime();

            sortedRaw.forEach(raw => {
              const rawStart = new Date(raw.period_start);
              const rawStartTime = rawStart.getTime();
              
              // Si el raw está dentro de esta hora exacta
              if (rawStartTime >= hourStartTime && rawStartTime < hourEndTime) {
                combined.push({ ...raw, _gran: 'raw' });
              }
            });
          }
        });
      });

      // 7. Renderizar
      renderDataWithGranularity(combined);

    } catch (err) {
      console.error(err);
      showMessage('danger', 'Error al buscar datos mixtos.');
    }

    return;
  }

  // ======= Lógica normal para raw/hour/day/month/year =======
  const url = new URL(`https://api.picoweather.net/stations/${stationId}/data`);
  url.searchParams.append('timezone', timezone);
  url.searchParams.append('start_time', start);
  url.searchParams.append('end_time', end);
  url.searchParams.append('granularity', granularity);
  url.searchParams.append('fields', fields);

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error en la respuesta del servidor');
    const data = await res.json();
    // Ordenar descendente para granularidades no mixtas
    data.sort((a, b) => new Date(b.period_start) - new Date(a.period_start));
    renderDataWithGranularity(data.map(d => ({ ...d, _gran: granularity })));
  } catch (err) {
    console.error(err);
    showMessage('danger', 'Error al buscar datos.');
  }
});
