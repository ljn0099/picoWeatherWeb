// ====== Inicializar Flatpickr ======
const granularitySelect = document.getElementById('granularitySelect');
const startInput = document.getElementById('startTimestamp');
const endInput = document.getElementById('endTimestamp');

let startPicker = flatpickr(startInput, {
  enableTime: true,
  dateFormat: "Y-m-d H:i",
  time_24hr: true,
  locale: "es"
});

let endPicker = flatpickr(endInput, {
  enableTime: true,
  dateFormat: "Y-m-d H:i",
  time_24hr: true,
  locale: "es"
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
fetch('http://localhost:8080/stations')
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
  const fields = fieldsByGranularity[granularity].split(',');

  choices.clearStore();
  const newChoices = fields.map(f => ({ value: f, label: (fieldMap[f]?.label || f.replace(/_/g, ' ')), selected: true }));
  choices.setChoices(newChoices, 'value', 'label', true);
}

// Inicializar fields al cargar la página
updateFieldsOptions(granularitySelect.value);

// ====== Cambiar fields y formato de fechas al cambiar granularidad ======
granularitySelect.addEventListener('change', () => {
  const gran = granularitySelect.value;
  updateFieldsOptions(gran);

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
  }
});

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

// ====== Buscar datos ======
document.getElementById('searchBtn').addEventListener('click', async () => {
  const stationId = stationSelect.value;
  const timezone = timezoneSelect.value;
  const start = startInput.value;
  const end = endInput.value;
  const granularity = granularitySelect.value;

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = ''; // Limpiar resultados antes de buscar

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

  const url = new URL(`http://localhost:8080/stations/${stationId}/data`);
  url.searchParams.append('timezone', timezone);
  url.searchParams.append('start_time', start);
  url.searchParams.append('end_time', end);
  url.searchParams.append('granularity', granularity);
  url.searchParams.append('fields', fields);

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error en la respuesta del servidor');
    const data = await res.json();

    if (data.length === 0) {
      resultsDiv.innerHTML = '<p>No hay datos para este rango.</p>';
      return;
    }

    data.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card shadow-sm';
      let innerHTML = `
        <div class="card-body">
          <h6 class="card-subtitle mb-2 text-muted">${item.period_start} → ${item.period_end}</h6>
          <div class="row g-2">
      `;

      for (const [key, value] of Object.entries(item)) {
        if (key === 'period_start' || key === 'period_end') continue;

        const field = fieldMap[key];
        const label = field ? field.label : key.replace(/_/g, ' ');
        const unit = field ? field.unit : '';

        let displayValue = value;
        if (!isNaN(value) && value !== null) displayValue = Number(value).toFixed(2);

        innerHTML += `<div class="col-12 col-sm-6 col-lg-3"><strong>${label}:</strong> ${displayValue} ${unit}</div>`;
      }

      innerHTML += `</div></div>`;
      card.innerHTML = innerHTML;
      resultsDiv.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    resultsDiv.innerHTML = '';
    showMessage('danger', 'Error al buscar datos.');
  }
});
