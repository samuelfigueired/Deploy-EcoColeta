const body = document.querySelector("body");
const tagScript = document.querySelector('script[src*="navFooter.js"]');

// Criando o Nav

let nav = document.createElement('nav');
nav.className = 'nav';
nav.id = 'nav';

let navContainer = document.createElement('div');
navContainer.className = 'nav-container';

let navContent = document.createElement('div');
navContent.className = 'nav-content';

// Filho de navContent
let logoContainer = document.createElement('div');
logoContainer.className = 'logo-container';

let logoWrapper = document.createElement('div');
logoWrapper.className = 'logo-wrapper';

// Filho de logoWrapper

let linksitem = document.createElement('a');
linksitem.className = 'logo-item';
linksitem.href = '../pages/index.html';

let logoImage = document.createElement('div');
logoImage.className = 'logo-image';

// Filho de logoImage
let navimg = document.createElement('img');
navimg.src = 'https://cdn.builder.io/api/v1/image/assets/TEMP/313a86a3763eb086a92f424be391c74cac3baa49?placeholderIfAbsent=true&apiKey=9d5f0dcfa7364879a1f7ce16420e4a1e';
navimg.alt = 'EcoColeta Logo';
navimg.className = 'logo';

// Filho de logoWrapper
let logoText = document.createElement('div');
logoText.className = 'logo-text';
logoText.textContent = 'EcoColeta';

// Filho de navContent
let navMenu = document.createElement('div');
navMenu.className = 'menu';

let itensMenu = ['Mapa', 'Guia', 'Recompensas', 'Comunidade', 'Doações'];
let linksMenu = [
  '../pages/encontraEco.html',
  '../pages/guiaEdu.html',
  '../pages/home.html',
  '../pages/comunidade.html',
  '../pages/home.html'
];

itensMenu.forEach((text, index) => {
  let link = document.createElement('a');
  link.href = linksMenu[index];

  let item = document.createElement('div');
  item.className = 'menu-item';
  item.textContent = text;

  link.appendChild(item);
  navMenu.appendChild(link);
});



let loginContainer = document.createElement('div');
loginContainer.className = 'login-container';

let loginButton = document.createElement('div');
loginButton.className = 'login-button';
loginButton.textContent = 'Entrar';


// Menu Toggle (checkbox invisível)
let menuToggle = document.createElement('input');
menuToggle.type = 'checkbox';
menuToggle.id = 'menuToggle';
menuToggle.style.display = 'none';

// Ícone do menu
let menuIconLabel = document.createElement('label');
menuIconLabel.setAttribute('for', 'menuToggle');
menuIconLabel.className = 'menu-icon';
menuIconLabel.setAttribute('aria-label', 'Abrir menu');

let menuIconOpen = document.createElement('img');
menuIconOpen.src = '../img/menuMobile.svg';
menuIconOpen.width = 20;
menuIconOpen.alt = 'Abrir menu';

let menuIconClose = document.createElement('img');
menuIconClose.src = 'https://img.icons8.com/?size=100&id=53395&format=png&color=000000';
menuIconClose.width = 20;
menuIconClose.alt = 'Fechar menu';

menuIconLabel.appendChild(menuIconOpen);
menuIconLabel.appendChild(menuIconClose);



// Montando Nav
logoImage.appendChild(navimg);
logoWrapper.appendChild(linksitem);
linksitem.appendChild(logoImage);
linksitem.appendChild(logoText);

logoContainer.appendChild(logoWrapper);
loginContainer.appendChild(loginButton);
navMenu.appendChild(loginContainer);

navContent.appendChild(menuToggle);  // Adicionando o menuToggle ao conteúdo
navContent.appendChild(menuIconLabel);  // Adicionando o ícone do menu
navContent.appendChild(logoContainer);
navContent.appendChild(navMenu);
navContainer.appendChild(navContent);
nav.appendChild(navContainer);
body.insertBefore(nav, body.firstChild);

// Criando Footer

let footer = document.createElement('footer');
footer.id = 'footer';

let divfooter = document.createElement('div');
divfooter.className = 'footer';

let footerContent = document.createElement('div');
footerContent.className = 'footer-content';

let footerLogo = document.createElement('div');
footerLogo.className = 'footer-logo';

// Wrapper que agrupa imagem e título
let footerLogoWrapper = document.createElement('div');
footerLogoWrapper.className = 'footer-logo-wrapper';

let footerLogoImg = document.createElement('img');
footerLogoImg.src = 'https://cdn.builder.io/api/v1/image/assets/TEMP/313a86a3763eb086a92f424be391c74cac3baa49?placeholderIfAbsent=true&apiKey=9d5f0dcfa7364879a1f7ce16420e4a1e';
footerLogoImg.alt = 'EcoColeta';

let footerLogoH3 = document.createElement('h3');
footerLogoH3.textContent = 'EcoColeta';

footerLogoWrapper.appendChild(footerLogoImg);
footerLogoWrapper.appendChild(footerLogoH3);

let footerLogoP = document.createElement('p');
footerLogoP.textContent = 'Transformando a reciclagem em uma experiência recompensadora.';

// Adiciona wrapper e parágrafo no logo
footerLogo.appendChild(footerLogoWrapper);
footerLogo.appendChild(footerLogoP);

// Criando grupos de links
let footerLinks = document.createElement('div');
footerLinks.className = 'footer-links';

function createLinkGroup(title, links) {
  let group = document.createElement('div');
  group.className = 'link-group';

  let h4 = document.createElement('h4');
  h4.textContent = title;

  let ul = document.createElement('ul');
  links.forEach(link => {
    let li = document.createElement('li');
    let a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.text;
    li.appendChild(a);
    ul.appendChild(li);
  });

  group.appendChild(h4);
  group.appendChild(ul);
  return group;
}

let group1 = createLinkGroup('Links Rápidos', [
  { text: 'Sobre Nós', href: '#' },
  { text: 'Como Funciona', href: '#' },
  { text: 'Pontos de Coleta', href: '#' },
  { text: 'Recompensas', href: '#l' }
]);

let group2 = createLinkGroup('Suporte', [
  { text: 'FAQ', href: '#' },
  { text: 'Contato', href: '#' },
  { text: 'Política de Privacidade', href: '#' },
  { text: 'Termos de Uso', href: '#' }
]);


let group3 = document.createElement('div');
group3.className = 'link-group';

let group3H4 = document.createElement('h4');
group3H4.textContent = 'Redes Sociais';

let sociaisIcons = document.createElement('div');
sociaisIcons.className = 'social-icons';

let redes = ['facebook', 'twitter', 'instagram', 'linkedin'];
let redesLinks = [
  'https://www.facebook.com/',
  'https://twitter.com/',
  'https://www.instagram.com/',
  'https://www.linkedin.com/'
];
redes.forEach((rede, index) => {
  let a = document.createElement('a');
  a.href = redesLinks[index];
  a.target = '_blank';
  a.rel = 'noopener noreferrer';

  let i = document.createElement('i');
  i.classList.add('fab', `fa-${rede}`);
  a.appendChild(i);
  sociaisIcons.appendChild(a);
});

group3.appendChild(group3H4);
group3.appendChild(sociaisIcons);

// Agrupando os grupos
footerLinks.appendChild(group1);
footerLinks.appendChild(group2);
footerLinks.appendChild(group3);

footerContent.appendChild(footerLogo);
footerContent.appendChild(footerLinks);

// Copyright
let copyright = document.createElement('div');
copyright.className = 'copyright';

let pCopyright = document.createElement('p');
pCopyright.innerHTML = '&copy; 2023 EcoColeta. Todos os direitos reservados.';

copyright.appendChild(pCopyright);
divfooter.appendChild(footerContent);
divfooter.appendChild(copyright);
footer.appendChild(divfooter);

tagScript.parentNode.insertBefore(footer, tagScript);
