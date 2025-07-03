/**
 * supabase-config.js
 * Configuração do Supabase para o Sistema de Controle de Compras e Recebimento
 * Este arquivo é responsável por inicializar a conexão com o Supabase
 * Migrado de Firebase para Supabase mantendo compatibilidade com código existente
 */

console.log('supabase-config.js carregado');

// Configuração do Supabase
const supabaseConfig = {
  url: 'https://mdfvydmnanrmscnblfwz.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZnZ5ZG1uYW5ybXNjbmJsZnd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NjYyOTYsImV4cCI6MjA2NzE0MjI5Nn0.4YEdVO1ah1-JuyXTWQRyNnH4sM-hMLLrEiHhSQxc0AA'
};

try {
  console.log('Inicializando Supabase...');
  console.log('Verificando disponibilidade da biblioteca Supabase...');
  console.log('window.supabase:', typeof window.supabase);
  console.log('window.Supabase:', typeof window.Supabase);
  console.log('supabase (global):', typeof supabase);
  
  // Aguardar um momento para garantir que a biblioteca carregou
  setTimeout(() => {
    try {
      // Detectar a forma correta de acessar o Supabase
      let supabaseLib;
      if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        supabaseLib = window.supabase;
        console.log('Usando window.supabase');
      } else if (typeof supabase !== 'undefined' && supabase.createClient) {
        supabaseLib = supabase;
        console.log('Usando supabase global');
      } else if (typeof window.Supabase !== 'undefined' && window.Supabase.createClient) {
        supabaseLib = window.Supabase;
        console.log('Usando window.Supabase');
      } else {
        throw new Error('Supabase library not found or createClient method not available');
      }
      
      // Inicializar o Supabase client
      const supabaseClient = supabaseLib.createClient(supabaseConfig.url, supabaseConfig.anonKey);
      console.log('Supabase inicializado com sucesso');
      
      // Continuar com o resto da configuração...
      inicializarSupabaseAdapter(supabaseClient);
      
    } catch (delayedError) {
      console.error('Erro ao inicializar Supabase (tentativa com delay):', delayedError);
      mostrarErroSupabase(delayedError);
    }
  }, 100); // Aguarda 100ms para a biblioteca carregar
  
} catch (error) {
  console.error('Erro crítico ao inicializar Supabase:', error);
  mostrarErroSupabase(error);
}

function inicializarSupabaseAdapter(supabaseClient) {
  // Criar adaptadores para manter compatibilidade com código Firebase existente
  class SupabaseAdapter {
    constructor(client, tableName) {
      this.client = client;
      this.tableName = tableName;
    }

    // Adaptar .once('value') do Firebase para Supabase
    async once(eventType = 'value') {
      try {
        const { data, error } = await this.client
          .from(this.tableName)
          .select('*');
        
        if (error) {
          console.error(`Erro ao buscar dados de ${this.tableName}:`, error);
          throw error;
        }

        // Simular snapshot do Firebase
        return {
          exists: () => data && data.length > 0,
          val: () => {
            if (!data || data.length === 0) return null;
            // Converter array para objeto com keys como Firebase
            const result = {};
            data.forEach(item => {
              result[item.id || item.key] = item;
            });
            return result;
          }
        };
      } catch (error) {
        console.error(`Erro na consulta ${this.tableName}:`, error);
        throw error;
      }
    }

    // Adaptar .on('value') do Firebase para Supabase (com realtime)
    on(eventType, callback) {
      if (eventType === 'value') {
        // Configurar subscription realtime
        const subscription = this.client
          .channel(`${this.tableName}_changes`)
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: this.tableName },
            (payload) => {
              console.log(`Mudança detectada em ${this.tableName}:`, payload);
              // Buscar dados atualizados e chamar callback
              this.once('value').then(callback).catch(console.error);
            }
          )
          .subscribe();

        // Buscar dados iniciais
        this.once('value').then(callback).catch(console.error);
        
        return subscription;
      }
    }

    // Adaptar .push() do Firebase para Supabase
    async push(data) {
      try {
        const { data: result, error } = await this.client
          .from(this.tableName)
          .insert([data])
          .select();
        
        if (error) {
          console.error(`Erro ao inserir em ${this.tableName}:`, error);
          throw error;
        }
        
        return {
          key: result[0].id,
          ref: this
        };
      } catch (error) {
        console.error(`Erro no push para ${this.tableName}:`, error);
        throw error;
      }
    }

    // Adaptar .set() do Firebase para Supabase
    async set(data) {
      try {
        const { error } = await this.client
          .from(this.tableName)
          .upsert([data]);
        
        if (error) {
          console.error(`Erro ao definir dados em ${this.tableName}:`, error);
          throw error;
        }
        
        return true;
      } catch (error) {
        console.error(`Erro no set para ${this.tableName}:`, error);
        throw error;
      }
    }

    // Adaptar .update() do Firebase para Supabase
    async update(id, data) {
      try {
        const { error } = await this.client
          .from(this.tableName)
          .update(data)
          .eq('id', id);
        
        if (error) {
          console.error(`Erro ao atualizar ${this.tableName}:`, error);
          throw error;
        }
        
        return true;
      } catch (error) {
        console.error(`Erro no update para ${this.tableName}:`, error);
        throw error;
      }
    }

    // Adaptar .remove() do Firebase para Supabase
    async remove(id) {
      try {
        const { error } = await this.client
          .from(this.tableName)
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error(`Erro ao remover de ${this.tableName}:`, error);
          throw error;
        }
        
        return true;
      } catch (error) {
        console.error(`Erro no remove para ${this.tableName}:`, error);
        throw error;
      }
    }

    // Adaptar .child() do Firebase para Supabase
    child(path) {
      return new SupabaseAdapter(this.client, `${this.tableName}_${path}`);
    }

    // Adaptar operações específicas para o sistema de recebimento
    async updateItem(clienteId, tipoProjeto, nomeLista, itemKey, updates) {
      try {
        // Para Supabase, vamos usar uma estrutura de dados diferente
        // mas mantendo compatibilidade com o código existente
        const { error } = await this.client
          .from('projeto_items')
          .update(updates)
          .eq('cliente_id', clienteId)
          .eq('tipo_projeto', tipoProjeto)
          .eq('nome_lista', nomeLista)
          .eq('item_key', itemKey);
        
        if (error) {
          console.error('Erro ao atualizar item:', error);
          throw error;
        }
        
        return true;
      } catch (error) {
        console.error('Erro no updateItem:', error);
        throw error;
      }
    }

    // Adaptar histórico de recebimentos
    async addHistorico(clienteId, tipoProjeto, nomeLista, itemKey, historicoData) {
      try {
        const historicoEntry = {
          cliente_id: clienteId,
          tipo_projeto: tipoProjeto,
          nome_lista: nomeLista,
          item_key: itemKey,
          ...historicoData,
          timestamp: new Date().toISOString()
        };

        const { error } = await this.client
          .from('historico_recebimentos')
          .insert([historicoEntry]);
        
        if (error) {
          console.error('Erro ao adicionar histórico:', error);
          throw error;
        }
        
        return true;
      } catch (error) {
        console.error('Erro no addHistorico:', error);
        throw error;
      }
    }
  }

  // Exportar as referências para uso em outros arquivos, mantendo compatibilidade
  window.supabaseClient = supabaseClient;
  window.dbRef = {
    clientes: new SupabaseAdapter(supabaseClient, 'clientes'),
    projetos: new SupabaseAdapter(supabaseClient, 'projetos'),
    compras: new SupabaseAdapter(supabaseClient, 'compras'),
    empenhos: new SupabaseAdapter(supabaseClient, 'empenhos'),
    recebimentos: new SupabaseAdapter(supabaseClient, 'recebimentos'),
    usuarios: new SupabaseAdapter(supabaseClient, 'usuarios')
  };
  
  console.log('window.dbRef criado e disponível globalmente:', window.dbRef);

  // Teste de conexão
  supabaseClient.from('clientes').select('count', { count: 'exact', head: true })
    .then(({ count, error }) => {
      if (error) {
        console.error('Erro no teste de conexão:', error);
      } else {
        console.log('Conectado ao Supabase com sucesso. Clientes encontrados:', count);
      }
    });
}

function mostrarErroSupabase(error) {
  // Tentar mostrar uma notificação mais robusta se global.js já estiver carregado
  if (typeof mostrarNotificacao === 'function') {
    mostrarNotificacao('Erro crítico ao conectar ao banco de dados. Recarregue a página.', 'danger', 10000);
  } else {
    alert('Erro crítico ao conectar ao banco de dados. Por favor, recarregue a página.');
  }
}