// relatorio.js
document.addEventListener('DOMContentLoaded', () => {
  const gerarRelatorioButton = document.getElementById('gerarRelatorioButton');

  gerarRelatorioButton.addEventListener('click', () => {
    const detalhesTable = document.getElementById('detalhesTable');
    const rows = detalhesTable.querySelectorAll('tbody tr');
    const listaMateriais = [];

    rows.forEach(row => {
      const cols = row.querySelectorAll('td');

      // Índices: 
      // 0 -> hidden checkbox (não visível)
      // 1 -> LOCAL
      // 2 -> ITEM
      // 3 -> QTD
      // 4 -> DESTINO
      // 5 -> DATA
      // 6 -> HORA
      const local    = cols[1].innerText;
      const item     = cols[2].innerText;
      const qtd      = cols[3].innerText;
      const destino  = cols[4].innerText;
      const data     = cols[5].innerText;
      const hora     = cols[6].innerText;

      // Deixar REPORTADO em branco
      const reportado = '';

      listaMateriais.push({ local, item, qtd, destino, data, hora, reportado });
    });

    // Lógica de salvar no localStorage por mês e dataCurta ...
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mesIndex = hoje.getMonth(); 
    const ano = String(hoje.getFullYear()).slice(-2);

    const MESES = ["JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO",
                   "JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"];
    const mesNome = MESES[mesIndex];
    const dataCurta = `${dia}_${String(mesIndex+1).padStart(2, '0')}_${ano}`;

    const stored = localStorage.getItem('relatoriosMes');
    let relatoriosMes = stored ? JSON.parse(stored) : {};

    if (!relatoriosMes[mesNome]) {
      relatoriosMes[mesNome] = {};
    }

    relatoriosMes[mesNome][dataCurta] = { items: listaMateriais };
    localStorage.setItem('relatoriosMes', JSON.stringify(relatoriosMes));

    window.location.href = 'DATArelatorio.html';
  });
});
