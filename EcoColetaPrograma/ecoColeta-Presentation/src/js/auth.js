// auth.js - Controla a transição entre login e cadastro na página de autenticação
// Implementa a lógica de slides horizontais e a submissão dos formulários

document.addEventListener('DOMContentLoaded', function() {
  // Elementos principais
  const container = document.querySelector('.auth-container');
  const loginForm = document.getElementById('loginForm');
  const cadastroForm = document.getElementById('cadastroForm');
  const goToRegisterBtn = document.getElementById('go-to-register');
  const goToLoginBtn = document.getElementById('go-to-login');
  const imagemInput = document.getElementById('imagemInput');
  const imagemPreview = document.getElementById('imagemPreview');
  const imagePanel = document.getElementById('image-section');
  const loginPanel = document.getElementById('login-section');
  const registerPanel = document.getElementById('register-section');

  // Função para verificar parâmetros da URL e mostrar o painel correto na inicialização
  function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    if (action === 'register') {
      showRegisterPanel();
    } else {
      showLoginPanel();
    }
  }

  // Funções para alternar entre os painéis com classes adicionais para efeito de sobreposição
  function showLoginPanel() {
    container.classList.remove('show-register');
    container.classList.add('show-login');
    
    // Classes adicionais para melhorar a transição visual
    loginPanel.classList.add('active-panel');
    registerPanel.classList.remove('active-panel');
    imagePanel.classList.add('show-with-login');
    imagePanel.classList.remove('show-with-register');
  }

  function showRegisterPanel() {
    container.classList.remove('show-login');
    container.classList.add('show-register');
    
    // Classes adicionais para melhorar a transição visual
    registerPanel.classList.add('active-panel');
    loginPanel.classList.remove('active-panel');
    imagePanel.classList.remove('show-with-login');
    imagePanel.classList.add('show-with-register');
  }

  // Adicionar classes iniciais
  loginPanel.classList.add('active-panel');
  imagePanel.classList.add('show-with-login');

  // Adiciona event listeners para os botões de navegação
  goToRegisterBtn.addEventListener('click', function(e) {
    e.preventDefault();
    showRegisterPanel();
  });

  goToLoginBtn.addEventListener('click', function(e) {
    e.preventDefault();
    showLoginPanel();
  });

  // Preview da imagem de perfil
  if (imagemInput) {
    imagemInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          imagemPreview.src = evt.target.result;
          imagemPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else {
        imagemPreview.style.display = 'none';
      }
    });
  }

  // Lógica de submissão do formulário de login
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = loginForm.email.value;
    const senha = loginForm.senha.value;

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

  // Lógica de submissão do formulário de cadastro
  cadastroForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Coleta os dados do formulário
    const formData = new FormData(cadastroForm);
    
    // Monta o objeto do usuário
    const usuario = {
      nome: formData.get('nome'),
      email: formData.get('email'),
      senha: formData.get('senha'),
      imagem: imagemPreview.src !== '#' ? imagemPreview.src : '', // Salva a imagem como base64
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
        showLoginPanel(); // Mostra o painel de login após cadastro bem-sucedido
      } else {
        alert('Erro ao cadastrar. Tente novamente.');
      }
    } catch (err) {
      alert('Erro de conexão com o servidor.');
    }
  });

  // Configuração do Google Sign-In
  function initGoogleSignIn() {
    gapi.load('auth2', function() {
      gapi.auth2.init({
        client_id: 'SEU_GOOGLE_CLIENT_ID', // Substitua pelo seu Client ID do Google
      });
    });
  }

  // Configuração do Facebook SDK
  function initFacebookSDK() {
    FB.init({
      appId: 'SEU_FACEBOOK_APP_ID', // Substitua pelo seu App ID do Facebook
      cookie: true,
      xfbml: true,
      version: 'v18.0'
    });
  }

  // Login com Google
  document.getElementById('googleLogin').addEventListener('click', function() {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signIn().then(
      function(googleUser) {
        const profile = googleUser.getBasicProfile();
        const userData = {
          nome: profile.getName(),
          email: profile.getEmail(),
          imagem: profile.getImageUrl(),
          googleId: profile.getId()
        };
        handleSocialLogin(userData, 'google');
      },
      function(error) {
        console.error('Erro no login com Google:', error);
        alert('Erro ao fazer login com Google. Tente novamente.');
      }
    );
  });

  // Login com Facebook
  document.getElementById('facebookLogin').addEventListener('click', function() {
    FB.login(function(response) {
      if (response.authResponse) {
        FB.api('/me', { fields: 'name,email,picture' }, function(userData) {
          const user = {
            nome: userData.name,
            email: userData.email,
            imagem: userData.picture.data.url,
            facebookId: userData.id
          };
          handleSocialLogin(user, 'facebook');
        });
      }
    }, { scope: 'email,public_profile' });
  });

  // Função para lidar com login social
  async function handleSocialLogin(userData, provider) {
    try {
      // Verifica se o usuário já existe
      const response = await fetch(`http://localhost:3000/usuarios?email=${encodeURIComponent(userData.email)}`);
      const usuarios = await response.json();
      
      let usuario;
      if (usuarios.length === 0) {
        // Cria novo usuário se não existir
        const newUser = {
          ...userData,
          senha: Math.random().toString(36).slice(-8), // Senha aleatória
          provider: provider
        };
        
        const createResponse = await fetch('http://localhost:3000/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        });
        usuario = await createResponse.json();
      } else {
        usuario = usuarios[0];
      }

      // Salva usuário no localStorage
      localStorage.setItem('usuarioLogado', JSON.stringify({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        imagem: usuario.imagem
      }));

      // Redireciona para o perfil
      window.location.href = 'perfil.html';
    } catch (error) {
      console.error('Erro no login social:', error);
      alert('Erro ao fazer login. Tente novamente.');
    }
  }

  // Inicializa os SDKs
  initGoogleSignIn();
  initFacebookSDK();

  // Verifica os parâmetros da URL na inicialização
  checkUrlParams();
}); 