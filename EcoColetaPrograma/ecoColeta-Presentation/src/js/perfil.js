// perfil.js - Gerencia o perfil do usuário logado na EcoColeta
// Busca dados do usuário, permite edição, atualização e logout
// Adapte a URL do JSON Server conforme necessário

const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
if (!usuarioLogado) {
  window.location.href = 'login.html';
}

const form = document.getElementById('perfilForm');
const editarBtn = document.getElementById('editarPerfilBtn');
const salvarBtn = document.getElementById('salvarPerfilBtn');
const logoutBtn = document.getElementById('logoutBtn');
const imagemInput = document.getElementById('perfilImagemInput');
const imagemPreview = document.getElementById('perfilImagemPreview');

// Função para preencher o formulário com os dados do usuário
async function preencherPerfil() {
  try {
    const response = await fetch(`http://localhost:3000/usuarios/${usuarioLogado.id}`);
    const usuario = await response.json();
    form.perfilNome.value = usuario.nome;
    form.perfilEmail.value = usuario.email;
    form.perfilRua.value = usuario.endereco.rua;
    form.perfilNumero.value = usuario.endereco.numero;
    form.perfilBairro.value = usuario.endereco.bairro;
    form.perfilCidade.value = usuario.endereco.cidade;
    form.perfilEstado.value = usuario.endereco.estado;
    form.perfilCep.value = usuario.endereco.cep;
    // Preferências
    form.prefNewsletter.checked = usuario.preferencias.includes('newsletter');
    form.prefNotificacoes.checked = usuario.preferencias.includes('notificacoes');
    form.prefTemaEscuro.checked = usuario.preferencias.includes('temas-escuros');
    // Imagem
    if (usuario.imagem) {
      imagemPreview.src = usuario.imagem;
      imagemPreview.style.display = 'block';
    } else {
      imagemPreview.style.display = 'none';
    }
  } catch (err) {
    alert('Erro ao carregar perfil.');
  }
}

// Torna os campos editáveis
function habilitarEdicao() {
  form.querySelectorAll('input').forEach(input => input.disabled = false);
  imagemInput.style.display = 'block';
  editarBtn.style.display = 'none';
  salvarBtn.style.display = 'inline-block';
}

// Torna os campos não editáveis
function desabilitarEdicao() {
  form.querySelectorAll('input').forEach(input => input.disabled = true);
  imagemInput.style.display = 'none';
  editarBtn.style.display = 'inline-block';
  salvarBtn.style.display = 'none';
}

// Preview da nova imagem
imagemInput.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (evt) {
      imagemPreview.src = evt.target.result;
      imagemPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

// Editar perfil
editarBtn.addEventListener('click', habilitarEdicao);

// Salvar alterações
form.addEventListener('submit', async function (e) {
  e.preventDefault();
  // Coleta preferências
  const preferencias = [];
  if (form.prefNewsletter.checked) preferencias.push('newsletter');
  if (form.prefNotificacoes.checked) preferencias.push('notificacoes');
  if (form.prefTemaEscuro.checked) preferencias.push('temas-escuros');
  // Monta objeto atualizado
  const usuarioAtualizado = {
    nome: form.perfilNome.value,
    email: form.perfilEmail.value,
    endereco: {
      rua: form.perfilRua.value,
      numero: form.perfilNumero.value,
      bairro: form.perfilBairro.value,
      cidade: form.perfilCidade.value,
      estado: form.perfilEstado.value,
      cep: form.perfilCep.value,
    },
    preferencias: preferencias,
    imagem: imagemPreview.src !== '#' ? imagemPreview.src : '',
  };
  try {
    const response = await fetch(`http://localhost:3000/usuarios/${usuarioLogado.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuarioAtualizado)
    });
    if (response.ok) {
      alert('Perfil atualizado com sucesso!');
      desabilitarEdicao();
    } else {
      alert('Erro ao atualizar perfil.');
    }
  } catch (err) {
    alert('Erro de conexão com o servidor.');
  }
});

// Logout
logoutBtn.addEventListener('click', function () {
  localStorage.removeItem('usuarioLogado');
  window.location.href = 'login.html';
});

// Inicialização
preencherPerfil();
desabilitarEdicao(); 