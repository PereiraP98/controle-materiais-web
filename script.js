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
// Função para abrir a janela flutuante de recebimento
function abrirJanelaRecebimento(index) {
    var detalhes = JSON.parse(localStorage.getItem("detalhes")) || []; // Carrega os detalhes do localStorage
    var detalhe = detalhes[index]; // Obtém o detalhe correspondente ao índice fornecido

    if (!detalhe) {
        alert("Erro: Detalhe não encontrado para o índice fornecido.");
        return;
    }

    // Preenche os campos da janela com os dados do item selecionado
    var recebimentoQuantidadeInput = document.getElementById("recebimentoQuantidade");
    var recebimentoHorarioInput = document.getElementById("recebimentoHorario");
    var recebimentoIndexInput = document.getElementById("recebimentoIndex");

    if (recebimentoQuantidadeInput) {
        recebimentoQuantidadeInput.value = detalhe.quantidade || "1"; // Define a quantidade ou padrão como 1

        // Se a quantidade solicitada for 1, desabilita a edição.
        // Caso contrário, habilita a edição.
        if (detalhe.quantidade === 1) {
            recebimentoQuantidadeInput.disabled = true;
        } else {
            recebimentoQuantidadeInput.disabled = false;
        }
    }

    if (recebimentoHorarioInput) {
        var horarioAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        recebimentoHorarioInput.value = horarioAtual; // Define o horário atual
    }

    if (recebimentoIndexInput) {
        recebimentoIndexInput.value = index; // Armazena o índice para uso posterior
    }

    // Mostra a janela de recebimento e o overlay
    var janelaRecebimento = document.getElementById("janelaRecebimento");
    var overlay = document.getElementById("overlay");

    if (janelaRecebimento && overlay) {
        overlay.classList.add("active");
        janelaRecebimento.classList.remove("hidden");

        // Define animação de entrada para a janela
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
        overlay.classList.remove("active"); // Remove o escurecimento da página
        janelaRecebimento.classList.add("hidden"); // Oculta a janela de recebimento

        // Reseta estilos e animações
        janelaRecebimento.style.animation = "";
        janelaRecebimento.style.display = ""; // Garante que o display seja resetado
    }
});

// Garantia de reset do overlay ao carregar a página
document.addEventListener("DOMContentLoaded", function () {
    var overlay = document.getElementById("overlay");
    if (overlay) {
        overlay.classList.remove("active"); // Remove qualquer estado residual
    }
});


 // Função para fechar a janela de recebimento
function fecharJanelaRecebimento() {
    var janelaRecebimento = document.getElementById("janelaRecebimento");
    var overlay = document.getElementById("overlay");

    if (janelaRecebimento && overlay) {
        // Adiciona animação de saída para a janela
        janelaRecebimento.style.animation = "slideUp 0.3s forwards";

        // Remove o overlay após a animação
        setTimeout(function () {
            overlay.classList.remove("active");
            janelaRecebimento.classList.add("hidden");

            // Reseta as propriedades de animação
            janelaRecebimento.style.animation = "";
            document.body.classList.remove("modal-open"); // Garante que a rolagem da página seja reativada
        }, 300); // Tempo igual à duração da animação
    }
}

// Evento de clique para o botão de cancelar
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

        var index = parseInt(recebimentoIndexInput ? recebimentoIndexInput.value : -1);
        var quantidadeRecebidaStr = recebimentoQuantidadeInput ? recebimentoQuantidadeInput.value.trim() : "";
        var horarioRecebido = recebimentoHorarioInput ? recebimentoHorarioInput.value.trim() : "";

        // Validações
        if (index === -1 || isNaN(index)) {
            alert("Erro ao identificar o item a ser recebido.");
            return;
        }

        if (!horarioRecebido) {
            alert("Por favor, insira o horário de recebimento.");
            return;
        }

        var detalhes = JSON.parse(localStorage.getItem("detalhes")) || [];
        var detalhe = detalhes[index];

        if (!detalhe) {
            alert("Erro ao encontrar o material nos detalhes.");
            return;
        }

        var quantidadeRecebida = parseInt(quantidadeRecebidaStr, 10);
        if (isNaN(quantidadeRecebida) || quantidadeRecebida <= 0) {
            alert("Por favor, insira uma quantidade válida recebida.");
            return;
        }

        if (quantidadeRecebida > detalhe.quantidade) {
            alert("A quantidade recebida não pode ser maior que a quantidade solicitada.");
            return;
        }

        // Limpa os intervals do cronômetro
        if (intervalMap.has(index)) {
            clearInterval(intervalMap.get(index));
            intervalMap.delete(index);
        }

        var recebidos = JSON.parse(localStorage.getItem("recebidos")) || [];

        // Caso a quantidade recebida seja igual à quantidade solicitada
        if (quantidadeRecebida === detalhe.quantidade) {
            // Adiciona o item completamente a 'recebidos'
            recebidos.push({
                local: detalhe.local,
                item: detalhe.item,
                quantidade: quantidadeRecebida,
                destino: detalhe.destino,
                dataAtual: detalhe.dataAtual,
                horario: detalhe.horario,
                recebido: horarioRecebido,
                guardado: ''
            });
            localStorage.setItem("recebidos", JSON.stringify(recebidos));

            // Remove o item de detalhes
            detalhes.splice(index, 1);
            localStorage.setItem("detalhes", JSON.stringify(detalhes));

            // Remove o item correspondente de 'solicitados'
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
            // Caso a quantidade recebida seja menor do que a solicitada
            // Adiciona apenas a quantidade recebida a 'recebidos'
            recebidos.push({
                local: detalhe.local,
                item: detalhe.item,
                quantidade: quantidadeRecebida,
                destino: detalhe.destino,
                dataAtual: detalhe.dataAtual,
                horario: detalhe.horario,
                recebido: horarioRecebido,
                guardado: ''
            });
            localStorage.setItem("recebidos", JSON.stringify(recebidos));

            // Atualiza a quantidade pendente no detalhe
            detalhe.quantidade = detalhe.quantidade - quantidadeRecebida;
            detalhes[index] = detalhe;
            localStorage.setItem("detalhes", JSON.stringify(detalhes));

            // Neste caso, não removemos o item de 'solicitados', pois ainda há quantidade pendente
        }

        // Atualiza as tabelas
        atualizarTabelaDetalhes(); // Atualiza a tabela de detalhes
        atualizarTabelaRecebidos(); // Atualiza a tabela de recebidos
        if (window.location.pathname.includes("index.html")) {
            atualizarTabelaSolicitados(); // Atualiza a tabela de solicitados, se na página index
        }

        // Fecha a janela de recebimento
        fecharJanelaRecebimento();

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

        recebidos.forEach(function (item, index) {
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

        // Mensagem para tabela vazia
        if (recebidos.length === 0) {
            var emptyRow = document.createElement("tr");
            emptyRow.innerHTML = `
                <td colspan="9" style="text-align: center;">Nenhum material recebido no momento.</td>
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

                // Verifica se há itens na tabela
                if (detalhesTableBody.rows.length === 0) {
                    alert("A lista de materiais solicitados está vazia! Adicione itens para poder realizar a exclusão.");
                    excluirItensButton.textContent = "Excluir Itens";
                    return;
                }

                // Seleciona todas as colunas de checkbox
                var checkboxColumns = detalhesTable.querySelectorAll(".checkbox-column");
                var checkboxes = detalhesTableBody.querySelectorAll(".delete-checkbox");

                if (!checkboxColumns.length) {
                    alert("A coluna 'SELECIONE' não foi configurada corretamente.");
                    return;
                }

                // Verifica se a coluna está oculta
                var isHidden = checkboxColumns[0].classList.contains("hidden");

                if (isHidden) {
                    // Exibir a coluna "SELECIONE"
                    checkboxColumns.forEach((column) => column.classList.remove("hidden"));
                    excluirItensButton.textContent = "Confirmar Exclusão";

                    // Adiciona evento para "Selecionar Todos" no cabeçalho
                    if (selectAllCheckbox) {
                        selectAllCheckbox.addEventListener("change", function () {
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
                        var detalhes = JSON.parse(localStorage.getItem("detalhes")) || [];
                        var solicitados = JSON.parse(localStorage.getItem("solicitados")) || [];

                        selectedCheckboxes.forEach((checkbox) => {
                            var row = checkbox.closest("tr");
                            var rowIndex = Array.from(detalhesTableBody.rows).indexOf(row);

                            // Remove do array de detalhes
                            var detalheExcluido = detalhes.splice(rowIndex, 1)[0];

                            // Remove o item correspondente da lista de solicitados em index
                            solicitados = solicitados.filter((itemSolicitado) => {
                                return !(
                                    itemSolicitado.local === detalheExcluido.local &&
                                    itemSolicitado.item === detalheExcluido.item &&
                                    itemSolicitado.destino === detalheExcluido.destino
                                );
                            });

                            // Remove a linha da tabela
                            row.remove();
                        });

                        // Atualiza o localStorage
                        localStorage.setItem("detalhes", JSON.stringify(detalhes));
                        localStorage.setItem("solicitados", JSON.stringify(solicitados));

                        alert("Itens excluídos com sucesso!");

                        // Ocultar novamente a coluna "SELECIONE"
                        checkboxColumns.forEach((column) => column.classList.add("hidden"));
                        excluirItensButton.textContent = "Excluir Itens";

                        // Desmarcar a caixa "Selecionar Todos"
                        if (selectAllCheckbox) selectAllCheckbox.checked = false;

                        // Atualizar a tabela de materiais solicitados na página index.html (se estiver carregada)
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

                // Verifica se há itens na tabela
                if (recebidosTableBody.rows.length === 0) {
                    alert("A lista de materiais recebidos está vazia! Adicione itens para poder realizar a exclusão.");
                    excluirRecebidosButton.textContent = "Excluir Itens";
                    return;
                }

                // Seleciona todas as colunas de checkbox
                var checkboxColumns = recebidosTable.querySelectorAll(".checkbox-column");
                var checkboxes = recebidosTableBody.querySelectorAll(".delete-checkbox");

                if (!checkboxColumns.length) {
                    alert("A coluna 'SELECIONE' não foi configurada corretamente.");
                    return;
                }

                // Verifica se a coluna está oculta
                var isHidden = checkboxColumns[0].classList.contains("hidden");

                if (isHidden) {
                    // Exibir a coluna "SELECIONE"
                    checkboxColumns.forEach((column) => column.classList.remove("hidden"));
                    excluirRecebidosButton.textContent = "Confirmar Exclusão";

                    // Adiciona evento para "Selecionar Todos" no cabeçalho
                    if (selectAllRecebidosCheckbox) {
                        selectAllRecebidosCheckbox.addEventListener("change", function () {
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
                        var recebidos = JSON.parse(localStorage.getItem("recebidos")) || [];

                        selectedCheckboxes.forEach((checkbox) => {
                            var row = checkbox.closest("tr");
                            var rowIndex = Array.from(recebidosTableBody.rows).indexOf(row);

                            // Remove do array de itens recebidos
                            recebidos.splice(rowIndex, 1);

                            // Remove a linha da tabela
                            row.remove();
                        });

                        // Atualiza o localStorage
                        localStorage.setItem("recebidos", JSON.stringify(recebidos));

                        alert("Itens excluídos com sucesso!");

                        // Ocultar novamente a coluna "SELECIONE"
                        checkboxColumns.forEach((column) => column.classList.add("hidden"));
                        excluirRecebidosButton.textContent = "Excluir Itens";

                        // Desmarcar a caixa "Selecionar Todos"
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
                    // Exibir as caixas de seleção e resetar marcações
                    checkboxColumns.forEach((column) => column.classList.remove("hidden"));
                    checkboxes.forEach((checkbox) => (checkbox.checked = false)); // Desmarca todas as caixas
                    reportarItensButton.textContent = "Confirmar Reporte";

                    // Vincular a função ao checkbox de selecionar todos
                    if (selectAllCheckbox) {
                        selectAllCheckbox.addEventListener("change", function () {
                            checkboxes.forEach((checkbox) => {
                                var row = checkbox.closest("tr");
                                var horaCell = row.children[6].textContent; // Coluna "HORA"

                                // Verifica se o item está atrasado (30 minutos ou mais)
                                if (verificarAtraso(horaCell)) {
                                    checkbox.checked = this.checked; // Marca apenas itens atrasados
                                }
                            });
                        });
                    }
                } else {
                    // Verifica itens selecionados
                    var selectedCheckboxes = Array.from(checkboxes).filter((checkbox) => checkbox.checked);

                    if (selectedCheckboxes.length === 0) {
                        alert("Selecione os itens que deseja reportar.");
                        return;
                    }

                    // Verificar se todos os itens selecionados estão atrasados
                    var detalhesReportados = [];
                    var erro = false;

                    selectedCheckboxes.forEach((checkbox) => {
                        var row = checkbox.closest("tr");
                        var horaCell = row.children[6].textContent; // Coluna "HORA"
                        var local = row.children[1].textContent; // Local do material
                        var item = row.children[2].textContent;  // Código do item

                        if (!verificarAtraso(horaCell)) {
                            alert(`Não é possível reportar o material (${local} - ${item}) porque ele não ultrapassou o tempo de atraso!`);
                            erro = true;
                            checkbox.checked = false; // Desmarca o item não atrasado
                        } else {
                            detalhesReportados.push(`• ${local} - ${item}`);
                        }
                    });

                    if (erro) {
                        return; // Interrompe o processo se houver erro
                    }

                    // Confirmar com a lista dos itens reportados
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

        // Função para verificar se um item está atrasado
        function verificarAtraso(horaSolicitada) {
            var agora = new Date();
            var [horas, minutos] = horaSolicitada.split(":").map(Number);

            var horarioSolicitado = new Date();
            horarioSolicitado.setHours(horas, minutos, 0, 0);

            var diferencaMinutos = Math.floor((agora - horarioSolicitado) / 60000);

            return diferencaMinutos >= 30; // Retorna true se estiver atrasado (30 minutos ou mais)
        }
    }
});
