// Configuração do Supabase
const SUPABASE_URL = 'https://nhbctpgmzrnrfulkuhgf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-oGF3MZ-AT3C04L7b2m-OA_PZyi4BSx';

// Não declare supabase novamente, use o que já vem do CDN
// Se o CDN não carregou, então criamos
if (typeof supabase === 'undefined') {
    console.log('Criando cliente Supabase...');
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.log('Supabase já carregado pelo CDN');
}

// Verificar se auth está disponível
if (!supabase.auth) {
    console.error('Supabase auth não está disponível!');
}

// Funções do banco de dados
const db = {
    // Obter grupos com filtros
    async getGroups(filters = {}) {
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
    },
    
    // Atualizar perfil do usuário
    async updateUserProfile(userId, profileData) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update(profileData)
                .eq('id', userId)
                .select();
            
            if (error) {
                console.error('Erro ao atualizar perfil do usuário:', error);
                return null;
            }
            
            return data[0];
        } catch (error) {
            console.error('Erro inesperado ao atualizar perfil:', error);
            return null;
        }
    }
};

// Exportar para uso global
window.db = db;

// Testar conexão
console.log('Testando conexão Supabase...');
supabase.from('categories').select('*').then(result => {
    if (result.error) {
        console.error('Erro na conexão com Supabase:', result.error);
    } else {
        console.log('✅ Conexão com Supabase OK');
        console.log('Auth disponível:', !!supabase.auth);
    }
}).catch(error => {
    console.error('Erro ao testar conexão:', error);
});
