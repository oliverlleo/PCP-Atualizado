/**
 * visualizacao.js
 * 
 * Lógica específica para visualização de clientes e seus projetos
 * Este arquivo contém todas as funções relacionadas à visualização detalhada
 * dos dados de clientes no Sistema de Controle de Compras e Recebimento
 */

/**
 * Abre o modal de visualização de cliente com os dados carregados
 * 
 * @param {string} clienteId - ID do cliente a ser visualizado
 */
async function visualizarCliente(clienteId) {
    console.log('=== INÍCIO DA FUNÇÃO VISUALIZAR CLIENTE (SUPABASE) ===');
    console.log('Iniciando visualização do cliente com ID:', clienteId);

    if (!window.supabase) {
        console.error('ERRO CRÍTICO: Supabase client (window.supabase) não está definido!');
        mostrarNotificacao('Erro de conexão com o banco de dados. Recarregue a página.', 'danger');
        return;
    }

    const loadingVisualizacao = document.getElementById('loadingVisualizacao');
    const conteudoVisualizacao = document.getElementById('conteudoVisualizacao');
    const listasProjetosDiv = document.getElementById('listasProjetos');
    const detalhesListaDiv = document.getElementById('detalhesLista');
    const modalVisualizacaoElement = document.getElementById('modalVisualizacao');

    if (loadingVisualizacao) loadingVisualizacao.classList.remove('d-none');
    if (conteudoVisualizacao) conteudoVisualizacao.classList.add('d-none');
    if (listasProjetosDiv) listasProjetosDiv.innerHTML = '';
    if (detalhesListaDiv) detalhesListaDiv.innerHTML = '';
    if (modalVisualizacaoElement) modalVisualizacaoElement.dataset.clienteId = clienteId;

    try {
        // 1. Buscar dados do cliente
        const { data: cliente, error: clienteError } = await window.supabase
            .from('clientes')
            .select('*')
            .eq('id', clienteId)
            .single();

        if (clienteError) {
            console.error("Erro ao buscar cliente no Supabase:", clienteError);
            throw new Error(`Cliente não encontrado: ${clienteError.message}`);
        }
        if (!cliente) {
            throw new Error('Cliente não encontrado no Supabase.');
        }

        console.log('Dados do cliente (Supabase):', cliente);

        // Preenche os dados do cliente no modal
        document.getElementById('visualizacaoTitulo').textContent = cliente.nome || 'Cliente sem nome';
        document.getElementById('visualizacaoStatus').textContent = cliente.StatusCadastro || 'Não iniciado';
        document.getElementById('visualizacaoStatus').className = `badge ${getBadgeClass(cliente.StatusCadastro)}`;

        // Assuming database column for dataCriacao is dataCriacao (as used in salvarCadastro)
        document.getElementById('visualizacaoDataCriacao').textContent = formatarData(cliente.dataCriacao);
        // Assuming database column for prazoEntrega is data_prazo_entrega (as used in salvarCadastro)
        document.getElementById('visualizacaoPrazoEntrega').textContent = formatarData(cliente.data_prazo_entrega);

        // 2. Buscar os projetos associados a esse cliente
        const { data: projetos, error: projetosError } = await window.supabase
            .from('projetos') // Nome da sua tabela de projetos no Supabase
            .select('*')
            .eq('cliente_id', clienteId);

        if (projetosError) {
            console.error("Erro ao buscar projetos no Supabase:", projetosError);
            // Não lançar erro aqui necessariamente, pode ser que o cliente não tenha projetos.
            // A interface tratará a ausência de projetos.
            mostrarNotificacao(`Erro ao buscar projetos: ${projetosError.message}`, 'warning');
        }

        console.log('Dados dos projetos (Supabase):', projetos);

        if (!projetos || projetos.length === 0) {
            console.log('Nenhum projeto encontrado para este cliente no Supabase');
            if (listasProjetosDiv) {
                listasProjetosDiv.innerHTML = `
                    <div class="alert alert-info">
                        Este cliente não possui projetos cadastrados.
                    </div>
                `;
            }
        } else {
            // Cria os cards para cada tipo de projeto
            if (listasProjetosDiv) listasProjetosDiv.innerHTML = ''; // Limpa antes de adicionar

            projetos.forEach(projeto => {
                const tipoProjeto = projeto.tipo_projeto; // Ex: "PVC", "Aluminio"
                console.log(`Processando projeto (Supabase) ${tipoProjeto}:`, projeto);

                const cardProjeto = document.createElement('div');
                cardProjeto.className = 'card mb-3 projeto-card';
                cardProjeto.dataset.tipoProjeto = tipoProjeto;

                const cardHeader = document.createElement('div');
                cardHeader.className = 'card-header d-flex justify-content-between align-items-center';
                const tituloCard = document.createElement('h5');
                tituloCard.className = 'mb-0';
                tituloCard.textContent = formatarTipoProjeto(tipoProjeto);

                if (projeto.terceirizado) {
                    const badgeTerceirizado = document.createElement('span');
                    badgeTerceirizado.className = 'badge bg-info ms-2';
                    badgeTerceirizado.textContent = 'Terceirizado';
                    tituloCard.appendChild(badgeTerceirizado);
                }
                cardHeader.appendChild(tituloCard);
                cardProjeto.appendChild(cardHeader);

                const cardBody = document.createElement('div');
                cardBody.className = 'card-body';

                if (projeto.terceirizado) {
                    cardBody.innerHTML = `
                        <p><strong>Empresa:</strong> ${projeto.empresa_terceirizada || 'Não informada'}</p>
                        <p><strong>Data de Solicitação:</strong> ${formatarData(projeto.data_solicitacao_terceirizada) || 'Não informada'}</p>
                        <p><strong>Prazo de Entrega:</strong> ${formatarData(projeto.prazo_entrega_terceirizada) || 'Não informado'}</p>
                    `;
                     // Adicionar botão para ver/baixar lista de chaves se URL existir
                    if (projeto.url_lista_chaves) {
                        const btnDownloadChaves = document.createElement('a');
                        btnDownloadChaves.href = projeto.url_lista_chaves;
                        btnDownloadChaves.target = "_blank";
                        btnDownloadChaves.className = "btn btn-sm btn-outline-secondary mt-2";
                        btnDownloadChaves.innerHTML = '<i class="fas fa-download me-1"></i> Ver Lista de Chaves';
                        cardBody.appendChild(btnDownloadChaves);
                    }

                } else { // Produção própria
                    // Aqui, em vez de `projeto.listas`, vamos verificar as URLs diretamente no objeto `projeto`
                    // Ex: projeto.url_lista_chaves, projeto.url_lista_pvc, etc.
                    const listasDisponiveis = [];
                    // Mapear nomes de colunas de URL para nomes de exibição de listas
                    const mapaListas = {
                        'url_lista_chaves': 'LChaves',
                        'url_lista_pvc': 'LPVC',
                        'url_lista_reforco': 'LReforco',
                        'url_lista_ferragens': 'LFerragens',
                        'url_lista_vidros': 'LVidros',
                        'url_lista_esteira': 'LEsteira',
                        'url_lista_motor': 'LMotor',
                        'url_lista_acabamento': 'LAcabamento',
                        'url_lista_tela_retratil': 'LTelaRetratil',
                        'url_lista_aco': 'LAco',
                        'url_lista_perfil': 'LPerfil',
                        'url_lista_contramarco': 'LContraMarco',
                        'url_lista_conexao': 'LConexao',
                        'url_lista_chapa_acm': 'LChapaACM',
                        'url_lista_fechadura_eletronica': 'LFechaduraEletronica',
                        // Adicionar outras listas conforme as colunas da sua tabela 'projetos'
                    };
                    // Para listas personalizadas de "Outros", você pode ter um campo JSON `custom_lists`
                    // if (tipoProjeto === 'Outros' && projeto.custom_lists) {
                    //     projeto.custom_lists.forEach(customList => {
                    //         if(customList.url) listasDisponiveis.push({ nomeExibicao: customList.name, url: customList.url, nomeOriginal: `L${customList.name}` });
                    //     });
                    // }


                    for (const urlField in mapaListas) {
                        if (projeto[urlField]) { // Se a URL existe no projeto
                            listasDisponiveis.push({
                                nomeExibicao: formatarNomeLista(mapaListas[urlField]),
                                url: projeto[urlField],
                                nomeOriginal: mapaListas[urlField] // Para `carregarItensLista` se necessário, ou apenas para download
                            });
                        }
                    }
                    
                    if (listasDisponiveis.length > 0) {
                        const listasContainer = document.createElement('div');
                        listasContainer.className = 'listas-container';
                        listasDisponiveis.forEach(listaInfo => {
                            const btnLista = document.createElement('a'); // Mudar para <a> para download direto
                            btnLista.href = listaInfo.url;
                            btnLista.target = "_blank"; // Abrir em nova aba
                            btnLista.className = 'btn btn-outline-primary me-2 mb-2 btn-lista-download';
                            btnLista.textContent = listaInfo.nomeExibicao;
                            btnLista.setAttribute('title', `Baixar lista ${listaInfo.nomeExibicao}`);
                            // Se precisar carregar itens na interface em vez de download direto:
                            // btnLista.addEventListener('click', function(e) {
                            // e.preventDefault(); // Prevenir navegação se for carregar na interface
                            // document.querySelectorAll('.btn-lista-download').forEach(btn => btn.classList.remove('active'));
                            // this.classList.add('active');
                            // carregarItensLista(clienteId, tipoProjeto, listaInfo.nomeOriginal, listaInfo.url); // Passar URL se os itens não estiverem no BD
                            // });
                            listasContainer.appendChild(btnLista);
                        });
                        cardBody.appendChild(listasContainer);
                    } else {
                        cardBody.innerHTML = `<div class="alert alert-light">Nenhuma lista de materiais disponível para este projeto.</div>`;
                    }
                }
                cardProjeto.appendChild(cardBody);
                if (listasProjetosDiv) listasProjetosDiv.appendChild(cardProjeto);
            });
        }

        if (loadingVisualizacao) loadingVisualizacao.classList.add('d-none');
        if (conteudoVisualizacao) conteudoVisualizacao.classList.remove('d-none');

        const modal = bootstrap.Modal.getInstance(modalVisualizacaoElement) || new bootstrap.Modal(modalVisualizacaoElement);
        modal.show();
        
        // Adiciona animação de entrada aos cards
        setTimeout(() => {
            document.querySelectorAll('.projeto-card').forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('animate__animated', 'animate__fadeInUp');
                }, index * 100);
            });
        }, 300);

        console.log('=== FIM DA FUNÇÃO VISUALIZAR CLIENTE (SUPABASE) - SUCESSO ===');

    } catch (error) {
        console.error('Erro ao carregar dados do cliente (Supabase):', error);
        mostrarNotificacao(`Erro ao carregar dados: ${error.message}`, 'danger');
        if (listasProjetosDiv) {
            listasProjetosDiv.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Erro ao carregar dados do cliente: ${error.message}
                </div>
                <div class="text-center mt-3">
                    <button class="btn btn-outline-danger" onclick="visualizarCliente('${clienteId}')">
                        <i class="fas fa-sync-alt me-2"></i> Tentar novamente
                    </button>
                </div>
            `;
        }
        if (loadingVisualizacao) loadingVisualizacao.classList.add('d-none');
        if (conteudoVisualizacao) conteudoVisualizacao.classList.remove('d-none');

        const modal = bootstrap.Modal.getInstance(modalVisualizacaoElement) || new bootstrap.Modal(modalVisualizacaoElement);
        modal.show(); // Mostra o modal mesmo com erro para o usuário ver a mensagem
        console.log('=== FIM DA FUNÇÃO VISUALIZAR CLIENTE (SUPABASE) - ERRO ===');
    }
}


/**
 * Carrega os itens de uma lista específica
 *
 * @param {string} clienteId - ID do cliente
 * Formata o tipo de projeto para exibição
 * 
 * @param {string} tipo - Tipo de projeto
 * @returns {string} - Tipo formatado
 */
function formatarTipoProjeto(tipo) {
    switch (tipo) {
        case 'PVC':
            return 'PVC';
        case 'Aluminio':
            return 'Alumínio';
        case 'Brise':
            return 'Brise';
        case 'ACM':
            return 'ACM';
        case 'Outros':
            return 'Outros';
        default:
            return tipo;
    }
}

/**
 * Formata o nome da lista para exibição
 * 
 * @param {string} nome - Nome da lista
 * @returns {string} - Nome formatado
 */
function formatarNomeLista(nome) {
    switch (nome) {
        case 'LPVC':
            return 'PVC';
        case 'LReforco':
            return 'Reforço';
        case 'LFerragens':
            return 'Ferragens';
        case 'LVidros':
        case 'LVidro':
            return 'Vidros';
        case 'LEsteira':
            return 'Esteira';
        case 'LMotor':
            return 'Motor';
        case 'LAcabamento':
            return 'Acabamento';
        case 'LTelaRetratil':
            return 'Tela Retrátil';
        case 'LAco':
            return 'Aço';
        case 'LOutros':
            return 'Outros';
        case 'LPerfil':
            return 'Perfil';
        case 'LContraMarco':
            return 'Contra Marco';
        default:
            return nome;
    }
}

/**
 * Retorna a classe do badge de acordo com o status
 * 
 * @param {string} status - Status do item
 * @returns {string} - Classe CSS para o badge
 */
function getBadgeClass(status) {
    switch (status) {
        case 'Em andamento':
            return 'bg-warning';
        case 'Concluído':
            return 'bg-success';
        case 'Pendente':
            return 'bg-secondary';
        default:
            return 'bg-secondary';
    }
}

/**
 * Formata uma data timestamp para exibição
 * 
 * @param {number} timestamp - Timestamp da data
 * @returns {string} - Data formatada
 */
function formatarData(timestamp) {
    if (!timestamp) return '-';
    
    const data = new Date(timestamp);
    
    // Formata a data como dd/mm/aaaa
    return `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
}

/**
 * Verifica se um objeto está vazio
 * 
 * @param {Object} obj - Objeto a ser verificado
 * @returns {boolean} - true se o objeto estiver vazio, false caso contrário
 */
function objetoVazio(obj) {
    return obj === null || obj === undefined || Object.keys(obj).length === 0;
}

/**
 * Exibe uma notificação na tela
 * 
 * @param {string} mensagem - Mensagem a ser exibida
 * @param {string} tipo - Tipo da notificação (success, danger, warning, info)
 */
function mostrarNotificacao(mensagem, tipo) {
    // Cria o elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.className = `alert alert-${tipo} alert-dismissible fade show notification`;
    notificacao.innerHTML = `
        ${mensagem}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    `;
    
    // Adiciona a notificação ao corpo da página
    document.body.appendChild(notificacao);
    
    // Remove a notificação após 5 segundos
    setTimeout(() => {
        notificacao.classList.remove('show');
        setTimeout(() => {
            notificacao.remove();
        }, 300);
    }, 5000);
}
