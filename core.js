// Tu túnel activo
//const API_URL = 'https://panel.theadriano.com';
const API_URL = 'panel.curvainfinitacentral.com';

async function consultarRadar() {
  const radarDiv = document.getElementById('radar-datos');
  const countSpan = document.getElementById('dimensiones-count');
  const estadoTexto = document.getElementById('estado-texto');
  
  try {
    const respuesta = await fetch(`${API_URL}/api/subbots_stats`);
    const datos = await respuesta.json();
    
    if (datos.success) {
      estadoTexto.innerText = "CONECTADO AL MULTIVERSO";
      estadoTexto.style.color = "#00ffcc";
      countSpan.innerText = datos.totalActivos;
      
      // Aquí puedes mapear tu tabla si tienes bots activos
      if (datos.totalActivos === 0) {
        radarDiv.innerHTML = '<p style="color: #888;">No hay Sub-Bots activos en este momento.</p>';
      } else {
        radarDiv.innerHTML = `<p style="color: #00ffcc;">Detectadas ${datos.totalActivos} firmas activas.</p>`;
        // Si tu API devuelve un array, aquí armas el HTML de la lista
      }
    }
  } catch (error) {
    estadoTexto.innerText = "ERROR DE CONEXIÓN CON EL NÚCLEO";
    estadoTexto.style.color = "#ff4444";
    radarDiv.innerHTML = '<p style="color: #ff4444;">No se pudo contactar al servidor de Termux.</p>';
  }
}

// Iniciar radar al cargar y refrescar cada 5 segundos
consultarRadar();
setInterval(consultarRadar, 5000);
