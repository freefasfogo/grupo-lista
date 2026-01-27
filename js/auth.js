const auth={
    async isLoggedIn(){const{data:{user}}=await supabase.auth.getUser();return!!user;},
    async getCurrentUser(){const{data:{user}}=await supabase.auth.getUser();return user;},
    async isAdmin(){const user=await this.getCurrentUser();if(!user)return false;const profile=await db.getUserProfile(user.id);return profile&&profile.role==='admin';},
    async login(email,password){const{data,error}=await supabase.auth.signInWithPassword({email,password});if(error){console.error('Erro ao fazer login:',error);return{success:false,error:error.message};}return{success:true,user:data.user};},
    async register(email,password){const{data,error}=await supabase.auth.signUp({email,password});if(error){console.error('Erro ao registrar:',error);return{success:false,error:error.message};}if(data.user){await supabase.from('users').insert({id:data.user.id,email:data.user.email,role:'user'});}return{success:true,user:data.user};},
    async logout(){const{error}=await supabase.auth.signOut();if(error){console.error('Erro ao fazer logout:',error);return false;}return true;},
    async requireAuth(redirectUrl='/pages/login.html'){const isLoggedIn=await this.isLoggedIn();if(!isLoggedIn){window.location.href=redirectUrl;return false;}return true;},
    async requireAdmin(redirectUrl='/pages/login.html'){const isAdmin=await this.isAdmin();if(!isAdmin){window.location.href=redirectUrl;return false;}return true;},
    async updateAuthUI(){const isLoggedIn=await this.isLoggedIn();const isAdmin=await this.isAdmin();
        const elements={login:document.getElementById('login-link'),register:document.getElementById('register-link'),logout:document.getElementById('logout-link'),profile:document.getElementById('profile-link'),admin:document.getElementById('admin-link')};
        if(isLoggedIn){if(elements.login)elements.login.style.display='none';if(elements.register)elements.register.style.display='none';if(elements.logout)elements.logout.style.display='block';if(elements.profile)elements.profile.style.display='block';if(isAdmin&&elements.admin)elements.admin.style.display='block';}else{if(elements.login)elements.login.style.display='block';if(elements.register)elements.register.style.display='block';if(elements.logout)elements.logout.style.display='none';if(elements.profile)elements.profile.style.display='none';if(elements.admin)elements.admin.style.display='none';}}
};
supabase.auth.onAuthStateChange((event,session)=>{auth.updateAuthUI();});
window.auth=auth;
