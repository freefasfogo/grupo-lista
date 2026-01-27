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
            console.log('Fazendo logout...');
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
            console.log('Atualizando UI de autenticação...');
            
            const isLoggedIn = await this.isLoggedIn();
            console.log('Usuário logado:', isLoggedIn);
            
            // Elementos da UI
            const elements = {
                login: document.getElementById('login-link'),
                register: document.getElementById('register-link'),
                logout: document.getElementById('logout-link'),
                admin: document.getElementById('admin-link')
            };
            
            if (isLoggedIn) {
                console.log('Configurando UI para usuário LOGADO');
                if (elements.login) {
                    elements.login.style.display = 'none';
                    console.log('Login link escondido');
                }
                if (elements.register) {
                    elements.register.style.display = 'none';
                    console.log('Register link escondido');
                }
                if (elements.logout) {
                    elements.logout.style.display = 'block';
                    console.log('Logout link mostrado');
                }
            } else {
                console.log('Configurando UI para usuário NÃO LOGADO');
                if (elements.login) {
                    elements.login.style.display = 'block';
                    console.log('Login link mostrado');
                }
                if (elements.register) {
                    elements.register.style.display = 'block';
                    console.log('Register link mostrado');
                }
                if (elements.logout) {
                    elements.logout.style.display = 'none';
                    console.log('Logout link escondido');
                }
                if (elements.admin) {
                    elements.admin.style.display = 'none';
                }
            }
            
            console.log('UI atualizada com sucesso');
        } catch (error) {
            console.error('Erro ao atualizar UI:', error);
        }
    }
};

// Configurar listener de mudança de autenticação
if (window.supabaseClient && window.supabaseClient.auth) {
    window.supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('📢 Estado de autenticação mudou:', event);
        console.log('Sessão:', session ? 'ativa' : 'inativa');
        
        // Forçar atualização da UI
        setTimeout(() => {
            auth.updateAuthUI();
        }, 500);
    });
    
    console.log('Listener de auth state configurado');
} else {
    console.warn('Não foi possível configurar listener de auth state');
}

// Exportar para uso global
window.auth = auth;
