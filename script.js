document.getElementById("materialForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const local = document.getElementById("local").value;
    const item = document.getElementById("item").value;
    const destino = document.getElementById("destino").value;

    if (!/^\d{5}$/.test(item)) {
        alert("O código do item deve ter exatamente 5 dígitos.");
        return;
    }

    // Adicionar item na tabela de solicitados
    const solicitadosTable = document.getElementById("solicitadosTable").querySelector("tbody");
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
        <td>${local}</td>
        <td>${item}</td>
        <td>${destino}</td>
    `;

    solicitadosTable.appendChild(newRow);

    alert("Item solicitado com sucesso!");
});

document.getElementById("reservarButton").addEventListener("click", function() {
    const local = document.getElementById("local").value;
    const item = document.getElementById("item").value;
    const destino = document.getElementById("destino").value;

    if (!/^\d{5}$/.test(item)) {
        alert("O código do item deve ter exatamente 5 dígitos.");
        return;
    }

    // Adicionar item na tabela de reservados
    const reservadosTable = document.getElementById("reservadosTable").querySelector("tbody");
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
        <td>${local}</td>
        <td>${item}</td>
        <td>${destino}</td>
    `;

    reservadosTable.appendChild(newRow);

    alert("Item reservado com sucesso!");
});

// Abrir janela flutuante
document.getElementById("abrirSolicitacaoButton").addEventListener("click", function() {
    const horarioAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById("horario").value = horarioAtual;
    document.getElementById("janelaSolicitacao").style.display = "block";
});

// Cancelar solicitação
document.getElementById("cancelarSolicitacaoButton").addEventListener("click", function() {
    document.getElementById("janelaSolicitacao").style.display = "none";
});

// Confirmar solicitação e registrar
document.getElementById("janelaForm").addEventListener("submit", function(event) {
    event.preventDefault();

    // Dados do formulário principal
    const local = document.getElementById("local").value;
    const item = document.getElementById("item").value;
    const destino = document.getElementById("destino").value;

    // Dados da janela flutuante
    const quantidade = document.getElementById("quantidade").value;
    const horario = document.getElementById("horario").value;
    const dataAtual = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

    // Registrar na tabela da página principal
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

    // Registrar na página de detalhes (opcional: use localStorage ou APIs)
    // Exemplo usando localStorage
    let detalhes = JSON.parse(localStorage.getItem("detalhes")) || [];
    detalhes.push({ local, item, quantidade, destino, dataAtual, horario });
    localStorage.setItem("detalhes", JSON.stringify(detalhes));

    // Fechar janela
    document.getElementById("janelaSolicitacao").style.display = "none";
});
