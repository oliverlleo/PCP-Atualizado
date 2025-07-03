# Sistema de Controle de Compras e Recebimento - YOUWARE

## Visão Geral

Sistema migrado do Firebase para Supabase, mantendo toda a funcionalidade original. O sistema gerencia cadastro de clientes, projetos, compras e recebimento de materiais.

## Configuração do Banco de Dados

### Supabase (Backend Principal)
- **Projeto**: SistemaCompras (ID: mdfvydmnanrmscnblfwz)
- **URL**: https://mdfvydmnanrmscnblfwz.supabase.co
- **Configuração**: `js/firebase-config.js` (mantido nome original por compatibilidade)

### Estrutura de Tabelas
- `clientes` - Cadastro de clientes e informações básicas
- `projetos` - Tipos de projeto associados aos clientes
- `projeto_listas` - Listas de materiais por projeto
- `projeto_items` - Itens individuais com status de compra/recebimento
- `historico_recebimentos` - Histórico completo de recebimentos
- `usuarios` - Sistema de usuários (futuro)

## Arquitetura do Sistema

### Compatibilidade Firebase
O sistema mantém compatibilidade com API Firebase através de adaptadores em `js/firebase-config.js`:
- `SupabaseAdapter` classe que simula interface Firebase
- `window.dbRef` objeto global mantido para compatibilidade
- Métodos `.once()`, `.on()`, `.push()`, `.set()`, `.update()`, `.remove()` adaptados

### Estrutura de Arquivos Críticos

#### Configuração (js/)
- `firebase-config.js` - Configuração Supabase e adaptadores de compatibilidade
- `global.js` - Funções utilitárias (sem dependências de banco)

#### Módulos Principais (js/)
- `cadastro.js` - Cadastro e edição de clientes/projetos
- `compras.js` - Gestão de compras e status de itens
- `recebimento.js` - Controle de recebimento de materiais
- `empenho.js` - Empenho de materiais
- `tratamento-dados.js` - Processamento de dados

#### Processamento (js/)
- `processamento-arquivos.js` - Upload e processamento de planilhas
- `processamento-arquivos-*.js` - Processamento específico por módulo
- `validacao-recebimento.js` - Validações específicas do recebimento

### Padrões de Desenvolvimento

#### Manipulação de Dados
- Sempre usar `window.dbRef` para operações de banco
- Manter estrutura de dados compatível com Firebase original
- IDs únicos gerados com `Date.now().toString(36) + Math.random().toString(36).substr(2, 9)`

#### Interface
- Bootstrap 5.3.0 para componentes e responsividade
- DataTables para tabelas complexas
- Flatpickr para seleção de datas
- Select2 para selects avançados

#### Notificações
- `mostrarNotificacao(mensagem, tipo, duracao)` função global
- Tipos: 'success', 'danger', 'warning', 'info'
- Toast notifications com Bootstrap

## Funcionalidades Principais

### Cadastro de Clientes
- Cadastro de clientes com projetos associados
- Tipos de projeto: PVC, Alumínio, Esquadrias, Outros
- Suporte a terceirização por projeto
- Upload de listas personalizadas

### Gestão de Compras
- Visualização de itens por cliente/projeto
- Seleção de itens para compra
- Controle de quantidade e fornecedores
- Atualização de prazos de entrega

### Controle de Recebimento
- Registro de recebimentos de materiais
- Histórico completo de recebimentos
- Cálculo automático de saldos
- Filtros avançados por data, cliente, status

### Processamento de Arquivos
- Upload de planilhas Excel/CSV
- Processamento automático de colunas
- Mapeamento inteligente de dados
- Validação e limpeza de dados

## Comandos de Desenvolvimento

### Estrutura de Desenvolvimento
```bash
# Navegação principal
index.html                 # Página inicial
pages/cadastro.html       # Cadastro de clientes
pages/compras.html        # Gestão de compras  
pages/recebimento.html    # Controle de recebimento
pages/empenho.html        # Empenho de materiais
pages/tratamento-dados.html # Processamento de dados
```

### Dependências CDN
- Bootstrap 5.3.0
- Font Awesome 6.4.0
- jQuery 3.6.0
- DataTables
- Flatpickr
- Select2
- Supabase JS 2.x

## Migração Firebase → Supabase

### Principais Adaptações
1. **Configuração**: Firebase SDK → Supabase Client
2. **Estrutura**: Realtime Database → PostgreSQL tables
3. **APIs**: Firebase methods → Supabase REST/GraphQL
4. **Compatibilidade**: Adaptadores mantêm interface original

### Preservação de Código
- ✅ HTML/CSS mantidos intactos
- ✅ Lógica de negócio preservada
- ✅ Validações e processamento inalterados
- ✅ Interface de usuário mantida
- ✅ Compatibilidade com código existente

### Sistema de Backup
- Estrutura original preservada em comentários
- Adaptadores permitem rollback se necessário
- Logs detalhados para depuração

## Considerações de Performance

### Otimizações Supabase
- Índices criados para consultas frequentes
- Relacionamentos otimizados
- Triggers para updated_at automático

### Frontend
- Lazy loading de dados grandes
- Filtros client-side para melhor UX
- Cache local quando apropriado

## Segurança

### Supabase RLS (Row Level Security)
- Pronto para implementação quando necessário
- Estrutura preparada para multi-tenant
- Controle granular de acesso

### Validação
- Validação client-side mantida
- Validação server-side via Supabase policies
- Sanitização de dados preservada