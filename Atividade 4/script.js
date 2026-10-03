// Atividade 4 - Web: tornando a página de produtos interativa (somente JavaScript)
//
// O HTML e o CSS da Atividade 3 não foram alterados (além da tag <script>).
// Tudo o que é novo (botão Comprar, busca, formulário e estilos dos estados)
// é criado aqui, via DOM, usando classList.add / classList.remove / classList.toggle.

document.addEventListener("DOMContentLoaded", function () {

    // ------------------------------------------------------------------
    // 0. Estilos dos estados (classes manipuladas com classList)
    // ------------------------------------------------------------------
    const estilos = document.createElement("style");
    estilos.textContent = `
        .oculto { display: none !important; }

        .busca { display: flex; gap: 8px; margin: 10px; }
        .busca input { flex: 1; padding: 10px; border: 1px solid #3a868b; border-radius: 6px; }
        .busca button { padding: 10px 18px; border: none; border-radius: 6px;
                        background-color: #3a868b; color: white; cursor: pointer; }

        .mensagem { margin: 10px; padding: 10px 14px; border-radius: 6px;
                    display: flex; justify-content: space-between; align-items: center; }
        .mensagem.sucesso { background: #e3f6e8; border: 1px solid #4caf50; color: #1b5e20; }
        .mensagem.aviso   { background: #fff4e0; border: 1px solid #ff9800; color: #8a5200; }
        .mensagem button  { border: none; background: none; cursor: pointer; font-size: 1.1em; }

        .botao_comprar { padding: 10px 18px; margin: 10px; border: none; border-radius: 6px;
                         background-color: #5b2fc9; color: white; cursor: pointer; }
        .botao_comprar.adicionado { background-color: #888; }

        .formulario-contato { margin: 10px; padding: 15px; max-width: 420px;
                              border: 1px solid #3a868b; border-radius: 5px; }
        .formulario-contato label { display: block; margin-top: 10px; font-weight: bold; }
        .formulario-contato input, .formulario-contato textarea {
            width: 100%; padding: 8px; margin-top: 4px;
            border: 1px solid #999; border-radius: 4px; font-family: inherit; }
        .formulario-contato .invalido { border: 1px solid #d32f2f; background: #fff5f5; }
        .formulario-contato .erro { color: #d32f2f; font-size: 0.85em; margin-top: 2px; }
        .formulario-contato .botao_enviar { margin-top: 12px; padding: 10px 18px; border: none;
                                            border-radius: 6px; background-color: #5b2fc9;
                                            color: white; cursor: pointer; }

        .contador-carrinho { float: right; font-size: 0.6em; padding: 4px 10px;
                             border: 1px solid currentColor; border-radius: 12px; }
    `;
    document.head.appendChild(estilos);

    // Remove acentos e põe em minúsculas, para a busca não ser sensível a isso
    function normalizar(texto) {
        return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
    }

    const secaoProdutos = document.querySelector("main section");
    const container = document.querySelector(".container");
    const cards = Array.from(document.querySelectorAll(".card"));

    // ------------------------------------------------------------------
    // Área de mensagens (usada pelo "Comprar" e pela busca)
    // ------------------------------------------------------------------
    const areaMensagem = document.createElement("div");
    areaMensagem.className = "mensagem sucesso oculto";
    areaMensagem.setAttribute("role", "status");
    const textoMensagem = document.createElement("span");
    const fecharMensagem = document.createElement("button");
    fecharMensagem.type = "button";
    fecharMensagem.textContent = "×";
    fecharMensagem.setAttribute("aria-label", "Fechar mensagem");
    areaMensagem.append(textoMensagem, fecharMensagem);

    let timerMensagem = null;

    function mostrarMensagem(texto, tipo) {
        textoMensagem.textContent = texto;
        // classList.remove / add: troca o tipo visual da mensagem
        areaMensagem.classList.remove("sucesso", "aviso", "oculto");
        areaMensagem.classList.add(tipo);
        clearTimeout(timerMensagem);
        timerMensagem = setTimeout(esconderMensagem, 3000);
    }

    function esconderMensagem() {
        areaMensagem.classList.add("oculto");
    }

    fecharMensagem.addEventListener("click", esconderMensagem);

    // ------------------------------------------------------------------
    // 2. Campo de busca
    // ------------------------------------------------------------------
    const busca = document.createElement("div");
    busca.className = "busca";
    const campoBusca = document.createElement("input");
    campoBusca.type = "text";
    campoBusca.placeholder = "Digite um produto...";
    campoBusca.setAttribute("aria-label", "Buscar produto");
    const botaoBuscar = document.createElement("button");
    botaoBuscar.type = "button";
    botaoBuscar.textContent = "Buscar";
    busca.append(campoBusca, botaoBuscar);

    // Ordem na tela: busca -> mensagem -> lista de produtos
    container.before(busca, areaMensagem);

    function buscarProdutos() {
        const termo = normalizar(campoBusca.value);
        let encontrados = 0;

        cards.forEach(function (card) {
            const nome = normalizar(card.querySelector("h3").textContent);
            const combina = nome.includes(termo);
            // classList.toggle com segundo argumento: liga/desliga a classe "oculto"
            card.classList.toggle("oculto", !combina);
            if (combina) encontrados++;
        });

        if (encontrados === 0) {
            mostrarMensagem("Nenhum produto encontrado para \"" + campoBusca.value.trim() + "\".", "aviso");
        } else {
            esconderMensagem();
        }
    }

    botaoBuscar.addEventListener("click", buscarProdutos);
    campoBusca.addEventListener("keydown", function (evento) {
        if (evento.key === "Enter") buscarProdutos();
    });

    // ------------------------------------------------------------------
    // 1. Botão "Comprar" em cada produto (+ contador de carrinho)
    // ------------------------------------------------------------------
    const contador = document.createElement("span");
    contador.className = "contador-carrinho";
    let itensNoCarrinho = 0;
    function atualizarContador() {
        contador.textContent = "Carrinho (" + itensNoCarrinho + ")";
    }
    atualizarContador();
    document.querySelector("header").appendChild(contador);

    cards.forEach(function (card) {
        const botaoComprar = document.createElement("button");
        botaoComprar.type = "button";
        botaoComprar.className = "botao_comprar";
        botaoComprar.textContent = "Comprar";

        botaoComprar.addEventListener("click", function () {
            itensNoCarrinho++;
            atualizarContador();
            // 4. classList.add: muda a aparência do botão após a compra
            botaoComprar.classList.add("adicionado");
            mostrarMensagem("Produto adicionado ao carrinho!", "sucesso");
        });

        card.appendChild(botaoComprar);
    });

    // ------------------------------------------------------------------
    // 3. Formulário com validação obrigatória (Nome, E-mail, Mensagem)
    // ------------------------------------------------------------------
    const secaoContato = document.createElement("section");
    secaoContato.innerHTML = `
        <h2>Fale Conosco</h2>
        <form class="formulario-contato" novalidate>
            <label for="contato-nome">Nome *</label>
            <input type="text" id="contato-nome" placeholder="Digite seu nome">
            <div class="erro oculto">Este campo é obrigatório.</div>

            <label for="contato-email">E-mail *</label>
            <input type="email" id="contato-email" placeholder="Digite seu e-mail">
            <div class="erro oculto">Este campo é obrigatório.</div>

            <label for="contato-mensagem">Mensagem *</label>
            <textarea id="contato-mensagem" rows="4" placeholder="Digite sua mensagem"></textarea>
            <div class="erro oculto">Este campo é obrigatório.</div>

            <button type="submit" class="botao_enviar">Enviar Mensagem</button>
        </form>
    `;
    // Entra depois das seções que já existem, dentro do <main>
    document.querySelector("main").appendChild(secaoContato);

    const formulario = secaoContato.querySelector("form");
    const campos = Array.from(formulario.querySelectorAll("input, textarea"));

    function validarCampo(campo) {
        const erro = campo.nextElementSibling;
        const valor = campo.value.trim();
        let valido = valor !== "";
        let texto = "Este campo é obrigatório.";

        // Além de "não vazio", confere o formato básico do e-mail
        if (valido && campo.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
            valido = false;
            texto = "Digite um e-mail válido.";
        }

        erro.textContent = texto;
        // classList.toggle com força: aplica/remove o visual de erro
        campo.classList.toggle("invalido", !valido);
        erro.classList.toggle("oculto", valido);
        return valido;
    }

    // Limpa o erro assim que o usuário corrige o campo
    campos.forEach(function (campo) {
        campo.addEventListener("input", function () {
            if (campo.classList.contains("invalido")) validarCampo(campo);
        });
    });

    formulario.addEventListener("submit", function (evento) {
        // Valida todos (sem parar no primeiro) para mostrar todos os erros de uma vez
        const resultados = campos.map(validarCampo);
        if (resultados.includes(false)) {
            evento.preventDefault(); // não permite o envio com campo vazio
            campos[resultados.indexOf(false)].focus();
            return;
        }

        // Sem back-end: apenas simula o envio
        evento.preventDefault();
        formulario.reset();
        mostrarMensagem("Mensagem enviada com sucesso!", "sucesso");
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});
