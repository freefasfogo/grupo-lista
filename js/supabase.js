// Configuração do Supabase
const SUPABASE_URL = 'https://nhbctpgmzrnrfulkuhgf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-oGF3MZ-AT3C04L7b2m-OA_PZyi4BSx';

// Solução: Criar nosso próprio cliente Supabase independente do CDN
console.log('Inicializando Supabase cliente...');

// Criar cliente Supabase manualmente
const createSupabaseClient = () => {
    try {
        // Verificar se a biblioteca Supabase está disponível globalmente
        if (window.supabase && window.supabase.createClient) {
            console.log('Usando Supabase do CDN');
            return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } else {
            console.error('Supabase JS não carregado pelo CDN');
            return null;
        }
    } catch (error) {
        console.error('Erro ao criar cliente Supabase:', error);
        return null;
    }
};

// Criar o cliente
const supabase = createSupabaseClient();

if (!supabase) {
    console.error('FALHA: Não foi possível criar cliente Supabase');
    
    // Tentar carregar dinamicamente
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    script.onload = () => {
        console.log('Supabase carregado dinamicamente');
        window.location.reload(); // Recarregar página
    };
    script.onerror = () => {
        console.error('Falha ao carregar Supabase dinamicamente');
    };
    document.head.appendChild(script);
}

// Funções do banco de dados (só executa se supabase existir)
const db = {
    // Verificar se supabase está disponível
    _checkSupabase() {
        if (!supabase) {
            console.error('Supabase não disponível');
            return false;
        }
        return true;
    },
    
    // Obter grupos com filtros
    async getGroups(filters = {}) {
        if (!this._checkSupabase()) return [];
        
        try {
            let query = supabase
                .from('groups')
                .select('*, categories(name)')
                .eq('status', 'approved');
            
            if (filters.search) {
                query = query.ilike('name', `%${filters.search}%`);
            }
            
            if (filters.category) {
                query = query.eq('category', filters.category);
            }
            
            if (filters.platform) {
                query = query.eq('platform', filters.platform);
            }
            
            query = query.order('isVIP', { ascending: false })
                        .order('views', { ascending: false });
            
            const { data, error } = await query;
            
            if (error) {
                console.error('Erro ao buscar grupos:', error);
                return [];
            }
            
            return data;
        } catch (error) {
            console.error('Erro inesperado ao buscar grupos:', error);
            return [];
        }
    },
    
    // Obter grupo por ID
    async getGroupById(id) {
        if (!this._checkSupabase()) return null;
        
        try {
            const { data, error } = await supabase
                .from('groups')
                .select('*, categories(name)')
                .eq('id', id)
                .single();
            
            if (error) {
                console.error('Erro ao buscar grupo:', error);
                return null;
            }
            
            return data;
        } catch (error) {
            console.error('Erro inesperado ao buscar grupo:', error);
            return null;
        }
    },
    
    // Criar novo grupo
    async createGroup(groupData) {
        if (!this._checkSupabase()) return null;
        
        try {
            const { data, error } = await supabase
                .from('groups')
                .insert([groupData])
                .select();
            
            if (error) {
                console.error('Erro ao criar grupo:', error);
                return null;
            }
            
            return data[0];
        } catch (error) {
            console.error('Erro inesperado ao criar grupo:', error);
            return null;
        }
    },
    
    // Atualizar grupo
    async updateGroup(id, groupData) {
        if (!this._checkSupabase()) return null;
        
        try {
            const { data, error } = await supabase
                .from('groups')
                .update(groupData)
                .eq('id', id)
                .select();
            
            if (error) {
                console.error('Erro ao atualizar grupo:', error);
                return null;
            }
            
            return data[0];
        } catch (error) {
            console.error('Erro inesperado ao atualizar grupo:', error);
            return null;
        }
    },
    
    // Excluir grupo
    async deleteGroup(id) {
        if (!this._checkSupabase()) return false;
        
        try {
            const { error } = await supabase
                .from('groups')
                .delete()
                .eq('id', id);
            
            if (error) {
                console.error('Erro ao excluir grupo:', error);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Erro inesperado ao excluir grupo:', error);
            return false;
        }
    },
    
    // Incrementar visualizações
    async incrementViews(id) {
        if (!this._checkSupabase()) return false;
        
        try {
            const { error } = await supabase.rpc('increment_views', { group_id: id });
            
            if (error) {
                console.error('Erro ao incrementar visualizações:', error);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Erro inesperado ao incrementar views:', error);
            return false;
        }
    },
    
    // Obter categorias
    async getCategories() {
        if (!this._checkSupabase()) return [];
        
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');
            
            if (error) {
                console.error('Erro ao buscar categorias:', error);
                return [];
            }
            
            return data;
        } catch (error) {
            console.error('Erro inesperado ao buscar categorias:', error);
            return [];
        }
    },
    
    // Obter perfil do usuário
    async getUserProfile(userId) {
        if (!this._checkSupabase()) return null;
        
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (error) {
                console.error('Erro ao buscar perfil do usuário:', error);
                return null;
            }
            
            return data;
        } catch (error) {
            console.error('Erro inesperado ao buscar perfil:', error);
            return null;
        }
    }
};

// Exportar para uso global
window.db = db;

// Testar conexão
if (supabase) {
    console.log('Testando conexão Supabase...');
    supabase.from('categories').select('*').limit(1)
        .then(result => {
            if (result.error) {
                console.error('Erro na conexão:', result.error.message);
            } else {
                console.log('✅ Conexão Supabase estabelecida');
            }
        })
        .catch(error => {
            console.error('Erro ao testar conexão:', error);
        });
} else {
    console.warn('Supabase não disponível para teste');
}
