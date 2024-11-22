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
            year: "numeric"
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

        var agora = Date.now();
        var isFuture = timestamp > agora;

        var detalhes = JSON.parse(localStorage.getItem("detalhes")) || [];
        detalhes.push({
            local: local,
            item: item,
            quantidade: quantidade,
            destino: destino,
            dataAtual: dataAtual,
            horario: horario,
            timestamp: timestamp, // Usamos o timestamp calculado
            isFuture: isFuture    // Indica se o horário é no futuro
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
var reservarButton = document.getElementById("reservarButton");
if (reservarButton) {
    reservarButton.addEventListener("click", function () {
        var localSelect = document.getElementById("local");
        var itemInput = document.getElementById("item");
        var destinoSelect = document.getElementById("destino");

        var local = localSelect ? localSelect.value : "";
        var item = itemInput ? itemInput.value : "";
        var destino = destinoSelect ? destinoSelect.value : "";

        if (!/^\d{5}$/.test(item)) {
            alert("O código do item deve ter exatamente 5 dígitos.");
            return;
        }

        var reservadosTable = document.getElementById("reservadosTable");
        var reservadosTableBody = reservadosTable ? reservadosTable.querySelector("tbody") : null;
        var newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${local}</td>
            <td>${item}</td>
            <td>${destino}</td>
        `;
        if (reservadosTableBody) {
            reservadosTableBody.appendChild(newRow);
        }

        alert("Material reservado com sucesso!");
    });
}

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

        // Função para formatar o tempo decorrido ou restante
        function formatTime(milliseconds, showSeconds = false) {
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

                detalhes.forEach(function(detalhe, index) {
                    var newRow = document.createElement("tr");

                    // Determina se o horário é no futuro
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
                        function updateTimeCell() {
                            var now = Date.now();
                            if (detalhe.isFuture) {
                                var remaining = detalhe.timestamp - now;
                                if (remaining <= 0) {
                                    // Tempo alcançado, mudar para tempo decorrido
                                    detalhe.isFuture = false;
                                    detalhe.timestamp = now;
                                    clearInterval(detalhe.countdownInterval);
                                    detalhe.elapsedInterval = setInterval(function() {
                                        var elapsed = Date.now() - detalhe.timestamp;
                                        tempoCell.textContent = formatTime(elapsed, false);
                                    }, 60000); // Atualiza a cada minuto
                                    tempoCell.textContent = formatTime(Date.now() - detalhe.timestamp, false);
                                } else {
                                    // Atualiza a contagem regressiva
                                    tempoCell.textContent = formatTime(remaining, true);
                                }
                            } else {
                                // Atualiza o tempo decorrido
                                var elapsed = now - detalhe.timestamp;
                                tempoCell.textContent = formatTime(elapsed, false);
                            }
                        }

                        // Inicializa a contagem
                        if (detalhe.isFuture) {
                            // Inicia a contagem regressiva a cada segundo
                            detalhe.countdownInterval = setInterval(updateTimeCell, 1000);
                        } else {
                            // Inicia a contagem do tempo decorrido a cada minuto
                            detalhe.elapsedInterval = setInterval(updateTimeCell, 60000);
                        }

                        // Exibição inicial
                        updateTimeCell();

                        // Eventos de hover
                        tempoCell.addEventListener("mouseover", function() {
                            tempoCell.classList.add('hovering');
                            var now = Date.now();
                            if (detalhe.isFuture) {
                                var remaining = detalhe.timestamp - now;
                                if (remaining > 0) {
                                    tempoCell.textContent = formatTime(remaining, true);
                                } else {
                                    var elapsed = now - detalhe.timestamp;
                                    tempoCell.textContent = formatTime(elapsed, true);
                                }
                            } else {
                                var elapsed = now - detalhe.timestamp;
                                tempoCell.textContent = formatTime(elapsed, true);
                            }
                        });

                        tempoCell.addEventListener("mouseout", function() {
                            tempoCell.classList.remove('hovering');
                            var now = Date.now();
                            if (detalhe.isFuture) {
                                var remaining = detalhe.timestamp - now;
                                if (remaining > 0) {
                                    tempoCell.textContent = formatTime(remaining, false);
                                } else {
                                    var elapsed = now - detalhe.timestamp;
                                    tempoCell.textContent = formatTime(elapsed, false);
                                }
                            } else {
                                var elapsed = now - detalhe.timestamp;
                                tempoCell.textContent = formatTime(elapsed, false);
                            }
                        });
                    }
                });
            }
        }

        atualizarTabelaDetalhes();

        // Função para abrir a janela flutuante de recebimento
        function abrirJanelaRecebimento(index) {
            var detalhe = detalhes[index];
            // Preenche os campos da janela com os dados atuais
            var recebimentoQuantidadeInput = document.getElementById("recebimentoQuantidade");
            if (recebimentoQuantidadeInput) {
                recebimentoQuantidadeInput.value = detalhe.quantidade;
            }
            var horarioAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            var recebimentoHorarioInput = document.getElementById("recebimentoHorario");
            if (recebimentoHorarioInput) {
                recebimentoHorarioInput.value = horarioAtual;
            }
            var recebimentoIndexInput = document.getElementById("recebimentoIndex");
            if (recebimentoIndexInput) {
                recebimentoIndexInput.value = index; // Armazena o índice para uso posterior
            }
            var janelaRecebimento = document.getElementById("janelaRecebimento");
            if (janelaRecebimento) {
                janelaRecebimento.style.display = "block";
            }
        }

        // Fecha a janela de recebimento
        var cancelarRecebimentoButton = document.getElementById("cancelarRecebimentoButton");
        if (cancelarRecebimentoButton) {
            cancelarRecebimentoButton.addEventListener("click", function () {
                var janelaRecebimento = document.getElementById("janelaRecebimento");
                if (janelaRecebimento) {
                    janelaRecebimento.style.display = "none";
                }
            });
        }

        // Confirma o recebimento
        var recebimentoForm = document.getElementById("recebimentoForm");
        if (recebimentoForm) {
            recebimentoForm.addEventListener("submit", function (event) {
                event.preventDefault();

                var recebimentoIndexInput = document.getElementById("recebimentoIndex");
                var recebimentoQuantidadeInput = document.getElementById("recebimentoQuantidade");
                var recebimentoHorarioInput = document.getElementById("recebimentoHorario");

                var index = parseInt(recebimentoIndexInput ? recebimentoIndexInput.value : 0);
                var quantidadeRecebida = recebimentoQuantidadeInput ? recebimentoQuantidadeInput.value : "";
                var horarioRecebido = recebimentoHorarioInput ? recebimentoHorarioInput.value : "";

                var detalhe = detalhes[index];

                // Limpa os intervals do cronômetro
                if (detalhe.isFuture && detalhe.countdownInterval) {
                    clearInterval(detalhe.countdownInterval);
                }
                if (!detalhe.isFuture && detalhe.elapsedInterval) {
                    clearInterval(detalhe.elapsedInterval);
                }

                // Cria um novo objeto para materiais recebidos
                var recebidos = JSON.parse(localStorage.getItem("recebidos")) || [];
                recebidos.push({
                    local: detalhe.local,
                    item: detalhe.item,
                    quantidade: quantidadeRecebida,
                    destino: detalhe.destino,
                    dataAtual: detalhe.dataAtual,
                    horario: detalhe.horario,
                    recebido: horarioRecebido,
                    guardado: '' // Pode ser preenchido posteriormente
                });
                localStorage.setItem("recebidos", JSON.stringify(recebidos));

                // Remove o item da lista de detalhes
                detalhes.splice(index, 1);
                localStorage.setItem("detalhes", JSON.stringify(detalhes));

                // Também remove o item correspondente de 'solicitados'
                var solicitados = JSON.parse(localStorage.getItem("solicitados")) || [];
                var solicitadosIndex = solicitados.findIndex(function(item) {
                    return item.local === detalhe.local &&
                        item.item === detalhe.item &&
                        item.destino === detalhe.destino;
                });

                if (solicitadosIndex !== -1) {
                    solicitados.splice(solicitadosIndex, 1);
                    localStorage.setItem("solicitados", JSON.stringify(solicitados));
                }

                // Atualiza a tabela
                atualizarTabelaDetalhes();

                // Atualiza a tabela de recebidos
                atualizarTabelaRecebidos();

                var janelaRecebimento = document.getElementById("janelaRecebimento");
                if (janelaRecebimento) {
                    janelaRecebimento.style.display = "none";
                }

                alert("Material recebido com sucesso!");
            });
        }

        // Função para atualizar a tabela de materiais recebidos
        var recebidosTableElement = document.getElementById("recebidosTable");
        var recebidosTable = recebidosTableElement ? recebidosTableElement.querySelector("tbody") : null;

        function atualizarTabelaRecebidos() {
            var recebidos = JSON.parse(localStorage.getItem("recebidos")) || [];
            if (recebidosTable) {
                recebidosTable.innerHTML = ""; // Limpa a tabela antes de recarregar

                recebidos.forEach(function(item, index) {
                    var newRow = document.createElement("tr");
                    newRow.innerHTML = `
                        <td class="checkbox-column hidden"><input type="checkbox" class="delete-checkbox"></td>
                        <td>${item.local}</td>
                        <td>${item.item}</td>
                        <td>${item.quantidade}</td>
                        <td>${item.destino}</td>
                        <td>${item.dataAtual}</td>
                        <td>${item.horario}</td>
                        <td>${item.recebido}</td>
                        <td>${item.guardado}</td>
                    `;
                    recebidosTable.appendChild(newRow);
                });
            }
        }

        atualizarTabelaRecebidos();

        // Função para excluir itens da tabela de materiais recebidos
        var excluirRecebidosButton = document.getElementById("excluirRecebidosButton");

        if (excluirRecebidosButton) {
            excluirRecebidosButton.addEventListener("click", function () {
                var checkboxes = document.querySelectorAll("#recebidosTable .delete-checkbox");
                var checkboxesVisible = checkboxes.length > 0 && checkboxes[0].style.display === "inline-block";

                if (checkboxesVisible) {
                    var selectedCheckboxes = document.querySelectorAll("#recebidosTable .delete-checkbox:checked");

                    if (selectedCheckboxes.length === 0) {
                        alert("Selecione os itens que deseja excluir.");
                        return;
                    }

                    if (confirm("Tem certeza que deseja excluir os itens selecionados?")) {
                        selectedCheckboxes.forEach(function(checkbox) {
                            var row = checkbox.closest("tr");
                            var index = Array.from(recebidosTable.rows).indexOf(row);
                            row.remove();
                            // Remove do array recebidos
                            var recebidos = JSON.parse(localStorage.getItem("recebidos")) || [];
                            recebidos.splice(index, 1);
                            localStorage.setItem("recebidos", JSON.stringify(recebidos));
                        });

                        alert("Itens excluídos com sucesso!");
                    }

                    checkboxes.forEach(function(checkbox) {
                        checkbox.style.display = "none";
                    });
                    excluirRecebidosButton.textContent = "Excluir Itens";
                } else {
                    checkboxes.forEach(function(checkbox) {
                        checkbox.style.display = "inline-block";
                    });
                    excluirRecebidosButton.textContent = "Confirmar Exclusão";
                }
            });
        }

        // Função de exclusão de itens na tabela de detalhes (já existente)
        if (excluirItensButton) {
            excluirItensButton.addEventListener("click", function () {
                var checkboxes = document.querySelectorAll("#detalhesTable .delete-checkbox");
                var checkboxesVisible = checkboxes.length > 0 && checkboxes[0].style.display === "inline-block";

                if (checkboxesVisible) {
                    var selectedCheckboxes = document.querySelectorAll("#detalhesTable .delete-checkbox:checked");

                    if (selectedCheckboxes.length === 0) {
                        alert("Selecione os itens que deseja excluir.");
                        return;
                    }

                    if (confirm("Tem certeza que deseja excluir os itens selecionados?")) {
                        selectedCheckboxes.forEach(function(checkbox) {
                            var row = checkbox.closest("tr");
                            var index = Array.from(detalhesTable.rows).indexOf(row);
                            var detalhe = detalhes[index];

                            // Limpa os intervals do cronômetro
                            if (detalhe.isFuture && detalhe.countdownInterval) {
                                clearInterval(detalhe.countdownInterval);
                            }
                            if (!detalhe.isFuture && detalhe.elapsedInterval) {
                                clearInterval(detalhe.elapsedInterval);
                            }

                            row.remove();
                            // Remove do array detalhes
                            detalhes.splice(index, 1);

                            // Também remove o item correspondente de 'solicitados'
                            var solicitados = JSON.parse(localStorage.getItem("solicitados")) || [];
                            var solicitadosIndex = solicitados.findIndex(function(item) {
                                return item.local === detalhe.local &&
                                    item.item === detalhe.item &&
                                    item.destino === detalhe.destino;
                            });

                            if (solicitadosIndex !== -1) {
                                solicitados.splice(solicitadosIndex, 1);
                                localStorage.setItem("solicitados", JSON.stringify(solicitados));
                            }

                            localStorage.setItem("detalhes", JSON.stringify(detalhes));
                        });

                        alert("Itens excluídos com sucesso!");
                    }

                    checkboxes.forEach(function(checkbox) {
                        checkbox.style.display = "none";
                    });
                    excluirItensButton.textContent = "Excluir Itens";
                } else {
                    checkboxes.forEach(function(checkbox) {
                        checkbox.style.display = "inline-block";
                    });
                    excluirItensButton.textContent = "Confirmar Exclusão";
                }
            });
        }
    }
});
