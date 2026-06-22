// =============================================
// 1. CONFIGURAÇÕES E VARIÁVEIS GLOBAIS
// =============================================
const SEU_WHATSAPP = "5584988850609"; 

const PRODUTOS_PADRAO = [];
const CATEGORIAS_PADRAO = [];

// AJUSTADO: Removidos os links reais de exemplo. Agora inicia como campos vazios/placeholders.
const BANNERS_PADRAO = ["", "", ""];

let PRODUTOS_CATALOGO = JSON.parse(localStorage.getItem('as_sound_produtos')) || PRODUTOS_PADRAO;
let LISTA_CATEGORIAS = JSON.parse(localStorage.getItem('as_sound_categorias')) || CATEGORIAS_PADRAO;
let LINKS_BANNERS = JSON.parse(localStorage.getItem('as_sound_banners')) || BANNERS_PADRAO;

let slideIndexAtivo = 0;
const totalSlides = 3;
const tempoAutoSlide = 5000;
let intervaloCarrossel = null; 
let quantidadeSelecionadaAtual = 1;

// =============================================
// 2. DETECTOR DE PÁGINA E INICIALIZAÇÃO
// =============================================
const estaNoPainelAdm = document.getElementById('form-cadastro-produto') !== null;

if (estaNoPainelAdm) {
    inicializarPainelAdm();
} else {
    inicializarVitrinePublica();
}

function fecharModalProduto() { 
    const modal = document.getElementById('product-modal');
    if (modal) modal.classList.add('hidden'); 
}
window.fecharModalProduto = fecharModalProduto;

// =============================================
// 3. AMBIENTE 1: SISTEMA DA VITRINE DO CLIENTE
// =============================================
function inicializarVitrinePublica() {
    aplicarLinksDosBannersNaVitrina();
    renderizarMenuCategorias();
    renderizarVitrineProdutos();
    iniciarAutoSlide();

    document.getElementById('search-btn')?.addEventListener('click', realizarBusca);
    document.getElementById('search-input')?.addEventListener('keyup', (e) => { if (e.key === 'Enter') realizarBusca(); });
}

function aplicarLinksDosBannersNaVitrina() {
    const slider = document.getElementById('carousel-slider');
    if (!slider) return;
    
    const imagensBanners = slider.querySelectorAll('img');
    if (imagensBanners.length >= 3) {
        // Se o link estiver vazio, ele põe uma imagem cinza de placeholder visual na vitrine
        imagensBanners[0].src = LINKS_BANNERS[0] || "https://via.placeholder.com/1200x400/cccccc/ffffff?text=Banner+1+Vazio";
        imagensBanners[1].src = LINKS_BANNERS[1] || "https://via.placeholder.com/1200x400/cccccc/ffffff?text=Banner+2+Vazio";
        imagensBanners[2].src = LINKS_BANNERS[2] || "https://via.placeholder.com/1200x400/cccccc/ffffff?text=Banner+3+Vazio";
    }
}

function renderizarMenuCategorias() {
    const navMenu = document.getElementById('nav-categorias-dinamicas');
    if (!navMenu) return;

    navMenu.innerHTML = `<a href="#" class="category-btn" id="btn-todas"><i class="fas fa-layer-group"></i> Todo o Estoque</a>`;

    LISTA_CATEGORIAS.forEach(cat => {
        const link = document.createElement('a');
        link.href = "#";
        link.className = "category-link";
        link.setAttribute('data-cat', cat.id);
        link.innerText = cat.nome;
        
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.product-card').forEach(p => {
                p.style.display = p.getAttribute('data-category') === cat.id ? "flex" : "none";
            });
        });

        navMenu.appendChild(link);
    });

    document.getElementById('btn-todas').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('search-input').value = "";
        document.querySelectorAll('.product-card').forEach(p => p.style.display = "flex");
    });
}

function renderizarVitrineProdutos() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    grid.innerHTML = "";

    if (PRODUTOS_CATALOGO.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">Nenhum produto cadastrado no momento.</p>`;
        return;
    }

    PRODUTOS_CATALOGO.forEach(produto => {
        const card = document.createElement('div');
        card.className = "product-card";
        card.setAttribute('data-category', produto.categoria);
        card.setAttribute('data-name', produto.nome.toLowerCase());

        const linkImagemFinal = produto.imagens && produto.imagens.length > 0 ? produto.imagens[0] : "https://via.placeholder.com/300";
        const precoFormatado = produto.preco % 1 === 0 ? produto.preco.toFixed(0) : produto.preco.toFixed(2).replace('.', ',');

        card.innerHTML = `
            <div class="product-image"><img src="${linkImagemFinal}" alt="${produto.nome}"></div>
            <div class="product-info">
                <span class="product-badge">${produto.badge}</span>
                <h3 class="product-title">${produto.nome}</h3>
                <div class="price-wrapper"><span class="price">R$ ${precoFormatado}</span></div>
                <button class="btn-view-details" onclick="window.abrirModalProduto(${produto.id})">Visualizar Item <i class="fas fa-arrow-right"></i></button>
            </div>
        `;
        grid.appendChild(card);
    });
}

window.abrirModalProduto = function(idProduto) {
    const produto = PRODUTOS_CATALOGO.find(p => p.id == idProduto);
    if (!produto) return;

    quantidadeSelecionadaAtual = 1;
    document.getElementById('modal-qty-value').innerText = quantidadeSelecionadaAtual;
    document.getElementById('modal-title').innerText = produto.nome;
    
    const precoFormatadoModal = produto.preco % 1 === 0 ? produto.preco.toFixed(0) : produto.preco.toFixed(2).replace('.', ',');
    document.getElementById('modal-price').innerText = `R$ ${precoFormatadoModal}`;
    document.getElementById('modal-description').innerText = produto.descricao;

    const mainImg = document.getElementById('modal-main-img');
    mainImg.src = produto.imagens && produto.imagens.length > 0 ? produto.imagens[0] : "https://via.placeholder.com/600";

    const containerThumbs = document.getElementById('modal-thumbnails');
    containerThumbs.innerHTML = "";

    if (produto.imagens && produto.imagens.length > 0) {
        produto.imagens.forEach((linkImg, idx) => {
            const thumbButton = document.createElement('div');
            thumbButton.className = `thumb-item ${idx === 0 ? 'active' : ''}`;
            thumbButton.innerHTML = `<img src="${linkImg}">`;
            
            thumbButton.addEventListener('click', function() {
                document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
                thumbButton.classList.add('active');
                mainImg.src = linkImg;
            });
            containerThumbs.appendChild(thumbButton);
        });
    }

    document.getElementById('btn-qty-minus').onclick = function() {
        if (quantidadeSelecionadaAtual > 1) {
            quantidadeSelecionadaAtual--;
            document.getElementById('modal-qty-value').innerText = quantidadeSelecionadaAtual;
        }
    };
    document.getElementById('btn-qty-plus').onclick = function() {
        quantidadeSelecionadaAtual++;
        document.getElementById('modal-qty-value').innerText = quantidadeSelecionadaAtual;
    };

    document.getElementById('modal-whatsapp-btn').onclick = function() {
        const total = produto.preco * quantidadeSelecionadaAtual;
        const totalFormatadoZap = total % 1 === 0 ? total.toFixed(0) : total.toFixed(2).replace('.', ',');
        let msg = `Olá! Quero fechar o pedido de:\n📦 *${produto.nome}*\n🔢 Qtd: ${quantidadeSelecionadaAtual}\n💰 Total: R$ ${totalFormatadoZap}`;
        window.open(`https://api.whatsapp.com/send?phone=${SEU_WHATSAPP}&text=${encodeURIComponent(msg)}`, '_blank');
    };

    document.getElementById('product-modal').classList.remove('hidden');
};

function atualizarPosousel() {
    const slider = document.getElementById('carousel-slider');
    if (slider) slider.style.transform = `translateX(-${slideIndexAtivo * (100 / totalSlides)}%)`;
    document.querySelectorAll('.carousel-dots .dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === slideIndexAtivo);
    });
}
function proximoSlide() { slideIndexAtivo = (slideIndexAtivo + 1) % totalSlides; atualizarPosousel(); }
function slideAnterior() { slideIndexAtivo = (slideIndexAtivo - 1 + totalSlides) % totalSlides; atualizarPosousel(); }
function iniciarAutoSlide() { clearInterval(intervaloCarrossel); intervaloCarrossel = setInterval(proximoSlide, tempoAutoSlide); }

document.getElementById('carousel-next-btn')?.addEventListener('click', () => { proximoSlide(); iniciarAutoSlide(); });
document.getElementById('carousel-prev-btn')?.addEventListener('click', () => { slideAnterior(); iniciarAutoSlide(); });

function realizarBusca() {
    const termo = document.getElementById('search-input').value.toLowerCase().trim();
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.display = card.getAttribute('data-name').includes(termo) ? "flex" : "none";
    });
}

// =============================================
// 4. AMBIENTE 2: SISTEMA INTERNO DO PAINEL ADM
// =============================================
function inicializarPainelAdm() {
    renderizarSelectCategorias();
    renderizarListagemAdm();
    renderizarListaCategoriesComBotaoRemover();
    carregarInputsDeBannersNoPainel();

    document.getElementById('form-cadastro-banners')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const b1 = document.getElementById('adm-banner1').value.trim();
        const b2 = document.getElementById('adm-banner2').value.trim();
        const b3 = document.getElementById('adm-banner3').value.trim();

        LINKS_BANNERS = [b1, b2, b3];
        localStorage.setItem('as_sound_banners', JSON.stringify(LINKS_BANNERS));
        alert("Banners salvos! Os novos links já estão ativos na vitrine.");
    });

    document.getElementById('form-cadastro-categoria').addEventListener('submit', function(e) {
        e.preventDefault();
        const inputNome = document.getElementById('adm-nova-categoria-nome');
        const nomeOriginal = inputNome.value.trim();
        
        const idGerado = nomeOriginal.toLowerCase()
                                     .normalize("NFD")
                                     .replace(/[\u0300-\u036f]/g, "") 
                                     .replace(/[^a-z0-9]/g, '-')
                                     .replace(/-+/g, '-');

        if (LISTA_CATEGORIAS.some(c => c.id === idGerado)) {
            alert("Esta categoria já existe!");
            return;
        }

        LISTA_CATEGORIAS.push({ id: idGerado, nome: nomeOriginal });
        salvarCategoriasNoLocalStorage();
        
        renderizarSelectCategorias(); 
        renderizarListaCategoriesComBotaoRemover();
        
        inputNome.value = "";
        alert(`Categoria "${nomeOriginal}" salva com sucesso!`);
    });

    document.getElementById('form-cadastro-produto').addEventListener('submit', function(e) {
        e.preventDefault();

        const nome = document.getElementById('adm-nome').value;
        const preco = parseFloat(document.getElementById('adm-preco').value);
        const categoriaId = document.getElementById('adm-categoria').value;
        const descricao = document.getElementById('adm-descricao').value;
        
        const img1 = document.getElementById('adm-img1').value.trim();
        const img2 = document.getElementById('adm-img2').value.trim();
        const img3 = document.getElementById('adm-img3').value.trim();

        if (!categoriaId || categoriaId === "") {
            alert("Por favor, crie e selecione uma categoria válida primeiro!");
            return;
        }

        const objetoCategoria = LISTA_CATEGORIAS.find(c => c.id === categoriaId);
        const labelBadge = objetoCategoria ? objetoCategoria.nome : "Componente";

        const novoProduto = {
            id: Date.now(),
            badge: labelBadge,
            nome: nome,
            preco: preco,
            categoria: categoriaId,
            descricao: descricao,
            imagens: [img1, img2, img3].filter(url => url !== "")
        };

        PRODUTOS_CATALOGO.push(novoProduto);
        salvarProdutosNoLocalStorage();
        renderizarListagemAdm();
        this.reset();
        alert("Componente inserido com sucesso!");
    });
}

function carregarInputsDeBannersNoPainel() {
    const inputB1 = document.getElementById('adm-banner1');
    const inputB2 = document.getElementById('adm-banner2');
    const inputB3 = document.getElementById('adm-banner3');
    
    if (inputB1 && inputB2 && inputB3) {
        inputB1.value = LINKS_BANNERS[0] || "";
        inputB2.value = LINKS_BANNERS[1] || "";
        inputB3.value = LINKS_BANNERS[2] || "";
    }
}

function renderizarSelectCategorias() {
    const selectMenu = document.getElementById('adm-categoria');
    if (!selectMenu) return;
    selectMenu.innerHTML = "";

    if (LISTA_CATEGORIAS.length === 0) {
        selectMenu.innerHTML = `<option value="">Nenhuma categoria cadastrada</option>`;
        return;
    }

    LISTA_CATEGORIAS.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.innerText = cat.nome;
        selectMenu.appendChild(option);
    });
}

function renderizarListaCategoriesComBotaoRemover() {
    let containerGerenciador = document.getElementById('adm-gerenciador-categorias-lista');
    
    if (!containerGerenciador) {
        const colunaDireita = document.querySelector('.admin-tables-column');
        if (!colunaDireita) return;

        const blocoLista = document.createElement('div');
        blocoLista.className = "admin-card";
        blocoLista.innerHTML = `
            <div class="card-header">
                <h3><i class="fas fa-tags"></i> Categorias Ativas</h3>
            </div>
            <div id="adm-gerenciador-categorias-lista" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap:12px;"></div>
        `;
        colunaDireita.insertBefore(blocoLista, colunaDireita.firstChild);
        containerGerenciador = document.getElementById('adm-gerenciador-categorias-lista');
    }

    containerGerenciador.innerHTML = "";

    if (LISTA_CATEGORIAS.length === 0) {
        containerGerenciador.innerHTML = `<p style="font-size: 13px; color: var(--text-muted); grid-column: 1/-1;">Nenhuma categoria cadastrada.</p>`;
        return;
    }

    LISTA_CATEGORIAS.forEach(cat => {
        const row = document.createElement('div');
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";
        row.style.background = "#f8fafc";
        row.style.padding = "10px 14px";
        row.style.borderRadius = "10px";
        row.style.border = "1px solid var(--border-color)";
        row.style.fontSize = "13px";

        row.innerHTML = `
            <span><strong>${cat.nome}</strong></span>
            <button onclick="window.removerCategoriaDoSistema('${cat.id}')" style="background:none; border:none; color:var(--danger-red); cursor:pointer; font-size:12px; font-weight:600;"><i class="fas fa-trash"></i></button>
        `;
        containerGerenciador.appendChild(row);
    });
}

window.removerCategoriaDoSistema = function(idCategoria) {
    if (confirm("Deseja mesmo apagar essa categoria? Os produtos que usam ela ficarão sem categoria vinculada.")) {
        LISTA_CATEGORIAS = LISTA_CATEGORIAS.filter(c => c.id !== idCategoria);
        salvarCategoriasNoLocalStorage();
        renderizarSelectCategorias();
        renderizarListaCategoriesComBotaoRemover();
    }
};

function renderizarListagemAdm() {
    const tbody = document.getElementById('adm-lista-produtos');
    if (!tbody) return;
    tbody.innerHTML = "";

    if (PRODUTOS_CATALOGO.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Nenhum produto no catálogo.</td></tr>`;
        return;
    }

    PRODUTOS_CATALOGO.forEach(produto => {
        const tr = document.createElement('tr');
        const precoPainel = produto.preco % 1 === 0 ? produto.preco.toFixed(0) : produto.preco.toFixed(2).replace('.', ',');

        tr.innerHTML = `
            <td><strong>${produto.nome}</strong></td>
            <td><span class="tag-status">${produto.categoria}</span></td>
            <td>R$ ${precoPainel}</td>
            <td><button class="btn-delete-adm" onclick="window.removerProdutoDoSistema(${produto.id})"><i class="fas fa-trash-can"></i> Remover</button></td>
        `;
        tbody.appendChild(tr);
    });
}

window.removerProdutoDoSistema = function(idProduto) {
    if (confirm("Deseja deletar este item permanentemente do banco dados?")) {
        PRODUTOS_CATALOGO = PRODUTOS_CATALOGO.filter(p => p.id !== idProduto);
        salvarProdutosNoLocalStorage();
        renderizarListagemAdm();
    }
};

function salvarProdutosNoLocalStorage() { localStorage.setItem('as_sound_produtos', JSON.stringify(PRODUTOS_CATALOGO)); }
function salvarCategoriasNoLocalStorage() { localStorage.setItem('as_sound_categorias', JSON.stringify(LISTA_CATEGORIAS)); }