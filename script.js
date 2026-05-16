let serverTimeMinutes = 0;
let isServerCreated = false;

function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h * 60) + m;
}

function minutesToTime(minutes) {
    // Ajusta minutos negativos (volta para dia anterior)
    if (minutes < 0) minutes += 24 * 60;
    
    // Garante que está dentro do intervalo de 24 horas
    minutes = Math.round(minutes) % (24 * 60);
    
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
}

/**
 * Formata a exibição do ajuste de sincronização
 * Exemplo: +5 minutos, -3 minutos
 * @param {number} diff - Diferença de minutos
 * @returns {string} Ajuste formatado com sinal
 */
function formatAdjustment(diff) {
    const sign = diff > 0 ? "+" : (diff < 0 ? "-" : "");
    return `${sign}${Math.abs(Math.round(diff))} minutos`;
}

/**
 * Cria um novo servidor obtendo a hora atual do sistema
 */
function criarServidor() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    const timeStr = `${h}:${m}`;
    
    serverTimeMinutes = timeToMinutes(timeStr);
    document.getElementById('lbl-servidor-hora').innerText = timeStr;
    isServerCreated = true;
}

/**
 * Sincroniza os relógios de 3 clientes usando o algoritmo de Berkeley
 * Calcula uma hora média e determina ajustes para cada nó
 * Ordena os eventos por causalidade após sincronização
 */
function sincronizar() {
    if (!isServerCreated) {
        alert("Por favor, crie o Servidor primeiro para obter a hora do computador!");
        return;
    }

    //ETAPA 1: Coleta de Dados
    const c1HoraLocal = document.getElementById('c1-local').value;
    const c2HoraLocal = document.getElementById('c2-local').value;
    const c3HoraLocal = document.getElementById('c3-local').value;

    // Coleta os horários de envio dos clientes
    const c1HoraEnvio = document.getElementById('c1-envio').value;
    const c2HoraEnvio = document.getElementById('c2-envio').value;
    const c3HoraEnvio = document.getElementById('c3-envio').value;

    // Valida se todos os campos foram preenchidos
    if (!c1HoraLocal || !c2HoraLocal || !c3HoraLocal || !c1HoraEnvio || !c2HoraEnvio || !c3HoraEnvio) {
        alert("Por favor, preencha todas as horas locais e horas de envio dos 3 clientes.");
        return;
    }

    // Converte para minutos para facilitar cálculos
    const c1LocMinutos = timeToMinutes(c1HoraLocal);
    const c2LocMinutos = timeToMinutes(c2HoraLocal);
    const c3LocMinutos = timeToMinutes(c3HoraLocal);

    const c1EnvioMinutos = timeToMinutes(c1HoraEnvio);
    const c2EnvioMinutos = timeToMinutes(c2HoraEnvio);
    const c3EnvioMinutos = timeToMinutes(c3HoraEnvio);

    //ETAPA 2: Cálculo da Sincronização 
    const mediaHoras = (serverTimeMinutes + c1LocMinutos + c2LocMinutos + c3LocMinutos) / 4;

    // Calcula o Ajuste para cada nó: Ajuste = Média - Tempo Local
    const ajusteServidor = mediaHoras - serverTimeMinutes;
    const ajusteCliente1 = mediaHoras - c1LocMinutos;
    const ajusteCliente2 = mediaHoras - c2LocMinutos;
    const ajusteCliente3 = mediaHoras - c3LocMinutos;

    //ETAPA 3: Ordenação de Causalidade 
    const clientes = [
        { 
            nome: "Cliente 1", 
            horaEnvioLocal: c1HoraEnvio, 
            tempoSincronizado: c1EnvioMinutos + ajusteCliente1 
        },
        { 
            nome: "Cliente 2", 
            horaEnvioLocal: c2HoraEnvio, 
            tempoSincronizado: c2EnvioMinutos + ajusteCliente2 
        },
        { 
            nome: "Cliente 3", 
            horaEnvioLocal: c3HoraEnvio, 
            tempoSincronizado: c3EnvioMinutos + ajusteCliente3 
        }
    ];

    clientes.sort((a, b) => a.tempoSincronizado - b.tempoSincronizado);

    //ETAPA 4: Renderização dos Resultados 
    document.getElementById('res-server-local').innerText = minutesToTime(serverTimeMinutes);
    document.getElementById('res-c1-local').innerText = c1HoraLocal;
    document.getElementById('res-c2-local').innerText = c2HoraLocal;
    document.getElementById('res-c3-local').innerText = c3HoraLocal;

    // Exibe a hora média sincronizada
    document.getElementById('res-media').innerText = minutesToTime(mediaHoras);
    
    // Exibe os ajustes necessários para cada nó
    document.getElementById('res-adj-s').innerText = formatAdjustment(ajusteServidor);
    document.getElementById('res-adj-c1').innerText = formatAdjustment(ajusteCliente1);
    document.getElementById('res-adj-c2').innerText = formatAdjustment(ajusteCliente2);
    document.getElementById('res-adj-c3').innerText = formatAdjustment(ajusteCliente3);

    // Exibe a ordenação dos eventos
    document.getElementById('res-ord-1').innerText = `${clientes[0].nome} (Enviado às ${clientes[0].horaEnvioLocal})`;
    document.getElementById('res-ord-2').innerText = `${clientes[1].nome} (Enviado às ${clientes[1].horaEnvioLocal})`;
    document.getElementById('res-ord-3').innerText = `${clientes[2].nome} (Enviado às ${clientes[2].horaEnvioLocal})`;

    // Exibe os horários sincronizados das mensagens
    const horaC1Sincronizada = minutesToTime(c1EnvioMinutos + ajusteCliente1);
    const horaC2Sincronizada = minutesToTime(c2EnvioMinutos + ajusteCliente2);
    const horaC3Sincronizada = minutesToTime(c3EnvioMinutos + ajusteCliente3);

    document.getElementById('res-msg-c1').innerText = `Enviado às ${c1HoraEnvio} (ajustado para ${horaC1Sincronizada})`;
    document.getElementById('res-msg-c2').innerText = `Enviado às ${c2HoraEnvio} (ajustado para ${horaC2Sincronizada})`;
    document.getElementById('res-msg-c3').innerText = `Enviado às ${c3HoraEnvio} (ajustado para ${horaC3Sincronizada})`;
}
