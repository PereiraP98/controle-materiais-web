// script.js

// Lógica de login
var loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;

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

// Abrir a janela flutuante para solicitação de material (Página Index)
var abrirSolicitacaoButton = document.getElementById("abrirSolicitacaoButton");
if (abrirSolicitacaoButton) {
    abrirSolicitacaoButton.addEventListener("click", function () {
        var horarioAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        document.getElementById("horario").value = horarioAtual; // Preenche o horário atual
        document.getElementById("janelaSolicitacao").style.display = "block";
    });
}

// Cancelar a solicitação e fechar a janela flutuante (Página Index)
var cancelarSolicitacaoButton = document.getElementById("cancelarSolicitacaoButton");
if (cancelarSolicitacaoButton) {
    cancelarSolicitacaoButton.addEventListener("click", function () {
        document.getElementById("janelaSolicitacao").style.display = "none";
    });
}

// Confirmar a solicitação e registrar os dados (Página Index)
var janelaForm = document.getElementById("janelaForm");
if (janelaForm) {
    janelaForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var quantidade = document.getElementById("quantidade").value;
        var horario = document.getElementById("horario").value;
        var local = document.getElementById("local").value;
        var item = document.getElementById("item").value;
        var destino = document.getElementById("destino").value;

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

        var detalhes = JSON.parse(localStorage.getItem("detalhes")) || [];
        detalhes.push({ local: local, item: item, quantidade: quantidade, destino: destino, dataAtual: dataAtual, horario: horario });
        localStorage.setItem("detalhes", JSON.stringify(detalhes));

        document.getElementById("janelaSolicitacao").style.display = "none";

        alert("Material solicitado com sucesso!");
    });
}

// Reservar um item (Página Index)
var reservarButton = document.getElementById("reservarButton");
if (reservarButton) {
    reservarButton.addEventListener("click", function () {
        var local = document.getElementById("local").value;
        var item = document.getElementById("item").value;
        var destino = document.getElementById("destino").value;

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
        var detalhesTable = document.getElementById("detalhesTable").querySelector("tbody");
        var excluirItensButton = document.getElementById("excluirItensButton");

        // Função para atualizar a tabela de detalhes
        function atualizarTabelaDetalhes() {
            detalhesTable.innerHTML = ""; // Limpa a tabela antes de recarregar

            detalhes.forEach(function(detalhe, index) {
                var newRow = document.createElement("tr");
                newRow.innerHTML = `
                    <td class="checkbox-column hidden"><input type="checkbox" class="delete-checkbox"></td>
                    <td>${detalhe.local}</td>
                    <td>${detalhe.item}</td>
                    <td>${detalhe.quantidade}</td>
                    <td>${detalhe.destino}</td>
                    <td>${detalhe.dataAtual}</td>
                    <td>${detalhe.horario}</td>
                    <td><button class="receberButton">Receber</button></td>
                    <td style="color: yellow; text-align: center;">REPORT</td>
                `;
                detalhesTable.appendChild(newRow);

                // Adiciona o evento de clique ao botão Receber
                var receberButton = newRow.querySelector(".receberButton");
                receberButton.addEventListener("click", function () {
                    abrirJanelaRecebimento(index);
                });
            });
        }

        atualizarTabelaDetalhes();

        // Função para abrir a janela flutuante de recebimento
        function abrirJanelaRecebimento(index) {
            var detalhe = detalhes[index];
            // Preenche os campos da janela com os dados atuais
            document.getElementById("recebimentoQuantidade").value = detalhe.quantidade;
            var horarioAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            document.getElementById("recebimentoHorario").value = horarioAtual;
            document.getElementById("recebimentoIndex").value = index; // Armazena o índice para uso posterior
            document.getElementById("janelaRecebimento").style.display = "block";
        }

        // Fecha a janela de recebimento
        var cancelarRecebimentoButton = document.getElementById("cancelarRecebimentoButton");
        if (cancelarRecebimentoButton) {
            cancelarRecebimentoButton.addEventListener("click", function () {
                document.getElementById("janelaRecebimento").style.display = "none";
            });
        }

        // Confirma o recebimento
        var recebimentoForm = document.getElementById("recebimentoForm");
        if (recebimentoForm) {
            recebimentoForm.addEventListener("submit", function (event) {
                event.preventDefault();

                var index = parseInt(document.getElementById("recebimentoIndex").value);
                var quantidadeRecebida = document.getElementById("recebimentoQuantidade").value;
                var horarioRecebido = document.getElementById("recebimentoHorario").value;

                var detalhe = detalhes[index];

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

                document.getElementById("janelaRecebimento").style.display = "none";

                alert("Material recebido com sucesso!");
            });
        }

        // Função para atualizar a tabela de materiais recebidos
        var recebidosTable = document.getElementById("recebidosTable").querySelector("tbody");

        function atualizarTabelaRecebidos() {
            var recebidos = JSON.parse(localStorage.getItem("recebidos")) || [];
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
