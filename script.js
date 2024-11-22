// script.js

// Lógica de login
var loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var usernameInput = document.getElementById("username");
        var passwordInput = document.getElementById("password");

        var username = usernameInput ? usernameInput.value : "";
        var password = passwordInput ? passwordInput.value : "";

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
        var horarioAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        var horarioInput = document.getElementById("horario");
        if (horarioInput) {
            horarioInput.value = horarioAtual; // Preenche o horário atual
        }
        var janelaSolicitacao = document.getElementById("janelaSolicitacao");
        if (janelaSolicitacao) {
            janelaSolicitacao.style.display = "block";
        }
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
    });
}

// Confirmar a solicitação e registrar os dados (Página Index)
var janelaForm = document.getElementById("janelaForm");
if (janelaForm) {
    janelaForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var quantidadeInput = document.getElementById("quantidade");
        var horarioInput = document.getElementById("horario");
        var localSelect = document.getElementById("local");
        var itemInput = document.getElementById("item");
        var destinoSelect = document.getElementById("destino");

        var quantidade = quantidadeInput ? quantidadeInput.value : "";
        var horario = horarioInput ? horarioInput.value : "";
        var local = localSelect ? localSelect.value : "";
        var item = itemInput ? itemInput.value : "";
        var destino = destinoSelect ? destinoSelect.value : "";

        if (!/^\d{5}$/.test(item)) {
            alert("O código do item deve ter exatamente 5 dígitos.");
            return;
        }

        var dataAtual = new Date().toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
        });

        var solicitadosTable = document.getElementById("solicitadosTable");
        var solicitadosTableBody = solicitadosTable ? solicitadosTable.querySelector("tbody") : null;
        var newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${local}</td>
            <td>${item}</td>
            <td>${destino}</td>
        `;
        if (solicitadosTableBody) {
            solicitadosTableBody.appendChild(newRow);
        }

        var solicitados = JSON.parse(localStorage.getItem("solicitados")) || [];
        solicitados.push({ local: local, item: item, destino: destino });
        localStorage.setItem("solicitados", JSON.stringify(solicitados));

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

        // Obter o timestamp (em milissegundos)
        var timestamp = timestampDate.getTime();

        // Se o timestamp calculado for maior que o horário atual, assumimos que é do dia anterior
        var agora = Date.now();
        if (timestamp > agora) {
            // Subtrair um dia (em milissegundos) do timestamp
            timestamp -= 24 * 60 * 60 * 1000;
        }

        var detalhes = JSON.parse(localStorage.getItem("detalhes")) || [];
        detalhes.push({
            local: local,
            item: item,
            quantidade: quantidade,
            destino: destino,
            dataAtual: dataAtual,
            horario: horario,
            timestamp: timestamp // Usamos o timestamp calculado
        });
        localStorage.setItem("detalhes", JSON.stringify(detalhes));

        var janelaSolicitacao = document.getElementById("janelaSolicitacao");
        if (janelaSolicitacao) {
            janelaSolicitacao.style.display = "none";
        }

        alert("Material solicitado com sucesso!");
    });
}

// Reservar um item (Página Index)
// ... Código permanece o mesmo ...

// Carregar os itens solicitados armazenados no localStorage na página index
document.addEventListener("DOMContentLoaded", function () {
    var solicitados = JSON.parse(localStorage.getItem("solicitados")) || [];
    var solicitadosTable = document.getElementById("solicitadosTable");
    var solicitadosTableBody = solicitadosTable ? solicitadosTable.querySelector("tbody") : null;

    if (solicitadosTableBody) {
        solicitados.forEach(function(item) {
            var newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td>${item.local}</td>
                <td>${item.item}</td>
                <td>${item.destino}</td>
            `;
            solicitadosTableBody.appendChild(newRow);
        });
    }

    // Código específico para detalhes.html
    if (window.location.pathname.includes("detalhes.html")) {
        var detalhes = JSON.parse(localStorage.getItem("detalhes")) || [];
        var detalhesTableElement = document.getElementById("detalhesTable");
        var detalhesTable = detalhesTableElement ? detalhesTableElement.querySelector("tbody") : null;
        var excluirItensButton = document.getElementById("excluirItensButton");

        // Função para formatar o tempo decorrido
        function formatElapsedTime(timestamp, showSeconds = false) {
            var now = Date.now();
            var elapsed = now - timestamp;

            if (elapsed < 0) {
                elapsed = 0; // Evita valores negativos
            }

            var totalSeconds = Math.floor(elapsed / 1000);
            var hours = Math.floor(totalSeconds / 3600);
            var minutes = Math.floor((totalSeconds % 3600) / 60);
            var seconds = totalSeconds % 60;

            if (showSeconds) {
                return (
                    String(hours).padStart(2, '0') + ':' +
                    String(minutes).padStart(2, '0') + ':' +
                    String(seconds).padStart(2, '0')
                );
            } else {
                return (
                    String(hours).padStart(2, '0') + ':' +
                    String(minutes).padStart(2, '0')
                );
            }
        }

        // Função para atualizar a tabela de detalhes
        function atualizarTabelaDetalhes() {
            if (detalhesTable) {
                detalhesTable.innerHTML = ""; // Limpa a tabela antes de recarregar

                detalhes.forEach(function(detalhe, index) {
                    var newRow = document.createElement("tr");

                    // Calcula o tempo decorrido inicial
                    var tempoDisplay = formatElapsedTime(detalhe.timestamp);

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
                        // Atualiza o tempo a cada minuto
                        detalhe.interval = setInterval(function() {
                            tempoCell.textContent = formatElapsedTime(detalhe.timestamp);
                        }, 60000);

                        // Exibição inicial
                        tempoCell.textContent = formatElapsedTime(detalhe.timestamp);

                        // Eventos de hover
                        tempoCell.addEventListener("mouseover", function() {
                            clearInterval(detalhe.interval);

                            tempoCell.textContent = formatElapsedTime(detalhe.timestamp, true);

                            detalhe.hoverInterval = setInterval(function() {
                                tempoCell.textContent = formatElapsedTime(detalhe.timestamp, true);
                            }, 1000);
                        });

                        tempoCell.addEventListener("mouseout", function() {
                            clearInterval(detalhe.hoverInterval);

                            tempoCell.textContent = formatElapsedTime(detalhe.timestamp);

                            detalhe.interval = setInterval(function() {
                                tempoCell.textContent = formatElapsedTime(detalhe.timestamp);
                            }, 60000);
                        });
                    }
                });
            }
        }

        atualizarTabelaDetalhes();

        // Funções para recebimento e exclusão de itens
        // ... O restante do código permanece o mesmo ...
    }
});
