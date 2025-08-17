// Main JavaScript file for DPD Conscript Recruitment website

// DOM Elements
const modal = document.getElementById('applicationModal');
const enrollBtn = document.getElementById('enrollBtn');
const ctaBtn = document.getElementById('ctaBtn');
const closeBtn = document.querySelector('.close');
const applicationForm = document.getElementById('applicationForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const progressFill = document.querySelector('.progress-fill');
const progressText = document.querySelector('.progress-text');
const totalTimerElement = document.getElementById('totalTimer');
const questionTimerElement = document.getElementById('questionTimer');

// Form state
let currentSection = 1;
const totalSections = 13;
let totalStartTime = null;
let questionStartTime = null;
let questionTimes = {};
let totalFormTime = 0;

// Anti-cheat system
let pasteAttempts = 0;
let copyAttempts = 0;
let suspiciousActivity = [];

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    initializeModal();
    initializeForm();
    initializeNavigation();
    initializeScrollEffects();
    initializeAntiCheat();
    initializeTimers();
});

// Anti-cheat initialization
function initializeAntiCheat() {
    // Disable paste events in form fields
    const formInputs = document.querySelectorAll('.no-paste');
    formInputs.forEach(input => {
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            pasteAttempts++;
            logSuspiciousActivity('Tentativa de colar texto', input.name || input.id);
            showAntiCheatWarning('Colar texto não é permitido durante o teste!');
            return false;
        });

        input.addEventListener('copy', function(e) {
            e.preventDefault();
            copyAttempts++;
            logSuspiciousActivity('Tentativa de copiar texto', input.name || input.id);
            showAntiCheatWarning('Copiar texto não é permitido durante o teste!');
            return false;
        });

        input.addEventListener('cut', function(e) {
            e.preventDefault();
            logSuspiciousActivity('Tentativa de recortar texto', input.name || input.id);
            showAntiCheatWarning('Recortar texto não é permitido durante o teste!');
            return false;
        });
    });

    // Disable additional keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Disable Ctrl+A (select all) outside form fields
        if (e.ctrlKey && e.key === 'a' && !isFormField(e.target)) {
            e.preventDefault();
            logSuspiciousActivity('Tentativa de selecionar tudo', 'keyboard');
            return false;
        }

        // Disable F-keys
        if (e.key.startsWith('F') && e.key.length > 1) {
            e.preventDefault();
            logSuspiciousActivity('Tentativa de usar tecla F', e.key);
            return false;
        }
    });

    // Detect tab switching
    document.addEventListener('visibilitychange', function() {
        if (document.hidden && modal.style.display === 'block') {
            logSuspiciousActivity('Mudança de aba durante o teste', 'tab_switch');
            showAntiCheatWarning('Não mude de aba durante o teste!');
        }
    });
}

function isFormField(element) {
    return element.tagName === 'INPUT' || element.tagName === 'TEXTAREA';
}

function logSuspiciousActivity(activity, details) {
    const timestamp = new Date().toISOString();
    suspiciousActivity.push({
        timestamp,
        activity,
        details,
        section: currentSection
    });
    console.warn(`Atividade suspeita detectada: ${activity} - ${details}`);
}

function showAntiCheatWarning(message) {
    // Create warning overlay
    const warning = document.createElement('div');
    warning.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        padding: 20px 30px;
        border-radius: 15px;
        z-index: 9999;
        font-weight: bold;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        animation: shake 0.5s ease-in-out;
    `;
    warning.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="margin-right: 10px; font-size: 1.2rem;"></i>
        ${message}
    `;
    
    document.body.appendChild(warning);
    
    setTimeout(() => {
        warning.remove();
    }, 3000);
}

// Timer functions
function initializeTimers() {
    // Update timers every second
    setInterval(updateTimers, 1000);
}

function startTotalTimer() {
    totalStartTime = Date.now();
}

function startQuestionTimer() {
    questionStartTime = Date.now();
}

function updateTimers() {
    if (totalStartTime) {
        const elapsed = Date.now() - totalStartTime;
        totalFormTime = elapsed;
        totalTimerElement.textContent = formatTime(elapsed);
    }

    if (questionStartTime) {
        const elapsed = Date.now() - questionStartTime;
        questionTimerElement.textContent = formatTime(elapsed, false);
    }
}

function formatTime(milliseconds, includeHours = true) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (includeHours) {
        return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    } else {
        return `${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
}

function saveQuestionTime() {
    if (questionStartTime) {
        const elapsed = Date.now() - questionStartTime;
        questionTimes[`section_${currentSection}`] = elapsed;
    }
}

// Navigation functionality
function initializeNavigation() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize scroll-triggered animations
function initializeScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Add fade-in animations to elements
    const animatedElements = document.querySelectorAll('.about-card, .requirement-card, .timeline-item');
    animatedElements.forEach(element => {
        element.classList.add('fade-in');
        observer.observe(element);
    });
}

// Initialize general animations
function initializeAnimations() {
    // Add animation delays to about cards
    const aboutCards = document.querySelectorAll('.about-card');
    aboutCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
    });
    
    // Add animation delays to requirement cards
    const requirementCards = document.querySelectorAll('.requirement-card');
    requirementCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.15}s`;
    });
}

// Modal functionality
function initializeModal() {
    // Open modal
    enrollBtn.addEventListener('click', openModal);
    ctaBtn.addEventListener('click', openModal);
    
    // Close modal
    closeBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Prevent modal close when clicking inside modal content
    document.querySelector('.modal-content').addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

function openModal() {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    resetForm();
    startTotalTimer();
    startQuestionTimer();
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    totalStartTime = null;
    questionStartTime = null;
}

// Form functionality
function initializeForm() {
    // Navigation buttons
    nextBtn.addEventListener('click', nextFormSection);
    prevBtn.addEventListener('click', prevFormSection);
    
    // Form submission
    applicationForm.addEventListener('submit', handleFormSubmit);
    
    // Real-time validation
    const inputs = applicationForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', validateField);
        input.addEventListener('blur', validateField);
    });
    
    // Initialize first section
    updateFormSection();
}

function nextFormSection() {
    if (validateCurrentSection()) {
        saveQuestionTime();
        if (currentSection < totalSections) {
            currentSection++;
            updateFormSection();
            startQuestionTimer();
        }
    }
}

function prevFormSection() {
    if (currentSection > 1) {
        saveQuestionTime();
        currentSection--;
        updateFormSection();
        startQuestionTimer();
    }
}

function updateFormSection() {
    // Hide all sections
    const sections = document.querySelectorAll('.form-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show current section
    const currentSectionElement = document.querySelector(`[data-section="${currentSection}"]`);
    if (currentSectionElement) {
        currentSectionElement.classList.add('active');
    }
    
    // Update navigation buttons
    prevBtn.style.display = currentSection === 1 ? 'none' : 'inline-block';
    
    if (currentSection === totalSections) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
    }
    
    // Update progress
    updateProgress();
}

function updateProgress() {
    const progress = (currentSection / totalSections) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${Math.round(progress)}% Completo`;
}

function validateCurrentSection() {
    const currentSectionElement = document.querySelector(`[data-section="${currentSection}"]`);
    const requiredFields = currentSectionElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    let isValid = true;
    
    // Remove existing error styling
    field.classList.remove('error');
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        showFieldError(field, 'Este campo é obrigatório');
    }
    
    // Specific validations
    if (value) {
        switch (field.type) {
            case 'number':
                if (isNaN(value) || value < 18 || value > 65) {
                    isValid = false;
                    showFieldError(field, 'Idade deve estar entre 18 e 65 anos');
                }
                break;
        }
        
        // Text length validation for textareas
        if (field.tagName === 'TEXTAREA' && value.length < 20) {
            isValid = false;
            showFieldError(field, 'Resposta muito curta. Mínimo de 20 caracteres');
        }
        
        // Minimum words validation for important questions
        if (field.tagName === 'TEXTAREA') {
            const wordCount = value.split(/\s+/).filter(word => word.length > 0).length;
            if (wordCount < 5) {
                isValid = false;
                showFieldError(field, 'Resposta deve conter pelo menos 5 palavras');
            }
        }
    }
    
    if (isValid) {
        clearFieldError(field);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    field.parentNode.appendChild(errorElement);
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateCurrentSection()) {
        return;
    }
    
    saveQuestionTime();
    const finalTotalTime = Date.now() - totalStartTime;
    
    // Show loading state
    submitBtn.innerHTML = '<span class="loading"></span> Enviando...';
    submitBtn.disabled = true;
    
    try {
        // Collect form data
        const formData = new FormData(applicationForm);
        const applicationData = {};
        
        for (let [key, value] of formData.entries()) {
            applicationData[key] = value;
        }
        
        // Add timing data and anti-cheat info
        const submissionData = {
            ...applicationData,
            timing: {
                totalTime: finalTotalTime,
                totalTimeFormatted: formatTime(finalTotalTime),
                questionTimes: questionTimes,
                averageTimePerQuestion: finalTotalTime / totalSections
            },
            security: {
                pasteAttempts,
                copyAttempts,
                suspiciousActivity,
                completionIntegrity: suspiciousActivity.length === 0 ? 'CLEAN' : 'SUSPICIOUS'
            }
        };
        
        // Send to Discord webhook
        await sendToDiscordWebhook(submissionData);
        
        // Show success message
        showSuccessMessage();
        
        // Reset form
        setTimeout(() => {
            closeModal();
            resetForm();
        }, 4000);
        
    } catch (error) {
        console.error('Erro ao enviar formulário:', error);
        
        // Show error message
        showErrorMessage();
        
        // Reset button
        submitBtn.innerHTML = 'Enviar Candidatura';
        submitBtn.disabled = false;
    }
}

async function sendToDiscordWebhook(data) {
    const webhookUrl = 'https://discord.com/api/webhooks/1406684833253691534/G46StuWH5Ut6c-z4RKebJ-QWgOEbrdG22rhPbsUG5kEIbltslroFFb2IkcMCzpKi0fBI';
    
    const currentDate = new Date().toLocaleString('pt-BR');
    
    // Create security status
    const securityStatus = data.security.completionIntegrity === 'CLEAN' ? 
        '✅ Limpo' : 
        `⚠️ Suspeito (${data.security.pasteAttempts + data.security.copyAttempts} tentativas)`;
    
    // Questions mapping with full text
    const questionTexts = {
        'nome_completo': 'Qual seu nome completo?',
        'idade': 'Sua idade?',
        'experiencia_policial': 'Já teve experiência como policial?',
        'codigos_q': 'Liste 10 códigos Q utilizados na comunicação policial e seus significados:',
        'codigos_patrulha': 'Explique os códigos de patrulha do 1 ao 6 e suas aplicações:',
        'codigos_abordagem': 'Descreva os códigos de abordagem do 1 ao 3 e quando utilizá-los:',
        'funcoes_p1_p2_p3': 'Explique as funções P1, P2 e P3 em uma operação policial:',
        'modulacao_codigo_0': 'Simule uma modulação de código 0:',
        'modulacao_acompanhamento': 'Simule uma modulação de iniciando acompanhamento a um veículo se evadindo de uma QRU de disparos:',
        'procedimentos_revista': 'Se você precisa realizar uma revista num cidadão, quais são os procedimentos?',
        'corrupcao_providencias': 'Se você vê um policial praticando corrupção, quais as providências que você irá tomar?',
        'agressao_providencia': 'Um indivíduo começa a te agredir sem motivo, e você está em serviço e devidamente armado. Qual sua providência?',
        'backup_situacao': 'Descreva quando e como solicitar backup durante uma operação:'
    };
    
    // Format individual question times
    const individualTimes = Object.keys(data.timing.questionTimes)
        .map((sectionKey, index) => {
            const sectionNumber = index + 1;
            const timeMs = data.timing.questionTimes[sectionKey];
            const timeFormatted = formatTime(timeMs, false);
            return `**Seção ${sectionNumber}:** ${timeFormatted}`;
        }).join('\n');
    
    const embed = {
        title: "🚔 Nova Candidatura - Recrutamento DPD",
        description: "**Formulário de Recrutamento de Conscrito Recebido**\n\nUm novo candidato se inscreveu para ingressar no Detroit Police Department.",
        color: 12377626, // Cor verde #BBDE1A convertida para decimal
        timestamp: new Date().toISOString(),
        footer: {
            text: "DPD - Recrutamento de Conscritos",
            icon_url: "https://images.unsplash.com/photo-1591506670460-5704776d4780?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
        },
        thumbnail: {
            url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
        },
        fields: [
            {
                name: "👤 1. " + questionTexts.nome_completo,
                value: `**Resposta:** ${data.nome_completo}`,
                inline: false
            },
            {
                name: "🎂 2. " + questionTexts.idade,
                value: `**Resposta:** ${data.idade} anos`,
                inline: false
            },
            {
                name: "👮 3. " + questionTexts.experiencia_policial,
                value: `**Resposta:** ${data.experiencia_policial.substring(0, 500)}${data.experiencia_policial.length > 500 ? '...' : ''}`,
                inline: false
            },
            {
                name: "📻 4. " + questionTexts.codigos_q,
                value: `**Resposta:** ${data.codigos_q.substring(0, 500)}${data.codigos_q.length > 500 ? '...' : ''}`,
                inline: false
            },
            {
                name: "🚔 5. " + questionTexts.codigos_patrulha,
                value: `**Resposta:** ${data.codigos_patrulha.substring(0, 500)}${data.codigos_patrulha.length > 500 ? '...' : ''}`,
                inline: false
            },
            {
                name: "🎯 6. " + questionTexts.codigos_abordagem,
                value: `**Resposta:** ${data.codigos_abordagem.substring(0, 500)}${data.codigos_abordagem.length > 500 ? '...' : ''}`,
                inline: false
            },
            {
                name: "⚔️ 7. " + questionTexts.funcoes_p1_p2_p3,
                value: `**Resposta:** ${data.funcoes_p1_p2_p3.substring(0, 500)}${data.funcoes_p1_p2_p3.length > 500 ? '...' : ''}`,
                inline: false
            },
            {
                name: "📡 8. " + questionTexts.modulacao_codigo_0,
                value: `**Resposta:** ${data.modulacao_codigo_0.substring(0, 500)}${data.modulacao_codigo_0.length > 500 ? '...' : ''}`,
                inline: false
            },
            {
                name: "🏃 9. " + questionTexts.modulacao_acompanhamento,
                value: `**Resposta:** ${data.modulacao_acompanhamento.substring(0, 500)}${data.modulacao_acompanhamento.length > 500 ? '...' : ''}`,
                inline: false
            },
            {
                name: "🔍 10. " + questionTexts.procedimentos_revista,
                value: `**Resposta:** ${data.procedimentos_revista.substring(0, 500)}${data.procedimentos_revista.length > 500 ? '...' : ''}`,
                inline: false
            },
            {
                name: "⚖️ 11. " + questionTexts.corrupcao_providencias,
                value: `**Resposta:** ${data.corrupcao_providencias.substring(0, 500)}${data.corrupcao_providencias.length > 500 ? '...' : ''}`,
                inline: false
            },
            {
                name: "🥊 12. " + questionTexts.agressao_providencia,
                value: `**Resposta:** ${data.agressao_providencia.substring(0, 500)}${data.agressao_providencia.length > 500 ? '...' : ''}`,
                inline: false
            },
            {
                name: "🆘 13. " + questionTexts.backup_situacao,
                value: `**Resposta:** ${data.backup_situacao.substring(0, 500)}${data.backup_situacao.length > 500 ? '...' : ''}`,
                inline: false
            },
            {
                name: "⏱️ Dados de Tempo",
                value: `**Tempo Total:** ${data.timing.totalTimeFormatted}\n**Tempo Médio/Pergunta:** ${formatTime(data.timing.averageTimePerQuestion, false)}`,
                inline: true
            },
            {
                name: "🛡️ Status de Segurança",
                value: securityStatus,
                inline: true
            },
            {
                name: "📅 Data de Envio",
                value: currentDate,
                inline: true
            },
            {
                name: "⏰ Tempo Individual por Pergunta",
                value: individualTimes || "Dados não disponíveis",
                inline: false
            },
            {
                name: "🌟 Status da Candidatura",
                value: "📋 Aguardando Análise",
                inline: false
            }
        ]
    };
    
    // Add suspicious activity details if any
    if (data.security.suspiciousActivity.length > 0) {
        embed.fields.push({
            name: "⚠️ Atividades Suspeitas Detectadas",
            value: data.security.suspiciousActivity.slice(0, 3).map(activity => 
                `• ${activity.activity} (Seção ${activity.section})`
            ).join('\n') + (data.security.suspiciousActivity.length > 3 ? '\n• ...' : ''),
            inline: false
        });
    }
    
    const payload = {
        username: "DPD Recruitment System",
        avatar_url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
        embeds: [embed]
    };
    
    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
    }
    
    return response;
}

function showSuccessMessage() {
    const modalContent = document.querySelector('.modal-content');
    modalContent.innerHTML = `
        <div class="success-message" style="text-align: center; padding: 60px 40px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #BBDE1A 0%, #9BC215 100%); 
                        border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                        margin: 0 auto 30px; animation: pulse 2s infinite;">
                <i class="fas fa-check" style="font-size: 2rem; color: white;"></i>
            </div>
            <h2 style="color: #BBDE1A; margin-bottom: 20px; font-family: 'Orbitron', monospace;">
                Candidatura Enviada com Sucesso!
            </h2>
            <p style="color: #64748b; font-size: 1.1rem; line-height: 1.6;">
                Parabéns por completar o formulário de recrutamento do Detroit Police Department! 
                Sua candidatura foi enviada e será analisada pela equipe de recrutamento. 
                Aguarde contato em breve com os próximos passos do processo seletivo.
            </p>
            <div style="margin-top: 30px; padding: 20px; background: #f0fdf4; border-radius: 12px; border-left: 4px solid #BBDE1A;">
                <p style="color: #101210; font-weight: 600; margin: 0;">
                    <i class="fas fa-info-circle" style="margin-right: 10px;"></i>
                    Próximos Passos: Sua candidatura será avaliada e você receberá feedback sobre seu desempenho no teste.
                </p>
            </div>
        </div>
    `;
}

function showErrorMessage() {
    const modalContent = document.querySelector('.modal-content');
    modalContent.innerHTML = `
        <div class="error-message" style="text-align: center; padding: 60px 40px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); 
                        border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                        margin: 0 auto 30px; animation: pulse 2s infinite;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: white;"></i>
            </div>
            <h2 style="color: #ef4444; margin-bottom: 20px; font-family: 'Orbitron', monospace;">
                Erro no Envio
            </h2>
            <p style="color: #64748b; font-size: 1.1rem; line-height: 1.6;">
                Ocorreu um erro ao enviar sua candidatura. Por favor, verifique sua conexão com a internet 
                e tente novamente. Se o problema persistir, entre em contato com o departamento de recrutamento.
            </p>
            <div style="margin-top: 30px;">
                <button onclick="location.reload()" class="btn-primary" style="padding: 15px 30px; border-radius: 50px; font-weight: 700; cursor: pointer; border: none; text-transform: uppercase; letter-spacing: 1px;">
                    Tentar Novamente
                </button>
            </div>
        </div>
    `;
}

function resetForm() {
    currentSection = 1;
    applicationForm.reset();
    
    // Clear all error messages
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
    
    // Remove error styling
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(field => field.classList.remove('error'));
    
    // Reset submit button
    submitBtn.innerHTML = 'Enviar Candidatura';
    submitBtn.disabled = false;
    
    // Reset timers
    totalStartTime = null;
    questionStartTime = null;
    questionTimes = {};
    totalFormTime = 0;
    
    // Reset anti-cheat counters
    pasteAttempts = 0;
    copyAttempts = 0;
    suspiciousActivity = [];
    
    // Reset modal content if it was changed
    if (document.querySelector('.success-message') || document.querySelector('.error-message')) {
        location.reload();
    }
    
    updateFormSection();
}

// Additional utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add loading animation to buttons on click
document.addEventListener('click', (e) => {
    if (e.target.matches('.btn-primary, .enroll-btn, .cta-button')) {
        e.target.style.transform = 'scale(0.98)';
        setTimeout(() => {
            e.target.style.transform = '';
        }, 150);
    }
});

// Keyboard accessibility
document.addEventListener('keydown', (e) => {
    // Close modal with Escape key
    if (e.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
    }
    
    // Navigate form with Arrow keys (only if not in input field)
    if (modal.style.display === 'block' && !isFormField(e.target)) {
        if (e.key === 'ArrowRight' && currentSection < totalSections) {
            nextFormSection();
        } else if (e.key === 'ArrowLeft' && currentSection > 1) {
            prevFormSection();
        }
    }
});

// Smooth animations for page elements
function animateOnScroll() {
    const elements = document.querySelectorAll('.fade-in');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('visible');
        }
    });
}

window.addEventListener('scroll', debounce(animateOnScroll, 50));

// Add CSS error styles dynamically
const style = document.createElement('style');
style.textContent = `
    .error {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }
    
    .fade-in {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    .fade-in.visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    @keyframes shake {
        0%, 100% { transform: translate(-50%, -50%) translateX(0); }
        25% { transform: translate(-50%, -50%) translateX(-5px); }
        75% { transform: translate(-50%, -50%) translateX(5px); }
    }
`;
document.head.appendChild(style);

console.log('DPD Conscript Recruitment website loaded successfully!');
console.warn('Sistema anti-cola ativo. Tentativas de trapacear serão registradas.');
