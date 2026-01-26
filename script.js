// ============================================
// SCRIPT.JS - CONECTADO A SUPABASE
// ============================================

// 🔧 CONFIGURACIÓN DE SUPABASE - CAMBIA ESTOS VALORES
const supabaseUrl = "https://yijkiujzuddkxtjsisme.supabase.co"; // Tu URL de Supabase
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpamtpdWp6dWRka3h0anNpc21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MTAzNjgsImV4cCI6MjA4MzQ4NjM2OH0.5c_rjImYWbb1xrVcFGu6e68oGeEvRa9XzIwZnDAC6-4"; // Tu ANON KEY aquí (debe empezar con "eyJhbGciOiJ...")

// Variable global para el cliente de Supabase
let supabaseClient;

// ============================================
// FUNCIÓN PARA MOSTRAR NOTIFICACIONES
// ============================================
function showNotification(message, type = 'info') {
    // Eliminar notificaciones anteriores
    const oldNotifications = document.querySelectorAll('.notification');
    oldNotifications.forEach(notification => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Crear nueva notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Icono según el tipo
    const icon = type === 'success' ? '✅' : 
                 type === 'error' ? '❌' : 
                 type === 'warning' ? '⚠️' : 'ℹ️';
    
    notification.innerHTML = `${icon} ${message}`;
    document.body.appendChild(notification);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// ============================================
// INICIALIZACIÓN CUANDO EL DOM ESTÉ LISTO
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM cargado, inicializando funciones...');
    
    // Inicializar todas las funciones
    initSupabase();
    initMobileMenu();
    initQuotationForm();
    initGalleryCarousel();
    initAnimations();
    initSmoothScroll();
    initHeaderEffect();
    initImageErrorHandling();
});

// ============================================
// 1. INICIALIZAR SUPABASE
// ============================================
function initSupabase() {
    try {
        // Verificar que las credenciales estén configuradas
        if (!supabaseUrl || supabaseUrl.includes("TU_URL") || !supabaseAnonKey || supabaseAnonKey.includes("TU_ANON_KEY")) {
            console.warn('⚠️ Credenciales de Supabase no configuradas');
            showNotification('Configure las credenciales de Supabase en script.js', 'warning');
            return;
        }
        
        // Verificar que la biblioteca Supabase esté cargada
        if (typeof supabase === 'undefined') {
            console.error('❌ Error: Biblioteca Supabase no cargada');
            showNotification('Error: No se puede conectar con el servidor', 'error');
            return;
        }
        
        // Inicializar cliente de Supabase
        supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);
        console.log('✅ Supabase inicializado correctamente');
        
        // Verificar conexión después de 1 segundo
        setTimeout(checkSupabaseConnection, 1000);
        
    } catch (error) {
        console.error('❌ Error al inicializar Supabase:', error);
        showNotification('Error al conectar con la base de datos', 'error');
    }
}

// ============================================
// 2. VERIFICAR CONEXIÓN CON SUPABASE
// ============================================
async function checkSupabaseConnection() {
    if (!supabaseClient) return;
    
    try {
        console.log('🔍 Verificando conexión con Supabase...');
        
        // Intentar una consulta simple
        const { data, error } = await supabaseClient
            .from('Cliente')
            .select('id_cliente')
            .limit(1);
        
        if (error) {
            console.error('❌ Error de conexión con Supabase:', error);
            
            if (error.code === 'PGRST301' || error.message.includes('JWT')) {
                showNotification('Error de autenticación. Verifique la clave API.', 'error');
            } else if (error.code === '42501') {
                showNotification('Error de permisos. Verifique las políticas RLS en Supabase.', 'error');
            } else {
                showNotification(`Error de conexión: ${error.message}`, 'error');
            }
        } else {
            console.log('✅ Conexión con Supabase establecida');
            // showNotification('✅ Conectado a la base de datos', 'success');
        }
    } catch (error) {
        console.error('❌ Error al verificar conexión:', error);
    }
}

// ============================================
// 3. MENÚ MÓVIL
// ============================================
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (!mobileMenuBtn || !navMenu) {
        console.warn('⚠️ Elementos del menú móvil no encontrados');
        return;
    }
    
    // Abrir/cerrar menú
    mobileMenuBtn.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        const icon = this.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        }
    });
    
    // Cerrar menú al hacer clic en enlaces
    document.querySelectorAll('.nav-item a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });
}

// ============================================
// 4. FORMULARIO DE COTIZACIÓN - CON SUPABASE
// ============================================
function initQuotationForm() {
    const quotationForm = document.getElementById('quotationForm');
    const serviceSelect = document.getElementById('Tipo_Servicio');
    const servicePriceDisplay = document.getElementById('servicePriceDisplay');
    const selectedServicePrice = document.getElementById('selectedServicePrice');
    const totalPriceValue = document.getElementById('totalPriceValue');
    const paymentOptions = document.querySelectorAll('.payment-option');
    const paymentMessage = document.getElementById('paymentMessage');
    const togglePaymentBtn = document.getElementById('togglePaymentBtn');
    const paymentSection = document.getElementById('paymentSection');
    const formMessage = document.getElementById('formMessage');
    
    if (!quotationForm) {
        console.warn('⚠️ Formulario de cotización no encontrado');
        return;
    }
    
    console.log('✅ Formulario encontrado, configurando eventos...');
    
    // 4.1. Mostrar precio del servicio seleccionado
    if (serviceSelect) {
        serviceSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const price = selectedOption.getAttribute('data-price');
            
            if (price && price !== "0") {
                selectedServicePrice.textContent = `$${price}`;
                if (servicePriceDisplay) servicePriceDisplay.classList.add('show');
                if (totalPriceValue) totalPriceValue.textContent = price;
            } else if (price === "0") {
                selectedServicePrice.textContent = 'Consultar';
                if (servicePriceDisplay) servicePriceDisplay.classList.add('show');
                if (totalPriceValue) totalPriceValue.textContent = '0';
            } else {
                if (servicePriceDisplay) servicePriceDisplay.classList.remove('show');
                if (totalPriceValue) totalPriceValue.textContent = '0';
            }
        });
    }
    
    // 4.2. Mostrar/ocultar sección de pago
    if (togglePaymentBtn && paymentSection) {
        togglePaymentBtn.addEventListener('click', function() {
            paymentSection.classList.toggle('show');
            if (paymentSection.classList.contains('show')) {
                this.innerHTML = '<i class="fas fa-credit-card"></i> Ocultar forma de pago';
            } else {
                this.innerHTML = '<i class="fas fa-credit-card"></i> Seleccionar forma de pago';
            }
        });
    }
    
    // 4.3. Seleccionar opción de pago
    if (paymentOptions.length > 0) {
        paymentOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remover selección anterior
                paymentOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Agregar selección actual
                this.classList.add('selected');
                
                // Mostrar mensaje si no es efectivo
                const paymentType = this.getAttribute('data-payment');
                if (paymentType !== 'Efectivo' && paymentMessage) {
                    paymentMessage.classList.add('show');
                } else if (paymentMessage) {
                    paymentMessage.classList.remove('show');
                }
            });
        });
    }
    
    // 4.4. ENVÍO DEL FORMULARIO A SUPABASE
    quotationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Ocultar mensaje anterior
        if (formMessage) {
            formMessage.className = 'form-message';
            formMessage.textContent = '';
        }
        
        // Validar campos requeridos
        const requiredFields = [
            { id: 'Nombre', name: 'Nombre' },
            { id: 'Apellido', name: 'Apellido' },
            { id: 'Telefono', name: 'Teléfono' },
            { id: 'Direccion', name: 'Dirección' },
            { id: 'Tipo_Servicio', name: 'Tipo de Servicio' },
            { id: 'Descripcion_o_Equipo_a_comprar', name: 'Descripción' },
            { id: 'Dia_Disponible', name: 'Día disponible' },
            { id: 'Hora_Disponible', name: 'Hora disponible' }
        ];
        
        for (const field of requiredFields) {
            const element = document.getElementById(field.id);
            if (!element || !element.value.trim()) {
                showNotification(`Por favor, complete el campo: ${field.name}`, 'warning');
                if (element) element.focus();
                return;
            }
        }
        
        // Validar que se haya seleccionado forma de pago si la sección está visible
        if (paymentSection && paymentSection.classList.contains('show')) {
            const selectedPayment = document.querySelector('.payment-option.selected');
            if (!selectedPayment) {
                showNotification('Por favor, seleccione una forma de pago', 'warning');
                return;
            }
        }
        
        // Preparar datos del formulario
        const formData = {
            nombre: document.getElementById('Nombre').value.trim(),
            apellido: document.getElementById('Apellido').value.trim(),
            telefono: document.getElementById('Telefono').value.trim(),
            direccion: document.getElementById('Direccion').value.trim(),
            tipo_servicio: serviceSelect.value,
            dia_disponible: document.getElementById('Dia_Disponible').value,
            hora_disponible: document.getElementById('Hora_Disponible').value,
            descripcion_o_equipo_a_comprar: document.getElementById('Descripcion_o_Equipo_a_comprar').value.trim(),
            forma_pago: document.querySelector('.payment-option.selected') 
                ? document.querySelector('.payment-option.selected').getAttribute('data-payment') 
                : 'No seleccionada',
            created_at: new Date().toISOString()
        };
        
        console.log('📤 Enviando datos a Supabase:', formData);
        
        // Mostrar estado de carga
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;
        
        try {
            // Verificar que Supabase esté inicializado
            if (!supabaseClient) {
                throw new Error('No hay conexión con la base de datos');
            }
            
            // Enviar datos a Supabase
            const { data, error } = await supabaseClient
                .from('Cliente')
                .insert([formData])
                .select();
            
            if (error) {
                console.error('❌ Error de Supabase:', error);
                
                // Manejar errores específicos
                if (error.code === '23505') {
                    throw new Error('Este registro ya existe en el sistema');
                } else if (error.code === '42501') {
                    throw new Error('Error de permisos. Verifique las políticas RLS en Supabase');
                } else if (error.code === '23514') {
                    throw new Error('Error en los datos. Verifique los valores ingresados');
                } else {
                    throw new Error(`Error del servidor: ${error.message}`);
                }
            }
            
            // Éxito
            console.log('✅ Datos guardados correctamente:', data);
            showNotification('✅ ¡Cotización enviada correctamente! Nos pondremos en contacto pronto.', 'success');
            
            // Mostrar mensaje en el formulario
            if (formMessage) {
                formMessage.className = 'form-message success';
                formMessage.innerHTML = '<i class="fas fa-check-circle"></i> Cotización enviada correctamente. ID: ' + (data[0]?.id_cliente || 'N/A');
            }
            
            // Limpiar formulario
            this.reset();
            if (servicePriceDisplay) servicePriceDisplay.classList.remove('show');
            if (totalPriceValue) totalPriceValue.textContent = '0';
            if (paymentOptions.length > 0) {
                paymentOptions.forEach(opt => opt.classList.remove('selected'));
            }
            if (paymentMessage) paymentMessage.classList.remove('show');
            if (paymentSection) paymentSection.classList.remove('show');
            if (togglePaymentBtn) {
                togglePaymentBtn.innerHTML = '<i class="fas fa-credit-card"></i> Seleccionar forma de pago';
            }
            
            // Scroll al inicio del formulario
            setTimeout(() => {
                quotationForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 500);
            
        } catch (error) {
            console.error('❌ Error al enviar formulario:', error);
            showNotification(`❌ ${error.message}`, 'error');
            
            // Mostrar mensaje de error en el formulario
            if (formMessage) {
                formMessage.className = 'form-message error';
                formMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${error.message}`;
            }
            
        } finally {
            // Restaurar botón
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ============================================
// 5. CARRUSEL DE GALERÍA
// ============================================
function initGalleryCarousel() {
    const carouselTrack = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const carouselDots = document.getElementById('carouselDots');
    const slides = document.querySelectorAll('.carousel-slide');
    
    if (!slides.length || !carouselTrack || !carouselDots) {
        console.warn('⚠️ Elementos del carrusel no encontrados');
        return;
    }
    
    let currentSlide = 0;
    let carouselInterval;
    
    // Crear puntos indicadores
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.classList.add('carousel-dot');
        dot.setAttribute('aria-label', `Ir a diapositiva ${index + 1}`);
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        carouselDots.appendChild(dot);
    });
    
    const dots = document.querySelectorAll('.carousel-dot');
    
    // Actualizar carrusel
    function updateCarousel() {
        carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Actualizar puntos activos
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }
    
    // Siguiente diapositiva
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        updateCarousel();
    }
    
    // Anterior diapositiva
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateCarousel();
    }
    
    // Ir a diapositiva específica
    function goToSlide(index) {
        currentSlide = index;
        updateCarousel();
        resetCarouselInterval();
    }
    
    // Reiniciar intervalo automático
    function resetCarouselInterval() {
        clearInterval(carouselInterval);
        carouselInterval = setInterval(nextSlide, 5000);
    }
    
    // Event listeners
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    
    // Carrusel automático
    carouselInterval = setInterval(nextSlide, 5000);
    
    // Pausar al pasar el mouse
    const carouselContainer = document.querySelector('.gallery-carousel');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => {
            clearInterval(carouselInterval);
        });
        
        carouselContainer.addEventListener('mouseleave', () => {
            resetCarouselInterval();
        });
    }
    
    // Inicializar
    updateCarousel();
}

// ============================================
// 6. ANIMACIONES AL HACER SCROLL
// ============================================
function initAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    function checkFade() {
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.classList.add('visible');
            }
        });
    }
    
    // Verificar al cargar y al hacer scroll
    window.addEventListener('scroll', checkFade);
    window.addEventListener('load', checkFade);
    
    // Verificar inmediatamente
    checkFade();
}

// ============================================
// 7. SCROLL SUAVE PARA ENLACES INTERNOS
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight || 80;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// 8. EFECTO EN HEADER AL HACER SCROLL
// ============================================
function initHeaderEffect() {
    const header = document.querySelector('header');
    
    if (!header) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.backgroundColor = 'rgba(26, 26, 26, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
            header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.backgroundColor = '';
            header.style.backdropFilter = '';
            header.style.boxShadow = '';
        }
    });
}

// ============================================
// 9. MANEJAR ERRORES DE IMÁGENES
// ============================================
function initImageErrorHandling() {
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            console.warn(`⚠️ Imagen no encontrada: ${this.src}`);
            
            // Reemplazar con imagen de respaldo
            if (this.classList.contains('local-image')) {
                const placeholderText = this.alt || 'Imagen';
                this.src = `https://placehold.co/300x200/001a33/0066cc?text=${encodeURIComponent(placeholderText)}`;
                console.log('🔄 Imagen reemplazada con placeholder');
            }
        });
    });
}

// ============================================
// 10. FUNCIÓN PARA PROBAR CONEXIÓN
// ============================================
async function testSupabaseConnection() {
    if (!supabaseClient) {
        console.error('❌ Supabase no inicializado');
        return false;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('Cliente')
            .select('count')
            .limit(1);
        
        if (error) {
            console.error('❌ Error de prueba:', error);
            return false;
        }
        
        console.log('✅ Prueba de conexión exitosa');
        return true;
    } catch (error) {
        console.error('❌ Error en prueba:', error);
        return false;
    }
}

// ============================================
// INSTRUCCIONES PARA CONFIGURAR
// ============================================
console.log(`
📋 INSTRUCCIONES PARA CONFIGURAR SUPABASE:

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. En Settings → API, copia:
   - URL: ${supabaseUrl || "Tu URL aquí"}
   - anon (public) key: (empieza con "eyJhbGciOiJ...")

3. Reemplaza en script.js:
   const supabaseAnonKey = "TU_ANON_KEY_AQUÍ";

4. Configura políticas RLS en Supabase:
   - Ve a Authentication → Policies
   - Para la tabla "Cliente", crea:
     CREATE POLICY "Permitir INSERT" ON "Cliente" FOR INSERT TO anon WITH CHECK (true);
     CREATE POLICY "Permitir SELECT" ON "Cliente" FOR SELECT TO anon USING (true);

5. Prueba el formulario y verifica en Supabase Table Editor
`);
