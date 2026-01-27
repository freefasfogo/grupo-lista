// Funções de autenticação
const auth = {
    // Verificar se usuário está logado
    async isLoggedIn() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            console.error('Erro ao verificar autenticação:', error);
            return false;
        }
        return !!user;
    },
    
    // Obter usuário atual
    async getCurrentUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            console.error('Erro ao obter usuário:', error);
            return null;
        }
        return user;
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
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) {
                console.error('Erro no login:', error);
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
            const { data, error } = await supabase.auth.signUp({
                email,
                password
            });
            
            if (error) {
                console.error('Erro no registro:', error);
                return { success: false, error: error.message };
            }
            
            // Criar perfil do usuário
            if (data.user) {
                await supabase.from('users').insert({
                    id: data.user.id,
                    email: data.user.email,
                    role: 'user'
                });
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
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Erro no logout:', error);
                return false;
            }
            return true;
        } catch (error) {
            console.error('Erro no logout:', error);
            return false;
        }
    },
    
    // Atualizar UI de autenticação
    async updateAuthUI() {
        try {
            const isLoggedIn = await this.isLoggedIn();
            const isAdmin = await this.isAdmin();
            
            // Elementos da UI
            const loginLink = document.getElementById('login-link');
            const registerLink = document.getElementById('register-link');
            const logoutLink = document.getElementById('logout-link');
            const adminLink = document.getElementById('admin-link');
            
            if (isLoggedIn) {
                if (loginLink) loginLink.style.display = 'none';
                if (registerLink) registerLink.style.display = 'none';
                if (logoutLink) logoutLink.style.display = 'block';
                
                if (isAdmin && adminLink) {
                    adminLink.style.display = 'block';
                }
            } else {
                if (loginLink) loginLink.style.display = 'block';
                if (registerLink) registerLink.style.display = 'block';
                if (logoutLink) logoutLink.style.display = 'none';
                if (adminLink) adminLink.style.display = 'none';
            }
        } catch (error) {
            console.error('Erro ao atualizar UI de auth:', error);
        }
    }
};

// Escutar mudanças de autenticação
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Estado de autenticação mudou:', event);
    auth.updateAuthUI();
});

// Exportar para uso global
window.auth = auth;
