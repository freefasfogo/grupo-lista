// js/auth.js
const auth = {
    // Obter cliente Supabase
    _client() {
        if (!window.supabaseClient) {
            console.warn('Supabase não disponível');
            return null;
        }
        return window.supabaseClient;
    },
    
    // Login
    async login(email, password) {
        try {
            const client = this._client();
            if (!client) {
                return { success: false, error: 'Sistema indisponível' };
            }
            
            const { data, error } = await client.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) {
                return { success: false, error: error.message };
            }
            
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Erro no login:', error);
            return { success: false, error: 'Erro inesperado' };
        }
    },
    
    // Registro
    async register(email, password) {
        try {
            const client = this._client();
            if (!client) {
                return { success: false, error: 'Sistema indisponível' };
            }
            
            const { data, error } = await client.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: window.location.origin + '/grupo-lista/pages/login.html'
                }
            });
            
            if (error) {
                return { success: false, error: error.message };
            }
            
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Erro no registro:', error);
            return { success: false, error: 'Erro inesperado' };
        }
    },
    
    // Logout
    async logout() {
        try {
            const client = this._client();
            if (!client) return false;
            
            const { error } = await client.auth.signOut();
            if (error) {
                console.error('Erro no logout:', error);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Erro inesperado no logout:', error);
            return false;
        }
    },
    
    // Verificar se está logado
    async isLoggedIn() {
        try {
            const client = this._client();
            if (!client) return false;
            
            const { data: { user }, error } = await client.auth.getUser();
            if (error) return false;
            
            return !!user;
        } catch (error) {
            console.error('Erro ao verificar login:', error);
            return false;
        }
    },
    
    // Obter usuário atual
    async getCurrentUser() {
        try {
            const client = this._client();
            if (!client) return null;
            
            const { data: { user } } = await client.auth.getUser();
            return user;
        } catch (error) {
            console.error('Erro ao obter usuário:', error);
            return null;
        }
    },
    
    // Atualizar UI de autenticação
    async updateAuthUI() {
        try {
            const isLoggedIn = await this.isLoggedIn();
            const isAdmin = await db.isAdmin();
            
            // Elementos
            const elements = {
                login: document.getElementById('login-link'),
                register: document.getElementById('register-link'),
                logout: document.getElementById('logout-link'),
                admin: document.getElementById('admin-link')
            };
            
            // Atualizar display
            if (isLoggedIn) {
                if (elements.login) elements.login.style.display = 'none';
                if (elements.register) elements.register.style.display = 'none';
                if (elements.logout) elements.logout.style.display = 'block';
                if (elements.admin) {
                    elements.admin.style.display = isAdmin ? 'block' : 'none';
                }
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

// Configurar listener de auth
if (window.supabaseClient) {
    window.supabaseClient.auth.onAuthStateChange(() => {
        auth.updateAuthUI();
    });
}

// Exportar
window.auth = auth;
