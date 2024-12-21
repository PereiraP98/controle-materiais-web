// relatorio.js
document.addEventListener('DOMContentLoaded', () => {
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
      // Ajuste os índices de acordo com a sua tabela:
      // (0) checkbox hidden
      // (1) LOCAL
      // (2) ITEM
      // (3) QTD
      // (4) DESTINO
      // (5) DATA
      // (6) HORA
      // (7) RECEBER
      // (8) TEMPO
      // Aqui, vamos capturar os 6 primeiros relevantes:
      const local = columns[1].innerText;
      const item  = columns[2].innerText;
      const qtd   = columns[3].innerText;
      const destino = columns[4].innerText;
      const data  = columns[5].innerText;
      const hora  = columns[6].innerText;

      // Deixar REPORTADO vazio (string vazia)
      const reportado = '';

      // Monta um objeto com as informações
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

    // Salvar no localStorage com a estrutura: relatoriosMes[MÊS][DATA] = { items: [...] }
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mesIndex = hoje.getMonth(); // 0-11
    const ano = String(hoje.getFullYear()).slice(-2); // últimos 2 dígitos do ano

    const MESES = [
      "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
      "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
    ];
    const mesNome = MESES[mesIndex];

    // Ex.: 21_12_24
    const dataCurta = `${dia}_${String(mesIndex+1).padStart(2, '0')}_${ano}`;

    // Buscar do localStorage
    const stored = localStorage.getItem('relatoriosMes');
    let relatoriosMes = stored ? JSON.parse(stored) : {};

    // Se não existir a “pasta” do mês, cria
    if (!relatoriosMes[mesNome]) {
      relatoriosMes[mesNome] = {};
    }

    // Cria o “arquivo” com a dataCurta
    relatoriosMes[mesNome][dataCurta] = {
      items: listaMateriais
    };

    // Atualiza no localStorage
    localStorage.setItem('relatoriosMes', JSON.stringify(relatoriosMes));

    // Redireciona para a nova página
    window.location.href = 'DATArelatorio.html';
  });
});
