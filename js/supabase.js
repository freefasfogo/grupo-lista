// Configuração
const SUPABASE_URL = 'https://nhbctpgmzrnrfulkuhgf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-oGF3MZ-AT3C04L7b2m-OA_PZyi4BSx';

// Inicializar Supabase se necessário
function initSupabase() {
    // Se já existe um cliente, usar
    if (window.supabaseClient) {
        return window.supabaseClient;
    }
    
    // Se a biblioteca está carregada, criar cliente
    if (window.supabase && window.supabase.createClient) {
        console.log('Criando cliente Supabase...');
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return window.supabaseClient;
    }
    
    console.error('Biblioteca Supabase não carregada');
    return null;
}

// Inicializar agora
const supabaseClient = initSupabase();

// Funções do banco de dados
const db = {
    // Obter grupos com filtros
    async getGroups(filters = {}) {
        if (!supabaseClient) {
            console.error('Cliente Supabase não disponível');
            return [];
        }
        
        try {
            let query = supabaseClient
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
        if (!supabaseClient) {
            console.error('Cliente Supabase não disponível');
            return null;
        }
        
        try {
            const { data, error } = await supabaseClient
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
        if (!supabaseClient) {
            console.error('Cliente Supabase não disponível');
            return null;
        }
        
        try {
            const { data, error } = await supabaseClient
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
        if (!supabaseClient) {
            console.error('Cliente Supabase não disponível');
            return [];
        }
        
        try {
            const { data, error } = await supabaseClient
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
        if (!supabaseClient) {
            console.error('Cliente Supabase não disponível');
            return null;
        }
        
        try {
            const { data, error } = await supabaseClient
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
window.supabaseClient = supabaseClient;

// Testar conexão
if (supabaseClient) {
    console.log('Testando conexão Supabase...');
    supabaseClient.from('categories').select('*').limit(1)
        .then(result => {
            if (result.error) {
                console.error('Erro na conexão:', result.error.message);
            } else {
                console.log('✅ Conexão Supabase estabelecida');
                console.log('Auth disponível:', !!supabaseClient.auth);
            }
        })
        .catch(error => {
            console.error('Erro ao testar conexão:', error);
        });
} else {
    console.warn('Cliente Supabase não disponível para teste');
}
