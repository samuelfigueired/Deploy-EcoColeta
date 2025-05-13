// login.js - Lida com o login de usuários na EcoColeta
// Este script valida o login consultando o JSON Server e salva sessão no localStorage
// Adapte a URL do JSON Server conforme necessário

const form = document.getElementById('loginForm');

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  const email = form.email.value;
  const senha = form.senha.value;

  try {
    // Busca usuário pelo email
    const response = await fetch(`http://localhost:3000/usuarios?email=${encodeURIComponent(email)}`);
    const usuarios = await response.json();
    if (usuarios.length === 0) {
      alert('Usuário não encontrado.');
      return;
    }
    const usuario = usuarios[0];
    if (usuario.senha !== senha) {
      alert('Senha incorreta.');
      return;
    }
    // Salva usuário logado no localStorage (exceto senha)
    localStorage.setItem('usuarioLogado', JSON.stringify({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email
    }));
    window.location.href = 'perfil.html';
  } catch (err) {
    alert('Erro de conexão com o servidor.');
  }
}); 