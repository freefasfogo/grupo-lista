// js/supabase.js
const SUPABASE_URL = 'https://nhbctpgmzrnrfulkuhgf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-oGF3MZ-AT3C04L7b2m-OA_PZyi4BSx';

// Inicializar Supabase - versão robusta
function initSupabase() {
    console.log('🔄 Inicializando módulo Supabase...');
    
    // Se já existe um cliente, usar
    if (window.supabaseClient && window.supabaseClient.auth) {
        console.log('✅ Cliente Supabase já está disponível');
        return window.supabaseClient;
    }
    
    // Se não temos a biblioteca, mostrar erro
    if (typeof supabase === 'undefined') {
        console.error('❌ Biblioteca Supabase não está disponível');
        console.log('Verifique se o script foi carregado:', window.supabase);
        return null;
    }
    
    try {
        console.log('📦 Criando novo cliente Supabase...');
        window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Testar se o cliente foi criado corretamente
        if (!window.supabaseClient || !window.supabaseClient.auth) {
            console.error('❌ Cliente Supabase criado, mas auth não disponível');
            return null;
        }
        
        console.log('✅ Cliente Supabase criado com sucesso');
        console.log('🔐 Auth disponível:', !!window.supabaseClient.auth);
        
        return window.supabaseClient;
    } catch (error) {
        console.error('❌ Erro ao criar cliente Supabase:', error);
        return null;
    }
}

// Inicializar e obter cliente
const supabaseClient = initSupabase();

// Funções do banco de dados
const db = {
    // Obter o cliente de forma segura
    _getClient() {
        if (!supabaseClient) {
            console.warn('⚠️ Cliente Supabase não disponível, tentando inicializar...');
            const client = initSupabase();
            if (!client) {
                throw new Error('Cliente Supabase não disponível');
            }
            return client;
        }
        return supabaseClient;
    },
    
    // Obter grupos com filtros
    async getGroups(filters = {}) {
        try {
            const client = this._getClient();
            
            let query = client
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
            const client = this._getClient();
            
            const { data, error } = await client
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
            const client = this._getClient();
            
            const { data, error } = await client
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
            const client = this._getClient();
            
            const { data, error } = await client
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
        try {
            const client = this._getClient();
            
            const { error } = await client
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
        try {
            const client = this._getClient();
            
            const { data, error } = await client
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
        try {
            const client = this._getClient();
            
            const { data, error } = await client
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
        try {
            const client = this._getClient();
            
            const { error } = await client
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
        try {
            const client = this._getClient();
            
            const { data: { user }, error: authError } = await client.auth.getUser();
            
            if (authError || !user) {
                console.log('Usuário não autenticado');
                return false;
            }
            
            const { data: profile, error: profileError } = await client
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
        try {
            const client = this._getClient();
            
            const { data, error } = await client
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
        try {
            const client = this._getClient();
            
            // Primeiro obtém o valor atual
            const { data: group, error: fetchError } = await client
                .from('groups')
                .select('views')
                .eq('id', id)
                .single();
            
            if (fetchError) throw fetchError;
            
            const newViews = (group.views || 0) + 1;
            
            // Atualiza com o novo valor
            const { error: updateError } = await client
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

// Testar conexão quando tudo estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (supabaseClient) {
            console.log('🔍 Testando conexão Supabase...');
            supabaseClient.from('categories').select('*').limit(1)
                .then(result => {
                    if (result.error) {
                        console.error('❌ Erro na conexão:', result.error.message);
                    } else {
                        console.log('✅ Conexão Supabase estabelecida com sucesso');
                    }
                })
                .catch(error => {
                    console.error('❌ Erro ao testar conexão:', error);
                });
        } else {
            console.warn('⚠️ Cliente Supabase não disponível para teste');
        }
    }, 1000); // Aguardar 1 segundo para tudo carregar
});

console.log('📦 Módulo Supabase carregado');
