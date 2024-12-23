// relatorio.js
document.addEventListener('DOMContentLoaded', () => {
  const gerarRelatorioButton = document.getElementById('gerarRelatorioButton');

  gerarRelatorioButton.addEventListener('click', () => {
    // =========== MATERIAIS SOLICITADOS ===========
    const detalhesTable = document.getElementById('detalhesTable');
    const rowsSolicitados = detalhesTable.querySelectorAll('tbody tr');
    const listaMateriaisSolicitados = [];

    rowsSolicitados.forEach((row, rowIndex) => {
      const cols = row.querySelectorAll('td');
      console.log(`[Solicitados] Linha #${rowIndex}: cols.length = ${cols.length}`);
      if (cols.length < 9) {
        console.warn('[Solicitados] PULEI linha pois tem menos de 9 colunas.');
        return;
      }

      // (0) hidden
      // (1) LOCAL
      // (2) ITEM
      // (3) QTD
      // (4) DESTINO
      // (5) DATA
      // (6) HORA
      // (7) RECEBER (ignorado)
      // (8) TEMPO
      const local = cols[1].innerText;
      const item = cols[2].innerText;
      const qtd = cols[3].innerText;
      const destino = cols[4].innerText;
      const data = cols[5].innerText;
      const hora = cols[6].innerText;
      const tempo = cols[8].innerText;

      // “reportado” fica vazio
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
      console.log('[Solicitados] Adicionado:', {local, item, qtd, destino, data, hora, tempo});
    });

    // =========== MATERIAIS RECEBIDOS ===========
    const recebidosTable = document.getElementById('recebidosTable');
    const rowsRecebidos = recebidosTable.querySelectorAll('tbody tr');
    const listaMateriaisRecebidos = [];

    rowsRecebidos.forEach((row, rowIndex) => {
      const cols = row.querySelectorAll('td');
      console.log(`[Recebidos] Linha #${rowIndex}: cols.length = ${cols.length}`);
      if (cols.length < 9) {
        console.warn('[Recebidos] PULEI linha pois tem menos de 9 colunas.');
        return;
      }

      // (0) hidden
      // (1) LOCAL
      // (2) ITEM
      // (3) QTD
      // (4) DESTINO
      // (5) DATA
      // (6) HORA
      // (7) RECEBIDO
      // (8) GUARDADO
      const local = cols[1].innerText;
      const item = cols[2].innerText;
      const qtd = cols[3].innerText;
      const destino = cols[4].innerText;
      const data = cols[5].innerText;
      const hora = cols[6].innerText;
      const recebido = cols[7].innerText;
      const guardado = cols[8].innerText;

      listaMateriaisRecebidos.push({
        local,
        item,
        qtd,
        destino,
        data,
        hora,
        recebido,
        guardado
      });
      console.log('[Recebidos] Adicionado:', {local, item, qtd, destino, data, hora, recebido, guardado});
    });

    // =========== SALVAR NO LOCALSTORAGE ===========
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

    // Carrega ou cria 'relatoriosMes'
    const stored = localStorage.getItem('relatoriosMes');
    let relatoriosMes = stored ? JSON.parse(stored) : {};

    if (!relatoriosMes[nomeMes]) {
      relatoriosMes[nomeMes] = {};
    }

    // Salva solicitados e recebidos
    relatoriosMes[nomeMes][dataCurta] = {
      solicitados: listaMateriaisSolicitados,
      recebidos: listaMateriaisRecebidos
    };

    localStorage.setItem('relatoriosMes', JSON.stringify(relatoriosMes));
    console.log(`[DEBUG] Salvei no localStorage: mes = ${nomeMes}, data = ${dataCurta}`);
    console.log('solicitados:', listaMateriaisSolicitados);
    console.log('recebidos:', listaMateriaisRecebidos);

    alert('Relatório registrado com sucesso!');
  });
});
