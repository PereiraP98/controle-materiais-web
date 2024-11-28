// script.js

// Map para armazenar os IDs dos intervals para cada detalhe
const intervalMap = new Map();

// Lógica de login
var loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var usernameInput = document.getElementById("username");
        var passwordInput = document.getElementById("password");

        var username = usernameInput ? usernameInput.value.trim() : "";
        var password = passwordInput ? passwordInput.value.trim() : "";

        // Validação simples de usuário e senha
        if (username === "admin" && password === "admin") {
            // Armazena o estado de autenticação no localStorage
            localStorage.setItem("authenticated", "true");
            // Redireciona para a página painel.html
            window.location.href = "painel.html";
        } else {
            alert("Usuário ou senha incorretos. Tente novamente.");
        }
    });
}

// Verifica a autenticação nas páginas protegidas
function checkAuthentication() {
    var isAuthenticated = localStorage.getItem("authenticated");
    if (isAuthenticated !== "true") {
        // Redireciona para a página de login se não estiver autenticado
        window.location.href = "login.html";
    }
}

// Chama a função de verificação nas páginas protegidas
if (
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname.endsWith("detalhes.html") ||
    window.location.pathname.endsWith("painel.html")
) {
    checkAuthentication();
}

// Função de logout
function logout() {
    // Remove o estado de autenticação
    localStorage.removeItem("authenticated");
    // Redireciona para a página de login
    window.location.href = "login.html";
}

// Adiciona o evento de clique ao botão de logout
var logoutButton = document.getElementById("logoutButton");
if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        logout();
    });
}

// Função para voltar ao painel
function backToPanel() {
    window.location.href = "painel.html";
}

// Adiciona o evento de clique ao botão de voltar ao painel
var backToPanelButton = document.getElementById("backToPanelButton");
if (backToPanelButton) {
    backToPanelButton.addEventListener("click", function () {
        backToPanel();
    });
}

// Abrir a janela flutuante para solicitação de material (Página Index)
var abrirSolicitacaoButton = document.getElementById("abrirSolicitacaoButton");
if (abrirSolicitacaoButton) {
    abrirSolicitacaoButton.addEventListener("click", function () {
        var localSelect = document.getElementById("local");
        var itemInput = document.getElementById("item");
        var destinoSelect = document.getElementById("destino");

        var local = localSelect ? localSelect.value.trim() : "";
        var item = itemInput ? itemInput.value.trim() : "";
        var destino = destinoSelect ? destinoSelect.value.trim() : "";

        // Validação dos campos
        if (!local || !item || !destino) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        if (!/^\d{5}$/.test(item)) {
            alert("O código do item deve ter exatamente 5 dígitos.");
            return;
        }

        // Abrir a janela de solicitação com os dados preenchidos
        abrirJanelaSolicitacao({ local: local, item: item, destino: destino });
    });
}

// Cancelar a solicitação e fechar a janela flutuante (Página Index)
var cancelarSolicitacaoButton = document.getElementById("cancelarSolicitacaoButton");
if (cancelarSolicitacaoButton) {
    cancelarSolicitacaoButton.addEventListener("click", function () {
        var janelaSolicitacao = document.getElementById("janelaSolicitacao");
        if (janelaSolicitacao) {
            janelaSolicitacao.style.display = "none";
        }
        // Limpa os campos ocultos
        var fromReservadosInput = document.getElementById("fromReservados");
        var itemIndexInput = document.getElementById("itemIndex");
        if (fromReservadosInput) fromReservadosInput.value = "false";
        if (itemIndexInput) itemIndexInput.value = "-1";
    });
}

// Confirmar a solicitação e registrar os dados (Página Index)
var janelaForm = document.getElementById("janelaForm");
if (janelaForm) {
    janelaForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var fromReservadosInput = document.getElementById("fromReservados");
        var itemIndexInput = document.getElementById("itemIndex");
        var quantidadeInput = document.getElementById("quantidade");
        var horarioInput = document.getElementById("horario");
        var localInput = document.getElementById("local");
        var itemInput = document.getElementById("item");
        var destinoSelect = document.getElementById("destino");

        var quantidade = quantidadeInput ? quantidadeInput.value.trim() : "";
        var horario = horarioInput ? horarioInput.value.trim() : "";
        var local = localInput ? localInput.value.trim() : "";
        var item = itemInput ? itemInput.value.trim() : "";
        var destino = destinoSelect ? destinoSelect.value.trim() : "";

        // Obter os valores dos campos ocultos
        var fromReservados = fromReservadosInput ? fromReservadosInput.value : "false";
        var itemIndex = itemIndexInput ? parseInt(itemIndexInput.value) : -1;

        // Validação dos campos
        if (!quantidade || !horario || !local || !item || !destino) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        if (!/^\d{5}$/.test(item)) {
            alert("O código do item deve ter exatamente 5 dígitos.");
            return;
        }

        // Verifica se o horário está no formato HH:MM
        if (!/^\d{2}:\d{2}$/.test(horario)) {
            alert("O horário deve estar no formato HH:MM.");
            return;
        }

        // Lógica para remover o item reservado após a confirmação
        if (fromReservados === "true" && itemIndex >= 0) {
            var reservados = JSON.parse(localStorage.getItem("reservados")) || [];
            reservados.splice(itemIndex, 1);
            localStorage.setItem("reservados", JSON.stringify(reservados));
            // Atualiza a tabela de reservados
            atualizarTabelaReservados();
        }

        // Limpa os campos ocultos após a submissão
        if (fromReservadosInput) fromReservadosInput.value = "false";
        if (itemIndexInput) itemIndexInput.value = "-1";

        // Registro da solicitação nos dados locais
        var dataAtual = new Date().toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });

        // Calcular o timestamp baseado no horário inserido pelo usuário
        var dataAtualObj = new Date();

        // Extrair o horário inserido pelo usuário (horario)
        var horarioParts = horario.split(':');
        var horas = parseInt(horarioParts[0], 10);
        var minutos = parseInt(horarioParts[1], 10);

        // Criar um novo objeto Date com a data atual e o horário inserido pelo usuário
        var timestampDate = new Date(
            dataAtualObj.getFullYear(),
            dataAtualObj.getMonth(),
            dataAtualObj.getDate(),
            horas,
            minutos,
            0, // segundos
            0  // milissegundos
        );

        var timestamp = timestampDate.getTime();
        var agora = Date.now();
        var isFuture = timestamp > agora;

        // Adiciona aos detalhes
        var detalhes = JSON.parse(localStorage.getItem("detalhes")) || [];
        detalhes.push({
            local: local,
            item: item,
            quantidade: quantidade,
            destino: destino,
            dataAtual: dataAtual,
            horario: horario,
            timestamp: timestamp,
            isFuture: isFuture
        });
        localStorage.setItem("detalhes", JSON.stringify(detalhes));

        // Adiciona aos solicitados
        var solicitados = JSON.parse(localStorage.getItem("solicitados")) || [];
        solicitados.push({ local: local, item: item, destino: destino });
        localStorage.setItem("solicitados", JSON.stringify(solicitados));

        var janelaSolicitacao = document.getElementById("janelaSolicitacao");
        if (janelaSolicitacao) {
            janelaSolicitacao.style.display = "none";
        }

        alert("Material solicitado com sucesso!");

        // Atualiza a tabela de solicitados na página index.html
        atualizarTabelaSolicitados();

        // Atualiza a tabela de detalhes se estiver na página detalhes.html
        if (window.location.pathname.includes("detalhes.html")) {
            atualizarTabelaDetalhes();
        }
    });
}

// Função para abrir a janela de solicitação com dados preenchidos
function abrirJanelaSolicitacao(dados, index) {
    var horarioAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    var localInput = document.getElementById("local");
    var itemInput = document.getElementById("item");
    var destinoSelect = document.getElementById("destino");
    var horarioInput = document.getElementById("horario");
    var fromReservadosInput = document.getElementById("fromReservados");
    var itemIndexInput = document.getElementById("itemIndex");

    if (localInput) localInput.value = dados.local || "";
    if (itemInput) itemInput.value = dados.item || "";
    if (destinoSelect) destinoSelect.value = dados.destino || "";
    if (horarioInput) horarioInput.value = horarioAtual;

    // Define os campos ocultos somente se o index for válido
    if (typeof index !== 'undefined') {
        if (fromReservadosInput) fromReservadosInput.value = "true";
        if (itemIndexInput) itemIndexInput.value = index;
    } else {
        if (fromReservadosInput) fromReservadosInput.value = "false";
        if (itemIndexInput) itemIndexInput.value = "-1";
    }

    var janelaSolicitacao = document.getElementById("janelaSolicitacao");
    if (janelaSolicitacao) {
        janelaSolicitacao.style.display = "block";
    }
}

// Reservar um item (Página Index)
var reservarButton = document.getElementById("reservarButton");

if (reservarButton) {
    reservarButton.addEventListener("click", function () {
        var localSelect = document.getElementById("local");
        var itemInput = document.getElementById("item");
        var destinoSelect = document.getElementById("destino");

        var local = localSelect ? localSelect.value.trim() : "";
        var item = itemInput ? itemInput.value.trim() : "";
        var destino = destinoSelect ? destinoSelect.value.trim() : "";

        // Validação dos campos
        if (!local || !item || !destino) {
            alert("Por favor, preencha todos os campos para reservar.");
            return;
        }

        if (!/^\d{5}$/.test(item)) {
            alert("O código do item deve ter exatamente 5 dígitos.");
            return;
        }

        // Adicionar ao localStorage
        var reservados = JSON.parse(localStorage.getItem("reservados")) || [];
        reservados.push({ local, item, destino });
        localStorage.setItem("reservados", JSON.stringify(reservados));

        // Atualiza a tabela de reservados
        atualizarTabelaReservados();

        alert("Material reservado com sucesso!");
    });
}

// Função para atualizar a tabela de materiais reservados
function atualizarTabelaReservados() {
    var reservados = JSON.parse(localStorage.getItem("reservados")) || [];
    var reservadosTableBody = document.querySelector("#reservadosTable tbody");

    if (reservadosTableBody) {
        reservadosTableBody.innerHTML = ""; // Limpa a tabela antes de recarregar

        reservados.forEach(function (item, index) {
            var newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td>${item.local}</td>
                <td>${item.item}</td>
                <td>${item.destino}</td>
                <td><button class="solicitar-button" data-index="${index}">Solicitar</button></td>
            `;

            reservadosTableBody.appendChild(newRow);

            // Adiciona evento ao botão de "Solicitar"
            var solicitarButton = newRow.querySelector(".solicitar-button");
            if (solicitarButton) {
                solicitarButton.addEventListener("click", function () {
                    var index = parseInt(this.getAttribute('data-index'));
                    abrirJanelaSolicitacao(item, index);
                    // Não removemos o item aqui; ele será removido após a confirmação
                });
            }
        });
    }
}

// Carrega os dados ao carregar a página
document.addEventListener("DOMContentLoaded", function () {
    atualizarTabelaReservados();
    atualizarTabelaSolicitados();
});

// Função para atualizar a tabela de materiais solicitados na página index.html
function atualizarTabelaSolicitados() {
    var solicitados = JSON.parse(localStorage.getItem("solicitados")) || [];
    var solicitadosTable = document.getElementById("solicitadosTable");
    var solicitadosTableBody = solicitadosTable ? solicitadosTable.querySelector("tbody") : null;

    if (solicitadosTableBody) {
        solicitadosTableBody.innerHTML = ""; // Limpa a tabela antes de recarregar

        solicitados.forEach(function (item) {
            var newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td>${item.local}</td>
                <td>${item.item}</td>
                <td>${item.destino}</td>
            `;
            solicitadosTableBody.appendChild(newRow);
        });
    }
}

// Código específico para detalhes.html
if (window.location.pathname.includes("detalhes.html")) {
    var detalhes = JSON.parse(localStorage.getItem("detalhes")) || [];
    var detalhesTableElement = document.getElementById("detalhesTable");
    var detalhesTable = detalhesTableElement ? detalhesTableElement.querySelector("tbody") : null;
    var excluirItensButton = document.getElementById("excluirItensButton");

    // Função para formatar o tempo decorrido ou restante
    function formatTime(milliseconds, showSeconds = false) {
        if (milliseconds < 0) milliseconds = 0; // Evita valores negativos

        var totalSeconds = Math.floor(milliseconds / 1000);
        var hours = Math.floor(totalSeconds / 3600);
        var minutes = Math.floor((totalSeconds % 3600) / 60);
        var seconds = totalSeconds % 60;

        var timeString = (
            String(hours).padStart(2, '0') + ':' +
            String(minutes).padStart(2, '0')
        );

        if (showSeconds) {
            timeString += ':' + String(seconds).padStart(2, '0');
        }

        return timeString;
    }

    // Função para atualizar a tabela de detalhes
    function atualizarTabelaDetalhes() {
        if (detalhesTable) {
            detalhesTable.innerHTML = ""; // Limpa a tabela antes de recarregar

            detalhes.forEach(function (detalhe, index) {
                var newRow = document.createElement("tr");

                // Determina se o horário é no futuro ou no passado
                var agora = Date.now();
                detalhe.isFuture = detalhe.timestamp > agora;

                // Calcula o tempo restante ou decorrido
                var tempoDisplay = detalhe.isFuture ? formatTime(detalhe.timestamp - agora, true) : formatTime(agora - detalhe.timestamp);

                newRow.innerHTML = `
                    <td class="checkbox-column hidden"><input type="checkbox" class="delete-checkbox"></td>
                    <td>${detalhe.local}</td>
                    <td>${detalhe.item}</td>
                    <td>${detalhe.quantidade}</td>
                    <td>${detalhe.destino}</td>
                    <td>${detalhe.dataAtual}</td>
                    <td>${detalhe.horario}</td>
                    <td><button class="receberButton">Receber</button></td>
                    <td class="tempo-cell">${tempoDisplay}</td>
                `;
                detalhesTable.appendChild(newRow);

                // Adiciona o evento de clique ao botão Receber
                var receberButton = newRow.querySelector(".receberButton");
                if (receberButton) {
                    receberButton.addEventListener("click", function () {
                        abrirJanelaRecebimento(index);
                    });
                }

                // Manipulação do tempo e eventos de hover
                var tempoCell = newRow.querySelector(".tempo-cell");
                if (tempoCell) {
                    // Função para atualizar o tempo na célula
                    function updateTimeCell(showSeconds = false) {
                        const now = Date.now();
                        const elapsed = now - detalhe.timestamp; // Tempo decorrido em milissegundos

                        // Define tempos limites
                        const maxTime = 30 * 60 * 1000; // 30 minutos em milissegundos
                        const midTime = 15 * 60 * 1000; // 15 minutos em milissegundos

                        if (elapsed > maxTime) {
                            newRow.classList.add("oscillation");
                            newRow.style.background = ""; // Remove estilos inline conflitantes
                        } else {
                            newRow.classList.remove("oscillation");

                            // Gradiente dinâmico para preenchimento da barra
                            let backgroundGradient;
                            if (elapsed <= midTime) {
                                const percentage = (elapsed / midTime) * 100; // Progresso da barra
                                backgroundGradient = `linear-gradient(to left, rgb(0, 255, 0) ${100 - percentage}%, rgb(255, 255, 0) ${100 - percentage}%)`;
                            } else {
                                const percentage = ((elapsed - midTime) / (maxTime - midTime)) * 100; // Progresso da barra
                                backgroundGradient = `linear-gradient(to left, rgb(255, 255, 0) ${100 - percentage}%, rgb(255, 0, 0) ${100 - percentage}%)`;
                            }

                            // Atualiza o fundo da linha inteira
                            newRow.style.background = backgroundGradient;
                        }

                        // Atualiza o campo de tempo
                        if (detalhe.isFuture) {
                            const remaining = detalhe.timestamp - now;
                            if (remaining <= 0) {
                                detalhe.isFuture = false;
                                detalhe.timestamp = now;
                            }
                            tempoCell.textContent = formatTime(remaining, showSeconds);
                        } else {
                            tempoCell.textContent = formatTime(elapsed, showSeconds);
                        }
                    }

                    // Inicializa a contagem
                    if (detalhe.isFuture) {
                        // Inicia a contagem regressiva a cada segundo
                        var countdownInterval = setInterval(() => updateTimeCell(false), 1000);
                        intervalMap.set(index, countdownInterval);
                    } else {
                        // Inicia a contagem do tempo decorrido a cada segundo
                        var elapsedInterval = setInterval(() => updateTimeCell(false), 1000);
                        intervalMap.set(index, elapsedInterval);
                    }

                    // Exibição inicial
                    updateTimeCell(false);

                    // Eventos de hover para exibir e ocultar os segundos
                    newRow.addEventListener("mouseover", function () {
                        // Pausa o intervalo padrão, se existir
                        if (intervalMap.has(index)) {
                            clearInterval(intervalMap.get(index));
                            intervalMap.delete(index); // Remove a referência do mapa para evitar conflitos
                        }

                        // Atualiza imediatamente com segundos e inicia um intervalo de hover
                        updateTimeCell(true); // Atualiza para exibir HH:MM:SS
                        if (!tempoCell._hoverInterval) {
                            tempoCell._hoverInterval = setInterval(() => {
                                const elapsedHover = Date.now() - detalhe.timestamp;
                                tempoCell.textContent = formatTime(elapsedHover, true); // Atualiza com HH:MM:SS
                            }, 1000);
                        }
                    });

                    newRow.addEventListener("mouseout", function () {
                        // Para a contagem dos segundos durante o hover
                        if (tempoCell._hoverInterval) {
                            clearInterval(tempoCell._hoverInterval);
                            delete tempoCell._hoverInterval; // Remove a referência ao intervalo
                        }

                        // Verifica se o item é futuro ou passado e retoma a contagem normal
                        if (detalhe.isFuture) {
                            if (!intervalMap.has(index)) {
                                // Reinicia a contagem regressiva apenas se não estiver já ativa
                                var countdownInterval = setInterval(() => updateTimeCell(false), 1000);
                                intervalMap.set(index, countdownInterval);
                            }
                        } else {
                            if (!intervalMap.has(index)) {
                                // Reinicia a contagem do tempo decorrido apenas se não estiver já ativa
                                var elapsedInterval = setInterval(() => updateTimeCell(false), 1000);
                                intervalMap.set(index, elapsedInterval);
                            }
                        }

                        // Volta para o formato HH:MM
                        const elapsed = Date.now() - detalhe.timestamp;
                        tempoCell.textContent = formatTime(elapsed, false);
                    });
                }
            });
        }
    }

    atualizarTabelaDetalhes();

    // Restante do código específico para detalhes.html (recebimento, exclusão, reporte)
    // ... (Inclua aqui as funções relacionadas, conforme necessário)
}