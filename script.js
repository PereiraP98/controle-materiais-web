// script.js

// Abrir a janela flutuante para solicitação de material (Página Index)
document.getElementById("abrirSolicitacaoButton")?.addEventListener("click", function () {
    const horarioAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById("horario").value = horarioAtual; // Preenche o horário atual
    document.getElementById("janelaSolicitacao").style.display = "block";
});

// Cancelar a solicitação e fechar a janela flutuante (Página Index)
document.getElementById("cancelarSolicitacaoButton")?.addEventListener("click", function () {
    document.getElementById("janelaSolicitacao").style.display = "none";
});

// Confirmar a solicitação e registrar os dados (Página Index)
document.getElementById("janelaForm")?.addEventListener("submit", function (event) {
    event.preventDefault();

    const quantidade = document.getElementById("quantidade").value;
    const horario = document.getElementById("horario").value;
    const local = document.getElementById("local").value;
    const item = document.getElementById("item").value;
    const destino = document.getElementById("destino").value;

    if (!/^\d{5}$/.test(item)) {
        alert("O código do item deve ter exatamente 5 dígitos.");
        return;
    }

    const dataAtual = new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
    });

    const solicitadosTable = document.getElementById("solicitadosTable")?.querySelector("tbody");
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>${local}</td>
        <td>${item}</td>
        <td>${destino}</td>
    `;
    solicitadosTable?.appendChild(newRow);

    let solicitados = JSON.parse(localStorage.getItem("solicitados")) || [];
    solicitados.push({ local, item, destino });
    localStorage.setItem("solicitados", JSON.stringify(solicitados));

    let detalhes = JSON.parse(localStorage.getItem("detalhes")) || [];
    detalhes.push({ local, item, quantidade, destino, dataAtual, horario });
    localStorage.setItem("detalhes", JSON.stringify(detalhes));

    document.getElementById("janelaSolicitacao").style.display = "none";

    alert("Material solicitado com sucesso!");
});

// Reservar um item (Página Index)
document.getElementById("reservarButton")?.addEventListener("click", function () {
    const local = document.getElementById("local").value;
    const item = document.getElementById("item").value;
    const destino = document.getElementById("destino").value;

    if (!/^\d{5}$/.test(item)) {
        alert("O código do item deve ter exatamente 5 dígitos.");
        return;
    }

    const reservadosTable = document.getElementById("reservadosTable")?.querySelector("tbody");
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>${local}</td>
        <td>${item}</td>
        <td>${destino}</td>
    `;
    reservadosTable?.appendChild(newRow);

    alert("Material reservado com sucesso!");
});

// Carregar os itens solicitados armazenados no localStorage na página index
document.addEventListener("DOMContentLoaded", function () {
    const solicitados = JSON.parse(localStorage.getItem("solicitados")) || [];
    const solicitadosTable = document.getElementById("solicitadosTable")?.querySelector("tbody");

    solicitados.forEach((item) => {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${item.local}</td>
            <td>${item.item}</td>
            <td>${item.destino}</td>
        `;
        solicitadosTable?.appendChild(newRow);
    });

    // Código específico para detalhes.html
    if (window.location.pathname.includes("detalhes.html")) {
        const detalhes = JSON.parse(localStorage.getItem("detalhes")) || [];
        const detalhesTable = document.getElementById("detalhesTable").querySelector("tbody");
        const excluirItensButton = document.getElementById("excluirItensButton");

        // Função para atualizar a tabela de detalhes
        function atualizarTabelaDetalhes() {
            detalhesTable.innerHTML = ""; // Limpa a tabela antes de recarregar

            detalhes.forEach((detalhe, index) => {
                const newRow = document.createElement("tr");
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
                const receberButton = newRow.querySelector(".receberButton");
                receberButton.addEventListener("click", function () {
                    abrirJanelaRecebimento(index);
                });
            });
        }

        atualizarTabelaDetalhes();

        // Função para abrir a janela flutuante de recebimento
        function abrirJanelaRecebimento(index) {
            const detalhe = detalhes[index];
            // Preenche os campos da janela com os dados atuais
            document.getElementById("recebimentoQuantidade").value = detalhe.quantidade;
            const horarioAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            document.getElementById("recebimentoHorario").value = horarioAtual;
            document.getElementById("recebimentoIndex").value = index; // Armazena o índice para uso posterior
            document.getElementById("janelaRecebimento").style.display = "block";
        }

        // Fecha a janela de recebimento
        document.getElementById("cancelarRecebimentoButton")?.addEventListener("click", function () {
            document.getElementById("janelaRecebimento").style.display = "none";
        });

        // Confirma o recebimento
        document.getElementById("recebimentoForm")?.addEventListener("submit", function (event) {
            event.preventDefault();

            const index = document.getElementById("recebimentoIndex").value;
            const quantidadeRecebida = document.getElementById("recebimentoQuantidade").value;
            const horarioRecebido = document.getElementById("recebimentoHorario").value;

            const detalhe = detalhes[index];

            // Cria um novo objeto para materiais recebidos
            let recebidos = JSON.parse(localStorage.getItem("recebidos")) || [];
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

            // Atualiza a tabela
            atualizarTabelaDetalhes();

            // Atualiza a tabela de recebidos
            atualizarTabelaRecebidos();

            document.getElementById("janelaRecebimento").style.display = "none";

            alert("Material recebido com sucesso!");
        });

        // Função para atualizar a tabela de materiais recebidos
        const recebidosTable = document.getElementById("recebidosTable")?.querySelector("tbody");

        function atualizarTabelaRecebidos() {
            const recebidos = JSON.parse(localStorage.getItem("recebidos")) || [];
            recebidosTable.innerHTML = ""; // Limpa a tabela antes de recarregar

            recebidos.forEach((item, index) => {
                const newRow = document.createElement("tr");
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
        const excluirRecebidosButton = document.getElementById("excluirRecebidosButton");

        excluirRecebidosButton.addEventListener("click", function () {
            const checkboxes = document.querySelectorAll("#recebidosTable .delete-checkbox");
            const checkboxesVisible = checkboxes[0]?.style.display === "inline-block";

            if (checkboxesVisible) {
                const selectedCheckboxes = document.querySelectorAll("#recebidosTable .delete-checkbox:checked");

                if (selectedCheckboxes.length === 0) {
                    alert("Selecione os itens que deseja excluir.");
                    return;
                }

                if (confirm("Tem certeza que deseja excluir os itens selecionados?")) {
                    selectedCheckboxes.forEach((checkbox) => {
                        const row = checkbox.closest("tr");
                        const index = Array.from(recebidosTable.rows).indexOf(row);
                        row.remove();
                        // Remove do array recebidos
                        let recebidos = JSON.parse(localStorage.getItem("recebidos")) || [];
                        recebidos.splice(index, 1);
                        localStorage.setItem("recebidos", JSON.stringify(recebidos));
                    });

                    alert("Itens excluídos com sucesso!");
                }

                checkboxes.forEach((checkbox) => {
                    checkbox.style.display = "none";
                });
                excluirRecebidosButton.textContent = "Excluir Itens";
            } else {
                checkboxes.forEach((checkbox) => {
                    checkbox.style.display = "inline-block";
                });
                excluirRecebidosButton.textContent = "Confirmar Exclusão";
            }
        });

        // Função de exclusão de itens na tabela de detalhes (já existente)
        excluirItensButton.addEventListener("click", function () {
            const checkboxes = document.querySelectorAll("#detalhesTable .delete-checkbox");
            const checkboxesVisible = checkboxes[0]?.style.display === "inline-block";

            if (checkboxesVisible) {
                const selectedCheckboxes = document.querySelectorAll("#detalhesTable .delete-checkbox:checked");

                if (selectedCheckboxes.length === 0) {
                    alert("Selecione os itens que deseja excluir.");
                    return;
                }

                if (confirm("Tem certeza que deseja excluir os itens selecionados?")) {
                    selectedCheckboxes.forEach((checkbox) => {
                        const row = checkbox.closest("tr");
                        const index = Array.from(detalhesTable.rows).indexOf(row);
                        row.remove();
                        // Remove do array detalhes
                        detalhes.splice(index, 1);
                        localStorage.setItem("detalhes", JSON.stringify(detalhes));
                    });

                    alert("Itens excluídos com sucesso!");
                }

                checkboxes.forEach((checkbox) => {
                    checkbox.style.display = "none";
                });
                excluirItensButton.textContent = "Excluir Itens";
            } else {
                checkboxes.forEach((checkbox) => {
                    checkbox.style.display = "inline-block";
                });
                excluirItensButton.textContent = "Confirmar Exclusão";
            }
        });
    }
});
