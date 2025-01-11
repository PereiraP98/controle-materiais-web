// script.js

// Map para armazenar os IDs dos intervals para cada detalhe
const intervalMap = new Map();

// Lógica de login
var loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var usernameInput = document.getElementById("username");
        var passwordInput = document.getElementById("password");

        var username = usernameInput ? usernameInput.value.trim() : "";
        var password = passwordInput ? passwordInput.value.trim() : "";

        // Validação simples de usuário e senha
        if (username === "admin" && password === "admin") {
            // Armazena o estado de autenticação no localStorage
            localStorage.setItem("authenticated", "true");
            // Redireciona para a página painel.html
            window.location.href = "painel.html";
        } else {
            alert("Usuário ou senha incorretos. Tente novamente.");
        }
    });
}

// Verifica a autenticação nas páginas protegidas
function checkAuthentication() {
    var isAuthenticated = localStorage.getItem("authenticated");
    if (isAuthenticated !== "true") {
        // Redireciona para a página de login se não estiver autenticado
        window.location.href = "login.html";
    }
}

// Chama a função de verificação nas páginas protegidas
if (
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname.endsWith("detalhes.html") ||
    window.location.pathname.endsWith("painel.html")
) {
    checkAuthentication();
}

// Função de logout
function logout() {
    // Remove o estado de autenticação
    localStorage.removeItem("authenticated");
    // Redireciona para a página de login
    window.location.href = "login.html";
}

// Adiciona o evento de clique ao botão de logout
var logoutButton = document.getElementById("logoutButton");
if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        logout();
    });
}

// Função para voltar ao painel
function backToPanel() {
    window.location.href = "painel.html";
}

// Adiciona o evento de clique ao botão de voltar ao painel
var backToPanelButton = document.getElementById("backToPanelButton");
if (backToPanelButton) {
    backToPanelButton.addEventListener("click", function () {
        backToPanel();
    });
}

// ... [código de solicitação/reserva etc. continua igual ao seu anterior, sem mudanças] ...


// Função para atualizar a tabela de materiais recebidos
var recebidosTableElement = document.getElementById("recebidosTable");
var recebidosTable = recebidosTableElement ? recebidosTableElement.querySelector("tbody") : null;

function atualizarTabelaRecebidos() {
    var recebidos = JSON.parse(localStorage.getItem("recebidos")) || [];
    if (recebidosTable) {
        recebidosTable.innerHTML = ""; // Limpa a tabela antes de recarregar

        recebidos.forEach(function (item, index) {
            var newRow = document.createElement("tr");
            // Esperamos 10 colunas em detalhes.html:
            // (0) hidden checkbox
            // (1) LOCAL
            // (2) ITEM
            // (3) QTD
            // (4) DESTINO
            // (5) DATA
            // (6) HORA
            // (7) RECEBIDO
            // (8) TEMPO
            // (9) GUARDADO
            // Aqui, exibimos col[1..9], ocultando a 0 com a class hidden
            newRow.innerHTML = `
                <td class="checkbox-column hidden"><input type="checkbox" class="delete-checkbox"></td>
                <td>${item.local || ""}</td>
                <td>${item.item || ""}</td>
                <td>${item.quantidade || ""}</td>
                <td>${item.destino || ""}</td>
                <td>${item.dataAtual || ""}</td>
                <td>${item.horario || ""}</td>
                <td>${item.recebido || ""}</td>
                <td>${item.tempo || ""}</td>   <!-- Exibe o campo TEMPO -->
                <td>${item.guardado || ""}</td>
            `;
            recebidosTable.appendChild(newRow);
        });

        // Mensagem para tabela vazia
        if (recebidos.length === 0) {
            var emptyRow = document.createElement("tr");
            emptyRow.innerHTML = `
                <td colspan="10" style="text-align: center;">Nenhum material recebido no momento.</td>
            `;
            recebidosTable.appendChild(emptyRow);
        }
    } else {
        console.error("Tabela de materiais recebidos não encontrada.");
    }
}


// ... [restante do script: tabela solicitados, exclusão etc., permanece o mesmo] ...

// Carrega os dados ao carregar a página
document.addEventListener("DOMContentLoaded", function () {
    atualizarTabelaReservados();
    atualizarTabelaSolicitados();

    if (window.location.pathname.includes("detalhes.html")) {
        // Carrega e exibe 'detalhes' e 'recebidos'
        atualizarTabelaDetalhes();
        atualizarTabelaRecebidos(); // chama a função para exibir TEMPO em RECEBIDOS
    }
});
