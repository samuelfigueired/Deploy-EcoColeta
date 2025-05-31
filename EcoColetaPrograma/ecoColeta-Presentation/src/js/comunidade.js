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
    comunidades.forEach(h => {
      // Corrigido: buscar nome e foto do autor diretamente do objeto, já que usuariosPorId não existe nesse contexto
      const nomeAutor = h.autor && h.autor.nome ? h.autor.nome : "Autor desconhecido";
      const fotoAutor = h.autor && h.autor.foto ? h.autor.foto : "https://placehold.co/50";

      containerHistorias.innerHTML += `
        <a href="detalhe-comunidade.html?id=${h.id}" class="historia-card">
          <img src="${h.banner || h.imagemCapa}" alt="Imagem do projeto"/>
          <div class="historia-card-content">
            <h3>${h.nome}</h3>
            <p>${h.descricao}</p>
          </div>
          <div class="autor-card-footer">
            <img src="${fotoAutor}" alt="Foto de ${nomeAutor}">
            <span>Por ${nomeAutor}</span>
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
