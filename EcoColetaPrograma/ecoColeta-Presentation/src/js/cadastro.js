// cadastro.js - Lida com o cadastro de novos usuários na EcoColeta
// Este script envia os dados do formulário para o JSON Server e faz preview da imagem de perfil
// Adapte a URL do JSON Server conforme necessário

const form = document.getElementById('cadastroForm');
const imagemInput = document.getElementById('imagemInput');
const imagemPreview = document.getElementById('imagemPreview');

// Preview da imagem de perfil
imagemInput.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (evt) {
      imagemPreview.src = evt.target.result;
      imagemPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else {
    imagemPreview.style.display = 'none';
  }
});

// Envio do formulário de cadastro
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  // Coleta os dados do formulário
  const formData = new FormData(form);
  const preferencias = [];
  form.querySelectorAll('input[name="preferencias"]:checked').forEach(cb => preferencias.push(cb.value));

  // Monta o objeto do usuário
  const usuario = {
    nome: formData.get('nome'),
    email: formData.get('email'),
    senha: formData.get('senha'),
    endereco: {
      rua: formData.get('rua'),
      numero: formData.get('numero'),
      bairro: formData.get('bairro'),
      cidade: formData.get('cidade'),
      estado: formData.get('estado'),
      cep: formData.get('cep'),
    },
    preferencias: preferencias,
    imagem: imagemPreview.src !== '#' ? imagemPreview.src : '', // Salva a imagem como base64 (apenas para demo)
  };

  // Envia para o JSON Server
  try {
    const response = await fetch('http://localhost:3000/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuario)
    });
    if (response.ok) {
      alert('Cadastro realizado com sucesso! Faça login para continuar.');
      window.location.href = 'login.html';
    } else {
      alert('Erro ao cadastrar. Tente novamente.');
    }
  } catch (err) {
    alert('Erro de conexão com o servidor.');
  }
}); 