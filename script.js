var reservarButton = document.getElementById("reservarButton");
if (reservarButton) {
    reservarButton.addEventListener("click", function () {
        var localInput = document.getElementById("local").value;
        var itemInput = document.getElementById("item").value;
        var destinoInput = document.getElementById("destino").value;

        var solicitados = JSON.parse(localStorage.getItem("solicitados")) || [];
        var itemJaSolicitado = solicitados.find(
            (item) => item.item === itemInput && item.destino === destinoInput
        );

        if (itemJaSolicitado) {
            // Exibe a janela de atenção
            mostrarJanelaAtencao(
                `ATENÇÃO: O material ${itemInput} já está solicitado e não foi recebido. Deseja solicitar novamente?`,
                function () {
                    // Lógica para abrir a janela de solicitação
                    var abrirSolicitacaoButton = document.getElementById("abrirSolicitacaoButton");
                    if (abrirSolicitacaoButton) abrirSolicitacaoButton.click();
                },
                function () {
                    // Apenas fecha a janela
                    console.log("Solicitação cancelada pelo usuário.");
                }
            );
        } else {
            // Adiciona o item aos reservados
            var reservados = JSON.parse(localStorage.getItem("reservados")) || [];
            reservados.push({ local: localInput, item: itemInput, destino: destinoInput });
            localStorage.setItem("reservados", JSON.stringify(reservados));
            alert("Material reservado com sucesso!");
        }
    });
}
