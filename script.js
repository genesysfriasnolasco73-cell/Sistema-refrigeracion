/************* SUPABASE *************/
const SUPABASE_URL = "https://yijkiujzuddkxtjsisme.supabase.co";
const SUPABASE_KEY = "sb_publishable_szKRZzG6v0liIT_56rmaqg_9AhqPQnx";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

/************* MENÚ MÓVIL *************/
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

mobileMenuBtn.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  mobileMenuBtn.innerHTML = navMenu.classList.contains('active')
    ? '<i class="fas fa-times"></i>'
    : '<i class="fas fa-bars"></i>';
});

document.querySelectorAll('.nav-item a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
  });
});

/************* FORMULARIO *************/
const serviceSelect = document.getElementById('tipo-servicio');
const servicePriceDisplay = document.getElementById('servicePriceDisplay');
const selectedServicePrice = document.getElementById('selectedServicePrice');
const totalPriceValue = document.getElementById('totalPriceValue');
const paymentOptions = document.querySelectorAll('.payment-option');
const paymentMessage = document.getElementById('paymentMessage');
const quotationForm = document.getElementById('quotationForm');

/************* PRECIOS *************/
const servicePrices = {
  mantenimiento: 120,
  instalacion: 350,
  reparacion: 250,
  venta: 0
};

serviceSelect.addEventListener('change', function () {
  const price = this.options[this.selectedIndex].getAttribute('data-price');

  if (price !== null) {
    selectedServicePrice.textContent =
      price === "0" ? "Consultar precio" : `$${price}`;
    totalPriceValue.textContent = price;
    servicePriceDisplay.classList.add('show');
  } else {
    servicePriceDisplay.classList.remove('show');
    totalPriceValue.textContent = "0";
  }
});

/************* MÉTODO DE PAGO *************/
paymentOptions.forEach(option => {
  option.addEventListener('click', function () {
    paymentOptions.forEach(opt => opt.classList.remove('selected'));
    this.classList.add('selected');

    const method = this.dataset.payment;
    if (method === 'tarjeta' || method === 'transferencia') {
      paymentMessage.classList.add('show');
    } else {
      paymentMessage.classList.remove('show');
    }
  });
});

/************* ENVIAR FORMULARIO *************/
quotationForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  console.log("🟢 Formulario enviado");

  const selectedPayment = document.querySelector('.payment-option.selected');
  if (!selectedPayment) {
    alert("Seleccione una forma de pago");
    return;
  }

  if (!serviceSelect.value) {
    alert("Seleccione un servicio");
    return;
  }

  const data = {
    Nombre: document.getElementById('nombre').value,
    Apellido: document.getElementById('apellido').value,
    Telefono: document.getElementById('telefono').value,
    Direccion: document.getElementById('direccion').value,
    Servicio: serviceSelect.options[serviceSelect.selectedIndex].text,
    Precio: totalPriceValue.textContent,
    Dia: document.getElementById('dia').value,
    Hora: document.getElementById('hora').value,
    Descripcion: document.getElementById('descripcion').value,
    Pago: selectedPayment.textContent.trim()
  };

  const { error } = await supabase
    .from('cliente')
    .insert([data]);

  if (error) {
    console.error("❌ Error Supabase:", error);
    alert("Error al guardar los datos");
    return;
  }

  alert("✅ Cotización enviada correctamente");

  quotationForm.reset();
  servicePriceDisplay.classList.remove('show');
  paymentMessage.classList.remove('show');
  totalPriceValue.textContent = "0";
  paymentOptions.forEach(opt => opt.classList.remove('selected'));

  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/************* EFECTOS EXTRA *************/
window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  header.style.boxShadow = window.scrollY > 100
    ? '0 5px 20px rgba(0,0,0,.1)'
    : 'var(--shadow)';
});
