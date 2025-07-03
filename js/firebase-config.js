// Exemplo de como deve ficar o firebase-config.js
const supabaseUrl = 'https://mdfvydmnanrmscnblfwz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZnZ5ZG1uYW5ybXNjbmJsZnd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NjYyOTYsImV4cCI6MjA2NzE0MjI5Nn0.4YEdVO1ah1-JuyXTWQRyNnH4sM-hMLLrEiHhSQxc0AA';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

window.supabase = supabase; // Exporta o cliente globalmente

// Opcional: Teste de conexão para verificar se o Supabase foi inicializado corretamente
if (window.supabase) {
  console.log('Supabase client inicializado e exportado globalmente como window.supabase');
  // Você pode adicionar um teste de select simples aqui se desejar, por exemplo:
  /*
  window.supabase.from('clientes').select('id', { count: 'exact', head: true })
    .then(({ count, error }) => {
      if (error) {
        console.error('Erro no teste de conexão com Supabase:', error);
      } else {
        console.log('Conexão com Supabase bem-sucedida. Número de clientes (teste):', count);
      }
    })
    .catch(error => {
        console.error('Falha ao tentar teste de conexão com Supabase:', error);
    });
  */
} else {
  console.error('Falha ao inicializar o Supabase client.');
  // Adicionar lógica para notificar o usuário ou tratar o erro, se necessário
  if (typeof mostrarNotificacao === 'function') {
    mostrarNotificacao('Erro crítico ao inicializar o banco de dados. Funcionalidades podem estar indisponíveis.', 'danger', 10000);
  } else {
    alert('Erro crítico ao inicializar o banco de dados. Por favor, recarregue a página ou contate o suporte.');
  }
}
