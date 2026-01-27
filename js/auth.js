// Funções de autenticação
const auth = {
    // Verificar se supabase está disponível
    _checkSupabase() {
        if (!window.supabase || !window.supabase.auth) {
            console.warn('Supabase auth não disponível');
            return false;
        }
        return true;
    },
    
    // Login
    async login(email, password) {
        if (!this._checkSupabase()) {
            return { success: false, error: 'Sistema indisponível. Recarregue a página.' };
        }
        
        try {
            console.log('Tentando login...');
            const { data, error } = await window.supabase.auth.signInWithPassword({
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
            console.error('Erro inesperado:', error);
            return { success: false, error: 'Erro inesperado' };
        }
    },
    
    // Registro
    async register(email, password) {
        if (!this._checkSupabase()) {
            return { success: false, error: 'Sistema indisponível. Recarregue a página.' };
        }
        
        try {
            console.log('Tentando registro...');
            const { data, error } = await window.supabase.auth.signUp({
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
            console.error('Erro inesperado:', error);
            return { success: false, error: 'Erro inesperado' };
        }
    },
    
    // Logout
    async logout() {
        if (!this._checkSupabase()) return false;
        
        try {
            const { error } = await window.supabase.auth.signOut();
            if (error) {
                console.error('Erro no logout:', error.message);
                return false;
            }
            console.log('✅ Logout bem-sucedido');
            return true;
        } catch (error) {
            console.error('Erro inesperado:', error);
            return false;
        }
    },
    
    // Atualizar UI de autenticação
    async updateAuthUI() {
        try {
            if (!this._checkSupabase()) return;
            
            const { data: { user }, error } = await window.supabase.auth.getUser();
            const isLoggedIn = !!user && !error;
            
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
            }
        } catch (error) {
            console.error('Erro ao atualizar UI:', error);
        }
    }
};

// Configurar listener
if (window.supabase && window.supabase.auth) {
    window.supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);
        auth.updateAuthUI();
    });
}

// Exportar
window.auth = auth;
