// ATENÇÃO: Já está carregado pelo CDN, não declare novamente!
// const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Configuração do Supabase
const SUPABASE_URL = 'https://nhbctpgmzrnrfulkuhgf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-oGF3MZ-AT3C04L7b2m-OA_PZyi4BSx';

// Se já existe globalmente, use; se não, crie
const supabase = window.supabase || window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Funções do banco de dados
const db = {
    // Obter grupos com filtros
    async getGroups(filters = {}) {
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
    },
    
    // Obter grupo por ID
    async getGroupById(id) {
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
    },
    
    // Criar novo grupo
    async createGroup(groupData) {
        const { data, error } = await supabase
            .from('groups')
            .insert([groupData])
            .select();
        
        if (error) {
            console.error('Erro ao criar grupo:', error);
            return null;
        }
        
        return data[0];
    },
    
    // Atualizar grupo
    async updateGroup(id, groupData) {
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
    },
    
    // Excluir grupo
    async deleteGroup(id) {
        const { error } = await supabase
            .from('groups')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Erro ao excluir grupo:', error);
            return false;
        }
        
        return true;
    },
    
    // Incrementar visualizações
    async incrementViews(id) {
        const { error } = await supabase.rpc('increment_views', { group_id: id });
        
        if (error) {
            console.error('Erro ao incrementar visualizações:', error);
            return false;
        }
        
        return true;
    },
    
    // Obter categorias
    async getCategories() {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');
        
        if (error) {
            console.error('Erro ao buscar categorias:', error);
            return [];
        }
        
        return data;
    },
    
    // Obter perfil do usuário
    async getUserProfile(userId) {
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
    },
    
    // Atualizar perfil do usuário
    async updateUserProfile(userId, profileData) {
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
    }
};

// Exportar para uso global
window.db = db;

// Testar conexão
supabase.from('categories').select('*').then(result => {
    if (result.error) {
        console.error('Erro na conexão com Supabase:', result.error);
    } else {
        console.log('Conexão com Supabase OK');
    }
});
