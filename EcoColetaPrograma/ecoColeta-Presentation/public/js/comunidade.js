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

// Função para carregar eventos do db.json e exibir na seção de eventos
async function carregarEventos() {
  const containerEventos = document.querySelector('.eventos-container');
  if (!containerEventos) return;
  // Corrige escopo da variável de API
  const API_BASE_URL = "http://localhost:3000/api";
  try {
    const response = await fetch(`${API_BASE_URL}/eventos`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const eventos = await response.json();
    exibirEventos(eventos);
  } catch (error) {
    console.error("Erro ao carregar eventos:", error);
    // Fallback para dados estáticos em caso de erro
    const eventosFallback = [
      {
        titulo: "Evento Exemplo",
        descricao: "Este é um evento de exemplo exibido como fallback.",
        data: "2025-06-30",
        hora: "14:00",
        imagem: "assets/img/calendar.svg",
        autor: { nome: "Equipe EcoColeta", foto: "https://placehold.co/32" }
      }
    ];
    exibirEventos(eventosFallback);
  }
}

// Função para exibir eventos
function exibirEventos(eventos) {
  console.log('Eventos recebidos:', eventos);
  const containerEventos = document.querySelector('.eventos-container');
  containerEventos.innerHTML = '';
  if (!eventos.length) {
    containerEventos.innerHTML = '<p style="text-align:center;color:#888">Nenhum evento encontrado.</p>';
    return;
  }
  eventos.forEach(evento => {
    const autor = evento.autor && evento.autor.nome ? evento.autor.nome : 'Autor desconhecido';
    const autorFoto = evento.autor && evento.autor.foto ? evento.autor.foto : 'https://placehold.co/32';
    // Formatar data para o padrão brasileiro
    let dataFormatada = evento.data;
    let statusEvento = '';
    let dataEvento = null;
    if (evento.data && evento.data.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [ano, mes, dia] = evento.data.split('-');
      dataFormatada = `${dia}/${mes}/${ano}`;
      dataEvento = new Date(`${evento.data}T${evento.hora || '00:00'}`);
    }
    // Status do evento
    if (dataEvento) {
      const agora = new Date();
      const fimEvento = new Date(dataEvento.getTime() + 2 * 60 * 60 * 1000); // evento dura 2h
      if (agora < dataEvento) {
        statusEvento = '<span class="evento-status status-breve">Acontecerá em breve</span>';
      } else if (agora >= dataEvento && agora <= fimEvento) {
        statusEvento = '<span class="evento-status status-agora">Acontecendo agora</span>';
      } else {
        // Não renderiza eventos passados
        return;
      }
    }
    containerEventos.innerHTML += `
      <div class="evento-card" data-id="${evento.id}" style="cursor:pointer;">
        <img src="${evento.imagem || 'assets/img/calendar.svg'}" alt="Imagem do Evento" class="evento-img">
        <div class="evento-info">
          <h3 class="evento-titulo">${evento.titulo}</h3>
          <div class="evento-detalhes">
            <span class="evento-data"><i class="fa-regular fa-calendar"></i> ${dataFormatada}</span>
            <span class="evento-hora"><i class="fa-regular fa-clock"></i> ${evento.hora || ''}</span>
          </div>
          ${statusEvento}
          <p class="evento-descricao">${evento.descricao}</p>
        </div>
        <div class="evento-autor-footer">
          <img src="${autorFoto}" alt="${autor}" class="evento-autor-img">
          <span class="evento-autor-nome">${autor}</span>
        </div>
      </div>
    `;
  });
  // Adiciona interação de clique nos cards de evento
  setTimeout(() => {
    document.querySelectorAll('.evento-card').forEach(card => {
      card.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        if (id) {
          window.location.href = `detalhe-evento.html?id=${id}`;
        }
      });
    });
  }, 100);
}

// Chamar ao carregar página
window.addEventListener('DOMContentLoaded', () => {
  carregarEventos();
});
