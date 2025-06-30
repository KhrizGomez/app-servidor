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
          currentImg.setAttribute('data-empty', 'false'); // Marcamos que la imagen ya no es la de defecto
          currentImg.setAttribute('data-filename', event.target.files[0].name); // Guardamos el nombre del archivo
        }
      }
      reader.readAsDataURL(event.target.files[0]);
      fileInput.value = '';
    }
  });

  // Al presionar el botón "Generar QR"
  const formulario = document.getElementById('btn-generar-qr');
  const contenedorQR = document.getElementById('contenedorQR');
  const QR = new QRCode(contenedorQR);

  formulario.addEventListener('click', async (e) => {
    e.preventDefault();

    // Aquí recolectamos las imágenes que NO son las de defecto
    let imagenesAGuardar = [];
    imagenes.forEach((img, idx) => {
      // Solo guardamos las imágenes que el usuario haya cambiado
      if (img.getAttribute('data-empty') === 'false' && img.src.startsWith('data:image/')) {
        // Obtenemos nombre o generamos uno
        const nombre = img.getAttribute('data-filename') || `imagen${idx+1}.png`;
        const [prefix, base64data] = img.src.split(',');
        const tipo = prefix.match(/data:(.*);base64/)[1];
        imagenesAGuardar.push({
          nombre,
          tipo,
          base64data
        });
      }
    });

    // Enviamos cada imagen al backend
    for (const img of imagenesAGuardar) {
      try {
        const response = await fetch('http://localhost:3000/api/imagen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(img)
        });
        const data = await response.json();
        if (!data.mensaje) {
          alert('Error al guardar una imagen: ' + (data.error || ''));
        }
      } catch (err) {
        alert('Error al guardar una imagen: ' + err.message);
      }
    }

    // Generar el QR después de guardar las imágenes (puedes cambiar el enlace si lo necesitas)
    QR.makeCode("https://khrizgomez.github.io/app-cliente/");
    alert('¡Imágenes guardadas en la base de datos!');
  });
});