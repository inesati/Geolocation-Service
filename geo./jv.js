let map;
let geocoder;
let directionsService;
let directionsRenderer;

// Inicializar el mapa
function initMap() {
  geocoder = new google.maps.Geocoder();

  // Geocodificar la direccion usando el codigo de direccion
  geocoder.geocode({ address: "Avenida de Requejo, 33, 49029 Zamora" }, (results, status) => {
    if (status === "OK") {
      const location = results[0].geometry.location;// Coordenadas obtenidas de la direccion
      
      // Crear y configurar el mapa centrado en la ubicacion geocodificada
      map = new google.maps.Map(document.getElementById("map"), {
        center: location,  // Usamos las coordenadas obtenidas de la direccion
        zoom: 15,  // Nivel de zoom ajustado
      });

      new google.maps.Marker({
        map: map,
        position: location,  // Marcador en las ubicaciones 
      });

      // Inicializar los servicios para direcciones y rutas
      directionsService = new google.maps.DirectionsService();// Servicio para calcular rutas
      directionsRenderer = new google.maps.DirectionsRenderer();// Renderizador de rutas en el mapa
      directionsRenderer.setMap(map);
    } else {
      alert("No se pudo geocodificar la dirección: " + status);
    }
  });
}

window.initMap = initMap;



// Funcion para encontrar la ubicacion de una direccion
function findLocation() {
  const address = document.getElementById("address").value;// Obtener la direccion del campo de entrada
  geocoder.geocode({ address: address }, (results, status) => {
    if (status === "OK") {
      const location = results[0].geometry.location;// Coordenadas de la dirección encontrada
      map.setCenter(location);

      // Crear un marcador en la ubicacion encontrada
      new google.maps.Marker({
        map: map, // Asociar el marcador al mapa actual
        position: location,
      });

      // Registrar la consulta en el log
      logQuery(`Dirección buscada: ${address}`, location);
    } else {
      alert("No se pudo encontrar la dirección: " + status);
    }
  });
}




// Funcion para calcular la ruta entre dos ubicaciones
function calculateRoute() {
  const origin = document.getElementById("origin").value;// Obtener la ubicación de origen
  const destination = document.getElementById("destination").value;// Obtener la ubicación de destino
  const travelMode = document.getElementById("travelMode").value;

  
  directionsService.route(
    {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode[travelMode],
    },
    (response, status) => {
      if (status === "OK") {
         // Renderizar la ruta calculada en el mapa
        directionsRenderer.setDirections(response);

         // Extraer la distancia y duracion del trayecto de la respuesta
        const route = response.routes[0].legs[0];// Primer tramo de la ruta
        const distance = route.distance.text; // Distancia total
        const duration = route.duration.text; // Duracion estimada

        // Mostrar distancia y tiempo estimado en la pagina
        document.getElementById("routeDistance").textContent = distance;
        document.getElementById("routeDuration").textContent = duration;
        document.getElementById("routeResult").style.display = "block";

        // Registrar la consulta en el log
        logQuery(`Ruta de ${origin} a ${destination}`, { distance, duration });
      } else {
        alert("Error al calcular la ruta: " + status);
      }
    }
  );
}


// Funcion para guardar en el log las consultas realizadas
function logQuery(description, data) {
  // Obtener los registros previos desde el almacenamiento local, o crear un arreglo vacio si no existen
  const logs = JSON.parse(localStorage.getItem("queryLogs")) || [];
   // Añadir una nueva consulta al log con la descripcion, los datos y la marca de tiempo actual
  logs.push({ description, data, timestamp: new Date() });
  // Guardar los registros actualizados en el almacenamiento local
  localStorage.setItem("queryLogs", JSON.stringify(logs));
   // Mostrar en la consola que la consulta ha sido guardada
  console.log("Consulta guardada en el log:", { description, data });
}

// Funcion para ver el log de consultas en la consola
function showLogInPage() {
  const logs = JSON.parse(localStorage.getItem("queryLogs")) || [];
  // Obtener el contenedor donde se mostraran los registros en la pagina
  const logContainer = document.getElementById("logContainer");
   // Establecer un titulo para el historial de consultas
  logContainer.innerHTML = "<h4>Historial de Consultas:</h4>";

  // Verificar si hay registros de consultas
  if (logs.length === 0) {
    logContainer.innerHTML += "<p>No hay registros de consultas.</p>";
  } else {
     // Si hay registros, mostrarlos en la pagina
    logs.forEach((log) => {
      logContainer.innerHTML += `<p><strong>Descripción:</strong> ${log.description}<br>
      <strong>Datos:</strong> ${JSON.stringify(log.data)}<br>
      <strong>Fecha:</strong> ${log.timestamp}</p><hr>`;
    });
  }
}
