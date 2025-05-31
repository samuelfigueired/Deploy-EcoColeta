// detalhe-comunidade.js
// Página de detalhe de comunidade: busca dados, renderiza, controla participação e comentários

const API_BASE_URL = "http://localhost:3000/api";

// Utilitário para pegar query string
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Utilitário para autenticação simulada
function getUsuarioLogado() {
    return JSON.parse(localStorage.getItem("usuarioLogado"));
}

// Busca comunidade por ID
async function fetchComunidade(id) {
    const res = await fetch(`${API_BASE_URL}/comunidades/${id}`);
    if (!res.ok) throw new Error("Comunidade não encontrada");
    return res.json();
}

// Busca comentários da comunidade (direto do campo comentarios do objeto comunidade)
async function fetchComentarios(comunidadeId) {
    const res = await fetch(`${API_BASE_URL}/comunidades/${comunidadeId}`);
    if (!res.ok) return [];
    const comunidade = await res.json();
    // Garante array
    return Array.isArray(comunidade.comentarios) ? comunidade.comentarios : [];
}

// Publica novo comentário ou resposta (atualiza o array de comentarios da comunidade)
async function postarComentario(comunidadeId, texto, usuario, parentId = null) {
    // Busca comunidade atual
    const res = await fetch(`${API_BASE_URL}/comunidades/${comunidadeId}`);
    if (!res.ok) return null;
    const comunidade = await res.json();
    let comentarios = Array.isArray(comunidade.comentarios) ? comunidade.comentarios : [];
    // Gera novo comentário
    const novoComentario = {
        id: Date.now(),
        texto,
        autorId: usuario.id,
        autorNome: usuario.nome,
        autorFoto: usuario.imagem || "assets/img/avatarCaique.jpg",
        data: new Date().toISOString(),
        parentId: parentId || null
    };
    // Se for resposta, insere como filho
    if (parentId) {
        function inserirResposta(lista) {
            for (let c of lista) {
                if (c.id == parentId) {
                    c.respostas = c.respostas || [];
                    c.respostas.push(novoComentario);
                    return true;
                }
                if (c.respostas && inserirResposta(c.respostas)) return true;
            }
            return false;
        }
        inserirResposta(comentarios);
    } else {
        comentarios.push(novoComentario);
    }
    // Atualiza comunidade
    await fetch(`${API_BASE_URL}/comunidades/${comunidadeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comentarios })
    });
    return novoComentario;
}

// Exclui comentário (remove do array e atualiza comunidade)
async function excluirComentario(comunidadeId, comentarioId, autorId) {
    // Busca comunidade
    const res = await fetch(`${API_BASE_URL}/comunidades/${comunidadeId}`);
    if (!res.ok) return;
    const comunidade = await res.json();
    let comentarios = Array.isArray(comunidade.comentarios) ? comunidade.comentarios : [];
    // Remove comentário (recursivo)
    function remover(lista) {
        return lista.filter(c => {
            if (c.id == comentarioId && c.autorId == autorId) return false;
            if (c.respostas) c.respostas = remover(c.respostas);
            return true;
        });
    }
    comentarios = remover(comentarios);
    await fetch(`${API_BASE_URL}/comunidades/${comunidadeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comentarios })
    });
}

// Verifica se usuário é membro
function usuarioParticipa(comunidade, usuario) {
    if (!usuario || !Array.isArray(comunidade.membros)) return false;
    return comunidade.membros.includes(usuario.id);
}

// Participar/Sair da comunidade (usando array de membros e nova rota PATCH)
async function toggleParticipacao(comunidade, usuario, participando) {
    if (!usuario) return;
    const action = participando ? 'sair' : 'entrar';
    await fetch(`${API_BASE_URL}/comunidades/${comunidade.id}/membros`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: usuario.id, action })
    });
}

// Renderiza dados da comunidade
function renderComunidade(comunidade, participando) {
    document.getElementById("comunidade-img").src = comunidade.banner || "assets/img/recycle.svg";
    document.getElementById("comunidade-nome").textContent = comunidade.nome;
    document.getElementById("comunidade-descricao").textContent = comunidade.descricao;
    // Exibir número de membros corretamente
    document.getElementById("comunidade-membros-count").textContent = Array.isArray(comunidade.membros) ? comunidade.membros.length : 0;
    // Regras
    const regrasList = document.getElementById("comunidade-regras-list");
    regrasList.innerHTML = "";
    if (comunidade.regras) {
        comunidade.regras.split(/[\n\r]+|[.;]/).forEach(r => {
            if (r.trim()) regrasList.innerHTML += `<li>${r.trim()}</li>`;
        });
    }
    // Botão participar
    const btn = document.getElementById("btn-participar");
    btn.textContent = participando ? "Sair da Comunidade" : "Participar";
    btn.classList.toggle("participando", participando);
}

// Renderiza comentários aninhados
function renderComentarios(comentarios, usuario, comunidadeId, nivel = 0) {
    const list = nivel === 0 ? document.getElementById("comentarios-list") : document.createElement("div");
    if (nivel === 0) list.innerHTML = "";
    if (!comentarios.length && nivel === 0) {
        list.innerHTML = '<div class="comentario vazio">Nenhum comentário ainda.</div>';
        return;
    }
    comentarios.forEach(c => {
        const podeExcluir = usuario && c.autorId === usuario.id;
        const comentarioDiv = document.createElement("div");
        comentarioDiv.className = "comentario" + (nivel > 0 ? " comentario-resposta" : "");
        comentarioDiv.innerHTML = `
            <div class="comentario-autor">
                <img src="${c.autorFoto}" alt="${c.autorNome}" style="width:28px;height:28px;border-radius:50%;margin-right:8px;vertical-align:middle;"> ${c.autorNome}
            </div>
            <div class="comentario-texto">${c.texto}</div>
            <div class="comentario-footer">
                <span>${new Date(c.data).toLocaleString('pt-BR')}</span>
                <button class="btn-responder-comentario" data-id="${c.id}">Responder</button>
                ${podeExcluir ? `<button class="btn-excluir-comentario" data-id="${c.id}">Excluir</button>` : ""}
            </div>
        `;
        // Respostas aninhadas
        if (c.respostas && c.respostas.length) {
            const respostasDiv = renderComentarios(c.respostas, usuario, comunidadeId, nivel + 1);
            comentarioDiv.appendChild(respostasDiv);
        }
        list.appendChild(comentarioDiv);
    });
    if (nivel === 0) {
        // Handler de exclusão
        list.querySelectorAll(".btn-excluir-comentario").forEach(btn => {
            btn.onclick = async () => {
                const usuario = getUsuarioLogado();
                await excluirComentario(comunidadeId, btn.dataset.id, usuario.id);
                carregarComentarios();
            };
        });
        // Handler de resposta
        list.querySelectorAll(".btn-responder-comentario").forEach(btn => {
            btn.onclick = function () {
                const parentDiv = btn.closest('.comentario');
                let form = parentDiv.querySelector('.form-resposta');
                if (form) { form.remove(); return; }
                form = document.createElement('div');
                form.className = 'form-resposta';
                form.innerHTML = `
                    <textarea class="input-resposta" placeholder="Responder..."></textarea>
                    <button class="btn-enviar-resposta">Enviar</button>
                `;
                parentDiv.appendChild(form);
                const textarea = form.querySelector('.input-resposta');
                const enviarBtn = form.querySelector('.btn-enviar-resposta');
                enviarBtn.onclick = async () => {
                    const texto = textarea.value.trim();
                    if (!texto) return;
                    enviarBtn.disabled = true;
                    const usuario = getUsuarioLogado();
                    await postarComentario(comunidadeId, texto, usuario, btn.dataset.id);
                    carregarComentarios();
                };
            };
        });
    }
    return list;
}

// Carrega e renderiza comentários
async function carregarComentarios() {
    const comunidadeId = getQueryParam("id");
    const usuario = getUsuarioLogado();
    const comentarios = await fetchComentarios(comunidadeId);
    renderComentarios(comentarios, usuario, comunidadeId);
}

// Handler de comentário
function setupComentarioForm(comunidadeId, participando) {
    const usuario = getUsuarioLogado();
    const form = document.getElementById("comentario-form-container");
    if (!usuario || !participando) {
        form.style.display = "none";
        return;
    }
    form.style.display = "flex";
    const input = document.getElementById("comentario-input");
    const btn = document.getElementById("btn-comentar");
    btn.onclick = async () => {
        const texto = input.value.trim();
        if (!texto) return;
        btn.disabled = true;
        await postarComentario(comunidadeId, texto, usuario);
        input.value = "";
        btn.disabled = false;
        carregarComentarios();
    };
}

// Handler de participação
function setupParticiparBtn(comunidade, participando) {
    const usuario = getUsuarioLogado();
    const btn = document.getElementById("btn-participar");
    btn.onclick = async () => {
        btn.disabled = true;
        await toggleParticipacao(comunidade, usuario, participando);
        location.reload();
    };
}

// Inicialização
window.addEventListener("DOMContentLoaded", async () => {
    const comunidadeId = getQueryParam("id");
    if (!comunidadeId) {
        alert("Comunidade não encontrada.");
        window.location.href = "comunidade.html";
        return;
    }
    let comunidade;
    try {
        comunidade = await fetchComunidade(comunidadeId);
    } catch {
        alert("Comunidade não encontrada.");
        window.location.href = "comunidade.html";
        return;
    }
    const usuario = getUsuarioLogado();
    // Verifica participação corretamente
    const participando = usuarioParticipa(comunidade, usuario);
    renderComunidade(comunidade, participando);
    setupParticiparBtn(comunidade, participando);
    setupComentarioForm(comunidadeId, participando);
    carregarComentarios();
});
