let serverTimeMinutes = 0;
let isServerCreated = false;

// Converte HH:MM para total de minutos desde a meia-noite
function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    let [h, m] = timeStr.split(':').map(Number);
    return (h * 60) + m;
}

// Converte total de minutos de volta para formato HH:MM
function minutesToTime(minutes) {
    // Lida com minutos negativos (ajustes de meia-noite)
    if (minutes < 0) minutes += 24 * 60;
    minutes = Math.round(minutes) % (24 * 60);
    
    let h = Math.floor(minutes / 60).toString().padStart(2, '0');
    let m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
}

// Formata a exibição do ajuste (+5 min, -3 min)
function formatAdjustment(diff) {
    let sign = diff > 0 ? "+" : (diff < 0 ? "-" : "");
    return `${sign}${Math.abs(Math.round(diff))} minutos`;
}

function criarServidor() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    const timeStr = `${h}:${m}`;
    
    serverTimeMinutes = timeToMinutes(timeStr);
    document.getElementById('lbl-servidor-hora').innerText = timeStr;
    isServerCreated = true;
}

function sincronizar() {
    if (!isServerCreated) {
        alert("Por favor, crie o Servidor primeiro para obter a hora do computador!");
        return;
    }

    // 1. Coleta dados da UI
    let c1_loc_str = document.getElementById('c1-local').value;
    let c2_loc_str = document.getElementById('c2-local').value;
    let c3_loc_str = document.getElementById('c3-local').value;

    let c1_env_str = document.getElementById('c1-envio').value;
    let c2_env_str = document.getElementById('c2-envio').value;
    let c3_env_str = document.getElementById('c3-envio').value;

    if (!c1_loc_str || !c2_loc_str || !c3_loc_str || !c1_env_str || !c2_env_str || !c3_env_str) {
        alert("Por favor, preencha todas as horas locais e horas de envio dos 3 clientes.");
        return;
    }

    let c1_loc = timeToMinutes(c1_loc_str);
    let c2_loc = timeToMinutes(c2_loc_str);
    let c3_loc = timeToMinutes(c3_loc_str);

    let c1_env = timeToMinutes(c1_env_str);
    let c2_env = timeToMinutes(c2_env_str);
    let c3_env = timeToMinutes(c3_env_str);

    // 2. Calcula a Hora Média (Clock Lógico / Berkeley)
    let averageTime = (serverTimeMinutes + c1_loc + c2_loc + c3_loc) / 4;

    // 3. Calcula a diferença (Ajuste) para cada nó: Ajuste = Media - Tempo Local
    let adj_s = averageTime - serverTimeMinutes;
    let adj_c1 = averageTime - c1_loc;
    let adj_c2 = averageTime - c2_loc;
    let adj_c3 = averageTime - c3_loc;

    // 4. Ordenação dos processos baseada no tempo ajustado de envio
    // Aplicamos o ajuste no momento em que a mensagem foi enviada para descobrir o tempo "real global"
    let clientes = [
        { id: "Cliente 1", rawEnvioStr: c1_env_str, adjEnvio: c1_env + adj_c1 },
        { id: "Cliente 2", rawEnvioStr: c2_env_str, adjEnvio: c2_env + adj_c2 },
        { id: "Cliente 3", rawEnvioStr: c3_env_str, adjEnvio: c3_env + adj_c3 }
    ];

    // Ordena do menor tempo para o maior (quem enviou primeiro)
    clientes.sort((a, b) => a.adjEnvio - b.adjEnvio);

    // 5. Atualiza o HTML com os Resultados
    document.getElementById('res-server-local').innerText = minutesToTime(serverTimeMinutes);
    document.getElementById('res-c1-local').innerText = c1_loc_str;
    document.getElementById('res-c2-local').innerText = c2_loc_str;
    document.getElementById('res-c3-local').innerText = c3_loc_str;

    document.getElementById('res-media').innerText = minutesToTime(averageTime);
    
    document.getElementById('res-adj-s').innerText = formatAdjustment(adj_s);
    document.getElementById('res-adj-c1').innerText = formatAdjustment(adj_c1);
    document.getElementById('res-adj-c2').innerText = formatAdjustment(adj_c2);
    document.getElementById('res-adj-c3').innerText = formatAdjustment(adj_c3);

    document.getElementById('res-ord-1').innerText = `${clientes[0].id} (Enviado às ${clientes[0].rawEnvioStr})`;
    document.getElementById('res-ord-2').innerText = `${clientes[1].id} (Enviado às ${clientes[1].rawEnvioStr})`;
    document.getElementById('res-ord-3').innerText = `${clientes[2].id} (Enviado às ${clientes[2].rawEnvioStr})`;
}
