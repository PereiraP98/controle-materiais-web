// relatorio.js
document.addEventListener('DOMContentLoaded', () => {
  // Seleciona o botão de "Gerar Relatório"
  const gerarRelatorioButton = document.getElementById('gerarRelatorioButton');

  gerarRelatorioButton.addEventListener('click', () => {
    // Seleciona a tabela de "Detalhes de Materiais Solicitados"
    const detalhesTable = document.getElementById('detalhesTable');
    // Pega todas as linhas do tbody
    const rows = detalhesTable.querySelectorAll('tbody tr');

    // Array para armazenar cada item
    const listaMateriais = [];

    rows.forEach((row) => {
      const columns = row.querySelectorAll('td');

      // Ajuste os índices de acordo com a sequência das suas colunas.
      // Em "detalhes.html", as colunas eram:
      // 0 - checkbox (hidden ou não)
      // 1 - LOCAL
      // 2 - ITEM
      // 3 - QTD
      // 4 - DESTINO
      // 5 - DATA
      // 6 - HORA
      // 7 - RECEBER
      // 8 - TEMPO
      // Supondo que a 0 seja oculta e a 7 e 8 não sejam necessários:
      // Precisamos pegar: local = columns[1], item = columns[2], ...
      const local = columns[1].innerText;
      const item = columns[2].innerText;
      const qtd = columns[3].innerText;
      const destino = columns[4].innerText;
      const data = columns[5].innerText;
      const hora = columns[6].innerText;

      // "Reportado" é um valor que pode vir de outra lógica
      // Ajuste conforme seu caso. Vou deixar 'Não' como exemplo.
      const reportado = 'Não';

      // Monta um objeto
      const materialObj = {
        local,
        item,
        qtd,
        destino,
        data,
        hora,
        reportado
      };

      listaMateriais.push(materialObj);
    });

    // Salva no localStorage como JSON
    localStorage.setItem('relatorioData', JSON.stringify(listaMateriais));

    // Redireciona para a nova página DATArelatorio.html
    window.location.href = 'DATArelatorio.html';
  });
});
