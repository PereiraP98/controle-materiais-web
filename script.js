// Abrir a janela flutuante para solicitação de material
document.getElementById("abrirSolicitacaoButton").addEventListener("click", function () {
    const horarioAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById("horario").value = horarioAtual; // Preenche o horário atual
    document.getElementById("janelaSolicitacao").style.display = "block";
});

// Cancelar a solicitação e fechar a janela flutuante
document.getElementById("cancelarSolicitacaoButton").addEventListener("click", function () {
    document.getElementById("janelaSolicitacao").style.display = "none";
});

// Confirmar a solicitação e registrar os dados
document.getElementById("janelaForm").addEventListener("submit", function (event) {
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

    const solicitadosTable = document.getElementById("solicitadosTable").querySelector("tbody");
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>${local}</td>
        <td>${item}</td>
        <td>${destino}</td>
    `;
    solicitadosTable.appendChild(newRow);

    let solicitados = JSON.parse(localStorage.getItem("solicitados")) || [];
    solicitados.push({ local, item, destino });
    localStorage.setItem("solicitados", JSON.stringify(solicitados));

    let detalhes = JSON.parse(localStorage.getItem("detalhes")) || [];
    detalhes.push({ local, item, quantidade, destino, dataAtual, horario });
    localStorage.setItem("detalhes", JSON.stringify(detalhes));

    document.getElementById("janelaSolicitacao").style.display = "none";

    alert("Material solicitado com sucesso!");
});

// Reservar um item
document.getElementById("reservarButton").addEventListener("click", function () {
    const local = document.getElementById("local").value;
    const item = document.getElementById("item").value;
    const destino = document.getElementById("destino").value;

    if (!/^\d{5}$/.test(item)) {
        alert("O código do item deve ter exatamente 5 dígitos.");
        return;
    }

    const reservadosTable = document.getElementById("reservadosTable").querySelector("tbody");
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>${local}</td>
        <td>${item}</td>
        <td>${destino}</td>
    `;
    reservadosTable.appendChild(newRow);

    alert("Material reservado com sucesso!");
});

// Carregar os itens solicitados armazenados no localStorage na página index
document.addEventListener("DOMContentLoaded", function () {
    const solicitados = JSON.parse(localStorage.getItem("solicitados")) || [];
    const solicitadosTable = document.getElementById("solicitadosTable").querySelector("tbody");

    solicitados.forEach((item) => {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${item.local}</td>
            <td>${item.item}</td>
            <td>${item.destino}</td>
        `;
        solicitadosTable.appendChild(newRow);
    });

    if (window.location.pathname.includes("detalhes.html")) {
        const detalhes = JSON.parse(localStorage.getItem("detalhes")) || [];
        const detalhesTable = document.getElementById("detalhesTable").querySelector("tbody");
        const excluirItensButton = document.getElementById("excluirItensButton");

        detalhes.forEach((detalhe) => {
            const newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td><input type="checkbox" class="delete-checkbox" style="display: none;"></td>
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
        });

        excluirItensButton.addEventListener("click", function () {
            const checkboxes = document.querySelectorAll(".delete-checkbox");
            const checkboxesVisible = checkboxes[0]?.style.display === "inline-block";

            if (checkboxesVisible) {
                const selectedCheckboxes = document.querySelectorAll(".delete-checkbox:checked");

                if (selectedCheckboxes.length === 0) {
                    alert("Selecione os itens que deseja excluir.");
                    return;
                }

                if (confirm("Tem certeza que deseja excluir os itens selecionados?")) {
                    selectedCheckboxes.forEach((checkbox) => {
                        const row = checkbox.closest("tr");
                        row.remove();
                    });

                    let detalhesAtualizados = Array.from(detalhesTable.rows).map((row) => ({
                        local: row.cells[1].innerText,
                        item: row.cells[2].innerText,
                        quantidade: row.cells[3].innerText,
                        destino: row.cells[4].innerText,
                        dataAtual: row.cells[5].innerText,
                        horario: row.cells[6].innerText,
                    }));
                    localStorage.setItem("detalhes", JSON.stringify(detalhesAtualizados));

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
