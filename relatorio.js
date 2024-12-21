document.addEventListener('DOMContentLoaded', () => {
    // Seleciona o botão de "Gerar Relatório"
    const gerarRelatorioButton = document.getElementById('gerarRelatorioButton');

    // Adiciona o evento de clique no botão
    gerarRelatorioButton.addEventListener('click', () => {
        // Seleciona a tabela de "Detalhes de Materiais Solicitados"
        const detalhesTable = document.getElementById('detalhesTable');
        
        // Conta o número de linhas na tabela, excluindo o cabeçalho
        const totalItens = detalhesTable.querySelectorAll('tbody tr').length;

        // Exibe a mensagem com o total de itens solicitados
        alert(`Total de itens solicitados: ${totalItens}`);
    });
});
