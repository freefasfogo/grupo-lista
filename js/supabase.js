// Configuração do Supabase - NÃO declare supabase aqui!
const SUPABASE_URL = 'https://nhbctpgmzrnrfulkuhgf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-oGF3MZ-AT3C04L7b2m-OA_PZyi4BSx';

// Funções do banco de dados - Use window.supabase diretamente
const db = {
    // Obter grupos com filtros
    async getGroups(filters = {}) {
        if (!window.supabase) {
            console.error('Supabase não disponível');
            return [];
        }
        
        try {
            let query = window.supabase
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
        if (!window.supabase) {
            console.error('Supabase não disponível');
            return null;
        }
        
        try {
            const { data, error } = await window.supabase
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
        if (!window.supabase) {
            console.error('Supabase não disponível');
            return null;
        }
        
        try {
            const { data, error } = await window.supabase
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
    
    // Obter categorias
    async getCategories() {
        if (!window.supabase) {
            console.error('Supabase não disponível');
            return [];
        }
        
        try {
            const { data, error } = await window.supabase
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
        if (!window.supabase) {
            console.error('Supabase não disponível');
            return null;
        }
        
        try {
            const { data, error } = await window.supabase
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
if (window.supabase) {
    console.log('Testando conexão Supabase...');
    window.supabase.from('categories').select('*').limit(1)
        .then(result => {
            if (result.error) {
                console.error('Erro na conexão:', result.error.message);
            } else {
                console.log('✅ Conexão Supabase OK');
                console.log('Auth disponível:', !!window.supabase.auth);
            }
        });
} else {
    console.warn('Supabase não disponível para teste');
}
