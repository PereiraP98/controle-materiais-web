// relatorio.js
document.addEventListener('DOMContentLoaded', () => {
  const gerarRelatorioButton = document.getElementById('gerarRelatorioButton');

  gerarRelatorioButton.addEventListener('click', () => {
    // 1) Capturar "Materiais Solicitados" (tabela detalhesTable)
    const detalhesTable = document.getElementById('detalhesTable');
    const rowsSolicitados = detalhesTable.querySelectorAll('tbody tr');
    const listaMateriaisSolicitados = [];

    rowsSolicitados.forEach((row, rowIndex) => {
      const cols = row.querySelectorAll('td');
      // Esperamos 9 colunas:
      // 0 -> (checkbox hidden)
      // 1 -> LOCAL
      // 2 -> ITEM
      // 3 -> QTD
      // 4 -> DESTINO
      // 5 -> DATA
      // 6 -> HORA
      // 7 -> RECEBER (ignorado no relatório)
      // 8 -> TEMPO
      if (cols.length < 9) return; // se faltar colunas, pula

      const local = cols[1].innerText;
      const item = cols[2].innerText;
      const qtd = cols[3].innerText;
      const destino = cols[4].innerText;
      const data = cols[5].innerText;
      const hora = cols[6].innerText;
      const tempo = cols[8].innerText; // coluna 8
      const reportado = ''; // futuro uso

      listaMateriaisSolicitados.push({
        local,
        item,
        qtd,
        destino,
        data,
        hora,
        tempo,
        reportado
      });
    });

    // 2) Capturar "Materiais Recebidos" (tabela recebidosTable)
    const recebidosTable = document.getElementById('recebidosTable');
    const rowsRecebidos = recebidosTable.querySelectorAll('tbody tr');
    const listaMateriaisRecebidos = [];

    rowsRecebidos.forEach((row, rowIndex) => {
      const cols = row.querySelectorAll('td');
      // Esperamos 9 colunas:
      // 0 -> (checkbox hidden)
      // 1 -> LOCAL
      // 2 -> ITEM
      // 3 -> QTD
      // 4 -> DESTINO
      // 5 -> DATA
      // 6 -> HORA
      // 7 -> RECEBIDO
      // 8 -> GUARDADO
      if (cols.length < 9) return; // se faltar colunas, pula

      const local = cols[1].innerText;
      const item = cols[2].innerText;
      const qtd = cols[3].innerText;
      const destino = cols[4].innerText;
      const data = cols[5].innerText;
      const hora = cols[6].innerText;
      const tempo = ''; // Observação: não há "TEMPO" aqui por padrão, mas se quiser, ajuste
      const recebido = cols[7].innerText;
      const guardado = cols[8].innerText;

      listaMateriaisRecebidos.push({
        local,
        item,
        qtd,
        destino,
        data,
        hora,
        tempo,      // se desejar aplicar "TEMPO" também aqui, é só incluir a coluna
        recebido,
        guardado
      });
    });

    // 3) Gerar a data do relatório
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mesIndex = hoje.getMonth(); // 0..11
    const anoDoisDig = String(hoje.getFullYear()).slice(-2);

    const MESES = [
      'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
      'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
    ];
    const nomeMes = MESES[mesIndex];
    const dataCurta = `${dia}_${String(mesIndex + 1).padStart(2, '0')}_${anoDoisDig}`;

    // 4) Salvar no localStorage
    const stored = localStorage.getItem('relatoriosMes');
    let relatoriosMes = stored ? JSON.parse(stored) : {};

    if (!relatoriosMes[nomeMes]) {
      relatoriosMes[nomeMes] = {};
    }

    // Guardamos dois conjuntos: solicitados e recebidos
    relatoriosMes[nomeMes][dataCurta] = {
      solicitados: listaMateriaisSolicitados,
      recebidos: listaMateriaisRecebidos
    };

    localStorage.setItem('relatoriosMes', JSON.stringify(relatoriosMes));

    // 5) Mensagem de sucesso (sem redirecionar)
    alert('Relatório registrado com sucesso!');
  });
});
