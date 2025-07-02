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

  // Código del QR y guardado de imágenes localmente
  const contenedorQR = document.getElementById('contenedorQR');
  const formulario = document.getElementById('btn-generar-qr');
  const QR = new QRCode(contenedorQR);

  // Función para guardar imágenes en archivo temporal para BD
  function guardarImagenesParaBD(imagenes) {
    try {
      // Guardar en archivo temporal para procesamiento por script de BD
      const dataStr = JSON.stringify(imagenes, null, 2);
      const dataBlob = new Blob([dataStr], {type: 'application/json'});
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = 'imagenes_temp.json';
      link.click();
      
      // También guardar en localStorage como respaldo
      const imagenesExistentes = JSON.parse(localStorage.getItem('imagenes_guardadas') || '[]');
      imagenes.forEach(img => {
        imagenesExistentes.push({
          ...img,
          fecha_subida: new Date().toISOString(),
          id_unico: Date.now() + Math.random()
        });
      });
      localStorage.setItem('imagenes_guardadas', JSON.stringify(imagenesExistentes));
      
      return true;
    } catch (error) {
      console.error('Error al preparar imágenes:', error);
      return false;
    }
  }

  formulario.addEventListener('click', async (e) => {
    e.preventDefault();
    
    // Recopilar todas las imágenes que no estén vacías
    const imagenesParaGuardar = [];
    imagenes.forEach(img => {
      if (img.getAttribute('data-empty') === 'false') {
        imagenesParaGuardar.push({
          nombre: img.getAttribute('data-filename'),
          src: img.src,
          id: img.id
        });
      }
    });

    if (imagenesParaGuardar.length === 0) {
      alert('Por favor, selecciona al menos una imagen antes de generar el QR');
      return;
    }

    try {
      // Mostrar mensaje de carga
      formulario.textContent = 'Guardando...';
      formulario.disabled = true;

      // Guardar imágenes para BD
      const guardadoExitoso = guardarImagenesParaBD(imagenesParaGuardar);

      if (guardadoExitoso) {
        console.log('Imágenes preparadas para guardar en BD');
        alert(`✅ ${imagenesParaGuardar.length} imágenes preparadas. Se descargó 'imagenes_temp.json'.\n\nPara guardar en BD ejecuta: node guardar-imagenes-bd.js`);
        
        // Generar QR después de guardar
        QR.makeCode("https://khrizgomez.github.io/app-cliente/");
      } else {
        alert('❌ Error al preparar las imágenes');
      }

    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al procesar las imágenes');
    } finally {
      // Restaurar botón
      formulario.textContent = 'Generar QR';
      formulario.disabled = false;
    }
  });
});