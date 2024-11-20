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

    // Obter os dados da janela flutuante
    const quantidade = document.getElementById("quantidade").value;
    const horario = document.getElementById("horario").value;

    // Obter os dados do formulário principal
    const local = document.getElementById("local").value;
    const item = document.getElementById("item").value;
    const destino = document.getElementById("destino").value;

    // Validar o código do item
    if (!/^\d{5}$/.test(item)) {
        alert("O código do item deve ter exatamente 5 dígitos.");
        return;
    }

    // Obter a data atual no formato DD/MM
    const dataAtual = new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
    });

    // Adicionar o item à tabela de materiais solicitados
    const solicitadosTable = document.getElementById("solicitadosTable").querySelector("tbody");
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
        <td>${local}</td>
        <td>${item}</td>
        <td>${quantidade}</td>
        <td>${destino}</td>
        <td>${dataAtual}</td>
        <td>${horario}</td>
    `;

    solicitadosTable.appendChild(newRow);

    // Fechar a janela flutuante
    document.getElementById("janelaSolicitacao").style.display = "none";

    alert("Material solicitado com sucesso!");
});

// Reservar um item
document.getElementById("reservarButton").addEventListener("click", function () {
    const local = document.getElementById("local").value;
    const item = document.getElementById("item").value;
    const destino = document.getElementById("destino").value;

    // Validar o código do item
    if (!/^\d{5}$/.test(item)) {
        alert("O código do item deve ter exatamente 5 dígitos.");
        return;
    }

    // Adicionar o item à tabela de materiais reservados
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
