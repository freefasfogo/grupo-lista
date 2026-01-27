// Verificar se supabase está disponível
if (typeof supabase === 'undefined') {
    console.error('Supabase não está disponível! Verifique se o script foi carregado.');
}

// Funções de autenticação
const auth = {
    // Verificar se usuário está logado
    async isLoggedIn() {
        try {
            if (!supabase || !supabase.auth) {
                console.error('Supabase auth não disponível');
                return false;
            }
            
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                console.error('Erro ao verificar autenticação:', error);
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
        try {
            if (!supabase || !supabase.auth) {
                console.error('Supabase auth não disponível');
                return null;
            }
            
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                console.error('Erro ao obter usuário:', error);
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
        try {
            if (!supabase || !supabase.auth) {
                console.error('Supabase auth não disponível para login');
                return { success: false, error: 'Sistema indisponível' };
            }
            
            console.log('Tentando login com:', email);
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) {
                console.error('Erro no login:', error);
                return { success: false, error: error.message };
            }
            
            console.log('Login bem-sucedido:', data.user);
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Erro inesperado no login:', error);
            return { success: false, error: 'Erro inesperado' };
        }
    },
    
    // Registro
    async register(email, password) {
        try {
            if (!supabase || !supabase.auth) {
                console.error('Supabase auth não disponível para registro');
                return { success: false, error: 'Sistema indisponível' };
            }
            
            console.log('Tentando registrar:', email);
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: window.location.origin + '/pages/login.html'
                }
            });
            
            if (error) {
                console.error('Erro no registro:', error);
                return { success: false, error: error.message };
            }
            
            console.log('Registro bem-sucedido:', data.user);
            
            // Criar perfil do usuário
            if (data.user) {
                try {
                    await supabase.from('users').insert({
                        id: data.user.id,
                        email: data.user.email,
                        role: 'user'
                    });
                    console.log('Perfil criado com sucesso');
                } catch (profileError) {
                    console.error('Erro ao criar perfil:', profileError);
                    // Continua mesmo com erro no perfil
                }
            }
            
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Erro inesperado no registro:', error);
            return { success: false, error: 'Erro inesperado' };
        }
    },
    
    // Logout
    async logout() {
        try {
            if (!supabase || !supabase.auth) {
                console.error('Supabase auth não disponível para logout');
                return false;
            }
            
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Erro no logout:', error);
                return false;
            }
            console.log('Logout bem-sucedido');
            return true;
        } catch (error) {
            console.error('Erro inesperado no logout:', error);
            return false;
        }
    },
    
    // Redirecionar se não estiver logado
    async requireAuth(redirectUrl = '/pages/login.html') {
        const isLoggedIn = await this.isLoggedIn();
        if (!isLoggedIn) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    },
    
    // Redirecionar se não for admin
    async requireAdmin(redirectUrl = '/pages/login.html') {
        const isAdmin = await this.isAdmin();
        if (!isAdmin) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    },
    
    // Atualizar UI de autenticação
    async updateAuthUI() {
        try {
            const isLoggedIn = await this.isLoggedIn();
            const isAdmin = await this.isAdmin();
            
            console.log('Atualizando UI - Logado:', isLoggedIn, 'Admin:', isAdmin);
            
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

// Escutar mudanças de autenticação - SÓ SE SUPABASE EXISTIR
if (supabase && supabase.auth) {
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('Estado de autenticação mudou:', event);
        auth.updateAuthUI();
    });
} else {
    console.warn('Supabase não disponível para onAuthStateChange');
}

// Exportar para uso global
window.auth = auth;
