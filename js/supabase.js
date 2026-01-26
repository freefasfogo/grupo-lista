// ATENÇÃO: Substitua 'SUA_URL_AQUI' e 'SUA_CHAVE_ANONIMA_AQUI' pelas suas credenciais do Supabase.
const SUPABASE_URL = 'https://nhbctpgmzrnrfulkuhgf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_IBiKqyz7ucMPm4zV12FTFg_eBvttKyy';

// Inicialização do cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Funções auxiliares para interagir com o Supabase
const db = {
    // Grupos
    async getGroups(filters = {}) {
        let query = supabase
            .from('groups')
            .select(`
                *,
                categories(name)
            `)
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
    
    async getGroupById(id) {
        const { data, error } = await supabase
            .from('groups')
            .select(`
                *,
                categories(name)
            `)
            .eq('id', id)
            .single();
        
        if (error) {
            console.error('Erro ao buscar grupo:', error);
            return null;
        }
        
        return data;
    },
    
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
    
    async incrementViews(id) {
        const { error } = await supabase.rpc('increment_views', { group_id: id });
        
        if (error) {
            console.error('Erro ao incrementar visualizações:', error);
            return false;
        }
        
        return true;
    },
    
    // Categorias
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
    
    // Usuários
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
    },
    
    // Pagamentos
    async createPayment(paymentData) {
        const { data, error } = await supabase
            .from('payments')
            .insert([paymentData])
            .select();
        
        if (error) {
            console.error('Erro ao criar pagamento:', error);
            return null;
        }
        
        return data[0];
    },
    
    async updatePaymentStatus(id, status) {
        const { data, error } = await supabase
            .from('payments')
            .update({ status })
            .eq('id', id)
            .select();
        
        if (error) {
            console.error('Erro ao atualizar status do pagamento:', error);
            return null;
        }
        
        return data[0];
    }
}; // <-- Chave de fechamento do objeto 'db'

// Exportar para uso em outros arquivos
window.db = db;

// Teste de conexão (executa uma vez quando a página carrega)
supabase.from('categories').select('*').then(result => {
  console.log('Teste de conexão com Supabase:', result);
  if (result.error) {
    console.error('Erro na conexão:', result.error);
  } else {
    console.log('Conexão bem-sucedida! Categorias encontradas:', result.data);
  }
});
