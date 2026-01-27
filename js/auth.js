// Funções de autenticação
const auth = {
    // Verificar se supabase está disponível
    _checkSupabase() {
        // Verificar se supabase existe globalmente
        if (typeof supabase === 'undefined' || !supabase.auth) {
            console.warn('Supabase auth não disponível');
            return false;
        }
        return true;
    },
    
    // Verificar se usuário está logado
    async isLoggedIn() {
        if (!this._checkSupabase()) return false;
        
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                console.error('Erro ao verificar autenticação:', error.message);
                return false;
            }
            return !!user;
        } catch (error) {
            console.error('Erro inesperado:', error);
            return false;
        }
    },
    
    // Obter usuário atual
    async getCurrentUser() {
        if (!this._checkSupabase()) return null;
        
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                console.error('Erro ao obter usuário:', error.message);
                return null;
            }
            return user;
        } catch (error) {
            console.error('Erro inesperado:', error);
            return null;
        }
    },
    
    // Verificar se é admin
    async isAdmin() {
        try {
            const user = await this.getCurrentUser();
            if (!user) return false;
            
            const profile = await db.getUserProfile(user.id);
            return profile && profile.role === 'admin';
        } catch (error) {
            console.error('Erro ao verificar admin:', error);
            return false;
        }
    },
    
    // Login
    async login(email, password) {
        if (!this._checkSupabase()) {
            return { success: false, error: 'Sistema de autenticação indisponível. Recarregue a página.' };
        }
        
        try {
            console.log('Tentando login...');
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) {
                console.error('Erro no login:', error.message);
                return { success: false, error: error.message };
            }
            
            console.log('✅ Login bem-sucedido');
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Erro inesperado no login:', error);
            return { success: false, error: 'Erro inesperado no login' };
        }
    },
    
    // Registro
    async register(email, password) {
        if (!this._checkSupabase()) {
            return { success: false, error: 'Sistema de autenticação indisponível. Recarregue a página.' };
        }
        
        try {
            console.log('Tentando registro...');
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: window.location.origin + '/pages/login.html'
                }
            });
            
            if (error) {
                console.error('Erro no registro:', error.message);
                return { success: false, error: error.message };
            }
            
            console.log('✅ Registro bem-sucedido');
            
            // Criar perfil do usuário (opcional)
            if (data.user) {
                try {
                    await supabase.from('users').insert({
                        id: data.user.id,
                        email: data.user.email,
                        role: 'user'
                    });
                    console.log('Perfil criado');
                } catch (profileError) {
                    console.warn('Não foi possível criar perfil:', profileError.message);
                }
            }
            
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Erro inesperado no registro:', error);
            return { success: false, error: 'Erro inesperado no registro' };
        }
    },
    
    // Logout
    async logout() {
        if (!this._checkSupabase()) return false;
        
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Erro no logout:', error.message);
                return false;
            }
            console.log('✅ Logout bem-sucedido');
            return true;
        } catch (error) {
            console.error('Erro inesperado no logout:', error);
            return false;
        }
    },
    
    // Atualizar UI de autenticação
    async updateAuthUI() {
        try {
            const isLoggedIn = await this.isLoggedIn();
            const isAdmin = await this.isAdmin();
            
            console.log('UI - Logado:', isLoggedIn, 'Admin:', isAdmin);
            
            // Elementos da UI
            const elements = {
                login: document.getElementById('login-link'),
                register: document.getElementById('register-link'),
                logout: document.getElementById('logout-link'),
                admin: document.getElementById('admin-link')
            };
            
            if (isLoggedIn) {
                if (elements.login) elements.login.style.display = 'none';
                if (elements.register) elements.register.style.display = 'none';
                if (elements.logout) elements.logout.style.display = 'block';
                if (isAdmin && elements.admin) elements.admin.style.display = 'block';
            } else {
                if (elements.login) elements.login.style.display = 'block';
                if (elements.register) elements.register.style.display = 'block';
                if (elements.logout) elements.logout.style.display = 'none';
                if (elements.admin) elements.admin.style.display = 'none';
            }
        } catch (error) {
            console.error('Erro ao atualizar UI:', error);
        }
    }
};

// Configurar listener de mudança de autenticação
if (typeof supabase !== 'undefined' && supabase.auth) {
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);
        auth.updateAuthUI();
    });
}

// Exportar para uso global
window.auth = auth;
