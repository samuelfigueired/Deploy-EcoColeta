document.addEventListener("DOMContentLoaded", () => {
  const containerContribuintes = document.querySelector(".contribuintes-container");
  const containerHistorias = document.querySelector(".historias-container");

  // Configuração da API
  const API_BASE_URL = "http://localhost:3000/api";

  const topContribuintes = [
    { 
        nome: "João Silva", 
        pontos: "2.5k", 
        foto: "https://placehold.co/400" 
    },
    { 
        nome: "Maria Oliveira", 
        pontos: "2.3k", 
        foto: "https://placehold.co/400" 
    },
    { 
        nome: "Lucas Pereira", 
        pontos: "2.1k", 
        foto: "https://placehold.co/400" 
    },
    { 
        nome: "Ana Souza", 
        pontos: "2.0k", 
        foto: "https://placehold.co/400" 

    },
    { 
        nome: "Carlos Lima", 
        pontos: "1.9k", 
        foto: "https://placehold.co/400" 

    },
  ];

  // Função para carregar comunidades da API
  async function carregarComunidades() {
    try {
      const response = await fetch(`${API_BASE_URL}/comunidades`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const comunidades = await response.json();
      exibirComunidades(comunidades);
    } catch (error) {
      console.error("Erro ao carregar comunidades:", error);
      // Fallback para dados estáticos em caso de erro
      const comunidadesFallback = [
        {
          id: 1,
          nome: "Mutirão de Reciclagem no Bairro Verde",
          descricao: "Conseguimos reciclar mais de 1 tonelada de materiais em um único dia!",
          tipo: "projeto-comunitario",
          autor: { nome: "Carlos Lima", foto: "https://placehold.co/80" },
          banner: "https://placehold.co/300x150",
          curtidas: 89,
          comentarios: 23,
          membros: 127
        }
      ];
      exibirComunidades(comunidadesFallback);
    }
  }
  // Função para exibir comunidades
  function exibirComunidades(comunidades) {
    containerHistorias.innerHTML = "";
    comunidades.forEach((comunidade) => {
      const tipoFormatado = formatarTipo(comunidade.tipo);
      
      // Verificar se a imagem do banner existe e é válida
      let bannerSrc = 'https://placehold.co/300x150';
      if (comunidade.banner && comunidade.banner.trim() !== '') {
        // Se é uma URL válida ou data URL (base64)
        if (comunidade.banner.startsWith('http') || comunidade.banner.startsWith('data:')) {
          bannerSrc = comunidade.banner;
        }
      }
      
      // Verificar se a foto do autor existe e é válida
      let autorFotoSrc = 'https://placehold.co/80';
      if (comunidade.autor && comunidade.autor.foto && comunidade.autor.foto.trim() !== '') {
        if (comunidade.autor.foto.startsWith('http') || comunidade.autor.foto.startsWith('data:')) {
          autorFotoSrc = comunidade.autor.foto;
        }
      }
      
      containerHistorias.innerHTML += `
        <a href="detalhe-comunidade.html?id=${comunidade.id}" class="historia-card">
          <img src="${bannerSrc}" alt="Imagem da comunidade" onerror="this.src='https://placehold.co/300x150'"/>
          <div class="historia-card-content">
            <span class="tag">${tipoFormatado}</span>
            <h3>${comunidade.nome}</h3>
            <p>${comunidade.descricao}</p>
            <div class="autor">
              <img src="${autorFotoSrc}" alt="Foto de ${comunidade.autor ? comunidade.autor.nome : 'Autor'}" onerror="this.src='https://placehold.co/80'">
              <p>Por ${comunidade.autor ? comunidade.autor.nome : 'Autor Desconhecido'}</p>
              <div class="icones">
                <i class="fa-regular fa-heart"></i>
                <span>${comunidade.curtidas || 0}</span>
                <i class="fa-regular fa-comment"></i>
                <span>${comunidade.comentarios || 0}</span>
                <i class="fa-regular fa-users"></i>
                <span>${comunidade.membros || 0}</span>
              </div>
            </div>
          </div>
        </a>
      `;
    });
  }

  // Função para formatar o tipo da comunidade
  function formatarTipo(tipo) {
    const tipos = {
      'projeto-comunitario': 'Projeto Comunitário',
      'educacao': 'Educação',
      'sustentabilidade': 'Sustentabilidade',
      'economia-local': 'Economia Local',
      'saude': 'Saúde'
    };
    return tipos[tipo] || tipo;
  }

  // Função para adicionar nova comunidade
  async function adicionarComunidade(dadosComunidade) {
    try {
      const response = await fetch(`${API_BASE_URL}/comunidades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosComunidade)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const novaComunidade = await response.json();
      console.log('Comunidade criada com sucesso:', novaComunidade);
      
      // Recarregar a lista de comunidades
      carregarComunidades();
      
      return novaComunidade;
    } catch (error) {
      console.error('Erro ao criar comunidade:', error);
      throw error;
    }
  }

  // Expor função globalmente para uso em outras páginas
  window.adicionarComunidade = adicionarComunidade;

  // Popula Top Contribuintes
  containerContribuintes.innerHTML = "";
  topContribuintes.forEach((c, index) => {
    containerContribuintes.innerHTML += `
      <div class="contribuinte">
        <img src="${c.foto}" alt="Foto de ${c.nome}">
        <p class="nome-contribuinte">${c.nome}</p>
        <p class="pontos-contribuinte">${c.pontos} pontos</p>
      </div>
    `;
  });
  // Carregar e exibir comunidades da API
  carregarComunidades();
});
