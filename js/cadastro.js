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
  document
    .getElementById("btnNovoCadastro")
    .addEventListener("click", function () {
      // Limpa o formulário antes de abrir o modal
      document.getElementById("formCadastro").reset();

      // Oculta todas as áreas de projeto
      document.querySelectorAll(".area-projeto").forEach((area) => {
        area.classList.add("d-none");
      });

      // Remove o ID do cliente do modal (para indicar que é um novo cadastro)
      document.getElementById("modalCadastro").dataset.clienteId = "";

      // Atualiza o título do modal
      document.getElementById("modalCadastroLabel").textContent =
        "Novo Cadastro";

      // Atualiza o texto do botão
      document.getElementById("btnSalvarCadastro").textContent = "Salvar";

      // Exibe o modal
      const modalCadastro = new bootstrap.Modal(
        document.getElementById("modalCadastro")
      );
      modalCadastro.show();
    });

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
  // Verifica se supabase está disponível
  if (typeof window.supabase === 'undefined' || !window.supabase) {
    console.error('Supabase não está disponível ainda. Aguardando...');
    // Opcional: tentar novamente após um tempo ou mostrar notificação persistente
    // setTimeout(carregarClientes, 500);
    return;
  }

  const tabelaClientes = document.getElementById("tabelaClientes");
  const nenhumCliente = document.getElementById("nenhumCliente");
  const filtroClienteSelect = document.getElementById("filtroCliente");

  // Limpa a tabela e o select de filtro
  tabelaClientes.innerHTML = "";
  filtroClienteSelect.innerHTML = '<option value="">Todos os clientes</option>'; // Mantém a opção padrão

  try {
    const { data: clientes, error } = await window.supabase
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
  console.log("=== INÍCIO DA FUNÇÃO EDITAR CLIENTE (SUPABASE) ===");
  console.log("Editando cliente com ID:", clienteId);

  if (!window.supabase) {
    console.error("ERRO CRÍTICO: Supabase client (window.supabase) não está definido!");
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
    const { data: cliente, error: clienteError } = await window.supabase
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
    if (cliente.prazoEntrega) {
      document.getElementById("dataPrazoEntrega").value = formatarDataParaInput(cliente.prazoEntrega);
    }
     if (cliente.projetoOutrosNome) {
        const nomeProjetoOutrosInput = document.getElementById("nomeProjetoOutros");
        if (nomeProjetoOutrosInput) nomeProjetoOutrosInput.value = cliente.projetoOutrosNome;
    }


    // 2. Buscar os projetos associados a esse cliente
    const { data: projetos, error: projetosError } = await window.supabase
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
  // Referência ao formulário
  const form = document.getElementById("formCadastro");

  // Valida o formulário
  if (!validarFormulario(form)) {
    mostrarNotificacao("Preencha todos os campos obrigatórios.", "warning");
    return;
  }

  // Validação específica para o tipo de projeto "Outros"
  if (document.getElementById("tipoOutros").checked) {
    const nomeProjetoOutrosInput = document.getElementById("nomeProjetoOutros");
    if (nomeProjetoOutrosInput && !nomeProjetoOutrosInput.value.trim()) {
      mostrarNotificacao("Informe o nome do projeto personalizado para 'Outros'.", "warning");
      return;
    }
  }

  // Obtém os valores do formulário
  const nomeCliente = document.getElementById("cliente").value;
  const prazoEntregaInput = document.getElementById("dataPrazoEntrega").value;

  // Converte a data para o formato ISO YYYY-MM-DD ou timestamp, dependendo do BD
  let prazoEntregaFormatado = null;
  if (prazoEntregaInput) {
    const dataParts = prazoEntregaInput.split("/");
    if (dataParts.length === 3) {
      prazoEntregaFormatado = new Date(
        parseInt(dataParts[2]),
        parseInt(dataParts[1]) - 1, // Mês é 0-indexed
        parseInt(dataParts[0])
      ).toISOString();
    }
  }

  // Verifica se é uma edição ou um novo cadastro
  const clienteIdModal = document.getElementById("modalCadastro").dataset.clienteId;
  const isEditing = !!clienteIdModal;
  const clienteId = clienteIdModal || gerarId(); // Supabase pode gerar ID se não fornecido em insert

  // Prepara os dados do cliente
  const clienteData = {
    nome: nomeCliente,
    prazoEntrega: prazoEntregaFormatado,
    ultimaAtualizacao: new Date().toISOString(),
  };

  if (isEditing) {
    clienteData.id = clienteId; // Necessário para upsert identificar o registro a ser atualizado
  } else {
    clienteData.dataCriacao = new Date().toISOString();
    clienteData.StatusCadastro = "Não iniciado"; // Status inicial para novos clientes
    // Se o seu BD gera o ID, não precisa incluir clienteData.id aqui para inserts
  }

  // Captura informações do projeto personalizado (Outros)
  let nomeProjetoOutros = "";
  if (document.getElementById("tipoOutros").checked) {
    const nomeProjetoOutrosInput = document.getElementById("nomeProjetoOutros");
    if (nomeProjetoOutrosInput) nomeProjetoOutros = nomeProjetoOutrosInput.value.trim();
    if (nomeProjetoOutros) {
        clienteData.projetoOutrosNome = nomeProjetoOutros; // Adiciona ao clienteData se relevante
    }
  }


  const tiposProjetoSelecionados = [];
  document.querySelectorAll(".tipo-projeto:checked").forEach((checkbox) => {
    tiposProjetoSelecionados.push(checkbox.value); // ex: "PVC", "Aluminio"
  });

  if (tiposProjetoSelecionados.length === 0) {
    mostrarNotificacao("Selecione pelo menos um tipo de projeto.", "warning");
    return;
  }

  // Função auxiliar para upload de arquivos
  async function uploadArquivo(arquivo, caminho) {
    if (!arquivo) return null;
    try {
      const { data, error } = await window.supabase.storage
        .from('listas-materiais') // Nome do seu bucket de storage
        .upload(caminho, arquivo, {
          cacheControl: '3600',
          upsert: true // Sobrescreve se já existir um arquivo com o mesmo nome/caminho
        });

      if (error) {
        console.error('Erro no upload do arquivo:', caminho, error);
        throw error;
      }

      // Obter a URL pública do arquivo
      const { data: publicUrlData } = window.supabase.storage
        .from('listas-materiais')
        .getPublicUrl(data.path);

      if (!publicUrlData || !publicUrlData.publicUrl) {
          console.error("Não foi possível obter a URL pública para:", data.path);
          return null; // Ou uma URL padrão / indicativo de erro
      }
      return publicUrlData.publicUrl;

    } catch (uploadError) {
      console.error(`Falha ao fazer upload de ${caminho}:`, uploadError);
      mostrarNotificacao(`Erro ao fazer upload do arquivo ${arquivo.name}.`, "danger");
      return null; // Retorna null para indicar falha no upload específico
    }
  }


  try {
    // 1. Salvar/Atualizar dados do cliente
    const { data: clienteSalvo, error: clienteError } = await window.supabase
      .from('clientes')
      .upsert(clienteData)
      .select() // Para retornar o registro salvo/atualizado, incluindo o ID gerado se for novo
      .single(); // Assumindo que upsert de um único item retorna um único resultado ou erro

    if (clienteError) {
      console.error("Erro ao salvar cliente:", clienteError);
      mostrarNotificacao(`Erro ao salvar dados do cliente: ${clienteError.message}`, "danger");
      return;
    }

    const effectiveClienteId = clienteSalvo.id; // ID definitivo do cliente (novo ou existente)

    // 2. Processar e salvar dados de cada tipo de projeto selecionado
    for (const tipo of tiposProjetoSelecionados) {
      const projetoData = {
        cliente_id: effectiveClienteId, // Chave estrangeira para o cliente
        tipo_projeto: tipo, // Ex: "PVC", "Aluminio"
        terceirizado: false,
        // Inicializa campos que podem ou não ser preenchidos
        empresa_terceirizada: null,
        data_solicitacao_terceirizada: null,
        prazo_entrega_terceirizada: null,
        // URLs dos arquivos de lista, inicializadas como null
        url_lista_chaves: null,
        // Adicione mais campos de URL de lista conforme necessário para cada tipo
        // Ex: url_lista_pvc: null, url_lista_perfil: null, etc.
      };

      const checkboxTerceirizado = document.getElementById(`${tipo.toLowerCase()}Terceirizado`);
      if (checkboxTerceirizado && checkboxTerceirizado.checked) {
        projetoData.terceirizado = true;
        projetoData.empresa_terceirizada = document.getElementById(`empresa${tipo}`)?.value || null;

        const dataSolicitacaoInput = document.getElementById(`dataSolicitacao${tipo}`)?.value;
        if (dataSolicitacaoInput) {
            const dsParts = dataSolicitacaoInput.split('/');
            projetoData.data_solicitacao_terceirizada = new Date(parseInt(dsParts[2]), parseInt(dsParts[1]) - 1, parseInt(dsParts[0])).toISOString();
        }

        const prazoEntregaTerceirizadoInput = document.getElementById(`prazoEntrega${tipo}`)?.value;
        if (prazoEntregaTerceirizadoInput) {
            const petParts = prazoEntregaTerceirizadoInput.split('/');
            projetoData.prazo_entrega_terceirizada = new Date(parseInt(petParts[2]), parseInt(petParts[1]) - 1, parseInt(petParts[0])).toISOString();
        }
        // Upload da lista de chaves para terceirizado
        const inputChavesTerceirizado = document.getElementById(`listaChaves${tipo}Terceirizado`);
        if (inputChavesTerceirizado && inputChavesTerceirizado.files.length > 0) {
            const arquivo = inputChavesTerceirizado.files[0];
            const caminho = `clientes/${effectiveClienteId}/${tipo}/terceirizado/LChaves_${arquivo.name}`;
            projetoData.url_lista_chaves = await uploadArquivo(arquivo, caminho);
        }

      } else { // Não terceirizado - produção própria
        // Definir quais listas são aplicáveis para este tipo de projeto (não terceirizado)
        let listasParaUpload = [];
        switch (tipo) {
            case "PVC":
                listasParaUpload = [
                    { idInput: "listaChavesPVC", nomeListaSupabase: "url_lista_chaves", nomeOriginal: "LChaves" },
                    { idInput: "listaPVC", nomeListaSupabase: "url_lista_pvc", nomeOriginal: "LPVC" },
                    // ... outras listas para PVC
                ];
                break;
            case "Aluminio":
                 listasParaUpload = [
                    { idInput: "listaChavesAluminio", nomeListaSupabase: "url_lista_chaves", nomeOriginal: "LChaves" },
                    { idInput: "listaPerfil", nomeListaSupabase: "url_lista_perfil", nomeOriginal: "LPerfil" },
                    // ... outras listas para Aluminio
                ];
                break;
            // ... outros casos para Brise, ACM, Trilho
            case "Outros":
                listasParaUpload = [ { idInput: "listaChavesOutros", nomeListaSupabase: "url_lista_chaves", nomeOriginal: "LChaves" } ];
                // Lógica para listas personalizadas do tipo "Outros"
                const listasContainer = document.getElementById("listasPersonalizadasContainer");
                if (listasContainer) {
                    const listasItems = listasContainer.querySelectorAll(".lista-personalizada");
                    listasItems.forEach((item, index) => {
                        const nomeListaInput = item.querySelector(".nome-lista-personalizada");
                        const arquivoListaInput = item.querySelector(".arquivo-lista-personalizada");
                        if (nomeListaInput && nomeListaInput.value.trim() && arquivoListaInput && arquivoListaInput.files.length > 0) {
                            const nomeListaSanitizado = nomeListaInput.value.trim().replace(/\s+/g, '_');
                            // Adiciona à estrutura de upload, garantindo nome de campo único no Supabase
                            // Você precisará de uma forma de mapear isso para colunas no Supabase,
                            // ou armazenar como JSON se for um número variável de listas.
                            // Exemplo: assumindo colunas como url_lista_outro_1, url_lista_outro_2, etc.
                            // Ou, um campo JSON `custom_lists: [{name: "nome", url: "url"}, ...]`
                            listasParaUpload.push({
                                idInput: `arquivoListaPersonalizada_${index}`, // Precisa de um ID único para o input se não tiver
                                fileObject: arquivoListaInput.files[0], // Passa o objeto do arquivo diretamente
                                nomeListaSupabase: `url_lista_outro_${nomeListaSanitizado}`, // Ou lógica de JSON
                                nomeOriginal: `L${nomeListaSanitizado}`
                            });
                        }
                    });
                }
                break;
        }

        for (const lista of listasParaUpload) {
            let arquivo;
            if (lista.fileObject) { // Para listas personalizadas "Outros"
                arquivo = lista.fileObject;
            } else { // Para listas padrão
                const inputFile = document.getElementById(lista.idInput);
                if (inputFile && inputFile.files.length > 0) {
                    arquivo = inputFile.files[0];
                }
            }

            if (arquivo) {
                const caminho = `clientes/${effectiveClienteId}/${tipo}/producao/${lista.nomeOriginal}_${arquivo.name}`;
                const urlArquivo = await uploadArquivo(arquivo, caminho);
                if (urlArquivo) {
                    projetoData[lista.nomeListaSupabase] = urlArquivo;
                }
            }
        }
      }

      // Verificar se já existe um projeto para este cliente e tipo
      // Se sim, obter o ID para fazer upsert corretamente no projeto
      // Isso é importante se um cliente pode ter múltiplos projetos do mesmo tipo ou se você quer apenas ATUALIZAR
      // Se a relação é 1 cliente para 1 projeto de cada tipo, o upsert com (cliente_id, tipo_projeto) como
      // identificadores únicos (constraint no BD) funcionaria bem.
      // Se não, você pode precisar buscar primeiro. Ex:
      // const { data: projetoExistente, error: errBusca } = await window.supabase
      //    .from('projetos')
      //    .select('id')
      //    .eq('cliente_id', effectiveClienteId)
      //    .eq('tipo_projeto', tipo)
      //    .maybeSingle();
      // if (projetoExistente) projetoData.id = projetoExistente.id;

      const { error: projetoError } = await window.supabase
        .from('projetos') // Sua tabela de projetos
        .upsert(projetoData);

      if (projetoError) {
        console.error(`Erro ao salvar projeto ${tipo}:`, projetoError);
        mostrarNotificacao(`Erro ao salvar projeto ${tipo}: ${projetoError.message}`, "danger");
        // Considerar se deve parar ou continuar com outros projetos
      }
    }

    // Se chegou aqui, tudo (ou a maior parte) foi salvo com sucesso
    mostrarNotificacao("Cliente e projetos salvos com sucesso!", "success");
    const modalCadastro = bootstrap.Modal.getInstance(document.getElementById("modalCadastro"));
    if (modalCadastro) modalCadastro.hide();

    if (typeof carregarClientes === "function") {
      carregarClientes(); // Recarrega a lista de clientes
    }
    document.getElementById("formCadastro").reset(); // Limpa o formulário
    document.getElementById("modalCadastro").dataset.clienteId = ""; // Limpa o ID do cliente do modal

  } catch (error) {
    console.error("Erro geral ao salvar cadastro:", error);
    mostrarNotificacao("Erro inesperado ao salvar cadastro. Tente novamente.", "danger");
  }
}

/**
 * Processa os arquivos de listas para cada tipo de projeto
 * * @param {string} clienteId - ID do cliente
 * @param {Array} tiposSelecionados - Tipos de projeto selecionados
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
