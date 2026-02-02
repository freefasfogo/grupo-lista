// js/supabase.js
const SUPABASE_URL = 'https://nhbctpgmzrnrfulkuhgf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-oGF3MZ-AT3C04L7b2m-OA_PZyi4BSx';

// Inicializar Supabase
function initSupabase() {
    if (window.supabaseClient) {
        return window.supabaseClient;
    }
    
    if (window.supabase && window.supabase.createClient) {
        console.log('Criando cliente Supabase...');
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return window.supabaseClient;
    }
    
    console.error('Biblioteca Supabase não carregada');
    return null;
}

const supabaseClient = initSupabase();

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
    
    // Atualizar grupo
    async updateGroup(id, groupData) {
        if (!supabaseClient) {
            console.error('Cliente Supabase não disponível');
            return null;
        }
        
        try {
            const { data, error } = await supabaseClient
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
    
    // Deletar grupo
    async deleteGroup(id) {
        if (!supabaseClient) {
            console.error('Cliente Supabase não disponível');
            return false;
        }
        
        try {
            const { error } = await supabaseClient
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
            
            console.log('Categorias do banco:', data);
            return data;
        } catch (error) {
            console.error('Erro inesperado ao buscar categorias:', error);
            return [];
        }
    },
    
    // Criar categoria
    async createCategory(categoryData) {
        if (!supabaseClient) {
            console.error('Cliente Supabase não disponível');
            return null;
        }
        
        try {
            const { data, error } = await supabaseClient
                .from('categories')
                .insert([categoryData])
                .select();
            
            if (error) {
                console.error('Erro ao criar categoria:', error);
                return null;
            }
            
            return data[0];
        } catch (error) {
            console.error('Erro inesperado ao criar categoria:', error);
            return null;
        }
    },
    
    // Deletar categoria
    async deleteCategory(id) {
        if (!supabaseClient) {
            console.error('Cliente Supabase não disponível');
            return false;
        }
        
        try {
            const { error } = await supabaseClient
                .from('categories')
                .delete()
                .eq('id', id);
            
            if (error) {
                console.error('Erro ao excluir categoria:', error);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Erro inesperado ao excluir categoria:', error);
            return false;
        }
    },
    
    // Verificar se usuário é admin
    async isAdmin() {
        if (!supabaseClient) {
            console.error('Cliente Supabase não disponível');
            return false;
        }
        
        try {
            const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
            
            if (authError || !user) {
                console.log('Usuário não autenticado');
                return false;
            }
            
            const { data: profile, error: profileError } = await supabaseClient
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();
            
            if (profileError) {
                console.error('Erro ao buscar perfil:', profileError);
                return false;
            }
            
            console.log('Perfil do usuário:', profile);
            return profile.role === 'admin';
        } catch (error) {
            console.error('Erro ao verificar admin:', error);
            return false;
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
    },
    
    // Incrementar visualizações
    async incrementViews(id) {
        if (!supabaseClient) {
            console.error('Cliente Supabase não disponível');
            return false;
        }
        
        try {
            // Primeiro obtém o valor atual
            const { data: group, error: fetchError } = await supabaseClient
                .from('groups')
                .select('views')
                .eq('id', id)
                .single();
            
            if (fetchError) throw fetchError;
            
            const newViews = (group.views || 0) + 1;
            
            // Atualiza com o novo valor
            const { error: updateError } = await supabaseClient
                .from('groups')
                .update({ views: newViews })
                .eq('id', id);
            
            if (updateError) throw updateError;
            
            return true;
        } catch (error) {
            console.error('Erro ao incrementar visualizações:', error);
            return false;
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
