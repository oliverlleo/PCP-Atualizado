// js/firebase-config.js

// Suas credenciais do Supabase
const supabaseUrl = 'https://mdfvydmnanrmscnblfwz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZnZ5ZG1uYW5ybXNjbmJsZnd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NjYyOTYsImV4cCI6MjA2NzE0MjI5Nn0.4YEdVO1ah1-JuyXTWQRyNnH4sM-hMLLrEiHhSQxc0AA';

// O objeto 'supabase' já deve existir globalmente por causa do script do CDN.
// Aqui, apenas criamos o cliente e o colocamos em 'window' para fácil acesso.
try {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
        console.log("Cliente Supabase (window.supabaseClient) inicializado com sucesso.");

        // Opcional: Teste de conexão simples
        if (window.supabaseClient) {
            window.supabaseClient.from('clientes').select('id', { count: 'exact', head: true })
            .then(response => {
                if (response.error) {
                    console.error('Teste de conexão Supabase falhou (erro na query):', response.error);
                     if (typeof mostrarNotificacao === 'function') {
                        mostrarNotificacao(`Falha ao conectar ao banco de dados: ${response.error.message}. Algumas funcionalidades podem não estar disponíveis.`, 'warning', 10000);
                    }
                } else {
                    console.log('Teste de conexão Supabase bem-sucedido. Contagem de clientes (teste):', response.count);
                }
            })
            .catch(error => {
                 console.error('Teste de conexão Supabase falhou (exceção):', error);
                 if (typeof mostrarNotificacao === 'function') {
                    mostrarNotificacao(`Erro crítico ao testar conexão com banco de dados: ${error.message}.`, 'danger', 10000);
                }
            });
        }

    } else {
        console.error("A biblioteca do Supabase (window.supabase) não foi carregada ou 'createClient' não é uma função. Verifique a ordem dos scripts no seu HTML e a integridade do CDN do Supabase.");
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao("Erro fatal: Biblioteca do banco de dados não carregada. Recarregue a página ou contate o suporte.", 'danger', 0); // 0 para persistente
        } else {
            alert("Erro fatal: Biblioteca do banco de dados não carregada. Recarregue a página ou contate o suporte.");
        }
    }
} catch (e) {
    console.error("Erro ao inicializar o cliente Supabase em firebase-config.js:", e);
    if (typeof mostrarNotificacao === 'function') {
        mostrarNotificacao(`Erro crítico na configuração do banco de dados: ${e.message}. Recarregue a página.`, 'danger', 0);
    } else {
        alert(`Erro crítico na configuração do banco de dados: ${e.message}. Recarregue a página.`);
    }
}
