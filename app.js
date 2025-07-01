document.addEventListener('DOMContentLoaded', function() {
  const imagenes = document.querySelectorAll('.imagen');
  const fileInput = document.getElementById('entrada-imagen');
  let currentImg = null;

  // Al hacer clic en una imagen, abrir selector de archivos
  imagenes.forEach(img => {
    img.addEventListener('click', function() {
      currentImg = img;
      fileInput.click();
    });
  });

  // Cuando el usuario selecciona un archivo
  fileInput.addEventListener('change', function(event) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onload = function(e) {
        if (currentImg) {
          // Mostrar la imagen seleccionada en la interfaz
          currentImg.src = e.target.result;
          currentImg.setAttribute('data-empty', 'false');
          currentImg.setAttribute('data-filename', file.name);
          console.log(`Imagen ${file.name} cargada para ${currentImg.id}`);
        }
      }
      reader.readAsDataURL(file);
      fileInput.value = '';
    }
  });

  // Código del QR y guardado de imágenes
  const contenedorQR = document.getElementById('contenedorQR');
  const formulario = document.getElementById('btn-generar-qr');
  const QR = new QRCode(contenedorQR);

  formulario.addEventListener('click', async (e) => {
    e.preventDefault();
    QR.makeCode("https://khrizgomez.github.io/app-cliente/");
  });
});