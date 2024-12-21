// relatorio.js
document.addEventListener('DOMContentLoaded', () => {
  const gerarRelatorioButton = document.getElementById('gerarRelatorioButton');

  gerarRelatorioButton.addEventListener('click', () => {
    // 1) Obter linhas da tabela
    const detalhesTable = document.getElementById('detalhesTable');
    const rows = detalhesTable.querySelectorAll('tbody tr');

    // 2) Montar array de materiais
    const materiais = [];
    rows.forEach(row => {
      const cols = row.querySelectorAll('td');
      // Ajuste índices caso sua tabela tenha outras colunas.
      // Exemplo (7 colunas):
      const local    = cols[0].innerText;
      const item     = cols[1].innerText;
      const qtd      = cols[2].innerText;
      const destino  = cols[3].innerText;
      const data     = cols[4].innerText;
      const hora     = cols[5].innerText;
      const reportado= cols[6].innerText;

      materiais.push({ local, item, qtd, destino, data, hora, reportado });
    });

    // 3) Gerar mês e dataCurta
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mesIndex = hoje.getMonth(); // 0-11
    const ano = String(hoje.getFullYear()).slice(-2); // últimos dois dígitos

    // Meses em maiúsculo:
    const MESES = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
                   "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
    const mesNome = MESES[mesIndex];

    // Data curta ex.: 21_12_24
    const dataCurta = `${dia}_${String(mesIndex+1).padStart(2, '0')}_${ano}`;

    // 4) Salvar no localStorage (chave: "relatoriosMes")
    //    Estrutura: { DEZEMBRO: { "21_12_24": { items: [] }, ... }, ... }
    const stored = localStorage.getItem('relatoriosMes');
    let relatoriosMes = stored ? JSON.parse(stored) : {};

    // Se não existir a “pasta” do mês, cria
    if (!relatoriosMes[mesNome]) {
      relatoriosMes[mesNome] = {};
    }

    // Cria o “arquivo” com a dataCurta
    relatoriosMes[mesNome][dataCurta] = {
      items: materiais
    };

    // Regravar no localStorage
    localStorage.setItem('relatoriosMes', JSON.stringify(relatoriosMes));

    // 5) Redirecionar para a nova página
    window.location.href = 'DATArelatorio.html';
  });
});
