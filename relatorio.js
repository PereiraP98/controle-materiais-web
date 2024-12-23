// relatorio.js
document.addEventListener('DOMContentLoaded', () => {
  const gerarRelatorioButton = document.getElementById('gerarRelatorioButton');

  gerarRelatorioButton.addEventListener('click', () => {

    // =========== MATERIAIS SOLICITADOS ===========
    const detalhesTable = document.getElementById('detalhesTable');
    const rowsSolicitados = detalhesTable.querySelectorAll('tbody tr');
    const listaMateriaisSolicitados = [];

    rowsSolicitados.forEach((row) => {
      const cols = row.querySelectorAll('td');
      // A tabela "Materiais Solicitados" tem 9 colunas:
      // (0) hidden (checkbox)
      // (1) LOCAL
      // (2) ITEM
      // (3) QTD
      // (4) DESTINO
      // (5) DATA
      // (6) HORA
      // (7) RECEBER (ignorado no relatório)
      // (8) TEMPO
      if (cols.length < 9) return; // se não tiver 9 colunas, pula

      const local = cols[1].innerText;
      const item = cols[2].innerText;
      const qtd = cols[3].innerText;
      const destino = cols[4].innerText;
      const data = cols[5].innerText;
      const hora = cols[6].innerText;
      const tempo = cols[8].innerText; // a coluna 8 é "TEMPO"

      // Campo "reportado" ficará vazio (futuro uso)
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

    // =========== MATERIAIS RECEBIDOS ===========
    const recebidosTable = document.getElementById('recebidosTable');
    const rowsRecebidos = recebidosTable.querySelectorAll('tbody tr');
    const listaMateriaisRecebidos = [];

    rowsRecebidos.forEach((row) => {
      const cols = row.querySelectorAll('td');
      // A tabela "Materiais Recebidos" também tem 9 colunas:
      // (0) hidden (checkbox)
      // (1) LOCAL
      // (2) ITEM
      // (3) QTD
      // (4) DESTINO
      // (5) DATA
      // (6) HORA
      // (7) RECEBIDO
      // (8) GUARDADO
      if (cols.length < 9) return; // se não tiver 9 colunas, pula

      const local = cols[1].innerText;
      const item = cols[2].innerText;
      const qtd = cols[3].innerText;
      const destino = cols[4].innerText;
      const data = cols[5].innerText;
      const hora = cols[6].innerText;
      const recebido = cols[7].innerText;
      const guardado = cols[8].innerText; // não existe tempo aqui

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
    });

    // =========== SALVANDO NO LOCALSTORAGE ===========
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mesIndex = hoje.getMonth(); // 0..11
    const anoDoisDig = String(hoje.getFullYear()).slice(-2);

    const MESES = [
      'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
      'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
    ];
    const mesNome = MESES[mesIndex];
    // Exemplo de nome de arquivo: 23_12_24
    const dataCurta = `${dia}_${String(mesIndex+1).padStart(2, '0')}_${anoDoisDig}`;

    // Obter (ou criar) o objeto relatoriosMes do localStorage
    const stored = localStorage.getItem('relatoriosMes');
    let relatoriosMes = stored ? JSON.parse(stored) : {};

    if (!relatoriosMes[mesNome]) {
      relatoriosMes[mesNome] = {};
    }

    // Salva nesse "arquivo" dataCurta
    relatoriosMes[mesNome][dataCurta] = {
      solicitados: listaMateriaisSolicitados,
      recebidos: listaMateriaisRecebidos
    };

    localStorage.setItem('relatoriosMes', JSON.stringify(relatoriosMes));

    // Mensagem de sucesso
    alert('Relatório registrado com sucesso!');
  });
});
