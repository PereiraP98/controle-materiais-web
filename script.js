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
                    // onConfirm: Abre a janela de solicitação
                    abrirJanelaSolicitacao({ local: local, item: item, destino: destino });
                },
                function () {
                    // onCancel: Não faz nada
                }
            );
        } else {
            // Abrir a janela de solicitação com os dados preenchidos
            abrirJanelaSolicitacao({ local: local, item: item, destino: destino });
        }
    });
}

// Cancelar a solicitação e fechar a janela flutuante
var cancelarSolicitacaoButton = document.getElementById("cancelarSolicitacaoButton");
if (cancelarSolicitacaoButton) {
    cancelarSolicitacaoButton.addEventListener("click", function () {
        fecharJanelaSolicitacao();
    });
}

var janelaForm = document.getElementById("janelaForm");
if (janelaForm) {
    janelaForm.addEventListener("submit", function (event) {
        event.preventDefault();

        // Primeiro, obter os valores antes de fechar a janela
        var fromReservadosInput = document.getElementById("fromReservados");
        var itemIndexInput = document.getElementById("itemIndex");
        var fromReservados = fromReservadosInput ? fromReservadosInput.value : "false";
        var itemIndex = itemIndexInput ? parseInt(itemIndexInput.value) : -1;

        // Fecha a janela após pegar os valores
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
            alert("O código do item deve ter exatamente 5 dígitos.");
            return;
        }

        if (!/^\d{2}:\d{2}$/.test(horario)) {
            alert("O horário deve estar no formato HH:MM.");
            return;
        }

        // Se a solicitação veio de um item reservado, remove o item agora
        if (fromReservados === "true" && itemIndex >= 0) {
            var reservados = JSON.parse(localStorage.getItem("reservados")) || [];
            if (itemIndex < reservados.length && itemIndex >= 0) {
                reservados.splice(itemIndex, 1);
                localStorage.setItem("reservados", JSON.stringify(reservados));
                atualizarTabelaReservados();
            } else {
                console.error("Índice inválido para remoção de materiais reservados.");
            }
        }

        // Registro da solicitação nos dados locais
        var dataAtual = new Date().toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });

        var dataAtualObj = new Date();
        var horarioParts = horario.split(':');
        var horas = parseInt(horarioParts[0], 10);
        var minutos = parseInt(horarioParts[1], 10);

        var timestampDate = new Date(
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
        solicitados.push({ local: local, item: item, destino: destino });
        localStorage.setItem("solicitados", JSON.stringify(solicitados));

        alert("Material solicitado com sucesso!");

        // Após a solicitação ser finalizada com sucesso, redefinimos LOCAL, DESTINO e ITEM
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

function abrirJanelaSolicitacao(dados, index) {
    var horarioAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    var localInput = document.getElementById("local");
    var itemInput = document.getElementById("item");
    var destinoSelect = document.getElementById("destino");
    var horarioInput = document.getElementById("horario");
    var fromReservadosInput = document.getElementById("fromReservados");
    var itemIndexInput = document.getElementById("itemIndex");
    var quantidadeInput = document.getElementById("quantidade");

    // Ajuste aqui: se não tiver dados, defina como ""
    if (localInput) localInput.value = (dados && dados.local) ? dados.local : "";
    if (itemInput) itemInput.value = (dados && dados.item) ? dados.item : "";
    if (destinoSelect) destinoSelect.value = (dados && dados.destino) ? dados.destino : "";
    if (horarioInput) horarioInput.value = horarioAtual;
    if (quantidadeInput) quantidadeInput.value = (dados && dados.quantidade) ? dados.quantidade : "1";

    if (typeof index !== 'undefined') {
        if (fromReservadosInput) fromReservadosInput.value = "true";
        if (itemIndexInput) itemIndexInput.value = index;
    } else {
        if (fromReservadosInput) fromReservadosInput.value = "false";
        if (itemIndexInput) itemIndexInput.value = "-1";
    }

    var janelaSolicitacao = document.getElementById("janelaSolicitacao");
    var overlay = document.getElementById("overlay");
    if (janelaSolicitacao && overlay) {
        janelaSolicitacao.style.display = '';
        janelaSolicitacao.style.animation = 'none';
        janelaSolicitacao.style.transform = '';
        janelaSolicitacao.style.opacity = '';
        janelaSolicitacao.offsetHeight;
        overlay.classList.add("active");
        janelaSolicitacao.classList.remove("hidden");
        janelaSolicitacao.style.animation = 'slideDown 0.3s forwards';
        document.body.classList.add('modal-open');
    }
}

// Função para fechar a janela de solicitação
function fecharJanelaSolicitacao() {
    var janelaSolicitacao = document.getElementById("janelaSolicitacao");
    var overlay = document.getElementById("overlay");

    if (janelaSolicitacao && overlay) {
        // Aplica a animação de saída
        janelaSolicitacao.style.animation = 'slideUp 0.3s forwards';

        // Remove o overlay e a classe 'modal-open' após a animação
        setTimeout(function () {
            overlay.classList.remove("active");
            janelaSolicitacao.classList.add("hidden");
            document.body.classList.remove('modal-open');

            // Reseta as propriedades de animação e transformação
            janelaSolicitacao.style.animation = '';
            janelaSolicitacao.style.transform = '';
            janelaSolicitacao.style.opacity = '';
            janelaSolicitacao.style.display = ''; // Remove qualquer display:none inline
        }, 300); // Duração da animação
    }

    // Limpa os campos ocultos
    var fromReservadosInput = document.getElementById("fromReservados");
    var itemIndexInput = document.getElementById("itemIndex");
    if (fromReservadosInput) fromReservadosInput.value = "false";
    if (itemIndexInput) itemIndexInput.value = "-1";
}

// Função para mostrar uma janela de atenção
function mostrarJanelaAtencao(mensagem, onConfirm, onCancel) {
    var janelaAtencao = document.getElementById("janelaAtencao");
    var atencaoMensagem = document.getElementById("atencaoMensagem");
    var confirmarAtencao = document.getElementById("confirmarAtencao");
    var cancelarAtencao = document.getElementById("cancelarAtencao");
    var overlay = document.getElementById("overlay");

    if (janelaAtencao && atencaoMensagem && overlay) {
        // Define a mensagem dinâmica
        atencaoMensagem.textContent = mensagem;

        // Resetar propriedades
        janelaAtencao.style.animation = 'none';
        janelaAtencao.style.transform = '';
        janelaAtencao.style.opacity = '';
        janelaAtencao.offsetHeight; // Força um reflow

        // Exibe o overlay e adiciona a classe 'active' para a animação
        overlay.classList.add("active");

        // Remove a classe 'hidden' e adiciona a animação de entrada
        janelaAtencao.classList.remove("hidden");
        janelaAtencao.style.animation = 'slideDown 0.3s forwards';

        // Adiciona a classe para impedir a rolagem
        document.body.classList.add('modal-open');

        // Adiciona os eventos nos botões
        if (confirmarAtencao) {
            confirmarAtencao.onclick = function () {
                if (onConfirm) onConfirm(); // Executa a ação de confirmação
                fecharJanelaAtencao(); // Fecha a janela de atenção
            };
        }

        if (cancelarAtencao) {
            cancelarAtencao.onclick = function () {
                if (onCancel) onCancel(); // Executa a ação de cancelamento
                fecharJanelaAtencao(); // Fecha a janela de atenção
            };
        }
    } else {
        console.error("Elementos da janela de atenção não encontrados.");
    }
}

// Função para fechar a janela de atenção com animação
function fecharJanelaAtencao() {
    var janelaAtencao = document.getElementById("janelaAtencao");
    var overlay = document.getElementById("overlay");

    if (janelaAtencao && overlay) {
        // Animação de saída
        janelaAtencao.style.animation = 'slideUp 0.3s forwards';

        // Remove o overlay após a animação
        setTimeout(function () {
            overlay.classList.remove("active");
            janelaAtencao.classList.add("hidden");
            document.body.classList.remove('modal-open');

            // Reseta as propriedades de animação e transformação
            janelaAtencao.style.animation = '';
            janelaAtencao.style.transform = '';
            janelaAtencao.style.opacity = '';
        }, 300); // Tempo igual à duração da animação
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
                    // onConfirm: Abre a janela de reserva
                    abrirJanelaReserva({ local, item, destino });
                },
                function () {
                    // onCancel: Não faz nada
                }
            );
        } else {
            // Abrir a janela de reserva
            abrirJanelaReserva({ local, item, destino });
        }
    });
}

// Função para abrir a janela de reserva
function abrirJanelaReserva(dados) {
    var janelaReserva = document.getElementById("janelaReserva");
    var reservaQuantidadeInput = document.getElementById("reservaQuantidade");
    var localSelect = document.getElementById("local");
    var destinoSelect = document.getElementById("destino");

    if (reservaQuantidadeInput) reservaQuantidadeInput.value = "1";

    // Se a janela de reserva também usa os mesmos campos de local e destino:
    if (localSelect) localSelect.value = (dados && dados.local) ? dados.local : "";
    if (destinoSelect) destinoSelect.value = (dados && dados.destino) ? dados.destino : "";

    janelaReserva.dataset.local = dados.local;
    janelaReserva.dataset.item = dados.item;
    janelaReserva.dataset.destino = dados.destino;

    var overlay = document.getElementById("overlay");
    if (janelaReserva && overlay) {
        janelaReserva.style.display = '';
        janelaReserva.style.animation = 'none';
        janelaReserva.style.transform = '';
        janelaReserva.style.opacity = '';
        janelaReserva.offsetHeight;
        overlay.classList.add("active");
        janelaReserva.classList.remove("hidden");
        janelaReserva.style.animation = 'slideDown 0.3s forwards';
        document.body.classList.add('modal-open');
    }
}

// Função para fechar a janela de reserva
function fecharJanelaReserva() {
    var janelaReserva = document.getElementById("janelaReserva");
    var overlay = document.getElementById("overlay");

    if (janelaReserva && overlay) {
        // Aplica a animação de saída
        janelaReserva.style.animation = 'slideUp 0.3s forwards';

        // Remove o overlay e a classe 'modal-open' após a animação
        setTimeout(function () {
            overlay.classList.remove("active");
            janelaReserva.classList.add("hidden");
            document.body.classList.remove('modal-open');

            // Reseta as propriedades de animação e transformação
            janelaReserva.style.animation = '';
            janelaReserva.style.transform = '';
            janelaReserva.style.opacity = '';
            janelaReserva.style.display = ''; // Remove qualquer display:none inline
        }, 300); // Duração da animação
    }
}

// Evento para cancelar a reserva
var cancelarReservaButton = document.getElementById("cancelarReservaButton");
if (cancelarReservaButton) {
    cancelarReservaButton.addEventListener("click", function () {
        fecharJanelaReserva();
    });
}

// Evento para confirmar a reserva
var janelaReservaForm = document.getElementById("janelaReservaForm");
if (janelaReservaForm) {
    janelaReservaForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var reservaQuantidadeInput = document.getElementById("reservaQuantidade");
        var quantidade = reservaQuantidadeInput ? reservaQuantidadeInput.value.trim() : "1";

        var janelaReserva = document.getElementById("janelaReserva");

        // Recuperar os dados armazenados
        var local = janelaReserva.dataset.local;
        var item = janelaReserva.dataset.item;
        var destino = janelaReserva.dataset.destino;

        // Adicionar ao localStorage
        var reservados = JSON.parse(localStorage.getItem("reservados")) || [];
        reservados.push({ local, item, destino, quantidade });
        localStorage.setItem("reservados", JSON.stringify(reservados));

        // Fecha a janela de reserva
        fecharJanelaReserva();

        // Atualiza a tabela de reservados
        atualizarTabelaReservados();

        if (janelaReserva) {
            janelaReserva.style.display = "none";
        }

        alert("Material reservado com sucesso!");

        // Redefinir LOCAL, DESTINO e ITEM
        var localSelect = document.getElementById("local");
        var destinoSelectField = document.getElementById("destino");
        var itemInputReset = document.getElementById("item");

        if (localSelect) localSelect.value = "";
        if (destinoSelectField) destinoSelectField.value = "";
        if (itemInputReset) itemInputReset.value = "";
    });
}

// Função para excluir itens da tabela de materiais reservados
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

        // Verifica se há itens na tabela
        if (reservadosTableBody.rows.length === 0) {
            alert("A lista de materiais reservados está vazia! Adicione itens para poder realizar a exclusão.");
            excluirReservadosButton.textContent = "Excluir Itens";
            return;
        }

        // Seleciona todas as colunas de checkbox
        var checkboxColumns = reservadosTable.querySelectorAll(".checkbox-column");
        var checkboxes = reservadosTableBody.querySelectorAll(".delete-checkbox");

        if (!checkboxColumns.length) {
            alert("A coluna 'SELECIONE' não foi configurada corretamente.");
            return;
        }

        // Verifica se a coluna está oculta
        var isHidden = checkboxColumns[0].classList.contains("hidden");

        if (isHidden) {
            // Exibir a coluna "SELECIONE"
            checkboxColumns.forEach((column) => column.classList.remove("hidden"));
            excluirReservadosButton.textContent = "Confirmar Exclusão";

            // Adiciona evento para "Selecionar Todos" no cabeçalho
            if (selectAllReservadosCheckbox) {
                selectAllReservadosCheckbox.addEventListener("change", function () {
                    // Marca ou desmarca todas as caixas de seleção
                    var isChecked = this.checked;
                    checkboxes.forEach((checkbox) => {
                        checkbox.checked = isChecked;
                    });
                });
            }
        } else {
            // Processar exclusão
            var selectedCheckboxes = Array.from(checkboxes).filter((checkbox) => checkbox.checked);

            if (selectedCheckboxes.length === 0) {
                alert("Selecione os itens que deseja excluir.");
                return;
            }

            if (confirm("Tem certeza que deseja excluir os itens selecionados?")) {
                var reservados = JSON.parse(localStorage.getItem("reservados")) || [];

                selectedCheckboxes.forEach((checkbox) => {
                    var row = checkbox.closest("tr");
                    var rowIndex = Array.from(reservadosTableBody.rows).indexOf(row);

                    // Remove do array de reservados
                    reservados.splice(rowIndex, 1);

                    // Remove a linha da tabela
                    row.remove();
                });

                // Atualiza o localStorage
                localStorage.setItem("reservados", JSON.stringify(reservados));

                alert("Itens excluídos com sucesso!");

                // Ocultar novamente a coluna "SELECIONE"
                checkboxColumns.forEach((column) => column.classList.add("hidden"));
                excluirReservadosButton.textContent = "Excluir Itens";

                // Desmarcar a caixa "Selecionar Todos"
                if (selectAllReservadosCheckbox) selectAllReservadosCheckbox.checked = false;
            }
        }
    });
}

function atualizarTabelaReservados() {
    var reservados = JSON.parse(localStorage.getItem("reservados")) || [];
    var reservadosTableElement = document.getElementById("reservadosTable");
    var reservadosTableBody = reservadosTableElement ? reservadosTableElement.querySelector("tbody") : null;

    if (reservadosTableBody) {
        reservadosTableBody.innerHTML = ""; // Limpa a tabela antes de recarregar

        reservados.forEach(function (item, index) {
            let currentItem = item;
            let currentIndex = index;

            var newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td class="checkbox-column hidden"><input type="checkbox" class="delete-checkbox"></td>
                <td>${currentItem.local}</td>
                <td>${currentItem.item}</td>
                <td>${currentItem.destino}</td>
                <td>${currentItem.quantidade}</td>
                <td><button class="solicitar-button" data-index="${currentIndex}">Solicitar</button></td>
            `;

            reservadosTableBody.appendChild(newRow);

            // Adiciona evento ao botão de "Solicitar" SEM remover o item imediatamente
            var solicitarButton = newRow.querySelector(".solicitar-button");
            if (solicitarButton) {
                solicitarButton.addEventListener("click", function () {
                    // Agora apenas abrimos a janela e passamos o índice do item
                    abrirJanelaSolicitacao(item, currentIndex);
                });
            }
        });

        // Mensagem para tabela vazia
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

function atualizarTabelaSolicitados() {
    var solicitados = JSON.parse(localStorage.getItem("solicitados")) || [];
    var solicitadosTable = document.getElementById("solicitadosTable");
    var solicitadosTableBody = solicitadosTable ? solicitadosTable.querySelector("tbody") : null;

    if (solicitadosTableBody) {
        solicitadosTableBody.innerHTML = ""; // Limpa a tabela

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

// Carrega os dados ao carregar a página
document.addEventListener("DOMContentLoaded", function () {
    atualizarTabelaReservados();
    atualizarTabelaSolicitados();

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
            var detalhes = JSON.parse(localStorage.getItem("detalhes")) || [];
            var detalhesTableElement = document.getElementById("detalhesTable");
            var detalhesTable = detalhesTableElement ? detalhesTableElement.querySelector("tbody") : null;

            if (detalhesTable) {
                detalhesTable.innerHTML = ""; // Limpa a tabela antes de recarregar

                detalhes.forEach(function (detalhe, index) {
                    var newRow = document.createElement("tr");

                    // Determina se o horário é no futuro ou no passado
                    var agora = Date.now();
                    detalhe.isFuture = detalhe.timestamp > agora;

                    // Calcula o tempo restante ou decorrido
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
                            const elapsed = now - detalhe.timestamp; // Tempo decorrido em ms

                            // Define tempos limites
                            const maxTime = 30 * 60 * 1000; // 30 minutos
                            const midTime = 15 * 60 * 1000; // 15 minutos

                            if (elapsed > maxTime) {
                                newRow.classList.add("oscillation");
                                newRow.style.background = ""; // Remove estilos inline conflitantes
                            } else {
                                newRow.classList.remove("oscillation");

                                // Gradiente dinâmico para preenchimento da barra
                                let backgroundGradient;
                                if (elapsed <= midTime) {
                                    const percentage = (elapsed / midTime) * 100;
                                    backgroundGradient = `linear-gradient(to left, rgb(0, 255, 0) ${100 - percentage}%, rgb(255, 255, 0) ${100 - percentage}%)`;
                                } else {
                                    const percentage = ((elapsed - midTime) / (maxTime - midTime)) * 100;
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
                            // Inicia a contagem regressiva
                            var countdownInterval = setInterval(() => updateTimeCell(false), 1000);
                            intervalMap.set(index, countdownInterval);
                        } else {
                            // Inicia a contagem do tempo decorrido
                            var elapsedInterval = setInterval(() => updateTimeCell(false), 1000);
                            intervalMap.set(index, elapsedInterval);
                        }

                        // Exibição inicial
                        updateTimeCell(false);

                        // Eventos de hover para exibir e ocultar os segundos
                        newRow.addEventListener("mouseover", function () {
                            // Pausa o intervalo padrão
                            if (intervalMap.has(index)) {
                                clearInterval(intervalMap.get(index));
                                intervalMap.delete(index);
                            }

                            // Atualiza imediatamente com segundos e inicia um intervalo de hover
                            updateTimeCell(true);
                            if (!tempoCell._hoverInterval) {
                                tempoCell._hoverInterval = setInterval(() => {
                                    const elapsedHover = Date.now() - detalhe.timestamp;
                                    tempoCell.textContent = formatTime(elapsedHover, true);
                                }, 1000);
                            }
                        });

                        newRow.addEventListener("mouseout", function () {
                            // Para a contagem dos segundos durante o hover
                            if (tempoCell._hoverInterval) {
                                clearInterval(tempoCell._hoverInterval);
                                delete tempoCell._hoverInterval;
                            }

                            // Verifica se o item é futuro ou passado e retoma a contagem normal
                            if (detalhe.isFuture) {
                                if (!intervalMap.has(index)) {
                                    var countdownInterval = setInterval(() => updateTimeCell(false), 1000);
                                    intervalMap.set(index, countdownInterval);
                                }
                            } else {
                                if (!intervalMap.has(index)) {
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

                // Mensagem para tabela vazia
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

        // Função para abrir a janela flutuante de recebimento
        function abrirJanelaRecebimento(index) {
            var detalhes = JSON.parse(localStorage.getItem("detalhes")) || [];
            var detalhe = detalhes[index];

            if (!detalhe) {
                alert("Erro: Detalhe não encontrado para o índice fornecido.");
                return;
            }

            // Converte a quantidade para número
            var quantidadeSolicitada = parseInt(detalhe.quantidade, 10);

            var recebimentoQuantidadeInput = document.getElementById("recebimentoQuantidade");
            var recebimentoHorarioInput = document.getElementById("recebimentoHorario");
            var recebimentoIndexInput = document.getElementById("recebimentoIndex");

            if (recebimentoQuantidadeInput) {
                recebimentoQuantidadeInput.value = quantidadeSolicitada.toString();
                // Desabilita o campo de quantidade somente se quantidadeSolicitada === 1
                recebimentoQuantidadeInput.disabled = (quantidadeSolicitada === 1);
            }

            if (recebimentoHorarioInput) {
                var horarioAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

        // Evento para fechar a janela de recebimento e remover o overlay
        document.getElementById("cancelarRecebimentoButton").addEventListener("click", function () {
            var janelaRecebimento = document.getElementById("janelaRecebimento");
            var overlay = document.getElementById("overlay");

            if (janelaRecebimento && overlay) {
                overlay.classList.remove("active");
                janelaRecebimento.classList.add("hidden");

                // Reseta estilos e animações
                janelaRecebimento.style.animation = "";
                janelaRecebimento.style.display = "";
            }
        });

        // Garantia de reset do overlay ao carregar a página
        document.addEventListener("DOMContentLoaded", function () {
            var overlay = document.getElementById("overlay");
            if (overlay) {
                overlay.classList.remove("active");
            }
        });

        // Função para fechar a janela de recebimento
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

        // Confirma o recebimento
        var recebimentoForm = document.getElementById("recebimentoForm");
        if (recebimentoForm) {
            recebimentoForm.addEventListener("submit", function (event) {
                event.preventDefault();

                var recebimentoIndexInput = document.getElementById("recebimentoIndex");
                var recebimentoQuantidadeInput = document.getElementById("recebimentoQuantidade");
                var recebimentoHorarioInput = document.getElementById("recebimentoHorario");

                var index = parseInt(recebimentoIndexInput ? recebimentoIndexInput.value : -1, 10);
                var quantidadeRecebidaStr = recebimentoQuantidadeInput ? recebimentoQuantidadeInput.value.trim() : "";
                var horarioRecebido = recebimentoHorarioInput ? recebimentoHorarioInput.value.trim() : "";

                if (index === -1 || isNaN(index)) {
                    alert("Erro ao identificar o item a ser recebido.");
                    return;
                }

                if (!horarioRecebido) {
                    alert("Por favor, insira o horário de recebimento.");
                    return;
                }

                var quantidadeRecebida = parseInt(quantidadeRecebidaStr, 10);
                if (isNaN(quantidadeRecebida) || quantidadeRecebida <= 0) {
                    alert("Por favor, insira uma quantidade válida recebida.");
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
                    alert("A quantidade recebida não pode ser maior que a quantidade solicitada.");
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

                    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
                }

                const tempoDecorrido = calcularTempoDecorrido(detalhe.horario, horarioRecebido);

                // Limpa os intervals do cronômetro, se houver
                if (intervalMap.has(index)) {
                    clearInterval(intervalMap.get(index));
                    intervalMap.delete(index);
                }

                var recebidos = JSON.parse(localStorage.getItem("recebidos")) || [];

                if (quantidadeRecebida === quantidadeSolicitada) {
                    // Recebimento total
                    recebidos.push({
                        local: detalhe.local,
                        item: detalhe.item,
                        quantidade: quantidadeRecebida,
                        destino: detalhe.destino,
                        dataAtual: detalhe.dataAtual,
                        horario: detalhe.horario,
                        recebido: horarioRecebido,
                        tempo: tempoDecorrido,
                        guardado: ''
                    });
                    localStorage.setItem("recebidos", JSON.stringify(recebidos));

                    // Remove o item de detalhes, pois não há mais pendência
                    detalhes.splice(index, 1);
                    localStorage.setItem("detalhes", JSON.stringify(detalhes));

                    // Remove o item de solicitados também
                    var solicitados = JSON.parse(localStorage.getItem("solicitados")) || [];
                    var solicitadosIndex = solicitados.findIndex(function (itemSolicitado) {
                        return itemSolicitado.local === detalhe.local &&
                            itemSolicitado.item === detalhe.item &&
                            itemSolicitado.destino === detalhe.destino;
                    });

                    if (solicitadosIndex !== -1) {
                        solicitados.splice(solicitadosIndex, 1);
                        localStorage.setItem("solicitados", JSON.stringify(solicitados));
                    }

                } else {
                    // Recebimento parcial
                    recebidos.push({
                        local: detalhe.local,
                        item: detalhe.item,
                        quantidade: quantidadeRecebida,
                        destino: detalhe.destino,
                        dataAtual: detalhe.dataAtual,
                        horario: detalhe.horario,
                        recebido: horarioRecebido,
                        tempo: tempoDecorrido,
                        guardado: ''
                    });
                    localStorage.setItem("recebidos", JSON.stringify(recebidos));

                    // Atualiza a quantidade pendente
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

        function calcularTempoDecorrido(horarioSolicitado, horarioRecebido) {
            const [horaS, minS] = horarioSolicitado.split(":").map(Number);
            const [horaR, minR] = horarioRecebido.split(":").map(Number);

            const dataAtual = new Date();
            const dataSolicitada = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate(), horaS, minS);
            const dataRecebida = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate(), horaR, minR);

            if (dataRecebida < dataSolicitada) {
                dataRecebida.setDate(dataRecebida.getDate() + 1);
            }

            const diffMs = dataRecebida - dataSolicitada;
            const diffMinutes = Math.floor(diffMs / 60000);

            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;

            return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
        }

        // Função para atualizar a tabela de materiais recebidos
        var recebidosTableElement = document.getElementById("recebidosTable");
        var recebidosTable = recebidosTableElement ? recebidosTableElement.querySelector("tbody") : null;

        function atualizarTabelaRecebidos() {
            var recebidos = JSON.parse(localStorage.getItem("recebidos")) || [];
            if (recebidosTable) {
                recebidosTable.innerHTML = ""; // Limpa a tabela antes de recarregar
        
                recebidos.forEach(function (item, index) {
                    // Verifica se é atrasado
                    let [h, m] = (item.tempo || "00:00").split(":" ).map(Number);
                    let totalMin = h * 60 + m;
                    let isAtrasado = (totalMin > 30);
        
                    // Define o emoji (⚠️ ou 📜 ou nada)
                    let emoji = "";
                    if (isAtrasado) {
                        if (item.justificativa && item.justificativa.trim() !== "") {
                            emoji = "📜"; // Já justificado
                        } else {
                            emoji = "⚠️"; // Não justificado
                        }
                    }
        
                    // Monta o campo TEMPO (ex: "01:25⚠️" ou "01:25📜")
                    let tempoCell = (item.tempo || "");
                    if (emoji) {
                        tempoCell += `${emoji}`; // Adiciona o emoji ao lado do tempo
                    }
        
                    // Adiciona funcionalidade de clicar para visualizar ou justificar
                    if (emoji) {
                        if (emoji === "⚠️") {
                            // Clique para justificar
                            tempoCell = `
                                <span style="cursor: pointer; color: red;"
                                      onclick="abrirJanelaJustificativa(${index})"
                                      title="Clique para justificar o atraso">
                                    ${tempoCell}
                                </span>
                            `;
                        } else if (emoji === "📜") {
                            // Clique para exibir justificativa salva
                            tempoCell = `
                                <span style="cursor: pointer; color: green;"
                                      onclick="mostrarJustificativa(${index})"
                                      title="Clique para visualizar a justificativa">
                                    ${tempoCell}
                                </span>
                            `;
                        }
                    }
        
                    // Atualiza a célula de GUARDADO
                    let guardadoCell = item.guardado || "NÃO📥";
                    guardadoCell = `
                        <span style="cursor: pointer; color: ${guardadoCell.includes("NÃO") ? "red" : "green"};"
                              onclick="${guardadoCell.includes("NÃO") ? "abrirJanelaGuardarMaterial" : "visualizarMaterialGuardado"}(${index})"
                              title="Clique para ${guardadoCell.includes("NÃO") ? "guardar" : "visualizar dados do material guardado"}">
                            ${guardadoCell}
                        </span>
                    `;
        
                    // Cria uma nova linha na tabela
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
                        <td>${tempoCell}</td>
                        <td>${guardadoCell}</td>
                    `;
                    recebidosTable.appendChild(newRow);
                });
        
                // Mensagem para tabela vazia
                if (recebidos.length === 0) {
                    var emptyRow = document.createElement("tr");
                    emptyRow.innerHTML = `
                        <td colspan="10" style="text-align: center;">Nenhum material recebido no momento.</td>
                    `;
                    recebidosTable.appendChild(emptyRow);
                }
            } else {
                console.error("Tabela de materiais recebidos não encontrada.");
            }
        }
        
        
        
        

        atualizarTabelaRecebidos();

        // Função para excluir itens da tabela de materiais solicitados
        var excluirItensButton = document.getElementById("excluirItensButton");

        if (excluirItensButton) {
            excluirItensButton.addEventListener("click", function () {
                var detalhesTable = document.getElementById("detalhesTable");
                var detalhesTableBody = detalhesTable ? detalhesTable.querySelector("tbody") : null;
                var selectAllCheckbox = document.getElementById("selectAllCheckbox");

                if (!detalhesTableBody) {
                    alert("Tabela de materiais solicitados não encontrada.");
                    return;
                }

                if (detalhesTableBody.rows.length === 0) {
                    alert("A lista de materiais solicitados está vazia! Adicione itens para poder realizar a exclusão.");
                    excluirItensButton.textContent = "Excluir Itens";
                    return;
                }

                var checkboxColumns = detalhesTable.querySelectorAll(".checkbox-column");
                var checkboxes = detalhesTableBody.querySelectorAll(".delete-checkbox");

                if (!checkboxColumns.length) {
                    alert("A coluna 'SELECIONE' não foi configurada corretamente.");
                    return;
                }

                var isHidden = checkboxColumns[0].classList.contains("hidden");

                if (isHidden) {
                    checkboxColumns.forEach((column) => column.classList.remove("hidden"));
                    excluirItensButton.textContent = "Confirmar Exclusão";

                    if (selectAllCheckbox) {
                        selectAllCheckbox.addEventListener("change", function () {
                            var isChecked = this.checked;
                            checkboxes.forEach((checkbox) => {
                                checkbox.checked = isChecked;
                            });
                        });
                    }
                } else {
                    var selectedCheckboxes = Array.from(checkboxes).filter((checkbox) => checkbox.checked);

                    if (selectedCheckboxes.length === 0) {
                        alert("Selecione os itens que deseja excluir.");
                        return;
                    }

                    if (confirm("Tem certeza que deseja excluir os itens selecionados?")) {
                        var detalhes = JSON.parse(localStorage.getItem("detalhes")) || [];
                        var solicitados = JSON.parse(localStorage.getItem("solicitados")) || [];

                        selectedCheckboxes.forEach((checkbox) => {
                            var row = checkbox.closest("tr");
                            var rowIndex = Array.from(detalhesTableBody.rows).indexOf(row);

                            var detalheExcluido = detalhes.splice(rowIndex, 1)[0];

                            solicitados = solicitados.filter((itemSolicitado) => {
                                return !(
                                    itemSolicitado.local === detalheExcluido.local &&
                                    itemSolicitado.item === detalheExcluido.item &&
                                    itemSolicitado.destino === detalheExcluido.destino
                                );
                            });

                            row.remove();
                        });

                        localStorage.setItem("detalhes", JSON.stringify(detalhes));
                        localStorage.setItem("solicitados", JSON.stringify(solicitados));

                        alert("Itens excluídos com sucesso!");

                        checkboxColumns.forEach((column) => column.classList.add("hidden"));
                        excluirItensButton.textContent = "Excluir Itens";

                        if (selectAllCheckbox) selectAllCheckbox.checked = false;

                        if (window.location.pathname.includes("index.html")) {
                            atualizarTabelaSolicitados();
                        }
                    }
                }
            });
        }

        // Função para excluir itens da tabela de materiais recebidos
        var excluirRecebidosButton = document.getElementById("excluirRecebidosButton");

        if (excluirRecebidosButton) {
            excluirRecebidosButton.addEventListener("click", function () {
                var recebidosTable = document.getElementById("recebidosTable");
                var recebidosTableBody = recebidosTable ? recebidosTable.querySelector("tbody") : null;
                var selectAllRecebidosCheckbox = document.getElementById("selectAllRecebidosCheckbox");

                if (!recebidosTableBody) {
                    alert("Tabela de materiais recebidos não encontrada.");
                    return;
                }

                if (recebidosTableBody.rows.length === 0) {
                    alert("A lista de materiais recebidos está vazia! Adicione itens para poder realizar a exclusão.");
                    excluirRecebidosButton.textContent = "Excluir Itens";
                    return;
                }

                var checkboxColumns = recebidosTable.querySelectorAll(".checkbox-column");
                var checkboxes = recebidosTableBody.querySelectorAll(".delete-checkbox");

                if (!checkboxColumns.length) {
                    alert("A coluna 'SELECIONE' não foi configurada corretamente.");
                    return;
                }

                var isHidden = checkboxColumns[0].classList.contains("hidden");

                if (isHidden) {
                    checkboxColumns.forEach((column) => column.classList.remove("hidden"));
                    excluirRecebidosButton.textContent = "Confirmar Exclusão";

                    if (selectAllRecebidosCheckbox) {
                        selectAllRecebidosCheckbox.addEventListener("change", function () {
                            var isChecked = this.checked;
                            checkboxes.forEach((checkbox) => {
                                checkbox.checked = isChecked;
                            });
                        });
                    }
                } else {
                    var selectedCheckboxes = Array.from(checkboxes).filter((checkbox) => checkbox.checked);

                    if (selectedCheckboxes.length === 0) {
                        alert("Selecione os itens que deseja excluir.");
                        return;
                    }

                    if (confirm("Tem certeza que deseja excluir os itens selecionados?")) {
                        var recebidos = JSON.parse(localStorage.getItem("recebidos")) || [];

                        selectedCheckboxes.forEach((checkbox) => {
                            var row = checkbox.closest("tr");
                            var rowIndex = Array.from(recebidosTableBody.rows).indexOf(row);

                            recebidos.splice(rowIndex, 1);

                            row.remove();
                        });

                        localStorage.setItem("recebidos", JSON.stringify(recebidos));

                        alert("Itens excluídos com sucesso!");

                        checkboxColumns.forEach((column) => column.classList.add("hidden"));
                        excluirRecebidosButton.textContent = "Excluir Itens";

                        if (selectAllRecebidosCheckbox) selectAllRecebidosCheckbox.checked = false;
                    }
                }
            });
        }

        // Função para reportar itens atrasados
        var reportarItensButton = document.getElementById("reportarItensButton");
        var selectAllCheckbox = document.getElementById("selectAllCheckbox");

        if (reportarItensButton) {
            reportarItensButton.addEventListener("click", function () {
                var detalhesTable = document.getElementById("detalhesTable");
                var detalhesTableBody = detalhesTable ? detalhesTable.querySelector("tbody") : null;

                if (!detalhesTableBody) {
                    alert("Tabela de materiais solicitados não encontrada.");
                    return;
                }

                var checkboxColumns = detalhesTable.querySelectorAll(".checkbox-column");
                var checkboxes = detalhesTableBody.querySelectorAll(".delete-checkbox");

                if (!checkboxColumns.length) {
                    alert("A coluna 'SELECIONE' não foi configurada corretamente.");
                    return;
                }

                var isHidden = checkboxColumns[0].classList.contains("hidden");

                if (isHidden) {
                    checkboxColumns.forEach((column) => column.classList.remove("hidden"));
                    checkboxes.forEach((checkbox) => (checkbox.checked = false));
                    reportarItensButton.textContent = "Confirmar Reporte";

                    if (selectAllCheckbox) {
                        selectAllCheckbox.addEventListener("change", function () {
                            checkboxes.forEach((checkbox) => {
                                var row = checkbox.closest("tr");
                                var horaCell = row.children[6].textContent;

                                if (verificarAtraso(horaCell)) {
                                    checkbox.checked = this.checked;
                                }
                            });
                        });
                    }
                } else {
                    var selectedCheckboxes = Array.from(checkboxes).filter((checkbox) => checkbox.checked);

                    if (selectedCheckboxes.length === 0) {
                        alert("Selecione os itens que deseja reportar.");
                        return;
                    }

                    var detalhesReportados = [];
                    var erro = false;

                    selectedCheckboxes.forEach((checkbox) => {
                        var row = checkbox.closest("tr");
                        var horaCell = row.children[6].textContent;
                        var local = row.children[1].textContent;
                        var item = row.children[2].textContent;

                        if (!verificarAtraso(horaCell)) {
                            alert(`Não é possível reportar o material (${local} - ${item}) porque ele não ultrapassou o tempo de atraso!`);
                            erro = true;
                            checkbox.checked = false;
                        } else {
                            detalhesReportados.push(`• ${local} - ${item}`);
                        }
                    });

                    if (erro) {
                        return;
                    }

                    var confirmacao = confirm(
                        `Tem certeza que deseja reportar os seguintes itens?\n\n${detalhesReportados.join("\n")}`
                    );

                    if (confirmacao) {
                        alert("Reporte realizado com sucesso!");
                        checkboxColumns.forEach((column) => column.classList.add("hidden"));
                        reportarItensButton.textContent = "Reportar";
                    }
                }
            });
        }

        function verificarAtraso(horaSolicitada) {
            var agora = new Date();
            var [horas, minutos] = horaSolicitada.split(":").map(Number);

            var horarioSolicitado = new Date();
            horarioSolicitado.setHours(horas, minutos, 0, 0);

            var diferencaMinutos = Math.floor((agora - horarioSolicitado) / 60000);

            return diferencaMinutos >= 30;
        }
    }

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
 *
 * Adicionamos abaixo a janela flutuante moderna para justificar 
 * atraso. Você deve ter o HTML correspondente em "detalhes.html"
 * (ex.: <div id="janelaJustificativaAtraso" ...>).
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

    // Abre a janela de justificativa
    window.abrirJanelaJustificativa = function (index) {
        justificativaIndex = index;

        let recebidos = JSON.parse(localStorage.getItem("recebidos")) || [];
        let item = recebidos[index];
        if (!item) {
            console.warn("Item de recebidos não encontrado para index:", index);
            return;
        }

        if (item.justificativa && item.justificativa !== "") {
            justificarRadio.checked = true;
            justificativaTexto.disabled = false;
            justificativaTexto.value = item.justificativa;
            contadorJustificativa.textContent = justificativaTexto.value.length + "/200";
        } else {
            semJustificaRadio.checked = true;
            justificativaTexto.disabled = true;
            justificativaTexto.value = "";
            contadorJustificativa.textContent = "0/200";
        }

        if (janelaJustificativa) {
            janelaJustificativa.classList.remove("hidden");
            janelaJustificativa.style.animation = 'slideDown 0.3s forwards';
        }
        let overlay = document.getElementById("overlay");
        if (overlay) overlay.classList.add("active");
    };

    // Fecha a janela de justificativa
    function fecharJanelaJustificativa() {
        if (janelaJustificativa) {
            janelaJustificativa.style.animation = 'slideUp 0.3s forwards';
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

    // Radios => habilitar/desabilitar textarea
    justificativaForm.addEventListener("change", function(e) {
        if (e.target.name === "radioJustificativa") {
            if (justificarRadio.checked) {
                justificativaTexto.disabled = false;
            } else {
                justificativaTexto.disabled = true;
                justificativaTexto.value = "";
                contadorJustificativa.textContent = "0/200";
            }
        }
    });

    // Contador de caracteres
    justificativaTexto.addEventListener("input", function() {
        let len = justificativaTexto.value.length;
        contadorJustificativa.textContent = len + "/200";
        if (len > 200) {
            justificativaTexto.style.color = "red";
        } else {
            justificativaTexto.style.color = "";
        }
    });

    // Submeter o form => salvar justificativa
    justificativaForm.addEventListener("submit", function(e) {
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

        // Aqui substituímos o ALERT pela janela de confirmação
        mostrarJanelaConfirmacao("Justificativa salva com sucesso!", function() {
            // Ao clicar em OK, fechamos a de justificativa e executamos a callback
            fecharJanelaJustificativa();     
            atualizarTabelaRecebidos();      

            // Redireciona (ou recarrega) para detalhes.html
            window.location.href = "detalhes.html";
        });
    });
}

/* 
 * =======================
 *   JANELA DE CONFIRMAÇÃO
 * =======================
 */

// Função para abrir a janela de confirmação
function mostrarJanelaConfirmacao(mensagem, onOk) {
    const janelaConfirmacao = document.getElementById("janelaConfirmacao");
    const confirmacaoMensagem = document.getElementById("confirmacaoMensagem");
    const okConfirmacaoButton = document.getElementById("okConfirmacaoButton");
    const overlay = document.getElementById("overlay");

    if (!janelaConfirmacao || !confirmacaoMensagem || !okConfirmacaoButton) {
        console.error("Elementos da janela de confirmação não encontrados.");
        return;
    }

    // Define a mensagem de confirmação
    confirmacaoMensagem.textContent = mensagem;

    // Exibe o overlay e a janela
    overlay.classList.add("active");
    janelaConfirmacao.classList.remove("hidden");
    janelaConfirmacao.style.animation = "slideDown 0.3s forwards";

    // Adiciona evento ao botão "OK"
    okConfirmacaoButton.onclick = function () {
        // Fecha a janela de justificativa, se estiver aberta
        fecharJanelaJustificativa();

        // Executa a callback personalizada
        if (typeof onOk === "function") {
            onOk();
        }

        // Fecha a janela de confirmação
        fecharJanelaConfirmacao();

        // Recarrega a página detalhes.html
        window.location.href = "detalhes.html";
    };
}

// Função para fechar a janela de confirmação
function fecharJanelaConfirmacao() {
    const janelaConfirmacao = document.getElementById("janelaConfirmacao");
    const overlay = document.getElementById("overlay");

    if (!janelaConfirmacao) {
        console.error("janelaConfirmacao não encontrada!");
        // Remove o overlay como fallback
        if (overlay) overlay.classList.remove("active");
        return;
    }

    janelaConfirmacao.style.animation = "slideUp 0.3s forwards";

    setTimeout(() => {
        janelaConfirmacao.classList.add("hidden");
        janelaConfirmacao.style.animation = "";

        // Remove o overlay se nenhuma outra janela estiver ativa
        overlay.classList.remove("active");
    }, 300);
}

// Função para fechar a janela de justificativa
function fecharJanelaJustificativa() {
    const janelaJustificativa = document.getElementById("janelaJustificativaAtraso");
    const overlay = document.getElementById("overlay");

    if (!janelaJustificativa) {
        console.error("janelaJustificativa não encontrada!");
        return;
    }

    janelaJustificativa.style.animation = "slideUp 0.3s forwards";

    setTimeout(() => {
        janelaJustificativa.classList.add("hidden");
        janelaJustificativa.style.animation = "";

        // Remove o overlay caso nenhuma outra janela esteja ativa
        if (overlay) overlay.classList.remove("active");
    }, 300);
}

okConfirmacaoButton.onclick = function () {
    console.log("Botão OK foi clicado");

    // Fecha a janela de justificativa se estiver aberta
    fecharJanelaJustificativa();

    // Fecha a janela de confirmação
    fecharJanelaConfirmacao();

    // Redireciona ou recarrega a página, se necessário
    window.location.href = "detalhes.html";
};

// Função para lidar com o clique no botão "OK" da janela de confirmação
document.getElementById("okConfirmacaoButton").addEventListener("click", function () {
    // Fecha a janela de confirmação
    if (janelaConfirmacao) {
        janelaConfirmacao.style.animation = "slideUp 0.3s forwards";
        setTimeout(() => {
            janelaConfirmacao.classList.add("hidden");
        }, 300);
    }

    // Remove o overlay
    let overlay = document.getElementById("overlay");
    if (overlay) overlay.classList.remove("active");

    // Recarrega a página para refletir as alterações
    location.reload();
});

window.mostrarJustificativa = function (index) {
    let recebidos = JSON.parse(localStorage.getItem("recebidos")) || [];
    let item = recebidos[index];

    if (!item || !item.justificativa || item.justificativa.trim() === "") {
        alert("Nenhuma justificativa salva para este item.");
        return;
    }

    // Atualiza o conteúdo da janela com a justificativa salva
    document.getElementById("justificativaTextoSalvo").textContent = item.justificativa;

    // Mostra a janela flutuante
    let janelaMostrar = document.getElementById("janelaMostrarJustificativa");
    if (janelaMostrar) {
        janelaMostrar.classList.remove("hidden");
        janelaMostrar.style.animation = "slideDown 0.3s forwards";
    }

    // Ativa o overlay
    let overlay = document.getElementById("overlay");
    if (overlay) overlay.classList.add("active");

    // Armazena o índice do item atual para edição
    justificativaIndex = index;
};

document.getElementById("editarJustificativaButton").addEventListener("click", function () {
    // Fecha a janela de exibição
    let janelaMostrar = document.getElementById("janelaMostrarJustificativa");
    if (janelaMostrar) {
        janelaMostrar.style.animation = "slideUp 0.3s forwards";
        setTimeout(() => {
            janelaMostrar.classList.add("hidden");
        }, 300);
    }

    // Abre a janela de edição de justificativa
    abrirJanelaJustificativa(justificativaIndex);
});

document.getElementById("fecharMostrarJustificativaButton").addEventListener("click", function () {
    let janelaMostrar = document.getElementById("janelaMostrarJustificativa");
    if (janelaMostrar) {
        janelaMostrar.style.animation = "slideUp 0.3s forwards";
        setTimeout(() => {
            janelaMostrar.classList.add("hidden");
        }, 300);
    }

    // Remove o overlay
    let overlay = document.getElementById("overlay");
    if (overlay) overlay.classList.remove("active");
});

function abrirJanelaGuardarMaterial(index) {
    let recebidos = JSON.parse(localStorage.getItem("recebidos")) || [];
    let item = recebidos[index];
    if (!item) {
        console.warn("Item de recebidos não encontrado para index:", index);
        return;
    }

    // Fecha a janela de visualização se estiver aberta
    let janelaVisualizacao = document.getElementById("janelaVisualizacaoMaterial");
    if (janelaVisualizacao && !janelaVisualizacao.classList.contains("hidden")) {
        janelaVisualizacao.classList.add("hidden");
    }

    // Preenche os dados na janela de guarda
    document.getElementById("guardarCodigo").textContent = item.item;
    document.getElementById("guardarQuantidade").value = item.quantidadeGuardada || item.quantidade || 1;
    document.getElementById("guardarEndereco").value = item.endereco || "";
    document.getElementById("guardarEnderecoUZ").value = item.enderecoUZ || "";
    document.getElementById("guardarNome").value = item.nomeRepositor || "";

    // Exibe a janela de guarda
    let janelaGuardar = document.getElementById("janelaGuardarMaterial");
    if (janelaGuardar) {
        janelaGuardar.classList.remove("hidden");
        janelaGuardar.style.animation = "slideDown 0.3s forwards";
    }
    let overlay = document.getElementById("overlay");
    if (overlay) overlay.classList.add("active");

    // Define o índice do item para salvar
    document.getElementById("guardarMaterialButton").dataset.index = index;
}





function guardarMaterial() {
    let index = document.getElementById("guardarMaterialButton").dataset.index;
    let recebidos = JSON.parse(localStorage.getItem("recebidos")) || [];
    let item = recebidos[index];

    if (!item) {
        console.warn("Item de recebidos não encontrado para index:", index);
        return;
    }

    // Obtém os dados da janela
    let quantidade = parseInt(document.getElementById("guardarQuantidade").value, 10);
    let endereco = document.getElementById("guardarEndereco").value.trim().toUpperCase();
    let enderecoUZ = document.getElementById("guardarEnderecoUZ").value.trim();
    let nomeRepositor = document.getElementById("guardarNome").value.trim();

    // Valida os campos
    if (isNaN(quantidade) || quantidade <= 0 || !endereco || !enderecoUZ || !nomeRepositor) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
    }

    // Atualiza os dados no item
    item.guardado = "SIM📦";
    item.quantidadeGuardada = quantidade;
    item.endereco = endereco;
    item.enderecoUZ = enderecoUZ;
    item.nomeRepositor = nomeRepositor;

    // Salva no localStorage
    localStorage.setItem("recebidos", JSON.stringify(recebidos));

    // Fecha a janela de guardar material
    fecharJanelaGuardarMaterial();

    // Exibe a janela de confirmação
    exibirJanelaConfirmacao("Material guardado com sucesso!");
}

function fecharJanelaGuardarMaterial() {
    let janelaGuardar = document.getElementById("janelaGuardarMaterial");
    if (janelaGuardar) {
        janelaGuardar.classList.add("hidden");
    }
    let overlay = document.getElementById("overlay");
    if (overlay) overlay.classList.remove("active");
}

function exibirJanelaConfirmacao(mensagem) {
    const janelaConfirmacao = document.getElementById("janelaConfirmacao");
    const confirmacaoMensagem = document.getElementById("confirmacaoMensagem");

    if (janelaConfirmacao && confirmacaoMensagem) {
        confirmacaoMensagem.textContent = mensagem;
        janelaConfirmacao.classList.remove("hidden");
        janelaConfirmacao.style.animation = "fadeIn 0.3s forwards";

        const okButton = document.getElementById("okConfirmacaoButton");
        okButton.onclick = () => {
            janelaConfirmacao.classList.add("hidden");
            location.reload(); // Recarrega a página
        };
    }
}

function visualizarMaterialGuardado(index) {
    let recebidos = JSON.parse(localStorage.getItem("recebidos")) || [];
    let item = recebidos[index];
    if (!item) {
        console.warn("Item de recebidos não encontrado para index:", index);
        return;
    }

    // Preenche os dados na janela de visualização
    document.getElementById("visualizacaoCodigo").textContent = item.item;
    document.getElementById("visualizacaoQuantidade").textContent = item.quantidadeGuardada || item.quantidade || "";
    document.getElementById("visualizacaoEndereco").textContent = item.endereco || "N/A";
    document.getElementById("visualizacaoEnderecoUZ").textContent = item.enderecoUZ || "N/A";
    document.getElementById("visualizacaoNome").textContent = item.nomeRepositor || "N/A";

    // Armazena o índice no campo oculto
    document.getElementById("visualizacaoIndex").value = index;

    // Exibe a janela de visualização
    let janelaVisualizacao = document.getElementById("janelaVisualizacaoMaterial");
    if (janelaVisualizacao) {
        janelaVisualizacao.classList.remove("hidden");
        janelaVisualizacao.style.animation = "fadeIn 0.3s forwards";
    }
    let overlay = document.getElementById("overlay");
    if (overlay) overlay.classList.add("active");
}

function abrirJanelaVisualizacaoMaterial(index) {
    let recebidos = JSON.parse(localStorage.getItem("recebidos")) || [];
    let item = recebidos[index];
    if (!item) {
        console.warn("Item de recebidos não encontrado para index:", index);
        return;
    }

    // Preenche os dados na janela de visualização
    document.getElementById("visualizacaoCodigo").textContent = item.item || "N/A";
    document.getElementById("visualizacaoQuantidade").textContent = item.quantidadeGuardada || item.quantidade || "N/A";
    document.getElementById("visualizacaoEndereco").textContent = item.endereco || "N/A";
    document.getElementById("visualizacaoEnderecoUZ").textContent = item.enderecoUZ || "N/A";
    document.getElementById("visualizacaoNome").textContent = (item.nomeRepositor || "N/A").toUpperCase(); // Garante letras maiúsculas
    document.getElementById("visualizacaoIndex").value = index;

    // Exibe a janela de visualização
    let janelaVisualizacao = document.getElementById("janelaVisualizacaoMaterial");
    if (janelaVisualizacao) {
        janelaVisualizacao.classList.remove("hidden");
        janelaVisualizacao.style.animation = "fadeIn 0.3s forwards";
    }

    let overlay = document.getElementById("overlay");
    if (overlay) overlay.classList.add("active");
}


function fecharJanela(janelaId) {
    let janela = document.getElementById(janelaId);
    if (janela) {
        janela.classList.add("hidden");
        janela.style.animation = ""; // Reseta a animação caso seja reaberto
    }

    let overlay = document.getElementById("overlay");
    if (overlay) overlay.classList.remove("active");
}

function gerarRelatorio() {
    const solicitados = [];
    const solicitadosRows = document.querySelectorAll("#detalhesTable tbody tr");
    solicitadosRows.forEach(row => {
        const cells = row.querySelectorAll("td");
        solicitados.push({
            local: cells[1]?.textContent || "",
            item: cells[2]?.textContent || "",
            qtd: cells[3]?.textContent || "",
            destino: cells[4]?.textContent || "",
            data: cells[5]?.textContent || "",
            hora: cells[6]?.textContent || "",
            reportado: cells[7]?.textContent || ""
        });
    });

    const recebidos = [];
    const recebidosRows = document.querySelectorAll("#recebidosTable tbody tr");
    recebidosRows.forEach(row => {
        const cells = row.querySelectorAll("td");
        recebidos.push({
            local: cells[1]?.textContent || "",
            item: cells[2]?.textContent || "",
            quantidade: cells[3]?.textContent || "",
            destino: cells[4]?.textContent || "",
            data: cells[5]?.textContent || "",
            horario: cells[6]?.textContent || "",
            recebido: cells[7]?.textContent || "",
            tempo: cells[8]?.textContent || "",
            guardado: cells[9]?.textContent || ""
        });
    });

    // Obtém o mês e a data para organizar os relatórios
    const now = new Date();
    const mes = now.toLocaleString("pt-BR", { month: "long" }).toUpperCase();
    const dataCurta = now.toLocaleDateString("pt-BR").replace(/\//g, "_");

    // Carrega os relatórios existentes no localStorage
    const relatoriosMes = JSON.parse(localStorage.getItem("relatoriosMes")) || {};

    // Adiciona a estrutura do mês e da data, se necessário
    if (!relatoriosMes[mes]) {
        relatoriosMes[mes] = {};
    }
    relatoriosMes[mes][dataCurta] = { solicitados, recebidos };

    // Salva os relatórios no localStorage
    localStorage.setItem("relatoriosMes", JSON.stringify(relatoriosMes));

    alert("Relatório gerado com sucesso!");
}



