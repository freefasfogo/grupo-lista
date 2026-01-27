// Funções de autenticação
const auth = {
    // Verificar se cliente está disponível
    _checkClient() {
        if (!window.supabaseClient || !window.supabaseClient.auth) {
            console.warn('Cliente Supabase não disponível');
            return false;
        }
        return true;
    },
    
    // Login
    async login(email, password) {
        if (!this._checkClient()) {
            return { success: false, error: 'Sistema de autenticação não disponível' };
        }
        
        try {
            console.log('Tentando login com:', email);
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
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
        if (!this._checkClient()) {
            return { success: false, error: 'Sistema de autenticação não disponível' };
        }
        
        try {
            console.log('Tentando registrar:', email);
            const { data, error } = await window.supabaseClient.auth.signUp({
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
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Erro inesperado no registro:', error);
            return { success: false, error: 'Erro inesperado no registro' };
        }
    },
    
    // Logout
    async logout() {
        if (!this._checkClient()) return false;
        
        try {
            const { error } = await window.supabaseClient.auth.signOut();
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
    
    // Verificar se usuário está logado
    async isLoggedIn() {
        if (!this._checkClient()) return false;
        
        try {
            const { data: { user }, error } = await window.supabaseClient.auth.getUser();
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
    
    // Atualizar UI de autenticação
    async updateAuthUI() {
        try {
            if (!this._checkClient()) return;
            
            const isLoggedIn = await this.isLoggedIn();
            console.log('UI - Logado:', isLoggedIn);
            
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
if (window.supabaseClient && window.supabaseClient.auth) {
    window.supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);
        auth.updateAuthUI();
    });
}

// Exportar para uso global
window.auth = auth;
