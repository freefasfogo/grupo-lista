// Funções de autenticação
const auth = {
    // Verificar se o usuário está logado
    async isLoggedIn() {
        const { data: { user } } = await supabase.auth.getUser();
        return !!user;
    },
    
    // Obter usuário atual
    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },
    
    // Verificar se o usuário é admin
    async isAdmin() {
        const user = await this.getCurrentUser();
        if (!user) return false;
        
        const profile = await db.getUserProfile(user.id);
        return profile && profile.role === 'admin';
    },
    
    // Login
    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            console.error('Erro ao fazer login:', error);
            return { success: false, error: error.message };
        }
        
        return { success: true, user: data.user };
    },
    
    // Registro
    async register(email, password) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });
        
        if (error) {
            console.error('Erro ao registrar:', error);
            return { success: false, error: error.message };
        }
        
        // Criar perfil do usuário
        if (data.user) {
            await db.createUserProfile({
                id: data.user.id,
                email: data.user.email,
                role: 'user'
            });
        }
        
        return { success: true, user: data.user };
    },
    
    // Logout
    async logout() {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            console.error('Erro ao fazer logout:', error);
            return false;
        }
        
        return true;
    },
    
    // Redirecionar se não estiver logado
    async requireAuth(redirectUrl = '/login.html') {
        const isLoggedIn = await this.isLoggedIn();
        if (!isLoggedIn) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    },
    
    // Redirecionar se não for admin
    async requireAdmin(redirectUrl = '/login.html') {
        const isAdmin = await this.isAdmin();
        if (!isAdmin) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    },
    
    // Atualizar UI com base no estado de autenticação
    async updateAuthUI() {
        const isLoggedIn = await this.isLoggedIn();
        const isAdmin = await this.isAdmin();
        
        // Elementos de UI
        const loginLink = document.getElementById('login-link');
        const registerLink = document.getElementById('register-link');
        const logoutLink = document.getElementById('logout-link');
        const profileLink = document.getElementById('profile-link');
        const adminLink = document.getElementById('admin-link');
        
        if (isLoggedIn) {
            // Usuário logado
            if (loginLink) loginLink.style.display = 'none';
            if (registerLink) registerLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'block';
            if (profileLink) profileLink.style.display = 'block';
            
            // Admin
            if (isAdmin && adminLink) {
                adminLink.style.display = 'block';
            }
        } else {
            // Usuário não logado
            if (loginLink) loginLink.style.display = 'block';
            if (registerLink) registerLink.style.display = 'block';
            if (logoutLink) logoutLink.style.display = 'none';
            if (profileLink) profileLink.style.display = 'none';
            if (adminLink) adminLink.style.display = 'none';
        }
    }
};

// Listener para mudanças de autenticação
supabase.auth.onAuthStateChange((event, session) => {
    auth.updateAuthUI();
});

// Exportar para uso em outros arquivos
window.auth = auth;
