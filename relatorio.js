// relatorio.js
document.addEventListener('DOMContentLoaded', () => {
  const gerarRelatorioButton = document.getElementById('gerarRelatorioButton');

  gerarRelatorioButton.addEventListener('click', () => {
    // ========= MATERIAIS SOLICITADOS =========
    const detalhesTable = document.getElementById('detalhesTable');
    const rowsSolicitados = detalhesTable.querySelectorAll('tbody tr');
    const listaMateriaisSolicitados = [];

    rowsSolicitados.forEach((row) => {
      const cols = row.querySelectorAll('td');
      if (cols.length < 9) return; // Esperamos 9 colunas

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
      const tempo = cols[8].innerText;  // 8

      const reportado = ''; // Uso futuro
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

    // ========= MATERIAIS RECEBIDOS =========
    const recebidosTable = document.getElementById('recebidosTable');
    const rowsRecebidos = recebidosTable.querySelectorAll('tbody tr');
    const listaMateriaisRecebidos = [];

    rowsRecebidos.forEach((row) => {
      const cols = row.querySelectorAll('td');
      if (cols.length < 10) return; 
      // Precisamos de 10 colunas:
      // (0) hidden
      // (1) LOCAL
      // (2) ITEM
      // (3) QTD
      // (4) DESTINO
      // (5) DATA
      // (6) HORA
      // (7) RECEBIDO
      // (8) TEMPO
      // (9) GUARDADO

      const local = cols[1].innerText;
      const item = cols[2].innerText;
      const qtd = cols[3].innerText;
      const destino = cols[4].innerText;
      const data = cols[5].innerText;
      const hora = cols[6].innerText;
      const recebido = cols[7].innerText;
      const tempo = cols[8].innerText;   // Tempo decorrido
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

    // ======== GERAR DATA DO RELATÓRIO (MÊS, etc.) ========
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mesIndex = hoje.getMonth();
    const anoDoisDig = String(hoje.getFullYear()).slice(-2);

    const MESES = [
      'JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO',
      'JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'
    ];
    const nomeMes = MESES[mesIndex];
    const dataCurta = `${dia}_${String(mesIndex+1).padStart(2,'0')}_${anoDoisDig}`;

    // ======== SALVAR NO LOCALSTORAGE ========
    const stored = localStorage.getItem('relatoriosMes');
    let relatoriosMes = stored ? JSON.parse(stored) : {};

    if (!relatoriosMes[nomeMes]) {
      relatoriosMes[nomeMes] = {};
    }

    relatoriosMes[nomeMes][dataCurta] = {
      solicitados: listaMateriaisSolicitados,
      recebidos: listaMateriaisRecebidos
    };

    localStorage.setItem('relatoriosMes', JSON.stringify(relatoriosMes));

    // Exibe mensagem
    alert('Relatório registrado com sucesso!');
  });
});
