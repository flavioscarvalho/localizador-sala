// Função para normalizar texto (remover acentos e converter para minúsculas)
function normalizeText(text) {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

// Função principal de busca
async function buscarAluno() {
    const studentName = document.getElementById('studentName').value.trim();
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');
    
    if (!studentName) {
        showError('Por favor, digite o nome completo do aluno.');
        return;
    }
    
    // Mostrar loading
    resultDiv.classList.add('hidden');
    loadingDiv.classList.remove('hidden');
    
    try {
        // Carregar dados do JSON
        const response = await fetch('ensalamento.json');
        
        if (!response.ok) {
            throw new Error('Arquivo de ensalamento não encontrado. Entre em contato com a escola.');
        }
        
        const data = await response.json();
        
        // Normalizar nome buscado
        const searchName = normalizeText(studentName);
        
        // Buscar aluno em todas as salas
        let alunoEncontrado = null;
        let salaEncontrada = null;
        
        for (const [nomeSala, dadosSala] of Object.entries(data.mapeamento_salas_aplicacao)) {
            const aluno = dadosSala.alunos_presentes.find(a => 
                normalizeText(a.nome_completo).includes(searchName) || 
                searchName.includes(normalizeText(a.nome_completo))
            );
            
            if (aluno) {
                alunoEncontrado = aluno;
                salaEncontrada = nomeSala;
                break;
            }
        }
        
        if (alunoEncontrado) {
            showSuccess(alunoEncontrado, salaEncontrada, data.metadata);
        } else {
            showError(`Aluno "${studentName}" não encontrado no ensalamento. Verifique se o nome está correto.`);
        }
        
    } catch (error) {
        console.error('Erro ao buscar:', error);
        showError('Erro ao carregar os dados. Tente novamente mais tarde ou entre em contato com a escola.');
    } finally {
        loadingDiv.classList.add('hidden');
    }
}

// Mostrar resultado de sucesso
function showSuccess(aluno, sala, metadata) {
    const resultDiv = document.getElementById('result');
    
    resultDiv.className = 'result success';
    resultDiv.innerHTML = `
        <h2>✅ Localização Encontrada!</h2>
        
        <div class="info-item">
            <strong>👨‍🎓 Aluno</strong>
            <span>${aluno.nome_completo}</span>
        </div>
        
        <div class="info-item">
            <strong>📚 Avaliação</strong>
            <span>${metadata.nome_ensalamento}</span>
        </div>
        
        <div class="info-item">
            <strong>🏫 Sala de Aplicação</strong>
            <span>${sala}</span>
        </div>
        
        <div class="info-item">
            <strong>📍 Posição</strong>
            <span>Fila ${aluno.posicao.fila}, Carteira ${aluno.posicao.coluna} (${aluno.posicao.assento})</span>
        </div>
        
        <div class="info-item">
            <strong>📌 Turma de Origem</strong>
            <span>${aluno.turma_origem}</span>
        </div>
        
        <div class="info-item">
            <strong>📅 Data</strong>
            <span>${metadata.data_aplicacao}</span>
        </div>
        
        <div class="info-item">
            <strong>🕐 Horário</strong>
            <span>${metadata.horario_aplicacao}</span>
        </div>
        
        <div class="info-item">
            <strong>📝 Disciplina(s)</strong>
            <span>${metadata.disciplinas}</span>
        </div>
    `;
    
    resultDiv.classList.remove('hidden');
}

// Mostrar erro
function showError(message) {
    const resultDiv = document.getElementById('result');
    
    resultDiv.className = 'result error';
    resultDiv.innerHTML = `
        <h2>❌ Não Encontrado</h2>
        <p style="font-size: 16px; line-height: 1.6; margin-top: 15px;">${message}</p>
    `;
    
    resultDiv.classList.remove('hidden');
}

// Permitir busca ao pressionar Enter
document.getElementById('studentName').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        buscarAluno();
    }
});
