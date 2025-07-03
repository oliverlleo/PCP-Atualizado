// js/processamento-arquivos.js

/**
 * Processa um arquivo Excel e salva seus itens na tabela 'projeto_itens' do Supabase.
 * @param {File} file - O arquivo Excel a ser processado.
 * @param {string} projetoId - O ID do projeto ao qual esses itens pertencem.
 * @returns {Promise<void>} - Uma promessa que resolve quando o processamento e salvamento são concluídos, ou rejeita em caso de erro.
 */
async function processarEsalvarItensDeArquivo(file, projetoId) {
    return new Promise((resolve, reject) => {
        if (!file) {
            return reject(new Error("Nenhum arquivo fornecido para processamento."));
        }
        if (!projetoId) {
            return reject(new Error("ID do Projeto não fornecido para associar os itens."));
        }
        if (typeof XLSX === 'undefined') {
            return reject(new Error("A biblioteca SheetJS (XLSX) não está carregada. Verifique o HTML."));
        }
        if (!window.supabaseClient) {
            return reject(new Error("Cliente Supabase não inicializado."));
        }

        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                if (!firstSheetName) {
                    console.warn("Nenhuma planilha encontrada no arquivo Excel:", file.name);
                    return resolve(); // Resolve, pois não há o que processar.
                }
                const worksheet = workbook.Sheets[firstSheetName];

                // Converte a planilha para JSON. header:1 cria um array de arrays.
                // range: "A11:J500" significa que estamos pegando da linha 11 até a linha 500, colunas A até J.
                const json_data = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: "A11:J500", defval: null });

                if (json_data.length === 0) {
                    console.log("Nenhum item encontrado no arquivo (range A11:J500) para processar:", file.name);
                    resolve();
                    return;
                }

                // Mapeia o JSON para o formato da tabela 'projeto_itens'
                // Colunas: pos, qtd, perfil, descricao, comp, larg, peso_unit, peso_total, area_pintura
                // Indices:   0,   1,     2,         3,    4,    5,         6,          7,            8
                const itensParaSalvar = json_data.map(row => ({
                    projeto_id: projetoId, // Link para o projeto pai
                    pos: row[0] !== null && row[0] !== undefined ? String(row[0]).trim() : null,
                    qtd: row[1] !== null && row[1] !== undefined ? String(row[1]).trim() : null,
                    perfil: row[2] !== null && row[2] !== undefined ? String(row[2]).trim() : null,
                    descricao: row[3] !== null && row[3] !== undefined ? String(row[3]).trim() : null,
                    comp: row[4] !== null && row[4] !== undefined ? String(row[4]).trim() : null,
                    larg: row[5] !== null && row[5] !== undefined ? String(row[5]).trim() : null,
                    peso_unit: row[6] !== null && row[6] !== undefined ? String(row[6]).trim() : null,
                    peso_total: row[7] !== null && row[7] !== undefined ? String(row[7]).trim() : null,
                    area_pintura: row[8] !== null && row[8] !== undefined ? String(row[8]).trim() : null,
                })).filter(item => item.pos && item.qtd && item.perfil); // Filtra linhas onde campos chave são nulos ou vazios

                if (itensParaSalvar.length === 0) {
                    console.log("Itens filtrados (pos, qtd, perfil obrigatórios) resultaram em uma lista vazia para o arquivo:", file.name);
                    resolve();
                    return;
                }

                // Salva os itens em lote no Supabase
                const { error } = await window.supabaseClient
                    .from('projeto_itens')
                    .insert(itensParaSalvar);

                if (error) {
                    console.error(`Erro ao salvar itens no Supabase para o arquivo ${file.name}:`, error);
                    throw new Error(`Erro ao salvar itens no Supabase: ${error.message}`);
                }

                console.log(`${itensParaSalvar.length} itens do arquivo ${file.name} salvos para o projeto ${projetoId}`);
                resolve();

            } catch (err) {
                console.error(`Erro durante o processamento do arquivo ${file.name}:`, err);
                reject(err);
            }
        };

        reader.onerror = (error) => {
            console.error(`Erro ao ler o arquivo ${file.name} com FileReader:`, error);
            reject(error);
        };
        reader.readAsArrayBuffer(file); // SheetJS/XLSX precisa de ArrayBuffer
    });
}

// Tornar a função acessível globalmente se chamada diretamente de outros scripts ou HTML,
// embora no fluxo atual ela seja chamada por salvarCadastro.js
if (typeof window !== 'undefined') {
    window.processarEsalvarItensDeArquivo = processarEsalvarItensDeArquivo;
}
