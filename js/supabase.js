const SUPABASE_URL = 'https://nhbctpgmzrnrfulkuhgf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-oGF3MZ-AT3C04L7b2m-OA_PZyi4BSx';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const db = {
    async getGroups(filters={}){
        let query=supabase.from('groups').select('*, categories(name)').eq('status','approved');
        if(filters.search)query=query.ilike('name',`%${filters.search}%`);
        if(filters.category)query=query.eq('category',filters.category);
        if(filters.platform)query=query.eq('platform',filters.platform);
        query=query.order('isVIP',{ascending:false}).order('views',{ascending:false});
        const {data,error}=await query;
        if(error){console.error('Erro ao buscar grupos:',error);return[];}
        return data;
    },
    async getGroupById(id){
        const {data,error}=await supabase.from('groups').select('*, categories(name)').eq('id',id).single();
        if(error){console.error('Erro ao buscar grupo:',error);return null;}
        return data;
    },
    async createGroup(groupData){
        const {data,error}=await supabase.from('groups').insert([groupData]).select();
        if(error){console.error('Erro ao criar grupo:',error);return null;}
        return data[0];
    },
    async updateGroup(id,groupData){
        const {data,error}=await supabase.from('groups').update(groupData).eq('id',id).select();
        if(error){console.error('Erro ao atualizar grupo:',error);return null;}
        return data[0];
    },
    async deleteGroup(id){
        const {error}=await supabase.from('groups').delete().eq('id',id);
        if(error){console.error('Erro ao excluir grupo:',error);return false;}
        return true;
    },
    async incrementViews(id){
        const {error}=await supabase.rpc('increment_views',{group_id:id});
        if(error){console.error('Erro ao incrementar visualizações:',error);return false;}
        return true;
    },
    async getCategories(){
        const {data,error}=await supabase.from('categories').select('*').order('name');
        if(error){console.error('Erro ao buscar categorias:',error);return[];}
        return data;
    },
    async getUserProfile(userId){
        const {data,error}=await supabase.from('users').select('*').eq('id',userId).single();
        if(error){console.error('Erro ao buscar perfil do usuário:',error);return null;}
        return data;
    },
    async updateUserProfile(userId,profileData){
        const {data,error}=await supabase.from('users').update(profileData).eq('id',userId).select();
        if(error){console.error('Erro ao atualizar perfil do usuário:',error);return null;}
        return data[0];
    },
    async createPayment(paymentData){
        const {data,error}=await supabase.from('payments').insert([paymentData]).select();
        if(error){console.error('Erro ao criar pagamento:',error);return null;}
        return data[0];
    },
    async updatePaymentStatus(id,status){
        const {data,error}=await supabase.from('payments').update({status}).eq('id',id).select();
        if(error){console.error('Erro ao atualizar status do pagamento:',error);return null;}
        return data[0];
    }
};
window.db=db;
supabase.from('categories').select('*').then(result=>{
    console.log('Conexão Supabase:',result.error?'Erro':'OK');
});
