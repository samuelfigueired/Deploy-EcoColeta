document.addEventListener("DOMContentLoaded", () => {
  const containerContribuintes = document.querySelector(".contribuintes-container");
  const containerHistorias = document.querySelector(".historias-container");

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

  const comunidades = [
    {
      titulo: "Mutirão de Reciclagem no Bairro Verde",
      descricao: "Conseguimos reciclar mais de 1 tonelada de materiais em um único dia!",
      autor: "Carlos Lima",
      tag: "Projeto Comunitário",
      imagemProjeto: "https://placehold.co/300x150",
      fotoAutor: "https://placehold.co/1"
    },
    {
      titulo: "Oficina de Programação para Jovens",
      descricao: "Capacitamos mais de 100 adolescentes com noções básicas de lógica e web.",
      autor: "Maria Oliveira",
      tag: "Educação",
      imagemProjeto: "https://placehold.co/300x150",
      fotoAutor: "https://placehold.co/1"
    },
    {
      titulo: "Horta Urbana Colaborativa",
      descricao: "Moradores se uniram para cultivar alimentos orgânicos na cidade.",
      autor: "João Silva",
      tag: "Sustentabilidade",
      imagemProjeto: "https://placehold.co/300x150",
      fotoAutor: "https://placehold.co/1"
    },
    {
      titulo: "Feira de Trocas Solidárias",
      descricao: "Evento promoveu a economia circular com trocas justas entre moradores.",
      autor: "Ana Souza",
      tag: "Economia Local",
      imagemProjeto: "https://placehold.co/300x150",
      fotoAutor: "https://placehold.co/1"
    },
    {
      titulo: "Campanha de Doação de Sangue",
      descricao: "Mais de 200 bolsas de sangue foram arrecadadas em um fim de semana.",
      autor: "Lucas Pereira",
      tag: "Saúde",
      imagemProjeto: "https://placehold.co/300x150",
      fotoAutor: "https://placehold.co/1"
    },
  ];

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

  // Popula Histórias em Destaque
  containerHistorias.innerHTML = "";
  comunidades.forEach((h, index) => {
    containerHistorias.innerHTML += `
      <a href="detalhe-historia.html?id=${index}" class="historia-card">
        <img src="${h.imagemProjeto}" alt="Imagem do projeto"/>
        <div class="historia-card-content">
          <span class="tag">${h.tag}</span>
          <h3>${h.titulo}</h3>
          <p>${h.descricao}</p>
          <div class="autor">
            <img src="${h.fotoAutor}" alt="Foto de ${h.autor}">
            <p>Por ${h.autor}</p>
            <div class="icones">
              <i class="fa-regular fa-heart"></i>
              <i class="fa-regular fa-comment"></i>
              <i class="fa-regular fa-bookmark"></i>
            </div>
          </div>
        </div>
      </a>
    `;
  });
});
