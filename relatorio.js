// relatorio.js
document.addEventListener('DOMContentLoaded', () => {
  const gerarRelatorioButton = document.getElementById('gerarRelatorioButton');

  gerarRelatorioButton.addEventListener('click', () => {
    // ========== MATERIAIS SOLICITADOS ==========
    const detalhesTable = document.getElementById('detalhesTable');
    const rowsSolicitados = detalhesTable.querySelectorAll('tbody tr');
    const listaMateriaisSolicitados = [];

    rowsSolicitados.forEach((row) => {
      const cols = row.querySelectorAll('td');
      // Esperamos 9 colunas no "detalhesTable":
      // (0) checkbox hidden
      // (1) LOCAL
      // (2) ITEM
      // (3) QTD
      // (4) DESTINO
      // (5) DATA
      // (6) HORA
      // (7) RECEBER (ignorado)
      // (8) TEMPO (decorrido para ser solicitado)
      if (cols.length < 9) return; // Se não tiver 9 colunas, pula a linha

      const local = cols[1].innerText;
      const item = cols[2].innerText;
      const qtd = cols[3].innerText;
      const destino = cols[4].innerText;
      const data = cols[5].innerText;
      const hora = cols[6].innerText;
      const tempo = cols[8].innerText; // tempo decorrido para solicitar

      // Deixamos 'reportado' em branco (futuro uso)
      const reportado = '';

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

    // ========== MATERIAIS RECEBIDOS ==========
    const recebidosTable = document.getElementById('recebidosTable');
    const rowsRecebidos = recebidosTable.querySelectorAll('tbody tr');
    const listaMateriaisRecebidos = [];

    rowsRecebidos.forEach((row) => {
      const cols = row.querySelectorAll('td');
      // Esperamos 10 colunas no "recebidosTable":
      // (0) checkbox hidden
      // (1) LOCAL
      // (2) ITEM
      // (3) QTD
      // (4) DESTINO
      // (5) DATA
      // (6) HORA
      // (7) RECEBIDO
      // (8) TEMPO (decorrido para receber)
      // (9) GUARDADO
      if (cols.length < 10) return; // Se não tiver 10 colunas, pula a linha

      const local = cols[1].innerText;
      const item = cols[2].innerText;
      const qtd = cols[3].innerText;
      const destino = cols[4].innerText;
      const data = cols[5].innerText;
      const hora = cols[6].innerText;
      const recebido = cols[7].innerText;
      const tempo = cols[8].innerText; // tempo decorrido para receber
      const guardado = cols[9].innerText;

      listaMateriaisRecebidos.push({
        local,
        item,
        qtd,
        destino,
        data,
        hora,
        recebido,
        tempo,
        guardado
      });
    });

    // ========== SALVAR NO LOCALSTORAGE ==========
    // Gera a data (dia, mês, ano)
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mesIndex = hoje.getMonth(); // 0..11
    const anoDoisDig = String(hoje.getFullYear()).slice(-2);

    const MESES = [
      'JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO',
      'JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'
    ];
    const nomeMes = MESES[mesIndex];
    const dataCurta = `${dia}_${String(mesIndex+1).padStart(2,'0')}_${anoDoisDig}`;

    // Pega ou cria o objeto 'relatoriosMes'
    const stored = localStorage.getItem('relatoriosMes');
    let relatoriosMes = stored ? JSON.parse(stored) : {};

    if (!relatoriosMes[nomeMes]) {
      relatoriosMes[nomeMes] = {};
    }

    // Salva em relatoriosMes[nomeMes][dataCurta] = { solicitados, recebidos }
    relatoriosMes[nomeMes][dataCurta] = {
      solicitados: listaMateriaisSolicitados,
      recebidos: listaMateriaisRecebidos
    };

    localStorage.setItem('relatoriosMes', JSON.stringify(relatoriosMes));

    // Exibe mensagem de sucesso
    alert('Relatório registrado com sucesso!');
  });
});
