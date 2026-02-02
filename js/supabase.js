// js/supabase.js - CORRIGIDO
const SUPABASE_URL = 'https://nhbctpgmzrnrfulkuhgf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-oGF3MZ-AT3C04L7b2m-OA_PZyi4BSx';

// Função para obter cliente Supabase
function getSupabaseClient() {
    // Verificar se já temos cliente
    if (window.supabaseClient) {
        return window.supabaseClient;
    }
    
    // Verificar se a biblioteca está carregada
    if (typeof window.supabase === 'undefined') {
        console.warn('⚠️ Biblioteca Supabase não carregada ainda');
        return null;
    }
    
    try {
        console.log('📚 Criando cliente Supabase...');
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Cliente Supabase criado');
        return window.supabaseClient;
    } catch (error) {
        console.error('❌ Erro ao criar cliente:', error);
        return null;
    }
}

// Banco de dados
const db = {
    // Obter cliente seguro
    _client() {
        const client = getSupabaseClient();
        if (!client) {
            console.warn('⚠️ Supabase não disponível, tentando novamente...');
            // Tentar obter novamente
            const newClient = getSupabaseClient();
            if (!newClient) {
                throw new Error('Supabase não disponível');
            }
            return newClient;
        }
        return client;
    },
    
    // Obter grupos
    async getGroups(filters = {}) {
        try {
            const client = this._client();
            
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
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Erro ao buscar grupos:', error);
            return [];
        }
    },
    
    // Obter grupo por ID
    async getGroupById(id) {
        try {
            const client = this._client();
            
            const { data, error } = await client
                .from('groups')
                .select('*, categories(name)')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao buscar grupo:', error);
            return null;
        }
    },
    
    // Criar grupo
    async createGroup(groupData) {
        try {
            const client = this._client();
            
            // Obter usuário atual
            const { data: { user } } = await client.auth.getUser();
            if (!user) {
                throw new Error('Usuário não autenticado');
            }
            
            const dataToInsert = {
                ...groupData,
                created_by: user.id
            };
            
            const { data, error } = await client
                .from('groups')
                .insert([dataToInsert])
                .select();
            
            if (error) throw error;
            return data?.[0] || null;
        } catch (error) {
            console.error('Erro ao criar grupo:', error);
            throw error;
        }
    },
    
    // Atualizar grupo
    async updateGroup(id, groupData) {
        try {
            const client = this._client();
            
            const { data, error } = await client
                .from('groups')
                .update(groupData)
                .eq('id', id)
                .select();
            
            if (error) throw error;
            return data?.[0] || null;
        } catch (error) {
            console.error('Erro ao atualizar grupo:', error);
            throw error;
        }
    },
    
    // Deletar grupo
    async deleteGroup(id) {
        try {
            const client = this._client();
            
            const { error } = await client
                .from('groups')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Erro ao deletar grupo:', error);
            throw error;
        }
    },
    
    // Obter categorias
    async getCategories() {
        try {
            const client = this._client();
            
            const { data, error } = await client
                .from('categories')
                .select('*')
                .order('name');
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
            return [];
        }
    },
    
    // Criar categoria
    async createCategory(name) {
        try {
            const client = this._client();
            
            const { data, error } = await client
                .from('categories')
                .insert([{ name }])
                .select();
            
            if (error) throw error;
            return data?.[0] || null;
        } catch (error) {
            console.error('Erro ao criar categoria:', error);
            throw error;
        }
    },
    
    // Deletar categoria
    async deleteCategory(id) {
        try {
            const client = this._client();
            
            const { error } = await client
                .from('categories')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Erro ao deletar categoria:', error);
            throw error;
        }
    },
    
    // Verificar se é admin
    async isAdmin() {
        try {
            const client = this._client();
            const { data: { user } } = await client.auth.getUser();
            
            if (!user) return false;
            
            const { data, error } = await client
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();
            
            if (error) return false;
            return data?.role === 'admin';
        } catch (error) {
            console.error('Erro ao verificar admin:', error);
            return false;
        }
    },
    
    // Obter usuário atual
    async getCurrentUser() {
        try {
            const client = this._client();
            const { data: { user } } = await client.auth.getUser();
            return user;
        } catch (error) {
            return null;
        }
    },
    
    // Incrementar visualizações
    async incrementViews(id) {
        try {
            const client = this._client();
            
            // Obter visualizações atuais
            const { data: group, error: fetchError } = await client
                .from('groups')
                .select('views')
                .eq('id', id)
                .single();
            
            if (fetchError) throw fetchError;
            
            const newViews = (group.views || 0) + 1;
            
            // Atualizar
            const { error: updateError } = await client
                .from('groups')
                .update({ views: newViews })
                .eq('id', id);
            
            if (updateError) throw updateError;
            return true;
        } catch (error) {
            console.error('Erro ao incrementar views:', error);
            return false;
        }
    }
};

// Inicialização tardia - quando Supabase estiver pronto
function initSupabase() {
    const client = getSupabaseClient();
    if (client) {
        console.log('✅ Supabase inicializado');
        
        // Testar conexão
        client.from('categories').select('count').then(result => {
            if (result.error) {
                console.error('❌ Erro de conexão:', result.error.message);
            } else {
                console.log('✅ Conexão Supabase OK');
            }
        });
    }
    return client;
}

// Exportar
window.db = db;

// Aguardar biblioteca carregar
if (typeof window.supabase !== 'undefined') {
    initSupabase();
} else {
    // Configurar listener para quando a biblioteca carregar
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (typeof window.supabase !== 'undefined') {
                initSupabase();
            } else {
                console.warn('⚠️ Supabase não carregou após timeout');
            }
        }, 1000);
    });
}

console.log('📦 Módulo Supabase carregado');
