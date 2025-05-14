// perfil.js - Gerencia o perfil do usuário logado na EcoColeta
// Busca dados do usuário, permite edição, atualização e logout
// Adapte a URL do JSON Server conforme necessário

const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
if (!usuarioLogado) {
  window.location.href = 'autent.html';
}

// Elementos do DOM
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const form = document.querySelector('.profile-form');
const editarBtn = document.querySelector('.btn-primary');
const salvarBtn = document.querySelector('.btn-secondary');
const logoutBtn = document.getElementById('logoutBtn');
const imagemInput = document.createElement('input');
imagemInput.type = 'file';
imagemInput.accept = 'image/*';
imagemInput.style.display = 'none';
document.body.appendChild(imagemInput);
const imagemPreview = document.getElementById('perfilImagemPreview');

// Avatares pré-definidos
const defaultAvatars = [
  'https://cdn.builder.io/api/v1/image/assets/4c6f6ec200514327a30a7409483092ac/e9c40d169f51fbec65745ba627609365d0101de8',
  'https://cdn.builder.io/api/v1/image/assets/4c6f6ec200514327a30a7409483092ac/7c3b0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c',
  'https://cdn.builder.io/api/v1/image/assets/4c6f6ec200514327a30a7409483092ac/8d4b0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c',
  'https://cdn.builder.io/api/v1/image/assets/4c6f6ec200514327a30a7409483092ac/9e5b0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c',
  'https://cdn.builder.io/api/v1/image/assets/4c6f6ec200514327a30a7409483092ac/0f6c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c',
  'https://cdn.builder.io/api/v1/image/assets/4c6f6ec200514327a30a7409483092ac/1g7d0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c'
];

// Função para mostrar feedback visual
function showFeedback(element, message, type = 'success') {
  const formGroup = element.closest('.form-group');
  formGroup.classList.remove('success', 'error');
  formGroup.classList.add(type);
  
  let feedback = formGroup.querySelector('.feedback');
  if (!feedback) {
    feedback = document.createElement('div');
    feedback.className = 'feedback';
    formGroup.appendChild(feedback);
  }
  
  feedback.textContent = message;
  
  setTimeout(() => {
    formGroup.classList.remove(type);
    feedback.textContent = '';
  }, 3000);
}

// Função para validar formulário
function validateForm(form) {
  let isValid = true;
  const inputs = form.querySelectorAll('input[required], textarea[required]');
  
  inputs.forEach(input => {
    if (!input.value.trim()) {
      showFeedback(input, 'Este campo é obrigatório', 'error');
      isValid = false;
    }
  });
  
  return isValid;
}

// Função para mostrar loading
function showLoading(element) {
  element.classList.add('loading');
}

function hideLoading(element) {
  element.classList.remove('loading');
}

// Função para alternar entre as tabs com animação
function switchTab(tabName) {
  const content = document.querySelector('.tab-content');
  content.style.opacity = '0';
  
  setTimeout(() => {
    // Remove classe active de todas as tabs
    tabButtons.forEach(button => {
      button.classList.remove('active');
      if (button.textContent.toLowerCase().includes(tabName.toLowerCase())) {
        button.classList.add('active');
      }
    });

    // Atualiza o conteúdo da tab
    content.innerHTML = '';

    switch(tabName.toLowerCase()) {
      case 'configurações da conta':
        content.innerHTML = `
          <form class="profile-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Primeiro Nome</label>
                <input type="text" class="form-input" value="${usuarioLogado.nome?.split(' ')[0] || ''}" />
              </div>
              <div class="form-group">
                <label class="form-label">Segundo nome</label>
                <input type="text" class="form-input" value="${usuarioLogado.nome?.split(' ')[1] || ''}" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" value="${usuarioLogado.email || ''}" />
              </div>
              <div class="form-group">
                <label class="form-label">Telefone</label>
                <input type="text" class="form-input" value="${usuarioLogado.telefone || ''}" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Bio</label>
              <textarea class="form-textarea">${usuarioLogado.bio || ''}</textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar configurações</button>
            </div>
          </form>
        `;
        break;

      case 'segurança':
        content.innerHTML = `
          <form class="profile-form">
            <div class="form-group">
              <label class="form-label">Senha Atual</label>
              <input type="password" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Nova Senha</label>
              <input type="password" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Confirmar Nova Senha</label>
              <input type="password" class="form-input" />
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary">Cancelar</button>
              <button type="submit" class="btn btn-primary">Alterar Senha</button>
            </div>
          </form>
        `;
        break;

      case 'notificações':
        content.innerHTML = `
          <form class="profile-form">
            <div class="form-group">
              <label class="form-label">Notificações por Email</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" ${usuarioLogado.notificacoes?.email ? 'checked' : ''} />
                  Receber atualizações por email
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" ${usuarioLogado.notificacoes?.marketing ? 'checked' : ''} />
                  Receber ofertas e promoções
                </label>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Notificações Push</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" ${usuarioLogado.notificacoes?.push ? 'checked' : ''} />
                  Ativar notificações push
                </label>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar Preferências</button>
            </div>
          </form>
        `;
        break;

      case 'pagamento':
        content.innerHTML = `
          <form class="profile-form">
            <div class="form-group">
              <label class="form-label">Método de Pagamento</label>
              <div class="payment-methods">
                <div class="payment-method">
                  <input type="radio" name="payment" id="credit" checked />
                  <label for="credit">Cartão de Crédito</label>
                </div>
                <div class="payment-method">
                  <input type="radio" name="payment" id="pix" />
                  <label for="pix">PIX</label>
                </div>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar Método</button>
            </div>
          </form>
        `;
        break;
    }
    
    content.style.opacity = '1';
  }, 200);
}

// Event Listeners
tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    switchTab(button.textContent);
  });
});

// Event Listeners melhorados
document.addEventListener('DOMContentLoaded', () => {
  // Carrega a primeira tab por padrão
  switchTab('configurações da conta');
  
  // Atualiza informações do perfil com animação
  const profileName = document.querySelector('.profile-name');
  const profileEmail = document.querySelector('.info-text');
  const profileAvatar = document.querySelector('.profile-avatar');
  
  if (profileName) {
    profileName.style.opacity = '0';
    setTimeout(() => {
      profileName.textContent = usuarioLogado.nome || 'Usuário';
      profileName.style.opacity = '1';
    }, 200);
  }
  
  if (profileEmail) {
    profileEmail.style.opacity = '0';
    setTimeout(() => {
      profileEmail.textContent = usuarioLogado.email || '';
      profileEmail.style.opacity = '1';
    }, 400);
  }
  
  if (profileAvatar && usuarioLogado.imagem) {
    profileAvatar.style.opacity = '0';
    setTimeout(() => {
      profileAvatar.src = usuarioLogado.imagem;
      profileAvatar.style.opacity = '1';
    }, 600);
  }
  
  // Adiciona tooltips
  document.querySelectorAll('[data-tooltip]').forEach(element => {
    element.addEventListener('mouseenter', () => {
      const tooltip = element.getAttribute('data-tooltip');
      element.setAttribute('title', tooltip);
    });
  });
  
  initAvatarModal();
});

// Event Listeners para formulários melhorados
document.addEventListener('submit', async (e) => {
  if (e.target.classList.contains('profile-form')) {
    e.preventDefault();
    
    if (!validateForm(e.target)) {
      return;
    }
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    showLoading(submitButton);
    
    try {
      const formData = new FormData(e.target);
      const dados = {};
      formData.forEach((value, key) => {
        dados[key] = value;
      });
      
      await salvarAlteracoes(dados);
      showFeedback(submitButton, 'Alterações salvas com sucesso!', 'success');
    } catch (error) {
      showFeedback(submitButton, 'Erro ao salvar alterações', 'error');
    } finally {
      hideLoading(submitButton);
    }
  }
});

// Função para salvar alterações com feedback
async function salvarAlteracoes(dados) {
  const usuarioAtualizado = { ...usuarioLogado, ...dados };
  localStorage.setItem('usuarioLogado', JSON.stringify(usuarioAtualizado));
  
  // Simula uma requisição
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return usuarioAtualizado;
}

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

// Preview da imagem com feedback
imagemInput.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) { // 5MB
      showFeedback(imagemInput, 'A imagem deve ter no máximo 5MB', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function (evt) {
      imagemPreview.src = evt.target.result;
      imagemPreview.style.display = 'block';
      showFeedback(imagemInput, 'Imagem carregada com sucesso!', 'success');
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

// Logout com confirmação
logoutBtn.addEventListener('click', function (e) {
  e.preventDefault();
  if (confirm('Tem certeza que deseja sair?')) {
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'autent.html';
  }
});

// Criar modal de avatar
function createAvatarModal() {
  const modal = document.createElement('div');
  modal.className = 'avatar-modal';
  modal.innerHTML = `
    <div class="avatar-modal-content">
      <div class="avatar-modal-header">
        <h3 class="avatar-modal-title">Escolha seu Avatar</h3>
        <button class="avatar-modal-close">&times;</button>
      </div>
      <div class="avatar-preview">
        <img src="${usuarioLogado.imagem || defaultAvatars[0]}" alt="Preview">
      </div>
      <div class="avatar-options">
        ${defaultAvatars.map((avatar, index) => `
          <div class="avatar-option ${avatar === usuarioLogado.imagem ? 'selected' : ''}" data-avatar="${avatar}">
            <img src="${avatar}" alt="Avatar ${index + 1}">
          </div>
        `).join('')}
      </div>
      <div class="avatar-upload">
        <div class="avatar-upload-icon">
          <i class="fas fa-cloud-upload-alt"></i>
        </div>
        <div class="avatar-upload-text">
          Arraste uma imagem ou clique para fazer upload
        </div>
        <input type="file" accept="image/*">
      </div>
      <div class="avatar-actions">
        <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
        <button class="btn btn-primary" data-action="save">Salvar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  return modal;
}

// Gerenciar modal de avatar
function initAvatarModal() {
  const modal = createAvatarModal();
  const preview = modal.querySelector('.avatar-preview img');
  const options = modal.querySelectorAll('.avatar-option');
  const upload = modal.querySelector('.avatar-upload');
  const fileInput = upload.querySelector('input[type="file"]');
  let selectedAvatar = usuarioLogado.imagem || defaultAvatars[0];

  // Abrir modal
  document.querySelector('.profile-avatar').addEventListener('click', () => {
    modal.classList.add('active');
  });

  // Fechar modal
  modal.querySelector('.avatar-modal-close').addEventListener('click', () => {
    modal.classList.remove('active');
  });

  // Selecionar avatar pré-definido
  options.forEach(option => {
    option.addEventListener('click', () => {
      options.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      selectedAvatar = option.dataset.avatar;
      preview.src = selectedAvatar;
    });
  });

  // Upload de imagem
  upload.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showFeedback(fileInput, 'A imagem deve ter no máximo 5MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        selectedAvatar = event.target.result;
        preview.src = selectedAvatar;
        options.forEach(opt => opt.classList.remove('selected'));
      };
      reader.readAsDataURL(file);
    }
  });

  // Salvar avatar
  modal.querySelector('[data-action="save"]').addEventListener('click', () => {
    const profileAvatar = document.querySelector('.profile-avatar');
    profileAvatar.src = selectedAvatar;
    usuarioLogado.imagem = selectedAvatar;
    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
    modal.classList.remove('active');
    showFeedback(profileAvatar, 'Avatar atualizado com sucesso!', 'success');
  });

  // Cancelar
  modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
    modal.classList.remove('active');
  });
}

// Inicialização
preencherPerfil();
desabilitarEdicao(); 