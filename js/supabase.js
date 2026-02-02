// No arquivo js/supabase.js, adicione estas funções ao objeto db:

const db = {
    // ... funções existentes ...
    
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
                console.error('Erro ao verificar usuário:', authError);
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
            
            return profile.role === 'admin';
        } catch (error) {
            console.error('Erro inesperado ao verificar admin:', error);
            return false;
        }
    }
};
