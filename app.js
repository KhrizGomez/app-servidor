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
    
    console.log("Generando QR y guardando imágenes...");

    // Recolectar las imágenes que el usuario cambió
    let imagenesAGuardar = [];
    imagenes.forEach((img, idx) => {
      // Solo las imágenes que NO son las de defecto
      if (img.getAttribute('data-empty') === 'false' && img.src.startsWith('data:image/')) {
        const nombre = img.getAttribute('data-filename') || `imagen_${idx + 1}.png`;
        const [prefix, base64data] = img.src.split(',');
        const tipo = prefix.match(/data:(.*);base64/)[1];
        
        imagenesAGuardar.push({
          nombre,
          tipo,
          base64data,
          imgId: img.id
        });
        
        console.log(`Preparando para guardar: ${nombre} (${tipo})`);
      }
    });

    if (imagenesAGuardar.length === 0) {
      alert("No hay imágenes nuevas para guardar");
      // Generar QR aunque no haya imágenes
      QR.makeCode("https://khrizgomez.github.io/app-cliente/");
      return;
    }

    let imagenesGuardadas = 0;
    let errores = [];

    // Enviar cada imagen al servidor local
    for (const imgData of imagenesAGuardar) {
      try {
        console.log(`Enviando ${imgData.nombre} al servidor...`);
        
        const response = await fetch('/api/imagen', { // Nota: URL relativa, ya no necesita localhost:3000
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: imgData.nombre,
            tipo: imgData.tipo,
            base64data: imgData.base64data
          })
        });

        const data = await response.json();
        
        if (response.ok && data.mensaje) {
          console.log(`✅ ${imgData.nombre} guardada exitosamente`);
          imagenesGuardadas++;
        } else {
          console.error(`❌ Error al guardar ${imgData.nombre}:`, data.error);
          errores.push(`${imgData.nombre}: ${data.error}`);
        }
        
      } catch (err) {
        console.error(`❌ Error de red al guardar ${imgData.nombre}:`, err);
        errores.push(`${imgData.nombre}: Error de conexión`);
      }
    }

    // Mostrar resultado al usuario
    if (errores.length === 0) {
      alert(`🎉 ¡${imagenesGuardadas} imagen(es) guardada(s) exitosamente en la base de datos!`);
    } else {
      alert(`⚠️ Se guardaron ${imagenesGuardadas} imágenes. Errores: ${errores.join(', ')}`);
    }

    // Generar el código QR
    QR.makeCode("https://khrizgomez.github.io/app-cliente/");
  });
});