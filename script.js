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

