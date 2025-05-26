// Script para manipulação do formulário de cadastro de coletor
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("cadastroColetorForm");

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        const nome = document.getElementById("nome").value;
        const email = document.getElementById("email").value;
        const telefone = document.getElementById("telefone").value;
        const cep = document.getElementById("cep").value;
        const endereco = document.getElementById("endereco").value;
        const cidade = document.getElementById("cidade").value;
        const estado = document.getElementById("estado").value;
        const razaoSocial = document.getElementById("razaoSocial").value;
        const cnpj = document.getElementById("cnpj").value;
        const areaAtuacao = document.getElementById("areaAtuacao").value;
        const senha = document.getElementById("senha").value;
        const confirmarSenha = document.getElementById("confirmarSenha").value;

        if (senha !== confirmarSenha) {
            alert("As senhas não coincidem. Por favor, verifique.");
            return;
        }

        const materiaisColeta = Array.from(document.querySelectorAll("input[name='materiaisColeta']:checked"))
            .map(checkbox => checkbox.value);

        const coletorData = {
            nome,
            email,
            telefone,
            cep,
            endereco,
            cidade,
            estado,
            razaoSocial,
            cnpj,
            areaAtuacao,
            materiaisColeta,
            senha
        };

        console.log("Dados do coletor:", coletorData);

        // Aqui você pode enviar os dados para o servidor usando fetch ou outra biblioteca
        // Exemplo:
        // fetch('/api/cadastro-coletor', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(coletorData)
        // }).then(response => response.json())
        //   .then(data => console.log(data))
        //   .catch(error => console.error('Erro:', error));

        alert("Cadastro realizado com sucesso!");
        form.reset();
    });
});
