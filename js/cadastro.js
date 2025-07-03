/**
 * cadastro.js
 * * Lógica específica da tela de cadastro de clientes e projetos
 * Este arquivo contém todas as funções relacionadas à tela de cadastro
 * do Sistema de Controle de Compras e Recebimento
 */

// Aguarda o carregamento completo do DOM
document.addEventListener("DOMContentLoaded", function () {
  // Inicializa os componentes da página
  inicializarComponentes();

  // Aguarda a inicialização do Supabase antes de carregar dados
  function verificarSupabaseECarregar() {
    if (typeof window.supabase !== 'undefined' && window.supabase) {
      console.log('Supabase client (window.supabase) inicializado, carregando clientes...');
      carregarClientes();
    } else {
      console.log('Aguardando inicialização do Supabase client (window.supabase)...');
      setTimeout(verificarSupabaseECarregar, 200); // Verifica novamente em 200ms
    }
  }
  
  verificarSupabaseECarregar();

  // Configura os listeners de eventos
  configurarEventListeners();
});

/**
 * Inicializa os componentes da interface
 * Configura datepickers, selects e outros elementos
 */
function inicializarComponentes() {
  // Inicializa os datepickers
  flatpickr(".datepicker", {
    locale: "pt",
    dateFormat: "d/m/Y",
    allowInput: true,
  });

  // Inicializa os selects com Select2
  $(document).ready(function () {
    $("#filtroCliente").select2({
      placeholder: "Selecione um cliente",
      allowClear: true,
    });

    $("#filtroStatus").select2({
      placeholder: "Selecione um status",
      allowClear: true,
    });
  });
}

/**
 * Configura os listeners de eventos para os elementos da página
 */
function configurarEventListeners() {
  // Botão Novo Cadastro
  const btnNovoCadastro = document.getElementById('btnNovoCadastro');
  if (btnNovoCadastro) {
      btnNovoCadastro.addEventListener('click', () => {
          fecharModalEresetarFormulario(); // Reseta o formulário e o estado de edição
          // A função fecharModalEresetarFormulario já ajusta o título e o botão para "Novo Cadastro" / "Salvar"
          // e esconde as áreas.
          // Apenas precisamos garantir que o modal seja exibido.
          const modalCadastro = bootstrap.Modal.getInstance(document.getElementById('modalCadastro')) || new bootstrap.Modal(document.getElementById('modalCadastro'));
          modalCadastro.show();
      });
  }

  // Checkboxes de tipo de projeto
  document.querySelectorAll(".tipo-projeto").forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const tipoId = this.id;
      const areaTipo = document.getElementById(
        "area" + tipoId.replace("tipo", "")
      );

      if (this.checked && areaTipo) {
        areaTipo.classList.remove("d-none");
      } else if (areaTipo) {
        areaTipo.classList.add("d-none");
      }
    });
  });

  // Checkbox de terceirização para Alumínio
  document
    .getElementById("aluminioTerceirizado")
    .addEventListener("change", function () {
      const areaTerceirizado = document.getElementById(
        "areaAluminioTerceirizado"
      );
      const areaProducao = document.getElementById("areaAluminioProducao");

      if (this.checked) {
        areaTerceirizado.classList.remove("d-none");
        areaProducao.classList.add("d-none");
      } else {
        areaTerceirizado.classList.add("d-none");
        areaProducao.classList.remove("d-none");
      }
    });

  // Checkbox de terceirização para Brise
  document
    .getElementById("briseTerceirizado")
    .addEventListener("change", function () {
      const areaTerceirizado = document.getElementById("areaBriseTerceirizado");
      const areaProducao = document.getElementById("areaBriseProducao");

      if (this.checked) {
        areaTerceirizado.classList.remove("d-none");
        areaProducao.classList.add("d-none");
      } else {
        areaTerceirizado.classList.add("d-none");
        areaProducao.classList.remove("d-none");
      }
    });

  // Checkbox de terceirização para ACM
  document
    .getElementById("acmTerceirizado")
    .addEventListener("change", function () {
      const areaTerceirizado = document.getElementById("areaACMTerceirizado");
      const areaProducao = document.getElementById("areaACMProducao");

      if (this.checked) {
        areaTerceirizado.classList.remove("d-none");
        areaProducao.classList.add("d-none");
      } else {
        areaTerceirizado.classList.add("d-none");
        areaProducao.classList.remove("d-none");
      }
    });

  // Checkbox de terceirização para Trilho
  document
    .getElementById("trilhoTerceirizado")
    .addEventListener("change", function () {
      const areaTerceirizado = document.getElementById(
        "areaTrilhoTerceirizado"
      );
      const areaProducao = document.getElementById("areaTrilhoProducao");

      if (this.checked) {
        areaTerceirizado.classList.remove("d-none");
        areaProducao.classList.add("d-none");
      } else {
        areaTerceirizado.classList.add("d-none");
        areaProducao.classList.remove("d-none");
      }
    });

  // Checkbox de terceirização para Outros
  document
    .getElementById("outrosTerceirizado")
    .addEventListener("change", function () {
      const areaTerceirizado = document.getElementById(
        "areaOutrosTerceirizado"
      );
      const areaProducao = document.getElementById("areaOutrosProducao");

      if (this.checked) {
        areaTerceirizado.classList.remove("d-none");
        areaProducao.classList.add("d-none");
      } else {
        areaTerceirizado.classList.add("d-none");
        areaProducao.classList.remove("d-none");
      }
    });

  // Botão para adicionar nova lista personalizada
  document
    .getElementById("btnAdicionarListaOutros")
    .addEventListener("click", function () {
      adicionarListaPersonalizada();
    });

  // Botão Salvar Cadastro
  document
    .getElementById("btnSalvarCadastro")
    .addEventListener("click", salvarCadastro);

  // Botão Filtrar
  document
    .getElementById("btnFiltrar")
    .addEventListener("click", aplicarFiltros);

  // Botão Limpar Filtros
  document
    .getElementById("btnLimparFiltros")
    .addEventListener("click", limparFiltros);
}

/**
 * Carrega a lista de clientes cadastrados do Supabase
 * e atualiza a tabela na interface
 */
async function carregarClientes() {
  // Verifica se supabaseClient está disponível
  if (typeof window.supabaseClient === 'undefined' || !window.supabaseClient) {
    console.error('Supabase client (window.supabaseClient) não está disponível ainda. Aguardando...');
    // Opcional: tentar novamente após um tempo ou mostrar notificação persistente
    // setTimeout(carregarClientes, 250);
    return;
  }

  const tabelaClientes = document.getElementById("tabelaClientes");
  const nenhumCliente = document.getElementById("nenhumCliente");
  const filtroClienteSelect = document.getElementById("filtroCliente");

  // Limpa a tabela e o select de filtro
  tabelaClientes.innerHTML = "";
  filtroClienteSelect.innerHTML = '<option value="">Todos os clientes</option>'; // Mantém a opção padrão

  try {
    const { data: clientes, error } = await window.supabaseClient
      .from('clientes')
      .select('*')
      .order('dataCriacao', { ascending: false });

    if (error) {
      console.error("Erro ao carregar clientes:", error);
      mostrarNotificacao("Erro ao carregar clientes: " + error.message, "danger");
      nenhumCliente.classList.remove("d-none");
      return;
    }

    if (!clientes || clientes.length === 0) {
      nenhumCliente.classList.remove("d-none");
      return;
    }

    nenhumCliente.classList.add("d-none");

    clientes.forEach(cliente => {
      // Adiciona ao filtro
      const option = document.createElement("option");
      option.value = cliente.id; // Supabase usa 'id' por padrão
      option.textContent = cliente.nome;
      filtroClienteSelect.appendChild(option);

      // Cria a linha da tabela
      const tr = document.createElement("tr");
      tr.dataset.id = cliente.id;

      // Define a classe de acordo com o status
      if (cliente.StatusCadastro === "Em andamento") {
        tr.classList.add("table-warning");
      } else if (cliente.StatusCadastro === "Concluído") {
        tr.classList.add("table-success");
      }

      // Formata a data de criação
      const dataCriacao = cliente.dataCriacao ? formatarData(cliente.dataCriacao) : 'N/A';

      // Conteúdo da linha
      tr.innerHTML = `
                  <td>${cliente.nome || 'Nome não disponível'}</td>
                  <td>${dataCriacao}</td>
                  <td>
                      <span class="badge ${getBadgeClass(
                        cliente.StatusCadastro
                      )}">${cliente.StatusCadastro || "Não iniciado"}</span>
                  </td>
                  <td>
                      <button class="btn btn-sm btn-info me-1 btn-visualizar" data-cliente-id="${cliente.id}">
                          <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn btn-sm btn-primary btn-editar" data-cliente-id="${cliente.id}">
                          <i class="fas fa-edit"></i>
                      </button>
                  </td>
              `;
      tabelaClientes.appendChild(tr);
    });

    // Adiciona event listeners DEPOIS que todos os botões foram adicionados ao DOM
    document.querySelectorAll(".btn-visualizar").forEach(button => {
      button.addEventListener("click", function() {
        const clienteId = this.dataset.clienteId;
        if (typeof visualizarCliente === 'function') {
            visualizarCliente(clienteId);
        } else {
            console.error('Função visualizarCliente não definida globalmente ou não acessível.');
        }
      });
    });

    document.querySelectorAll(".btn-editar").forEach(button => {
      button.addEventListener("click", function() {
        const clienteId = this.dataset.clienteId;
         if (typeof editarCliente === 'function') {
            editarCliente(clienteId);
        } else {
            console.error('Função editarCliente não definida globalmente ou não acessível.');
        }
      });
    });

  } catch (error) {
    console.error("Erro ao carregar clientes (catch geral):", error);
    mostrarNotificacao("Erro ao carregar clientes. Tente novamente.", "danger");
    nenhumCliente.classList.remove("d-none");
  }
}

/**
 * Retorna a classe do badge de acordo com o status
 * * @param {string} status - Status do cliente
 * @returns {string} - Classe CSS para o badge
 */
function getBadgeClass(status) {
  switch (status) {
    case "Em andamento":
      return "bg-warning";
    case "Concluído":
      return "bg-success";
    default:
      return "bg-secondary";
  }
}

/**
 * Abre o modal de edição de cliente com os dados carregados
 * * @param {string} clienteId - ID do cliente a ser editado
 */
async function editarCliente(clienteId) {
  window.editandoClienteId = clienteId; // Definir o ID do cliente em edição globalmente
  console.log("=== INÍCIO DA FUNÇÃO EDITAR CLIENTE (SUPABASE) ===");
  console.log("Editando cliente com ID:", clienteId, "Global editandoClienteId:", window.editandoClienteId);

  if (!window.supabaseClient) {
    console.error("ERRO CRÍTICO: Supabase client (window.supabaseClient) não está definido!");
    mostrarNotificacao("Erro de conexão com o banco de dados. Recarregue a página.", "danger");
    return;
  }

  const formCadastro = document.getElementById("formCadastro");
  if (formCadastro) formCadastro.reset();

  document.querySelectorAll(".area-projeto").forEach((area) => {
    area.classList.add("d-none");
  });

  // Limpar previews de arquivos existentes (se houver)
  document.querySelectorAll('.file-preview-text').forEach(preview => preview.textContent = '');


  document.getElementById("modalCadastro").dataset.clienteId = clienteId;
  document.getElementById("modalCadastroLabel").textContent = "Editar Cadastro";
  document.getElementById("btnSalvarCadastro").textContent = "Atualizar";

  try {
    // 1. Buscar dados do cliente
    const { data: cliente, error: clienteError } = await window.supabaseClient
      .from('clientes')
      .select('*')
      .eq('id', clienteId)
      .single();

    if (clienteError) {
      console.error("Erro ao buscar cliente:", clienteError);
      throw new Error(`Cliente não encontrado: ${clienteError.message}`);
    }

    if (!cliente) {
      console.error("Cliente não encontrado no Supabase com ID:", clienteId);
      mostrarNotificacao("Cliente não encontrado.", "warning");
      return;
    }

    console.log("Dados do cliente:", cliente);

    // Preenche os campos do formulário com os dados do cliente
    document.getElementById("cliente").value = cliente.nome || "";
    // Assuming database column is data_prazo_entrega
    if (cliente.data_prazo_entrega) {
      document.getElementById("dataPrazoEntrega").value = formatarDataParaInput(cliente.data_prazo_entrega);
    }
    // Assuming database column is projetoOutrosNome (as used in salvarCadastro)
     if (cliente.projetoOutrosNome) {
        const nomeProjetoOutrosInput = document.getElementById("nomeProjetoOutros");
        if (nomeProjetoOutrosInput) nomeProjetoOutrosInput.value = cliente.projetoOutrosNome;
    }


    // 2. Buscar os projetos associados a esse cliente
    const { data: projetos, error: projetosError } = await window.supabaseClient
      .from('projetos') // Nome da sua tabela de projetos
      .select('*')
      .eq('cliente_id', clienteId);

    if (projetosError) {
      console.error("Erro ao buscar projetos:", projetosError);
      // Não lançar erro aqui, pode ser que o cliente não tenha projetos ainda
      mostrarNotificacao(`Erro ao buscar projetos: ${projetosError.message}`, "warning");
    }

    console.log("Dados dos projetos:", projetos);

    if (projetos && projetos.length > 0) {
      projetos.forEach((projeto) => {
        const tipoProjeto = projeto.tipo_projeto; // Ex: "PVC", "Aluminio"
        const checkboxTipo = document.getElementById(`tipo${tipoProjeto}`); // Ex: id="tipoPVC"

        if (checkboxTipo) {
          checkboxTipo.checked = true;
          const areaTipo = document.getElementById(`area${tipoProjeto}`); // Ex: id="areaPVC"
          if (areaTipo) areaTipo.classList.remove("d-none");

          if (projeto.terceirizado) {
            const checkboxTerceirizado = document.getElementById(`${tipoProjeto.toLowerCase()}Terceirizado`);
            if (checkboxTerceirizado) checkboxTerceirizado.checked = true;

            const areaTerceirizado = document.getElementById(`area${tipoProjeto}Terceirizado`);
            const areaProducao = document.getElementById(`area${tipoProjeto}Producao`);
            if (areaTerceirizado) areaTerceirizado.classList.remove("d-none");
            if (areaProducao) areaProducao.classList.add("d-none");

            const empresaInput = document.getElementById(`empresa${tipoProjeto}`);
            if (empresaInput) empresaInput.value = projeto.empresa_terceirizada || "";

            const dataSolicitacaoInput = document.getElementById(`dataSolicitacao${tipoProjeto}`);
            if (dataSolicitacaoInput && projeto.data_solicitacao_terceirizada) {
                dataSolicitacaoInput.value = formatarDataParaInput(projeto.data_solicitacao_terceirizada);
            }

            const prazoEntregaInput = document.getElementById(`prazoEntrega${tipoProjeto}`);
            if (prazoEntregaInput && projeto.prazo_entrega_terceirizada) {
                prazoEntregaInput.value = formatarDataParaInput(projeto.prazo_entrega_terceirizada);
            }

            // Preencher nome do arquivo para lista de chaves terceirizado (se houver URL)
            if(projeto.url_lista_chaves) {
                const filePreview = document.getElementById(`filePreviewListaChaves${tipoProjeto}Terceirizado`);
                if(filePreview) filePreview.textContent = extrairNomeArquivoDeUrl(projeto.url_lista_chaves) || "Arquivo carregado";
            }

          } else { // Produção própria
            const areaProducao = document.getElementById(`area${tipoProjeto}Producao`);
            if (areaProducao) areaProducao.classList.remove("d-none");
            const areaTerceirizado = document.getElementById(`area${tipoProjeto}Terceirizado`);
             if (areaTerceirizado) areaTerceirizado.classList.add("d-none");


            // Preencher nomes dos arquivos para listas de produção própria
            // Exemplo para lista de chaves (adapte para outras listas e tipos)
            if(projeto.url_lista_chaves) {
                const filePreview = document.getElementById(`filePreviewListaChaves${tipoProjeto}`); // Ex: filePreviewListaChavesPVC
                if(filePreview) filePreview.textContent = extrairNomeArquivoDeUrl(projeto.url_lista_chaves) || "Arquivo carregado";
            }
            // Adicionar lógica similar para outras listas (LPVC, LPerfil, etc.)
            // Ex:
            // if(projeto.url_lista_pvc) {
            //     const filePreviewPVC = document.getElementById(`filePreviewListaPVC${tipoProjeto}`);
            //     if(filePreviewPVC) filePreviewPVC.textContent = extrairNomeArquivoDeUrl(projeto.url_lista_pvc) || "Arquivo carregado";
            // }
             if (tipoProjeto === "Outros" && projeto.custom_lists) { // Se custom_lists for um JSON [{name, url}, ...]
                // Lógica para popular listas personalizadas
                // Isso vai depender de como você estruturou o HTML para listas "Outros" dinâmicas
                // Pode ser necessário recriar os inputs de nome e exibir os nomes dos arquivos
            }
          }
        }
      });
    }

    const modalCadastro = new bootstrap.Modal(document.getElementById("modalCadastro"));
    modalCadastro.show();

  } catch (error) {
    console.error("Erro ao editar cliente (Supabase):", error);
    mostrarNotificacao(`Erro ao carregar dados para edição: ${error.message}`, "danger");
    console.log("=== FIM DA FUNÇÃO EDITAR CLIENTE (SUPABASE) - ERRO ===");
  }
}

/**
 * Salva um novo cadastro de cliente e seus projetos no Supabase
 * ou atualiza um cadastro existente
 */
async function salvarCadastro() {
    const nomeCliente = document.getElementById('cliente').value.trim();
    const dataPrazoInput = document.getElementById('dataPrazoEntrega').value;

    if (!nomeCliente) {
        mostrarNotificacao("O nome do cliente é obrigatório.", "danger");
        return;
    }

    let dataPrazoFormatada = null;
    if (dataPrazoInput) {
        const parts = dataPrazoInput.split('/');
        if (parts.length === 3) {
            dataPrazoFormatada = new Date(Date.UTC(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))).toISOString();
        } else {
            console.warn("Formato de data inválido para prazo de entrega:", dataPrazoInput);
        }
    }

    const clienteData = {
        nome: nomeCliente,
        data_prazo_entrega: dataPrazoFormatada,
        ultimaAtualizacao: new Date().toISOString(),
    };

    if (document.getElementById('tipoOutros')?.checked) {
        const nomeProjetoOutrosInput = document.getElementById('nomeProjetoOutros');
        if (nomeProjetoOutrosInput && nomeProjetoOutrosInput.value.trim()) {
            clienteData.projetoOutrosNome = nomeProjetoOutrosInput.value.trim();
        }
    }

    try {
        let savedCliente;
        if (window.editandoClienteId) {
            clienteData.id = window.editandoClienteId;
            const { data, error } = await window.supabaseClient
                .from('clientes')
                .update(clienteData)
                .eq('id', window.editandoClienteId)
                .select()
                .single();
            if (error) throw error;
            savedCliente = data;
            mostrarNotificacao("Cliente atualizado com sucesso!", "success");
        } else {
            clienteData.dataCriacao = new Date().toISOString();
            clienteData.StatusCadastro = "Não iniciado";
            const { data, error } = await window.supabaseClient
                .from('clientes')
                .insert(clienteData)
                .select()
                .single();
            if (error) throw error;
            savedCliente = data;
            mostrarNotificacao("Cliente cadastrado com sucesso!", "success");
        }

        const clienteId = savedCliente.id;
        const tiposDeProjetoSelecionados = getTiposDeProjetoSelecionados();

        for (const tipo of tiposDeProjetoSelecionados) {
            const isTerceirizado = document.getElementById(`${tipo.toLowerCase()}Terceirizado`)?.checked || false;

            const projetoPayload = {
                cliente_id: clienteId,
                tipo_projeto: tipo,
                terceirizado: isTerceirizado,
            };

            if (isTerceirizado) {
                const empresa = document.getElementById(`empresa${tipo}`)?.value.trim();
                if (empresa) projetoPayload.empresa_terceirizada = empresa;
                const dataSolicitacaoInput = document.getElementById(`dataSolicitacao${tipo}`)?.value;
                if (dataSolicitacaoInput) {
                    const parts = dataSolicitacaoInput.split('/');
                    if (parts.length === 3) projetoPayload.data_solicitacao_terceirizada = new Date(Date.UTC(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))).toISOString();
                }
                const prazoEntregaTerceirizadoInput = document.getElementById(`prazoEntrega${tipo}`)?.value;
                if (prazoEntregaTerceirizadoInput) {
                    const parts = prazoEntregaTerceirizadoInput.split('/');
                    if (parts.length === 3) projetoPayload.prazo_entrega_terceirizada = new Date(Date.UTC(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))).toISOString();
                }
            } else if (tipo === "Outros") {
                 const listasPersonalizadasContainer = document.getElementById("listasPersonalizadasContainer");
                 const customListsData = [];
                 if (listasPersonalizadasContainer) {
                     const listasItems = listasPersonalizadasContainer.querySelectorAll(".lista-personalizada");
                     for (const item of listasItems) {
                         const nomeListaInput = item.querySelector(".nome-lista-personalizada");
                         const arquivoListaInput = item.querySelector(".arquivo-lista-personalizada");
                         if (nomeListaInput?.value.trim() && arquivoListaInput?.files.length > 0) {
                             // Apenas coletamos o nome aqui. O upload e processamento do arquivo será feito depois.
                             customListsData.push({ nome: nomeListaInput.value.trim(), inputElement: arquivoListaInput });
                         }
                     }
                 }
                 if (customListsData.length > 0) {
                    // Guardamos a referencia para os inputs para processar depois do upsert do projeto
                    projetoPayload._customListsToProcess = customListsData;
                 }
            }

            // Upsert inicial do projeto para obter/confirmar o ID do projeto
            const { data: savedProjeto, error: upsertProjetoError } = await window.supabaseClient
                .from('projetos')
                .upsert(projetoPayload, { onConflict: 'cliente_id, tipo_projeto' })
                .select()
                .single();

            if (upsertProjetoError) {
                throw new Error(`Erro ao salvar/atualizar o projeto ${tipo}: ${upsertProjetoError.message}`);
            }
            const projetoId = savedProjeto.id;

            // Processar arquivos para este projeto
            const areaDeInputsId = isTerceirizado ? `area${tipo}Terceirizado` : `area${tipo}Producao`;
            const storageSubPath = isTerceirizado ? 'terceirizado' : 'producao';
            const areaDeInputs = document.getElementById(areaDeInputsId);

            if (areaDeInputs) {
                const inputsDeArquivo = areaDeInputs.querySelectorAll('input[type="file"]');
                const fileProcessingPromises = [];

                for (const input of inputsDeArquivo) {
                    if (tipo === "Outros" && !isTerceirizado && input.classList.contains('arquivo-lista-personalizada')) {
                        continue; // Já tratado ou será tratado por _customListsToProcess
                    }
                    if (input.files.length > 0) {
                        const arquivo = input.files[0];
                        let baseNomeColuna = input.id.replace('lista', '').replace(tipo, '').toLowerCase();
                        baseNomeColuna = baseNomeColuna.replace(/terceirizado$/i, '').replace(/producao$/i, '');
                        const nomeDaColunaUrl = `url_${baseNomeColuna}`;
                        const caminhoArquivo = `public/${clienteId}/${tipo}/${storageSubPath}/${input.id}-${arquivo.name}`;

                        fileProcessingPromises.push(
                            window.supabaseClient.storage.from('listas-materiais').upload(caminhoArquivo, arquivo, { cacheControl: '3600', upsert: true })
                                .then(async ({ data: uploadData, error: uploadError }) => {
                                    if (uploadError) throw new Error(`Upload falhou para ${arquivo.name}: ${uploadError.message}`);
                                    const { data: urlData } = window.supabaseClient.storage.from('listas-materiais').getPublicUrl(uploadData.path);

                                    await window.supabaseClient.from('projetos').update({ [nomeDaColunaUrl]: urlData.publicUrl }).eq('id', projetoId);

                                    // Chamar processamento de itens
                                    if (typeof processarEsalvarItensDeArquivo === "function") {
                                        return processarEsalvarItensDeArquivo(arquivo, projetoId)
                                            .then(() => mostrarNotificacao(`Itens de ${arquivo.name} processados.`,"info"))
                                            .catch(procErr => {
                                                console.error(`Erro processando itens de ${arquivo.name}:`, procErr);
                                                mostrarNotificacao(`Erro ao processar itens de ${arquivo.name}.`, "warning");
                                            });
                                    }
                                })
                        );
                    }
                }
                 // Processar listas personalizadas para "Outros" (produção)
                if (tipo === "Outros" && !isTerceirizado && savedProjeto._customListsToProcess) {
                    for (const customItem of savedProjeto._customListsToProcess) {
                        const arquivo = customItem.inputElement.files[0];
                        const nomeListaSanitizado = customItem.nome.replace(/\s+/g, '_');
                        const caminhoArquivo = `public/${clienteId}/${tipo}/${storageSubPath}/L${nomeListaSanitizado}-${arquivo.name}`;
                        const nomeDaColunaUrl = `url_custom_${nomeListaSanitizado}`; // Ou como for armazenar no BD

                        fileProcessingPromises.push(
                             window.supabaseClient.storage.from('listas-materiais').upload(caminhoArquivo, arquivo, { cacheControl: '3600', upsert: true })
                                .then(async ({ data: uploadData, error: uploadError }) => {
                                    if (uploadError) throw new Error(`Upload falhou para ${arquivo.name}: ${uploadError.message}`);
                                    const { data: urlData } = window.supabaseClient.storage.from('listas-materiais').getPublicUrl(uploadData.path);

                                    // Supondo que você tenha colunas dinâmicas ou um campo JSON para estas URLs em 'projetos'
                                    // Aqui estamos apenas atualizando um campo JSON 'custom_lists_json' como exemplo
                                    const updatePayload = {};
                                    updatePayload.custom_lists_json = savedProjeto.custom_lists_json || [];
                                    updatePayload.custom_lists_json.push({ nome: nomeListaSanitizado, url: urlData.publicUrl });

                                    await window.supabaseClient.from('projetos').update(updatePayload).eq('id', projetoId);

                                    if (typeof processarEsalvarItensDeArquivo === "function") {
                                       return processarEsalvarItensDeArquivo(arquivo, projetoId)
                                            .then(() => mostrarNotificacao(`Itens de ${arquivo.name} (custom) processados.`, "info"))
                                            .catch(procErr => {
                                                console.error(`Erro processando itens de ${arquivo.name} (custom):`, procErr);
                                                mostrarNotificacao(`Erro ao processar itens de ${arquivo.name} (custom).`, "warning");
                                            });
                                    }
                                })
                        );
                    }
                }


                await Promise.all(fileProcessingPromises).catch(err => {
                    // Um erro em Promise.all geralmente significa que um dos uploads/processamentos falhou.
                    // A notificação específica do erro já deve ter sido mostrada dentro do loop.
                    // Aqui, podemos apenas logar que nem tudo foi concluído.
                    console.error("Alguns arquivos ou processamentos de itens falharam:", err);
                    // Não relançar o erro para permitir que o fluxo continue, se desejado.
                    // Ou pode-se optar por lançar para parar tudo: throw err;
                });
            }
        }

        fecharModalEresetarFormulario();
        if (typeof carregarClientes === "function") await carregarClientes();
        else console.warn("Função carregarClientes não definida.");

    } catch (error) {
        console.error("Erro no processo de salvar cadastro:", error);
        mostrarNotificacao(`Erro: ${error.message}`, "danger");
    }
}
// FUNÇÃO AUXILIAR para pegar os tipos de projeto marcados
function getTiposDeProjetoSelecionados() {
    const selecionados = [];
    document.querySelectorAll('.tipo-projeto:checked').forEach(checkbox => {
        // Ex: 'tipoPVC' se torna 'PVC'
        selecionados.push(checkbox.id.replace('tipo', ''));
    });
    return selecionados;
}

// FUNÇÃO AUXILIAR para limpar o formulário
function fecharModalEresetarFormulario() {
    const modalElement = document.getElementById('modalCadastro');
    if (modalElement) {
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
            modalInstance.hide();
        }
    }

    const form = document.getElementById('formCadastro');
    if (form) form.reset();

    window.editandoClienteId = null; // Limpa o ID global de edição

    const btnSalvar = document.getElementById("btnSalvarCadastro");
    if(btnSalvar) btnSalvar.textContent = "Salvar";

    const modalLabel = document.getElementById("modalCadastroLabel");
    if(modalLabel) modalLabel.textContent = "Novo Cadastro";

    // Ocultar todas as áreas de projeto principais
    document.querySelectorAll(".area-projeto").forEach((area) => {
        area.classList.add("d-none");
    });

    // Ocultar todas as sub-áreas de produção e terceirizado específicas
    document.querySelectorAll('[id^="area"][id$="Producao"], [id^="area"][id$="Terceirizado"]').forEach(subArea => {
        subArea.classList.add('d-none');
    });

     // Limpar previews de arquivos (se existirem elementos com essa classe)
    document.querySelectorAll('.file-preview-text').forEach(preview => {
        preview.textContent = '';
    });

    // Resetar checkboxes de tipo de projeto
    document.querySelectorAll('.tipo-projeto').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Resetar checkboxes de terceirização (os que controlam a visibilidade das sub-áreas)
    document.querySelectorAll('input[type="checkbox"][id$="Terceirizado"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Limpar container de listas personalizadas do tipo "Outros", se existir
    const listasPersonalizadasContainer = document.getElementById("listasPersonalizadasContainer");
    if (listasPersonalizadasContainer) {
        listasPersonalizadasContainer.innerHTML = '';
    }

    // Garantir que o dataset.clienteId no modal também seja limpo
    if (modalElement) modalElement.dataset.clienteId = "";
}


/**
 * Adiciona uma nova lista personalizada para o tipo de projeto "Outros"
 */
function adicionarListaPersonalizada() {
  // Obtém o template da lista personalizada
  const template = document.getElementById("templateListaPersonalizada");
  const container = document.getElementById("listasPersonalizadasContainer");

  // Clona o template
  const clone = document.importNode(template.content, true);

  // Adiciona evento para remover a lista
  const btnRemover = clone.querySelector(".btn-remover-lista");
  btnRemover.addEventListener("click", function () {
    const listaItem = this.closest(".lista-personalizada");
    listaItem.remove();
  });

  // Adiciona ao container
  container.appendChild(clone);
}

/**
 * Aplica os filtros selecionados à tabela de clientes
 */
function aplicarFiltros() {
  // Implementação da função de aplicar filtros
  console.log("Aplicando filtros...");

  // Obter valores dos filtros
  const filtroCliente = document.getElementById("filtroCliente").value;
  const filtroStatus = document.getElementById("filtroStatus").value;

  // Aplicar filtros à tabela
  const linhas = document.querySelectorAll("#tabelaClientes tr");

  linhas.forEach((linha) => {
    const clienteId = linha.dataset.id;
    const statusElement = linha.querySelector(".badge");
    const status = statusElement ? statusElement.textContent : "";

    let mostrar = true;

    if (filtroCliente && clienteId !== filtroCliente) {
      mostrar = false;
    }

    if (filtroStatus && status !== filtroStatus) {
      mostrar = false;
    }

    linha.style.display = mostrar ? "" : "none";
  });
}

/**
 * Limpa os filtros aplicados à tabela de clientes
 */
function limparFiltros() {
  // Limpa os campos de filtro
  document.getElementById("filtroCliente").value = "";
  document.getElementById("filtroStatus").value = "";

  // Recarrega a lista de clientes
  carregarClientes();
}

/**
 * Valida o formulário de cadastro
 * * @param {HTMLFormElement} form - Formulário a ser validado
 * @returns {boolean} - Indica se o formulário é válido
 */
function validarFormulario(form) {
  // Verifica se o nome do cliente foi preenchido
  const nomeCliente = document.getElementById("cliente").value;
  if (!nomeCliente) {
    return false;
  }

  // Verifica se a data de prazo de entrega foi preenchida
  const prazoEntrega = document.getElementById("dataPrazoEntrega").value;
  if (!prazoEntrega) {
    return false;
  }

  return true;
}

/**
 * Gera um ID único para novos registros
 * * @returns {string} - ID único
 */
function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Formata uma data timestamp para o formato DD/MM/YYYY
 * * @param {number} timestamp - Timestamp da data
 * @returns {string} - Data formatada
 */
function formatarData(timestampOrIsoString) {
  const data = new Date(timestampOrIsoString); // Date constructor handles both timestamps and ISO strings
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();

  return `${dia}/${mes}/${ano}`;
}

/**
 * Verifica se um objeto está vazio
 * * @param {object} obj - Objeto a ser verificado
 * @returns {boolean} - Indica se o objeto está vazio
 */
function objetoVazio(obj) {
  return obj === null || obj === undefined || Object.keys(obj).length === 0;
}

/**
 * Exibe uma notificação na interface
 * * @param {string} mensagem - Mensagem a ser exibida
 * @param {string} tipo - Tipo da notificação (success, warning, danger)
 */
function mostrarNotificacao(mensagem, tipo) {
  const notificacao = document.createElement("div");
  notificacao.className = `alert alert-${tipo} alert-dismissible fade show`;
  notificacao.role = "alert";
  notificacao.innerHTML = `
        ${mensagem}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    `;

  const container = document.querySelector(".container");
  container.insertBefore(notificacao, container.firstChild);

  // Remove a notificação após 5 segundos
  setTimeout(() => {
    notificacao.classList.remove("show");
    setTimeout(() => {
      notificacao.remove();
    }, 150);
  }, 5000);
}

/**
 * Formata uma data (timestamp ou string ISO) para o formato DD/MM/YYYY, adequado para inputs de data.
 * @param {string|number} dateStringOrTimestamp - A data em formato ISO 8601 ou timestamp.
 * @returns {string} - Data formatada como DD/MM/YYYY.
 */
function formatarDataParaInput(dateStringOrTimestamp) {
  if (!dateStringOrTimestamp) return "";
  try {
    const data = new Date(dateStringOrTimestamp);
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0"); // Mês é 0-indexed
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  } catch (e) {
    console.error("Erro ao formatar data para input:", e);
    return ""; // Retorna vazio se houver erro na formatação
  }
}

/**
 * Extrai o nome do arquivo de uma URL do Supabase Storage.
 * Ex: https://project.supabase.co/storage/v1/object/public/bucket/path/to/LChaves_arquivo.xlsx -> LChaves_arquivo.xlsx
 * @param {string} url - A URL completa do arquivo.
 * @returns {string|null} - O nome do arquivo ou null se não puder ser extraído.
 */
function extrairNomeArquivoDeUrl(url) {
    if (!url) return null;
    try {
        const urlParts = url.split('/');
        const nomeArquivoComQueryParams = urlParts.pop(); // Pega a última parte: "LChaves_arquivo.xlsx?token=..."
        if (nomeArquivoComQueryParams) {
            const nomeArquivo = nomeArquivoComQueryParams.split('?')[0]; // Remove query params
             // Decodifica componentes da URI que podem estar codificados (ex: %20 para espaço)
            return decodeURIComponent(nomeArquivo);
        }
        return null;
    } catch (e) {
        console.error("Erro ao extrair nome do arquivo da URL:", url, e);
        return null;
    }
}
