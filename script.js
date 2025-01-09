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
            // Armazena o estado de autenticação
            localStorage.setItem("authenticated", "true");
            // Redireciona para painel.html
            window.location.href = "painel.html";
        } else {
            alert("Usuário ou senha incorretos. Tente novamente.");
        }
    });
}

// Verifica autenticação
function checkAuthentication() {
    var isAuthenticated = localStorage.getItem("authenticated");
    if (isAuthenticated !== "true") {
        window.location.href = "login.html";
    }
}

// Aplica verificação de autenticação nas páginas
if (
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname.endsWith("detalhes.html") ||
    window.location.pathname.endsWith("painel.html")
) {
    checkAuthentication();
}

// Função de logout
function logout() {
    localStorage.removeItem("authenticated");
    window.location.href = "login.html";
}

var logoutButton = document.getElementById("logoutButton");
if (logoutButton) {
    logoutButton.addEventListener("click", logout);
}

// Voltar ao painel
function backToPanel() {
    window.location.href = "painel.html";
}
var backToPanelButton = document.getElementById("backToPanelButton");
if (backToPanelButton) {
    backToPanelButton.addEventListener("click", backToPanel);
}

// Botão para abrir solicitação (Index)
var abrirSolicitacaoButton = document.getElementById("abrirSolicitacaoButton");
if (abrirSolicitacaoButton) {
    abrirSolicitacaoButton.addEventListener("click", function () {
        var localSelect = document.getElementById("local");
        var itemInput = document.getElementById("item");
        var destinoSelect = document.getElementById("destino");

        var local = localSelect ? localSelect.value.trim() : "";
        var item = itemInput ? itemInput.value.trim() : "";
        var destino = destinoSelect ? destinoSelect.value.trim() : "";

        // Validações simples
        if (!local || !item || !destino) {
            alert("Por favor, preencha todos os campos.");
            return;
        }
        if (!/^\d{5}$/.test(item)) {
            alert("O código do item deve ter exatamente 5 dígitos.");
            return;
        }

        // Verifica se o item já foi solicitado
        var solicitados = JSON.parse(localStorage.getItem("solicitados")) || [];
        var itemJaSolicitado = solicitados.some(function (solicitado) {
            return (
                solicitado.local === local &&
                solicitado.item === item &&
                solicitado.destino === destino
            );
        });

        if (itemJaSolicitado) {
            mostrarJanelaAtencao(
                "Este item já foi solicitado. Deseja continuar?",
                function () {
                    abrirJanelaSolicitacao({ local, item, destino });
                },
                function () {
                    // onCancel
                }
            );
        } else {
            abrirJanelaSolicitacao({ local, item, destino });
        }
    });
}

// Cancelar solicitação
var cancelarSolicitacaoButton = document.getElementById("cancelarSolicitacaoButton");
if (cancelarSolicitacaoButton) {
    cancelarSolicitacaoButton.addEventListener("click", fecharJanelaSolicitacao);
}

// Form da Janela de Solicitação
var janelaForm = document.getElementById("janelaForm");
if (janelaForm) {
    janelaForm.addEventListener("submit", function (event) {
        event.preventDefault();

        // Pega valores antes de fechar
        var fromReservadosInput = document.getElementById("fromReservados");
        var itemIndexInput = document.getElementById("itemIndex");
        var fromReservados = fromReservadosInput ? fromReservadosInput.value : "false";
        var itemIndex = itemIndexInput ? parseInt(itemIndexInput.value) : -1;

        fecharJanelaSolicitacao();

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

        // Validações
        if (!quantidade || !horario || !local || !item || !destino) {
            alert("Por favor, preencha todos os campos.");
            return;
        }
        if (!/^\d{5}$/.test(item)) {
            alert("O código do item deve ter 5 dígitos.");
            return;
        }
        if (!/^\d{2}:\d{2}$/.test(horario)) {
            alert("O horário deve estar no formato HH:MM.");
            return;
        }

        // Se veio de reservados, remove
        if (fromReservados === "true" && itemIndex >= 0) {
            var reservados = JSON.parse(localStorage.getItem("reservados")) || [];
            if (itemIndex < reservados.length && itemIndex >= 0) {
                reservados.splice(itemIndex, 1);
                localStorage.setItem("reservados", JSON.stringify(reservados));
                atualizarTabelaReservados();
            } else {
                console.error("Índice inválido de reserva.");
            }
        }

        // Registra a solicitação
        var dataAtual = new Date().toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });

        var dataAtualObj = new Date();
        var horarioParts = horario.split(":");
        var horas = parseInt(horarioParts[0], 10);
        var minutos = parseInt(horarioParts[1], 10);

        var timestampDate = new Date(
            dataAtualObj.getFullYear(),
            dataAtualObj.getMonth(),
            dataAtualObj.getDate(),
            horas,
            minutos,
            0,
            0
        );
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
            timestamp: timestamp,
            isFuture: isFuture
        });
        localStorage.setItem("detalhes", JSON.stringify(detalhes));

        var solicitados = JSON.parse(localStorage.getItem("solicitados")) || [];
        solicitados.push({ local, item, destino });
        localStorage.setItem("solicitados", JSON.stringify(solicitados));

        alert("Material solicitado com sucesso!");

        // Limpa campos
        var localSelect = document.getElementById("local");
        var destinoSelectField = document.getElementById("destino");
        var itemInputReset = document.getElementById("item");
        if (localSelect) localSelect.value = "";
        if (destinoSelectField) destinoSelectField.value = "";
        if (itemInputReset) itemInputReset.value = "";

        atualizarTabelaSolicitados();
        atualizarTabelaReservados();

        if (window.location.pathname.includes("detalhes.html")) {
            atualizarTabelaDetalhes();
        }
    });
}

// Abrir janela de solicitação
function abrirJanelaSolicitacao(dados, index) {
    var horarioAtual = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    var localInput = document.getElementById("local");
    var itemInput = document.getElementById("item");
    var destinoSelect = document.getElementById("destino");
    var horarioInput = document.getElementById("horario");
    var fromReservadosInput = document.getElementById("fromReservados");
    var itemIndexInput = document.getElementById("itemIndex");
    var quantidadeInput = document.getElementById("quantidade");

    if (localInput) localInput.value = (dados && dados.local) ? dados.local : "";
    if (itemInput) itemInput.value = (dados && dados.item) ? dados.item : "";
    if (destinoSelect) destinoSelect.value = (dados && dados.destino) ? dados.destino : "";
    if (horarioInput) horarioInput.value = horarioAtual;
    if (quantidadeInput) quantidadeInput.value = (dados && dados.quantidade) ? dados.quantidade : "1";

    if (typeof index !== "undefined") {
        if (fromReservadosInput) fromReservadosInput.value = "true";
        if (itemIndexInput) itemIndexInput.value = index;
    } else {
        if (fromReservadosInput) fromReservadosInput.value = "false";
        if (itemIndexInput) itemIndexInput.value = "-1";
    }

    var janelaSolicitacao = document.getElementById("janelaSolicitacao");
    var overlay = document.getElementById("overlay");
    if (janelaSolicitacao && overlay) {
        janelaSolicitacao.style.display = "";
        janelaSolicitacao.style.animation = "none";
        janelaSolicitacao.style.transform = "";
        janelaSolicitacao.style.opacity = "";
        janelaSolicitacao.offsetHeight;
        overlay.classList.add("active");
        janelaSolicitacao.classList.remove("hidden");
        janelaSolicitacao.style.animation = "slideDown 0.3s forwards";
        document.body.classList.add("modal-open");
    }
}

// Fechar janela solicitação
function fecharJanelaSolicitacao() {
    var janelaSolicitacao = document.getElementById("janelaSolicitacao");
    var overlay = document.getElementById("overlay");

    if (janelaSolicitacao && overlay) {
        janelaSolicitacao.style.animation = "slideUp 0.3s forwards";
        setTimeout(function () {
            overlay.classList.remove("active");
            janelaSolicitacao.classList.add("hidden");
            document.body.classList.remove("modal-open");

            janelaSolicitacao.style.animation = "";
            janelaSolicitacao.style.transform = "";
            janelaSolicitacao.style.opacity = "";
            janelaSolicitacao.style.display = "";
        }, 300);
    }

    var fromReservadosInput = document.getElementById("fromReservados");
    var itemIndexInput = document.getElementById("itemIndex");
    if (fromReservadosInput) fromReservadosInput.value = "false";
    if (itemIndexInput) itemIndexInput.value = "-1";
}

// Janela de Atenção
function mostrarJanelaAtencao(mensagem, onConfirm, onCancel) {
    var janelaAtencao = document.getElementById("janelaAtencao");
    var atencaoMensagem = document.getElementById("atencaoMensagem");
    var confirmarAtencao = document.getElementById("confirmarAtencao");
    var cancelarAtencao = document.getElementById("cancelarAtencao");
    var overlay = document.getElementById("overlay");

    if (janelaAtencao && atencaoMensagem && overlay) {
        atencaoMensagem.textContent = mensagem;

        janelaAtencao.style.animation = "none";
        janelaAtencao.style.transform = "";
        janelaAtencao.style.opacity = "";
        janelaAtencao.offsetHeight; 

        overlay.classList.add("active");
        janelaAtencao.classList.remove("hidden");
        janelaAtencao.style.animation = "slideDown 0.3s forwards";
        document.body.classList.add("modal-open");

        if (confirmarAtencao) {
            confirmarAtencao.onclick = function () {
                if (onConfirm) onConfirm();
                fecharJanelaAtencao();
            };
        }
        if (cancelarAtencao) {
            cancelarAtencao.onclick = function () {
                if (onCancel) onCancel();
                fecharJanelaAtencao();
            };
        }
    } else {
        console.error("Elementos da janela de atenção não encontrados.");
    }
}
function fecharJanelaAtencao() {
    var janelaAtencao = document.getElementById("janelaAtencao");
    var overlay = document.getElementById("overlay");
    if (janelaAtencao && overlay) {
        janelaAtencao.style.animation = "slideUp 0.3s forwards";
        setTimeout(function () {
            overlay.classList.remove("active");
            janelaAtencao.classList.add("hidden");
            document.body.classList.remove("modal-open");

            janelaAtencao.style.animation = "";
            janelaAtencao.style.transform = "";
            janelaAtencao.style.opacity = "";
        }, 300);
    }
}

// Reservar (Index)
var reservarButton = document.getElementById("reservarButton");
if (reservarButton) {
    reservarButton.addEventListener("click", function () {
        var localSelect = document.getElementById("local");
        var itemInput = document.getElementById("item");
        var destinoSelect = document.getElementById("destino");

        var local = localSelect ? localSelect.value.trim() : "";
        var item = itemInput ? itemInput.value.trim() : "";
        var destino = destinoSelect ? destinoSelect.value.trim() : "";

        if (!local || !item || !destino) {
            alert("Por favor, preencha todos os campos para reservar.");
            return;
        }
        if (!/^\d{5}$/.test(item)) {
            alert("O código do item deve ter exatamente 5 dígitos.");
            return;
        }

        var solicitados = JSON.parse(localStorage.getItem("solicitados")) || [];
        var itemJaSolicitado = solicitados.some(function (solicitado) {
            return (
                solicitado.local === local &&
                solicitado.item === item &&
                solicitado.destino === destino
            );
        });

        if (itemJaSolicitado) {
            mostrarJanelaAtencao(
                "Este item já foi solicitado. Deseja continuar?",
                function () {
                    abrirJanelaReserva({ local, item, destino });
                },
                function () {}
            );
        } else {
            abrirJanelaReserva({ local, item, destino });
        }
    });
}

// Abre janela de reserva
function abrirJanelaReserva(dados) {
    var janelaReserva = document.getElementById("janelaReserva");
    var reservaQuantidadeInput = document.getElementById("reservaQuantidade");
    var localSelect = document.getElementById("local");
    var destinoSelect = document.getElementById("destino");

    if (reservaQuantidadeInput) reservaQuantidadeInput.value = "1";

    if (localSelect) localSelect.value = (dados && dados.local) ? dados.local : "";
    if (destinoSelect) destinoSelect.value = (dados && dados.destino) ? dados.destino : "";

    janelaReserva.dataset.local = dados.local;
    janelaReserva.dataset.item = dados.item;
    janelaReserva.dataset.destino = dados.destino;

    var overlay = document.getElementById("overlay");
    if (janelaReserva && overlay) {
        janelaReserva.style.display = "";
        janelaReserva.style.animation = "none";
        janelaReserva.style.transform = "";
        janelaReserva.style.opacity = "";
        janelaReserva.offsetHeight;
        overlay.classList.add("active");
        janelaReserva.classList.remove("hidden");
        janelaReserva.style.animation = "slideDown 0.3s forwards";
        document.body.classList.add("modal-open");
    }
}
function fecharJanelaReserva() {
    var janelaReserva = document.getElementById("janelaReserva");
    var overlay = document.getElementById("overlay");
    if (janelaReserva && overlay) {
        janelaReserva.style.animation = "slideUp 0.3s forwards";
        setTimeout(function () {
            overlay.classList.remove("active");
            janelaReserva.classList.add("hidden");
            document.body.classList.remove("modal-open");

            janelaReserva.style.animation = "";
            janelaReserva.style.transform = "";
            janelaReserva.style.opacity = "";
            janelaReserva.style.display = "";
        }, 300);
    }
}
var cancelarReservaButton = document.getElementById("cancelarReservaButton");
if (cancelarReservaButton) {
    cancelarReservaButton.addEventListener("click", fecharJanelaReserva);
}

// Form da reserva
var janelaReservaForm = document.getElementById("janelaReservaForm");
if (janelaReservaForm) {
    janelaReservaForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var reservaQuantidadeInput = document.getElementById("reservaQuantidade");
        var quantidade = reservaQuantidadeInput ? reservaQuantidadeInput.value.trim() : "1";

        var janelaReserva = document.getElementById("janelaReserva");
        var local = janelaReserva.dataset.local;
        var item = janelaReserva.dataset.item;
        var destino = janelaReserva.dataset.destino;

        var reservados = JSON.parse(localStorage.getItem("reservados")) || [];
        reservados.push({ local, item, destino, quantidade });
        localStorage.setItem("reservados", JSON.stringify(reservados));

        fecharJanelaReserva();
        atualizarTabelaReservados();

        if (janelaReserva) {
            janelaReserva.style.display = "none";
        }
        alert("Material reservado com sucesso!");

        var localSelect = document.getElementById("local");
        var destinoSelectField = document.getElementById("destino");
        var itemInputReset = document.getElementById("item");
        if (localSelect) localSelect.value = "";
        if (destinoSelectField) destinoSelectField.value = "";
        if (itemInputReset) itemInputReset.value = "";
    });
}

// Excluir reservados
var excluirReservadosButton = document.getElementById("excluirReservadosButton");
if (excluirReservadosButton) {
    excluirReservadosButton.addEventListener("click", function () {
        var reservadosTable = document.getElementById("reservadosTable");
        var reservadosTableBody = reservadosTable ? reservadosTable.querySelector("tbody") : null;
        var selectAllReservadosCheckbox = document.getElementById("selectAllReservadosCheckbox");

        if (!reservadosTableBody) {
            alert("Tabela de materiais reservados não encontrada.");
            return;
        }
        if (reservadosTableBody.rows.length === 0) {
            alert("A lista de materiais reservados está vazia!");
            excluirReservadosButton.textContent = "Excluir Itens";
            return;
        }

        var checkboxColumns = reservadosTable.querySelectorAll(".checkbox-column");
        var checkboxes = reservadosTableBody.querySelectorAll(".delete-checkbox");

        if (!checkboxColumns.length) {
            alert("A coluna 'SELECIONE' não foi configurada corretamente.");
            return;
        }

        var isHidden = checkboxColumns[0].classList.contains("hidden");
        if (isHidden) {
            checkboxColumns.forEach((col) => col.classList.remove("hidden"));
            excluirReservadosButton.textContent = "Confirmar Exclusão";

            if (selectAllReservadosCheckbox) {
                selectAllReservadosCheckbox.addEventListener("change", function () {
                    var isChecked = this.checked;
                    checkboxes.forEach((cb) => {
                        cb.checked = isChecked;
                    });
                });
            }
        } else {
            var selectedCheckboxes = Array.from(checkboxes).filter((cb) => cb.checked);
            if (selectedCheckboxes.length === 0) {
                alert("Selecione os itens que deseja excluir.");
                return;
            }
            if (confirm("Tem certeza que deseja excluir os itens selecionados?")) {
                var reservados = JSON.parse(localStorage.getItem("reservados")) || [];

                selectedCheckboxes.forEach((checkbox) => {
                    var row = checkbox.closest("tr");
                    var rowIndex = Array.from(reservadosTableBody.rows).indexOf(row);

                    reservados.splice(rowIndex, 1);
                    row.remove();
                });

                localStorage.setItem("reservados", JSON.stringify(reservados));
                alert("Itens excluídos com sucesso!");

                checkboxColumns.forEach((col) => col.classList.add("hidden"));
                excluirReservadosButton.textContent = "Excluir Itens";
                if (selectAllReservadosCheckbox) selectAllReservadosCheckbox.checked = false;
            }
        }
    });
}

// Atualizar reservados
function atualizarTabelaReservados() {
    var reservados = JSON.parse(localStorage.getItem("reservados")) || [];
    var reservadosTableElement = document.getElementById("reservadosTable");
    var reservadosTableBody = reservadosTableElement ? reservadosTableElement.querySelector("tbody") : null;

    if (reservadosTableBody) {
        reservadosTableBody.innerHTML = "";
        reservados.forEach(function (item, index) {
            var newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td class="checkbox-column hidden"><input type="checkbox" class="delete-checkbox"></td>
                <td>${item.local}</td>
                <td>${item.item}</td>
                <td>${item.destino}</td>
                <td>${item.quantity || item.quantidade || "1"}</td>
                <td><button class="solicitar-button" data-index="${index}">Solicitar</button></td>
            `;
            reservadosTableBody.appendChild(newRow);

            var solicitarButton = newRow.querySelector(".solicitar-button");
            if (solicitarButton) {
                solicitarButton.addEventListener("click", function () {
                    abrirJanelaSolicitacao(item, index);
                });
            }
        });

        if (reservados.length === 0) {
            var emptyRow = document.createElement("tr");
            emptyRow.innerHTML = `
                <td colspan="6" style="text-align: center;">Nenhum material reservado no momento.</td>
            `;
            reservadosTableBody.appendChild(emptyRow);
        }
    } else {
        console.error("Tabela de itens reservados não encontrada.");
    }
}

// Atualizar solicitados
function atualizarTabelaSolicitados() {
    var solicitados = JSON.parse(localStorage.getItem("solicitados")) || [];
    var solicitadosTable = document.getElementById("solicitadosTable");
    var solicitadosTableBody = solicitadosTable ? solicitadosTable.querySelector("tbody") : null;

    if (solicitadosTableBody) {
        solicitadosTableBody.innerHTML = "";

        if (solicitados.length === 0) {
            var emptyRow = document.createElement("tr");
            emptyRow.innerHTML = `<td colspan="4" style="text-align: center;">Nenhum material solicitado no momento.</td>`;
            solicitadosTableBody.appendChild(emptyRow);
        } else {
            solicitados.forEach((item) => {
                var newRow = document.createElement("tr");
                newRow.innerHTML = `
                    <td>${item.local}</td>
                    <td>${item.item}</td>
                    <td>${item.destino}</td>
                `;
                solicitadosTableBody.appendChild(newRow);
            });
        }
    } else {
        console.error("Tabela de materiais solicitados não encontrada.");
    }
}

// DOM Loaded
document.addEventListener("DOMContentLoaded", function () {
    atualizarTabelaReservados();
    atualizarTabelaSolicitados();

    // Se for detalhes.html
    if (window.location.pathname.includes("detalhes.html")) {
        var detalhes = JSON.parse(localStorage.getItem("detalhes")) || [];
        var detalhesTableElement = document.getElementById("detalhesTable");
        var detalhesTable = detalhesTableElement ? detalhesTableElement.querySelector("tbody") : null;
        var excluirItensButton = document.getElementById("excluirItensButton");

        // Formatador
        function formatTime(milliseconds, showSeconds = false) {
            if (milliseconds < 0) milliseconds = 0;
            var totalSeconds = Math.floor(milliseconds / 1000);
            var hours = Math.floor(totalSeconds / 3600);
            var minutes = Math.floor((totalSeconds % 3600) / 60);
            var seconds = totalSeconds % 60;

            var timeString =
                String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");
            if (showSeconds) {
                timeString += ":" + String(seconds).padStart(2, "0");
            }
            return timeString;
        }

        function atualizarTabelaDetalhes() {
            var detalhes = JSON.parse(localStorage.getItem("detalhes")) || [];
            if (detalhesTable) {
                detalhesTable.innerHTML = "";
                detalhes.forEach(function (detalhe, index) {
                    var newRow = document.createElement("tr");
                    var agora = Date.now();
                    detalhe.isFuture = detalhe.timestamp > agora;

                    var tempoDisplay = detalhe.isFuture
                        ? formatTime(detalhe.timestamp - agora, true)
                        : formatTime(agora - detalhe.timestamp);

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

                    var receberButton = newRow.querySelector(".receberButton");
                    if (receberButton) {
                        receberButton.addEventListener("click", function () {
                            abrirJanelaRecebimento(index);
                        });
                    }

                    var tempoCell = newRow.querySelector(".tempo-cell");
                    if (tempoCell) {
                        function updateTimeCell(showSeconds = false) {
                            const now = Date.now();
                            const elapsed = now - detalhe.timestamp;

                            const maxTime = 30 * 60 * 1000; 
                            const midTime = 15 * 60 * 1000; 

                            if (elapsed > maxTime) {
                                newRow.classList.add("oscillation");
                                newRow.style.background = "";
                            } else {
                                newRow.classList.remove("oscillation");
                                let backgroundGradient;
                                if (elapsed <= midTime) {
                                    const percentage = (elapsed / midTime) * 100;
                                    backgroundGradient = `linear-gradient(to left, rgb(0,255,0) ${
                                        100 - percentage
                                    }%, rgb(255,255,0) ${100 - percentage}%)`;
                                } else {
                                    const percentage = ((elapsed - midTime) / (maxTime - midTime)) * 100;
                                    backgroundGradient = `linear-gradient(to left, rgb(255,255,0) ${
                                        100 - percentage
                                    }%, rgb(255,0,0) ${100 - percentage}%)`;
                                }
                                newRow.style.background = backgroundGradient;
                            }

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

                        if (detalhe.isFuture) {
                            var countdownInterval = setInterval(() => updateTimeCell(false), 1000);
                            intervalMap.set(index, countdownInterval);
                        } else {
                            var elapsedInterval = setInterval(() => updateTimeCell(false), 1000);
                            intervalMap.set(index, elapsedInterval);
                        }

                        updateTimeCell(false);

                        newRow.addEventListener("mouseover", function () {
                            if (intervalMap.has(index)) {
                                clearInterval(intervalMap.get(index));
                                intervalMap.delete(index);
                            }
                            updateTimeCell(true);
                            if (!tempoCell._hoverInterval) {
                                tempoCell._hoverInterval = setInterval(() => {
                                    const elapsedHover = Date.now() - detalhe.timestamp;
                                    tempoCell.textContent = formatTime(elapsedHover, true);
                                }, 1000);
                            }
                        });
                        newRow.addEventListener("mouseout", function () {
                            if (tempoCell._hoverInterval) {
                                clearInterval(tempoCell._hoverInterval);
                                delete tempoCell._hoverInterval;
                            }
                            if (detalhe.isFuture) {
                                if (!intervalMap.has(index)) {
                                    var countdownInterval = setInterval(
                                        () => updateTimeCell(false),
                                        1000
                                    );
                                    intervalMap.set(index, countdownInterval);
                                }
                            } else {
                                if (!intervalMap.has(index)) {
                                    var elapsedInterval = setInterval(
                                        () => updateTimeCell(false),
                                        1000
                                    );
                                    intervalMap.set(index, elapsedInterval);
                                }
                            }
                            const elapsed = Date.now() - detalhe.timestamp;
                            tempoCell.textContent = formatTime(elapsed, false);
                        });
                    }
                });

                if (detalhes.length === 0) {
                    var emptyRow = document.createElement("tr");
                    emptyRow.innerHTML = `
                        <td colspan="9" style="text-align: center;">Nenhum material solicitado no momento.</td>
                    `;
                    detalhesTable.appendChild(emptyRow);
                }
            } else {
                console.error("Tabela de detalhes não encontrada.");
            }
        }

        atualizarTabelaDetalhes();

        // Abrir janela recebimento
        function abrirJanelaRecebimento(index) {
            var detalhes = JSON.parse(localStorage.getItem("detalhes")) || [];
            var detalhe = detalhes[index];
            if (!detalhe) {
                alert("Erro: Detalhe não encontrado.");
                return;
            }

            var quantidadeSolicitada = parseInt(detalhe.quantidade, 10);
            var recebimentoQuantidadeInput = document.getElementById("recebimentoQuantidade");
            var recebimentoHorarioInput = document.getElementById("recebimentoHorario");
            var recebimentoIndexInput = document.getElementById("recebimentoIndex");

            if (recebimentoQuantidadeInput) {
                recebimentoQuantidadeInput.value = quantidadeSolicitada.toString();
                recebimentoQuantidadeInput.disabled = (quantidadeSolicitada === 1);
            }
            if (recebimentoHorarioInput) {
                var horarioAtual = new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                });
                recebimentoHorarioInput.value = horarioAtual;
            }
            if (recebimentoIndexInput) {
                recebimentoIndexInput.value = index;
            }

            var janelaRecebimento = document.getElementById("janelaRecebimento");
            var overlay = document.getElementById("overlay");

            if (janelaRecebimento && overlay) {
                overlay.classList.add("active");
                janelaRecebimento.classList.remove("hidden");
                janelaRecebimento.style.animation = "slideDown 0.3s forwards";
            } else {
                alert("Erro: Elementos da janela de recebimento não encontrados.");
            }
        }

        document
            .getElementById("cancelarRecebimentoButton")
            .addEventListener("click", function () {
                var janelaRecebimento = document.getElementById("janelaRecebimento");
                var overlay = document.getElementById("overlay");
                if (janelaRecebimento && overlay) {
                    overlay.classList.remove("active");
                    janelaRecebimento.classList.add("hidden");

                    janelaRecebimento.style.animation = "";
                    janelaRecebimento.style.display = "";
                }
            });

        document.addEventListener("DOMContentLoaded", function () {
            var overlay = document.getElementById("overlay");
            if (overlay) {
                overlay.classList.remove("active");
            }
        });

        function fecharJanelaRecebimento() {
            var janelaRecebimento = document.getElementById("janelaRecebimento");
            var overlay = document.getElementById("overlay");
            if (janelaRecebimento && overlay) {
                janelaRecebimento.style.animation = "slideUp 0.3s forwards";
                setTimeout(function () {
                    overlay.classList.remove("active");
                    janelaRecebimento.classList.add("hidden");
                    janelaRecebimento.style.animation = "";
                    document.body.classList.remove("modal-open");
                }, 300);
            }
        }

        var cancelarRecebimentoButton = document.getElementById("cancelarRecebimentoButton");
        if (cancelarRecebimentoButton) {
            cancelarRecebimentoButton.addEventListener("click", fecharJanelaRecebimento);
        }

        var recebimentoForm = document.getElementById("recebimentoForm");
        if (recebimentoForm) {
            recebimentoForm.addEventListener("submit", function (event) {
                event.preventDefault();

                var recebimentoIndexInput = document.getElementById("recebimentoIndex");
                var recebimentoQuantidadeInput = document.getElementById("recebimentoQuantidade");
                var recebimentoHorarioInput = document.getElementById("recebimentoHorario");

                var index = parseInt(recebimentoIndexInput ? recebimentoIndexInput.value : -1, 10);
                var quantidadeRecebidaStr = recebimentoQuantidadeInput
                    ? recebimentoQuantidadeInput.value.trim()
                    : "";
                var horarioRecebido = recebimentoHorarioInput
                    ? recebimentoHorarioInput.value.trim()
                    : "";

                if (index === -1 || isNaN(index)) {
                    alert("Erro ao identificar o item.");
                    return;
                }
                if (!horarioRecebido) {
                    alert("Por favor, insira o horário de recebimento.");
                    return;
                }
                var quantidadeRecebida = parseInt(quantidadeRecebidaStr, 10);
                if (isNaN(quantidadeRecebida) || quantidadeRecebida <= 0) {
                    alert("Por favor, insira uma quantidade válida.");
                    return;
                }
                var detalhes = JSON.parse(localStorage.getItem("detalhes")) || [];
                var detalhe = detalhes[index];
                if (!detalhe) {
                    alert("Erro ao encontrar o material nos detalhes.");
                    return;
                }
                var quantidadeSolicitada = parseInt(detalhe.quantidade, 10);
                if (quantidadeRecebida > quantidadeSolicitada) {
                    alert("A quantidade recebida não pode ser maior que a solicitada.");
                    return;
                }

                function calcularTempoDecorrido(horarioSolicitado, horarioRecebido) {
                    const [horaS, minS] = horarioSolicitado.split(":").map(Number);
                    const [horaR, minR] = horarioRecebido.split(":").map(Number);

                    const minutosSolicitados = horaS * 60 + minS;
                    const minutosRecebidos = horaR * 60 + minR;
                    const minutosDecorridos = minutosRecebidos - minutosSolicitados;
                    const horas = Math.floor(minutosDecorridos / 60);
                    const minutos = minutosDecorridos % 60;

                    return (
                        String(horas).padStart(2, "0") + ":" + String(minutos).padStart(2, "0")
                    );
                }

                const tempoDecorrido = calcularTempoDecorrido(detalhe.horario, horarioRecebido);

                if (intervalMap.has(index)) {
                    clearInterval(intervalMap.get(index));
                    intervalMap.delete(index);
                }

                var recebidos = JSON.parse(localStorage.getItem("recebidos")) || [];
                if (quantidadeRecebida === quantidadeSolicitada) {
                    recebidos.push({
                        local: detalhe.local,
                        item: detalhe.item,
                        quantidade: quantidadeRecebida,
                        destino: detalhe.destino,
                        dataAtual: detalhe.dataAtual,
                        horario: detalhe.horario,
                        recebido: horarioRecebido,
                        tempo: tempoDecorrido,
                        guardado: ""
                    });
                    localStorage.setItem("recebidos", JSON.stringify(recebidos));

                    detalhes.splice(index, 1);
                    localStorage.setItem("detalhes", JSON.stringify(detalhes));

                    var solicitados = JSON.parse(localStorage.getItem("solicitados")) || [];
                    var solicitadosIndex = solicitados.findIndex(function (itemSolicitado) {
                        return (
                            itemSolicitado.local === detalhe.local &&
                            itemSolicitado.item === detalhe.item &&
                            itemSolicitado.destino === detalhe.destino
                        );
                    });
                    if (solicitadosIndex !== -1) {
                        solicitados.splice(solicitadosIndex, 1);
                        localStorage.setItem("solicitados", JSON.stringify(solicitados));
                    }
                } else {
                    recebidos.push({
                        local: detalhe.local,
                        item: detalhe.item,
                        quantidade: quantidadeRecebida,
                        destino: detalhe.destino,
                        dataAtual: detalhe.dataAtual,
                        horario: detalhe.horario,
                        recebido: horarioRecebido,
                        tempo: tempoDecorrido,
                        guardado: ""
                    });
                    localStorage.setItem("recebidos", JSON.stringify(recebidos));

                    detalhe.quantidade = quantidadeSolicitada - quantidadeRecebida;
                    detalhes[index] = detalhe;
                    localStorage.setItem("detalhes", JSON.stringify(detalhes));
                }

                atualizarTabelaDetalhes();
                atualizarTabelaRecebidos();
                if (window.location.pathname.includes("index.html")) {
                    atualizarTabelaSolicitados();
                }
                fecharJanelaRecebimento();
                alert("Material recebido com sucesso!");
            });
        }
    }

    // Botão Data
    document.getElementById("selecionarDataButton").addEventListener("click", function () {
        const dateInput = document.getElementById("data-relatorio");
        if (dateInput) {
            dateInput.showPicker();
        }
    });
});

/* 
 * =======================
 *   JANELA DE JUSTIFICATIVA
 * =======================
 */

let justificativaIndex = -1;
const janelaJustificativa = document.getElementById("janelaJustificativaAtraso");
const justificativaForm = document.getElementById("justificativaForm");
if (justificativaForm) {
    const justificarRadio = justificativaForm.querySelector('input[value="com"]');
    const semJustificaRadio = justificativaForm.querySelector('input[value="sem"]');
    const justificativaTexto = document.getElementById("justificativaTexto");
    const contadorJustificativa = document.getElementById("contadorJustificativa");
    const cancelarJustificativaButton = document.getElementById("cancelarJustificativaButton");
    // Precisamos referenciar o botão Editar:
    const editarJustificativaButton = document.getElementById("editarJustificativaButton");

    // Abre a janela de justificativa
    window.abrirJanelaJustificativa = function (index) {
        justificativaIndex = index;

        let recebidos = JSON.parse(localStorage.getItem("recebidos")) || [];
        let item = recebidos[index];
        if (!item) {
            console.warn("Item de recebidos não encontrado para index:", index);
            return;
        }

        // Caso o item já tenha justificativa => exibe somente a descrição + botão "Editar"
        if (item.justificativa && item.justificativa.trim() !== "") {
            justificarRadio.checked = true;
            // Esconde os rádios
            justificarRadio.style.display = "none";
            semJustificaRadio.style.display = "none";

            justificativaTexto.disabled = true;
            justificativaTexto.value = item.justificativa;
            contadorJustificativa.textContent = justificativaTexto.value.length + "/200";

            if (editarJustificativaButton) {
                editarJustificativaButton.style.display = "";
            }
        } else {
            // Não tem justificativa => permitir a escolha
            semJustificaRadio.checked = true;
            justificarRadio.style.display = "";
            semJustificaRadio.style.display = "";
            if (editarJustificativaButton) editarJustificativaButton.style.display = "none";

            justificativaTexto.disabled = true;
            justificativaTexto.value = "";
            contadorJustificativa.textContent = "0/200";
        }

        if (janelaJustificativa) {
            janelaJustificativa.classList.remove("hidden");
            janelaJustificativa.style.animation = "slideDown 0.3s forwards";
        }
        let overlay = document.getElementById("overlay");
        if (overlay) overlay.classList.add("active");
    };

    // Fecha a janela de justificativa
    function fecharJanelaJustificativa() {
        if (janelaJustificativa) {
            janelaJustificativa.style.animation = "slideUp 0.3s forwards";
            setTimeout(function () {
                janelaJustificativa.classList.add("hidden");
            }, 300);
        }
        let overlay = document.getElementById("overlay");
        if (overlay) overlay.classList.remove("active");
    }

    if (cancelarJustificativaButton) {
        cancelarJustificativaButton.addEventListener("click", function () {
            fecharJanelaJustificativa();
        });
    }

    if (editarJustificativaButton) {
        editarJustificativaButton.addEventListener("click", function () {
            // Mostra os rádios novamente
            justificarRadio.style.display = "";
            semJustificaRadio.style.display = "";
            // Marca "com" e habilita texto
            justificarRadio.checked = true;
            justificativaTexto.disabled = false;
            // Some o botão Editar
            editarJustificativaButton.style.display = "none";
        });
    }

    // Submeter form => salvando justificativa
    justificativaForm.addEventListener("submit", function (e) {
        e.preventDefault();

        let recebidos = JSON.parse(localStorage.getItem("recebidos")) || [];
        let item = recebidos[justificativaIndex];
        if (!item) {
            alert("Erro: item não encontrado!");
            return;
        }

        if (justificarRadio.checked) {
            let texto = justificativaTexto.value.trim();
            if (texto.length > 200) {
                alert("O texto ultrapassou 200 caracteres. Por favor, diminua.");
                return;
            }
            item.justificativa = texto;
        } else {
            item.justificativa = "";
        }

        recebidos[justificativaIndex] = item;
        localStorage.setItem("recebidos", JSON.stringify(recebidos));

        alert("Justificativa salva com sucesso!");
        atualizarTabelaRecebidos();
        fecharJanelaJustificativa();
    });

    // Contador de caracteres
    justificativaTexto.addEventListener("input", function () {
        let len = justificativaTexto.value.length;
        contadorJustificativa.textContent = len + "/200";
        if (len > 200) {
            justificativaTexto.style.color = "red";
        } else {
            justificativaTexto.style.color = "";
        }
    });
}
