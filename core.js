const API_URL = 'https://panel.theadriano.com.curvacentral.site';

function calcularUptime(msInicio) {
    const diff = Date.now() - msInicio;
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (horas > 0) return `${horas}h ${minutos}m`;
    return `${minutos}m`;
}

async function actualizarRadar() {
    try {
        const res = await fetch(`${API_URL}/api/subbots_stats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        
        if (!res.ok) throw new Error(`Conexión interrumpida`);
        
        const data = await res.json();
        
        if (data.success) {
            document.getElementById('total_bots').innerText = data.totalActivos;
            const tbody = document.getElementById('tabla_bots');
            
            if (data.totalActivos === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: #555;">No hay dimensiones activas en el radar.</td></tr>`;
                return;
            }

            tbody.innerHTML = ""; 
            
            data.bots.forEach(bot => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="color: var(--text-main); font-weight: bold;">${bot.id}</td>
                    <td class="stats-ok">${bot.firmaWTK}</td>
                    <td style="color: #aaa;">${calcularUptime(bot.uptime)}</td>
                    <td class="stats-ok" style="font-weight: bold;">${bot.stats.comandosUsados}</td>
                    <td class="${bot.stats.errores > 0 ? 'stats-err' : ''}">${bot.stats.errores}</td>
                    <td><a href="https://wa.me/${bot.id}" target="_blank" class="btn-wa">ABRIR CHAT</a></td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        document.getElementById('tabla_bots').innerHTML = `<tr><td colspan="6" class="stats-err" style="text-align:center;">STATUS: ERROR DE CONEXIÓN CON EL NÚCLEO (TERMUX APAGADO)</td></tr>`;
        document.getElementById('total_bots').innerText = "0";
    }
}

async function solicitarCodigo() {
    const numero = document.getElementById('input_numero').value.replace(/\D/g, '');
    if (!numero) return alert("Ingresa un número válido para viajar entre dimensiones.");
    
    const box = document.getElementById('codigo_generado');
    const texto = document.getElementById('pairing_text');
    
    box.style.display = "block";
    texto.innerText = "ENVIANDO PETICIÓN...";
    
    try {
        const resInicio = await fetch(`${API_URL}/api/generar_codigo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ numero: numero })
        });

        if (!resInicio.ok) throw new Error("Error interno");
        texto.innerText = "SINTONIZANDO WHATSAPP...";

        const intervalo = setInterval(async () => {
            try {
                const res = await fetch(`${API_URL}/api/leer_codigo`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: numero })
                });
                const data = await res.json();
                
                if (data.success && data.codigo) {
                    texto.innerText = data.codigo;
                    clearInterval(intervalo);
                }
            } catch(e) {}
        }, 2000);

        setTimeout(() => {
            clearInterval(intervalo);
            if(texto.innerText === "SINTONIZANDO WHATSAPP...") {
                texto.innerText = "TIMEOUT - REINICIAR PROCESO";
            }
        }, 30000);

    } catch (e) {
        texto.innerText = "ERROR - DIMENSIÓN INACCESIBLE";
    }
}

actualizarRadar();
setInterval(actualizarRadar, 3000); 
