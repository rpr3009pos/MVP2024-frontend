// URL base da API
const API_BASE_URL = "http://127.0.0.1:5000";

// Função para exibir mensagens no front-end
function exibirMensagem(texto, cor) {
    const mensagem = document.getElementById('mensagem');
    mensagem.textContent = texto;
    mensagem.style.color = cor;
    setTimeout(() => mensagem.textContent = '', 5000);
}

// Função para validar CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, ''); // Remove caracteres não numéricos
    
    if (cpf.length !== 11 || !/^\d{11}$/.test(cpf)) {
        return false;
    }
    
    let soma = 0;
    let resto;

    // Valida o primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) {
        resto = 0;
    }
    if (resto !== parseInt(cpf.substring(9, 10))) {
        return false;
    }

    soma = 0;
    // Valida o segundo dígito verificador
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) {
        resto = 0;
    }
    return resto === parseInt(cpf.substring(10, 11));
}


// Função para carregar os clientes e exibi-los na tabela
function carregar_clientes() {
    fetch(`${API_BASE_URL}/listar_clientes`)
        .then(response => response.json())
        .then(clientes => {
            const tabela = document.getElementById('tabela').querySelector('tbody');
            tabela.innerHTML = ''; // Limpa a tabela antes de preencher novamente
            clientes.forEach(cliente => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', cliente.id); // Adiciona o atributo data-id com o ID do cliente
                row.innerHTML = `
                    <td>${cliente.nome}</td>
                    <td>${cliente.cpf}</td>
                    <td>${cliente.dt_nasc}</td>
                    <td>${cliente.logradouro}</td>
                    <td>${cliente.cep}</td>
                    <td>${cliente.cidade}</td>
                    <td>${cliente.uf}</td>
                    <td>
                        <button onclick="editar_cliente(${cliente.id})">Editar</button>
                        <button onclick="remover_cliente(${cliente.id})">Remover</button>
                    </td>
                `;
                tabela.appendChild(row);
            });
        })
        .catch(err => exibirMensagem(`Erro ao carregar clientes: ${err.message}`, 'red'));
}



// Variável para armazenar o ID do cliente em edição
let clienteEditandoId = null;

// Função para editar um cliente
function editar_cliente(id) {
    clienteEditandoId = id; // Armazena o ID do cliente em edição

    const row = document.querySelector(`tr[data-id="${id}"]`);
    const cells = row.querySelectorAll('td');

    // Preenche o formulário com os dados do cliente selecionado
    document.getElementById('nome').value = cells[0].textContent;
    document.getElementById('cpf').value = cells[1].textContent;
    document.getElementById('dt_nasc').value = cells[2].textContent;
    document.getElementById('logradouro').value = cells[3].textContent;
    document.getElementById('cep').value = cells[4].textContent;
    document.getElementById('cidade').value = cells[5].textContent;
    document.getElementById('uf').value = cells[6].textContent;
}

// Função para salvar ou atualizar cliente no formulário
document.getElementById('cadastro-form').onsubmit = (event) => {
    event.preventDefault();

    const cliente = {
        nome: document.getElementById('nome').value,
        cpf: document.getElementById('cpf').value,
        dt_nasc: document.getElementById('dt_nasc').value,
        logradouro: document.getElementById('logradouro').value,
        cep: document.getElementById('cep').value,
        cidade: document.getElementById('cidade').value,
        uf: document.getElementById('uf').value
    };

    if (clienteEditandoId !== null) {
        // Atualiza cliente existente
        fetch(`${API_BASE_URL}/editar_cliente/${clienteEditandoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cliente)
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.message); });
                }
                return response.json();
            })
            .then(data => {
                exibirMensagem(data.message, 'green');
                clienteEditandoId = null; // Reseta o ID do cliente em edição
                document.getElementById('cadastro-form').reset(); // Limpa o formulário
                carregar_clientes(); // Recarrega os clientes
            })
            .catch(err => exibirMensagem(err.message, 'red'));
    } else {
        // Cadastra novo cliente
        fetch(`${API_BASE_URL}/cadastrar_cliente`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cliente)
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.error); });
                }
                return response.json();
            })
            .then(data => {
                exibirMensagem(data.message, 'green');
                document.getElementById('cadastro-form').reset(); // Limpa o formulário
                carregar_clientes(); // Recarrega os clientes
            })
            .catch(err => exibirMensagem(err.message, 'red'));
    }
};

// Função para remover um cliente
function remover_cliente(id) {
    fetch(`${API_BASE_URL}/deletar_cliente/${id}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            exibirMensagem(data.message, 'green');
            carregar_clientes(); // Recarrega os clientes após remoção
        })
        .catch(err => exibirMensagem(`Erro ao remover cliente: ${err.message}`, 'red'));
}

// Carregar os clientes ao carregar a página
document.addEventListener('DOMContentLoaded', carregar_clientes);
