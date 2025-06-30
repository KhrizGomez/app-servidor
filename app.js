document.addEventListener('DOMContentLoaded', function() {
  const imagenes = document.querySelectorAll('.imagen');
  const fileInput = document.getElementById('entrada-imagen');
  let currentImg = null;

  imagenes.forEach(img => {
    img.addEventListener('click', function() {
      currentImg = img;
      fileInput.click();
    });
  });

  fileInput.addEventListener('change', function(event) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        if (currentImg) {
          currentImg.src = e.target.result;
          currentImg.setAttribute('data-empty', 'false');
        }
      }
      reader.readAsDataURL(event.target.files[0]);
      fileInput.value = '';
    }
  });
});

const contenedorQR = document.getElementById('contenedorQR');
const formulario = document.getElementById('btn-generar-qr');

const QR = new QRCode(contenedorQR);

formulario.addEventListener('click', (e) => {
	e.preventDefault();
	QR.makeCode("https://khrizgomez.github.io/app-cliente/");
});