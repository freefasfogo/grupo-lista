const admin = {
    async renderPendingGroups() {
        const container = document.getElementById('pending-groups-table');
        if (!container) return;
        
        container.innerHTML = '<tr><td colspan="6" class="text-center"><div class="spinner"></div></td></tr>';
        
        try {
            const { data, error } = await supabase
                .from('groups')
                .select(`*, categories(name)`)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            if (data.length === 0) {
                container.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum grupo pendente.</td></tr>';
                return;
            }
            
            container.innerHTML = data.map(group => `
                <tr>
                    <td>${group.name}</td>
                    <td>${group.platform}</td>
                    <td>${group.categories?.name || 'N/A'}</td>
                    <td>${utils.formatDate(group.created_at)}</td>
                    <td><span class="status-badge status-pending">Pendente</span></td>
                    <td><div class="action-buttons"><button class="btn-action btn-approve" data-id="${group.id}">Aprovar</button><button class="btn-action btn-reject" data-id="${group.id}">Rejeitar</button><button class="btn-action btn-edit" data-id="${group.id}">Editar</button><button class="btn-action btn-delete" data-id="${group.id}">Excluir</button></div></td>
                </tr>
            `).join('');
            
            this.attachGroupActionListeners();
        } catch (error) {
            console.error('Erro ao renderizar grupos pendentes:', error);
            container.innerHTML = '<tr><td colspan="6" class="text-center">Erro ao carregar.</td></tr>';
        }
    },

    async renderAllGroups() {
        const container = document.getElementById('all-groups-table');
        if (!container) return;
        
        container.innerHTML = '<tr><td colspan="7" class="text-center"><div class="spinner"></div></td></tr>';
        
        try {
            const { data, error } = await supabase
                .from('groups')
                .select(`*, categories(name)`)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            if (data.length === 0) {
                container.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum grupo encontrado.</td></tr>';
                return;
            }
            
            container.innerHTML = data.map(group => {
                const statusClass = `status-${group.status}`;
                const statusText = group.status === 'pending' ? 'Pendente' : group.status === 'approved' ? 'Aprovado' : 'Rejeitado';
                const vipBadge = group.isVIP ? '<span class="vip-badge">VIP</span>' : '';
                
                return `
                    <tr>
                        <td>${group.name} ${vipBadge}</td>
                        <td>${group.platform}</td>
                        <td>${group.categories?.name || 'N/A'}</td>
                        <td>${group.views || 0}</td>
                        <td>${utils.formatDate(group.created_at)}</td>
                        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                        <td><div class="action-buttons">${group.status === 'pending' ? `<button class="btn-action btn-approve" data-id="${group.id}">Aprovar</button><button class="btn-action btn-reject" data-id="${group.id}">Rejeitar</button>` : ''}<button class="btn-action btn-edit" data-id="${group.id}">Editar</button><button class="btn-action btn-delete" data-id="${group.id}">Excluir</button>${!group.isVIP ? `<button class="btn-action btn-vip" data-id="${group.id}">Tornar VIP</button>` : ''}</div></td>
                    </tr>
                `;
            }).join('');
            
            this.attachGroupActionListeners();
        } catch (error) {
            console.error('Erro ao renderizar todos os grupos:', error);
            container.innerHTML = '<tr><td colspan="7" class="text-center">Erro ao carregar.</td></tr>';
        }
    },
    
    async renderEditGroupForm(groupId) {
        const container = document.getElementById('edit-group-form-container');
        if (!container) return;
        
        container.innerHTML = '<div class="spinner"></div>';
        
        try {
            const group = await db.getGroupById(groupId);
            const categories = await db.getCategories();
            
            if (!group) {
                container.innerHTML = '<p class="text-center">Grupo não encontrado.</p>';
                return;
            }
            
            container.innerHTML = `
                <form id="edit-group-form" class="admin-form">
                    <input type="hidden" id="group-id" value="${group.id}">
                    <div class="form-row">
                        <div class="form-group"><label for="name">Nome</label><input type="text" id="name" name="name" class="form-control" value="${group.name}" required></div>
                        <div class="form-group"><label for="platform">Plataforma</label><select id="platform" name="platform" class="form-control" required><option value="WhatsApp" ${group.platform === 'WhatsApp' ? 'selected' : ''}>WhatsApp</option><option value="Telegram" ${group.platform === 'Telegram' ? 'selected' : ''}>Telegram</option><option value="Discord" ${group.platform === 'Discord' ? 'selected' : ''}>Discord</option></select></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label for="category">Categoria</label><select id="category" name="category" class="form-control" required>${categories.map(c => `<option value="${c.id}" ${group.category === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select></div>
                        <div class="form-group"><label for="status">Status</label><select id="status" name="status" class="form-control" required><option value="pending" ${group.status === 'pending' ? 'selected' : ''}>Pendente</option><option value="approved" ${group.status === 'approved' ? 'selected' : ''}>Aprovado</option><option value="rejected" ${group.status === 'rejected' ? 'selected' : ''}>Rejeitado</option></select></div>
                    </div>
                    <div class="form-group"><label for="description">Descrição</label><textarea id="description" name="description" class="form-control" required>${group.description}</textarea></div>
                    <div class="form-group"><label for="invite_link">Link de Convite</label><input type="url" id="invite_link" name="invite_link" class="form-control" value="${group.invite_link}" required></div>
                    <div class="form-group"><label><input type="checkbox" id="isVIP" name="isVIP" ${group.isVIP ? 'checked' : ''}> Marcar como VIP</label></div>
                    <div class="form-group"><button type="submit" class="btn btn-primary">Salvar</button><button type="button" id="cancel-edit" class="btn btn-outline">Cancelar</button></div>
                </form>
            `;
            
            document.getElementById('edit-group-form').addEventListener('submit', this.handleEditGroupSubmit);
            document.getElementById('cancel-edit').addEventListener('click', () => {
                document.getElementById('edit-group-modal').style.display = 'none';
            });
        } catch (error) {
            console.error('Erro ao renderizar formulário de edição:', error);
            container.innerHTML = '<p class="text-center">Erro ao carregar formulário.</p>';
        }
    },

    attachGroupActionListeners() {
        document.querySelectorAll('.btn-approve').forEach(btn => {
            btn.addEventListener('click', async () => {
                const success = await this.approveGroup(btn.dataset.id);
                if (success) {
                    utils.showToast('Grupo aprovado!', 'success');
                    this.renderPendingGroups();
                    this.renderAllGroups();
                } else {
                    utils.showToast('Erro ao aprovar.', 'error');
                }
            });
        });

        document.querySelectorAll('.btn-reject').forEach(btn => {
            btn.addEventListener('click', async () => {
                const success = await this.rejectGroup(btn.dataset.id);
                if (success) {
                    utils.showToast('Grupo rejeitado!', 'success');
                    this.renderPendingGroups();
                    this.renderAllGroups();
                } else {
                    utils.showToast('Erro ao rejeitar.', 'error');
                }
            });
        });

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', async () => {
                await this.renderEditGroupForm(btn.dataset.id);
                document.getElementById('edit-group-modal').style.display = 'block';
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Tem certeza?')) {
                    const success = await this.deleteGroup(btn.dataset.id);
                    if (success) {
                        utils.showToast('Grupo excluído!', 'success');
                        this.renderPendingGroups();
                        this.renderAllGroups();
                    } else {
                        utils.showToast('Erro ao excluir.', 'error');
                    }
                }
            });
        });

        document.querySelectorAll('.btn-vip').forEach(btn => {
            btn.addEventListener('click', async () => {
                const success = await this.makeGroupVIP(btn.dataset.id);
                if (success) {
                    utils.showToast('Grupo é VIP agora!', 'success');
                    this.renderAllGroups();
                } else {
                    utils.showToast('Erro ao tornar VIP.', 'error');
                }
            });
        });
    },

    async approveGroup(groupId) {
        const result = await db.updateGroup(groupId, { status: 'approved' });
        return !!result;
    },

    async rejectGroup(groupId) {
        const result = await db.updateGroup(groupId, { status: 'rejected' });
        return !!result;
    },

    async deleteGroup(groupId) {
        return await db.deleteGroup(groupId);
    },

    async makeGroupVIP(groupId) {
        const result = await db.updateGroup(groupId, { isVIP: true });
        return !!result;
    },

    async handleEditGroupSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const groupId = formData.get('group-id');
        
        const groupData = {
            name: formData.get('name'),
            platform: formData.get('platform'),
            category: formData.get('category'),
            description: formData.get('description'),
            invite_link: formData.get('invite_link'),
            status: formData.get('status'),
            isVIP: formData.get('isVIP') === 'on'
        };
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Salvando...';
        
        try {
            const result = await db.updateGroup(groupId, groupData);
            
            if (result) {
                utils.showToast('Grupo atualizado!', 'success');
                document.getElementById('edit-group-modal').style.display = 'none';
                this.renderPendingGroups();
                this.renderAllGroups();
            } else {
                utils.showToast('Erro ao atualizar.', 'error');
            }
        } catch (error) {
            console.error('Erro ao atualizar grupo:', error);
            utils.showToast('Erro ao atualizar.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    if (!(await auth.requireAdmin())) return;

    await admin.renderPendingGroups();
    await admin.renderAllGroups();
    
    const navLinks = document.querySelectorAll('.admin-sidebar a');
    const sections = document.querySelectorAll('.admin-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.style.display = 'none');
            
            link.classList.add('active');
            const sectionId = link.getAttribute('href').substring(1);
            const section = document.getElementById(sectionId);
            if (section) section.style.display = 'block';
        });
    });

    const modal = document.getElementById('edit-group-modal');
    const closeBtn = document.querySelector('.close-modal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

window.admin = admin;
