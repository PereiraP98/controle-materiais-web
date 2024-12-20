// relatorio.js
document.addEventListener('DOMContentLoaded', () => {
  const gerarRelatorioButton = document.getElementById('gerarRelatorioButton');

  gerarRelatorioButton.addEventListener('click', () => {
    // Seleciona a tabela "Detalhes de Materiais Solicitados"
    const detalhesTable = document.getElementById('detalhesTable');
    const rows = detalhesTable.querySelectorAll('tbody tr');

    // Array para armazenar cada item
    const listaMateriais = [];

    rows.forEach((row, rowIndex) => {
      const cols = row.querySelectorAll('td');

      // Logs para depuração: mostra quantas colunas foram encontradas
      console.log(`Linha ${rowIndex}: quantidade de colunas = ${cols.length}`);
      cols.forEach((col, colIndex) => {
        console.log(`  Coluna ${colIndex}:`, col.innerText);
      });

      // A tabela possui 9 colunas no <thead>:
      // 0 -> (checkbox hidden)
      // 1 -> LOCAL
      // 2 -> ITEM
      // 3 -> QTD
      // 4 -> DESTINO
      // 5 -> DATA
      // 6 -> HORA
      // 7 -> RECEBER (não usado no relatório)
      // 8 -> TEMPO

      // Se o cols.length < 9, possivelmente "TEMPO" está faltando no HTML dessa linha
      if (cols.length < 9) {
        console.warn(`A linha ${rowIndex} não possui 9 colunas. Verifique se a coluna TEMPO está presente.`);
        return; // Pula essa linha, pois não tem a estrutura esperada
      }

      const local = cols[1].innerText;
      const item = cols[2].innerText;
      const qtd = cols[3].innerText;
      const destino = cols[4].innerText;
      const data = cols[5].innerText;
      const hora = cols[6].innerText;

      // Captura o TEMPO (coluna 8)
      const tempo = cols[8].innerText;

      // Deixamos 'reportado' em branco (futuro uso)
      const reportado = '';

      // Monta o objeto com o campo tempo incluso
      listaMateriais.push({
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

    // Cria no localStorage a pasta do mês e o arquivo pela data
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mesIndex = hoje.getMonth(); // 0..11
    const anoDoisDig = String(hoje.getFullYear()).slice(-2); // últimos 2 dígitos

    const MESES = [
      'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
      'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
    ];
    const nomeMes = MESES[mesIndex];

    // Exemplo de nome de arquivo: 21_12_24 (DD_MM_AA)
    const dataCurta = `${dia}_${String(mesIndex + 1).padStart(2, '0')}_${anoDoisDig}`;

    // Recupera (ou cria) o objeto de relatórios
    const stored = localStorage.getItem('relatoriosMes');
    let relatoriosMes = stored ? JSON.parse(stored) : {};

    // Se ainda não existe o "mês" no objeto, cria
    if (!relatoriosMes[nomeMes]) {
      relatoriosMes[nomeMes] = {};
    }

    // Salva o array "listaMateriais" nesse "arquivo" dataCurta
    relatoriosMes[nomeMes][dataCurta] = {
      items: listaMateriais
    };

    // Atualiza no localStorage
    localStorage.setItem('relatoriosMes', JSON.stringify(relatoriosMes));

    // Exibe apenas uma mensagem de sucesso
    alert('Relatório registrado com sucesso!');
  });
});
