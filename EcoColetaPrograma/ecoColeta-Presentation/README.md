# EcoColeta - Frontend

Este é o frontend da aplicação EcoColeta, um sistema de doações para projetos ambientais.

## Requisitos

- Node.js (versão 14 ou superior)
- npm (gerenciador de pacotes do Node.js)

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/ecocoleta.git
cd ecocoleta/EcoColetaPrograma/ecoColeta-Presentation
```

2. Instale as dependências:
```bash
npm install
```

## Executando o Projeto

1. Inicie o servidor JSON (backend mock):
```bash
npm start
```

2. Abra o arquivo `src/pages/home.html` em seu navegador ou use um servidor local como o Live Server do VS Code.

## Estrutura do Projeto

```
ecoColeta-Presentation/
├── src/
│   ├── css/
│   │   ├── doacoes.css
│   │   └── navFooter.css
│   ├── js/
│   │   ├── doacoes.js
│   │   ├── doacao-realizada.js
│   │   └── navFooter.js
│   └── pages/
│       ├── doacoes.html
│       ├── doacao-realizada.html
│       └── home.html
├── db.json
├── package.json
└── README.md
```

## Funcionalidades

- Sistema de doações com valores predefinidos
- Formulário de doação com validação
- Integração com API de pagamento (mock)
- Armazenamento de doações no JSON Server
- Página de confirmação de doação
- Design responsivo
- Animações e transições suaves

## Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- JSON Server (mock backend)
- Font Awesome (ícones)

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.