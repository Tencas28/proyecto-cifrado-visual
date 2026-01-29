class MobileColorCipher {
    constructor() {
        this.initElements();
        this.initEventListeners();
        this.initTouchEvents();
        this.pixelSize = 20;
        this.currentColorPairs = [];
    }

    initElements() {
        // Input y output
        this.textInput = document.getElementById('textInput');
        this.hexOutput = document.getElementById('hexOutput');
        this.colorPalette = document.getElementById('colorPalette');
        this.htmlColors = document.getElementById('htmlColors');
        this.visualRepresentation = document.getElementById('visualRepresentation');
        this.infoDisplay = document.getElementById('infoDisplay');
        
        // Contadores
        this.charCount = document.getElementById('charCount');
        this.colorCount = document.getElementById('colorCount');
        
        // Botones principales
        this.encryptBtn = document.getElementById('encryptBtn');
        this.decryptBtn = document.getElementById('decryptBtn');
        this.clearBtn = document.getElementById('clearBtn');
        
        // Botones de utilidad
        this.pasteBtn = document.getElementById('pasteBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.sampleBtn = document.getElementById('sampleBtn');
        
        // Botones de copiado
        this.copyHexBtn = document.getElementById('copyHexBtn');
        this.copyPaletteBtn = document.getElementById('copyPaletteBtn');
        this.copyCodeBtn = document.getElementById('copyCodeBtn');
        
        // Controles visuales
        this.zoomInBtn = document.getElementById('zoomInBtn');
        this.zoomOutBtn = document.getElementById('zoomOutBtn');
        this.saveImageBtn = document.getElementById('saveImageBtn');
        
        // Modal
        this.exportModal = document.getElementById('exportModal');
        this.exportPngBtn = document.getElementById('exportPngBtn');
        this.exportJpgBtn = document.getElementById('exportJpgBtn');
        this.exportSimpleBtn = document.getElementById('exportSimpleBtn');
        this.cancelExportBtn = document.getElementById('cancelExportBtn');
        
        // Toast
        this.toast = document.getElementById('toast');
    }

    initEventListeners() {
        // Contador de caracteres
        this.textInput.addEventListener('input', () => {
            this.charCount.textContent = this.textInput.value.length;
        });

        // Botones principales
        this.encryptBtn.addEventListener('click', () => this.encrypt());
        this.decryptBtn.addEventListener('click', () => this.decrypt());
        this.clearBtn.addEventListener('click', () => this.clearAll());

        // Botones de utilidad
        this.pasteBtn.addEventListener('click', () => this.pasteFromClipboard());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.sampleBtn.addEventListener('click', () => this.loadSample());

        // Botones de copiado
        this.copyHexBtn.addEventListener('click', () => this.copyHex());
        this.copyPaletteBtn.addEventListener('click', () => this.copyPalette());
        this.copyCodeBtn.addEventListener('click', () => this.copyCode());

        // Controles visuales
        this.zoomInBtn.addEventListener('click', () => this.zoomIn());
        this.zoomOutBtn.addEventListener('click', () => this.zoomOut());
        this.saveImageBtn.addEventListener('click', () => this.showExportModal());

        // Modal de exportación
        this.exportPngBtn.addEventListener('click', () => {
            this.hideExportModal();
            this.exportImage('png');
        });
        
        this.exportJpgBtn.addEventListener('click', () => {
            this.hideExportModal();
            this.exportImage('jpg');
        });
        
        this.exportSimpleBtn.addEventListener('click', () => {
            this.hideExportModal();
            this.saveAsImageSimple();
        });
        
        this.cancelExportBtn.addEventListener('click', () => this.hideExportModal());
        
        // Cerrar modal al tocar fuera
        this.exportModal.addEventListener('click', (e) => {
            if (e.target === this.exportModal) {
                this.hideExportModal();
            }
        });

        // Enter para cifrar en dispositivos con teclado físico
        this.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                this.encrypt();
            }
        });
    }

    initTouchEvents() {
        // Soporte para toque prolongado
        let touchTimer;
        this.colorPalette.addEventListener('touchstart', (e) => {
            const colorBox = e.target.closest('.color-box');
            if (colorBox) {
                touchTimer = setTimeout(() => {
                    this.showColorDetails(colorBox.style.backgroundColor);
                }, 800);
            }
        }, { passive: true });

        this.colorPalette.addEventListener('touchend', () => {
            clearTimeout(touchTimer);
        }, { passive: true });

        this.colorPalette.addEventListener('touchmove', () => {
            clearTimeout(touchTimer);
        }, { passive: true });
    }

    // Funciones principales
    textToHex(text) {
        let hex = '';
        for (let i = 0; i < text.length; i++) {
            const hexChar = text.charCodeAt(i).toString(16).padStart(2, '0');
            hex += hexChar;
        }
        return hex;
    }

    hexToText(hex) {
        let text = '';
        for (let i = 0; i < hex.length; i += 2) {
            const hexChar = hex.substr(i, 2);
            text += String.fromCharCode(parseInt(hexChar, 16));
        }
        return text;
    }

    hexToColorPairs(hex) {
        const pairs = [];
        for (let i = 0; i < hex.length; i += 6) {
            let colorHex = hex.substr(i, 6);
            while (colorHex.length < 6) {
                colorHex += '0';
            }
            pairs.push(colorHex);
        }
        return pairs;
    }

    async encrypt() {
        const text = this.textInput.value.trim();
        
        if (!text) {
            this.showToast('⚠️ Escribe un mensaje primero');
            this.textInput.focus();
            return;
        }

        if (text.length > 500) {
            this.showToast('⚠️ Máximo 500 caracteres');
            return;
        }

        try {
            // Mostrar carga
            this.showToast('🔐 Cifrando...');

            // Convertir a hexadecimal
            const hex = this.textToHex(text);
            this.hexOutput.textContent = hex;

            // Generar colores
            const colorPairs = this.hexToColorPairs(hex);
            this.currentColorPairs = colorPairs;
            this.colorCount.textContent = `${colorPairs.length} colores generados`;

            // Crear paleta de colores
            this.createColorPalette(colorPairs);

            // Crear vista previa
            this.createVisualRepresentation(colorPairs);

            // Generar código HTML
            this.generateHTMLCode(colorPairs);

            // Mostrar información
            this.displayInfo(text, hex, colorPairs);

            this.showToast('✅ Mensaje cifrado correctamente');
        } catch (error) {
            this.showToast('❌ Error al cifrar');
            console.error(error);
        }
    }

    decrypt() {
        const hex = this.hexOutput.textContent;
        
        if (!hex) {
            this.showToast('⚠️ No hay datos hexadecimales');
            return;
        }

        try {
            const text = this.hexToText(hex);
            this.textInput.value = text;
            this.charCount.textContent = text.length;
            this.showToast('🔓 Texto descifrado');
        } catch (error) {
            this.showToast('❌ Error: hexadecimal inválido');
        }
    }

    clearAll() {
        this.textInput.value = '';
        this.hexOutput.textContent = '';
        this.colorPalette.innerHTML = '';
        this.htmlColors.textContent = '';
        this.visualRepresentation.innerHTML = '';
        this.infoDisplay.innerHTML = '';
        this.charCount.textContent = '0';
        this.colorCount.textContent = '0 colores generados';
        this.pixelSize = 20;
        this.currentColorPairs = [];
        this.showToast('🗑️ Todo limpiado');
    }

    // Funciones de utilidad móvil
    async pasteFromClipboard() {
        try {
            if (!navigator.clipboard) {
                this.showToast('📝 Pegue manualmente en el área de texto');
                this.textInput.focus();
                return;
            }
            
            const text = await navigator.clipboard.readText();
            this.textInput.value = text;
            this.charCount.textContent = text.length;
            this.showToast('📋 Texto pegado');
        } catch (error) {
            this.showToast('👆 Use el menú contextual para pegar');
            this.textInput.focus();
        }
    }

    async copyToClipboard() {
        const text = this.textInput.value;
        if (!text) {
            this.showToast('⚠️ No hay texto para copiar');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showToast('📋 Texto copiado');
        } catch (error) {
            this.showToast('❌ Error al copiar');
        }
    }

    loadSample() {
        const samples = [
            "¡Hola Mundo! 🌍",
            "El cifrado visual es increíble",
            "Texto a colores hexadecimales",
            "Prueba este sistema móvil",
            "1234567890 ABCDEF"
        ];
        
        const randomSample = samples[Math.floor(Math.random() * samples.length)];
        this.textInput.value = randomSample;
        this.charCount.textContent = randomSample.length;
        this.showToast('✨ Ejemplo cargado');
    }

    // Funciones de visualización
    createColorPalette(colorPairs) {
        this.colorPalette.innerHTML = '';
        
        colorPairs.forEach((pair, index) => {
            const colorBox = document.createElement('div');
            colorBox.className = 'color-box';
            colorBox.style.backgroundColor = `#${pair}`;
            colorBox.dataset.color = `#${pair.toUpperCase()}`;
            colorBox.dataset.index = index + 1;
            
            const colorCode = document.createElement('div');
            colorCode.className = 'color-code';
            colorCode.textContent = `#${pair.substring(0, 6).toUpperCase()}`;
            colorBox.appendChild(colorCode);
            
            // Eventos táctiles
            colorBox.addEventListener('click', () => this.copyColor(pair));
            
            this.colorPalette.appendChild(colorBox);
        });
    }

    createVisualRepresentation(colorPairs) {
        this.visualRepresentation.innerHTML = '';
        
        const containerWidth = this.visualRepresentation.clientWidth;
        const maxCols = Math.max(1, Math.floor(containerWidth / this.pixelSize));
        
        colorPairs.forEach(pair => {
            const pixel = document.createElement('div');
            pixel.className = 'pixel';
            pixel.style.width = `${this.pixelSize}px`;
            pixel.style.height = `${this.pixelSize}px`;
            pixel.style.backgroundColor = `#${pair}`;
            pixel.title = `#${pair.toUpperCase()}`;
            this.visualRepresentation.appendChild(pixel);
        });
    }

    generateHTMLCode(colorPairs) {
        let code = '<!-- Colores generados automáticamente -->\n';
        code += '<div class="color-palette">\n';
        
        colorPairs.forEach(pair => {
            code += `  <div class="color-box" style="background-color: #${pair.toUpperCase()};">\n`;
            code += `    <span class="color-code">#${pair.toUpperCase()}</span>\n`;
            code += `  </div>\n`;
        });
        
        code += '</div>\n\n';
        code += '<!-- CSS correspondiente -->\n';
        code += '<style>\n';
        code += '  .color-palette {\n';
        code += '    display: flex;\n';
        code += '    flex-wrap: wrap;\n';
        code += '    gap: 10px;\n';
        code += '    padding: 20px;\n';
        code += '  }\n\n';
        code += '  .color-box {\n';
        code += '    width: 60px;\n';
        code += '    height: 60px;\n';
        code += '    border-radius: 8px;\n';
        code += '    display: flex;\n';
        code += '    align-items: center;\n';
        code += '    justify-content: center;\n';
        code += '  }\n\n';
        code += '  .color-code {\n';
        code += '    background: rgba(0,0,0,0.7);\n';
        code += '    color: white;\n';
        code += '    padding: 3px 6px;\n';
        code += '    border-radius: 4px;\n';
        code += '    font-size: 12px;\n';
        code += '  }\n';
        code += '</style>';
        
        this.htmlColors.textContent = code;
    }

    displayInfo(text, hex, colorPairs) {
        const charCount = text.length;
        const hexLength = hex.length;
        const colorCount = colorPairs.length;
        
        this.infoDisplay.innerHTML = `
            <div class="info-item">
                <strong>Caracteres:</strong> ${charCount}
            </div>
            <div class="info-item">
                <strong>Hex longitud:</strong> ${hexLength}
            </div>
            <div class="info-item">
                <strong>Colores:</strong> ${colorCount}
            </div>
            <div class="info-item">
                <strong>Relación:</strong> ${(charCount/colorCount).toFixed(1)}:1
            </div>
            <div class="info-item">
                <strong>Bytes:</strong> ${Math.ceil(hexLength/2)}
            </div>
            <div class="info-item">
                <strong>Tamaño píxel:</strong> ${this.pixelSize}px
            </div>
        `;
    }

    // Funciones de copiado
    async copyHex() {
        const hex = this.hexOutput.textContent;
        if (!hex) {
            this.showToast('⚠️ No hay hexadecimal');
            return;
        }

        try {
            await navigator.clipboard.writeText(hex);
            this.showToast('📋 Hexadecimal copiado');
        } catch (error) {
            this.showToast('❌ Error al copiar');
        }
    }

    async copyPalette() {
        const colorBoxes = this.colorPalette.querySelectorAll('.color-box');
        if (colorBoxes.length === 0) {
            this.showToast('⚠️ No hay colores');
            return;
        }

        let paletteText = 'Paleta de colores:\n';
        colorBoxes.forEach(box => {
            paletteText += `${box.dataset.color}\n`;
        });

        try {
            await navigator.clipboard.writeText(paletteText);
            this.showToast('🎨 Paleta copiada');
        } catch (error) {
            this.showToast('❌ Error al copiar');
        }
    }

    async copyCode() {
        const code = this.htmlColors.textContent;
        if (!code.trim()) {
            this.showToast('⚠️ No hay código');
            return;
        }

        try {
            await navigator.clipboard.writeText(code);
            this.showToast('📋 Código copiado');
        } catch (error) {
            this.showToast('❌ Error al copiar');
        }
    }

    async copyColor(colorHex) {
        try {
            await navigator.clipboard.writeText(`#${colorHex.toUpperCase()}`);
            this.showToast(`🎨 #${colorHex.toUpperCase()} copiado`);
        } catch (error) {
            this.showToast('❌ Error al copiar color');
        }
    }

    // Controles visuales
    zoomIn() {
        if (this.pixelSize < 40) {
            this.pixelSize += 2;
            this.updateVisualRepresentation();
            this.showToast(`🔍 Zoom: ${this.pixelSize}px`);
        }
    }

    zoomOut() {
        if (this.pixelSize > 10) {
            this.pixelSize -= 2;
            this.updateVisualRepresentation();
            this.showToast(`🔍 Zoom: ${this.pixelSize}px`);
        }
    }

    updateVisualRepresentation() {
        const pixels = this.visualRepresentation.querySelectorAll('.pixel');
        pixels.forEach(pixel => {
            pixel.style.width = `${this.pixelSize}px`;
            pixel.style.height = `${this.pixelSize}px`;
        });
    }

    // Funciones de exportación de imagen
    showExportModal() {
        if (!this.currentColorPairs || this.currentColorPairs.length === 0) {
            this.showToast('⚠️ Primero genera colores con "Cifrar"');
            return;
        }
        this.exportModal.style.display = 'flex';
    }

    hideExportModal() {
        this.exportModal.style.display = 'none';
    }

    exportImage(format = 'png') {
        if (!this.currentColorPairs || this.currentColorPairs.length === 0) {
            this.showToast('⚠️ No hay colores para exportar');
            return;
        }

        try {
            const canvas = this.createProfessionalCanvas();
            const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
            const extension = format === 'jpg' ? 'jpg' : 'png';
            const quality = format === 'jpg' ? 0.9 : 1.0;
            
            canvas.toBlob((blob) => {
                if (!blob) {
                    throw new Error('No se pudo crear la imagen');
                }
                
                this.downloadBlob(blob, `cifrado-visual-${Date.now()}.${extension}`);
                this.showToast(`📸 Imagen ${extension.toUpperCase()} descargada`);
            }, mimeType, quality);
            
        } catch (error) {
            console.error('Error al exportar imagen:', error);
            this.showToast('❌ Error al generar imagen');
        }
    }

    createProfessionalCanvas() {
        const colors = this.currentColorPairs;
        const pixelSize = 60;
        const columns = 8;
        const rows = Math.ceil(colors.length / columns);
        const margin = 10;
        const padding = 40;
        
        // Dimensiones
        const canvasWidth = columns * (pixelSize + margin) + padding * 2;
        const canvasHeight = padding * 2 + rows * (pixelSize + margin) + 120; // +120 para título y info
        
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');
        
        // Fondo degradado
        const gradient = ctx.createLinearGradient(0, 0, canvasWidth, 0);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Área de contenido
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(20, 20, canvasWidth - 40, canvasHeight - 40);
        
        // Título
        ctx.fillStyle = '#1a1a2e';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎨 PALETA DE COLORES CIFRADA', canvasWidth / 2, 60);
        
        // Información
        ctx.fillStyle = '#4361ee';
        ctx.font = '14px Arial';
        const originalText = this.textInput.value.substring(0, 30);
        ctx.fillText(`"${originalText}${this.textInput.value.length > 30 ? '...' : ''}"`, canvasWidth / 2, 85);
        
        ctx.fillStyle = '#6c757d';
        ctx.font = '12px Arial';
        ctx.fillText(
            `${colors.length} colores | ${this.textInput.value.length} caracteres`,
            canvasWidth / 2,
            105
        );
        
        // Dibujar colores
        colors.forEach((color, index) => {
            const row = Math.floor(index / columns);
            const col = index % columns;
            
            const x = padding + col * (pixelSize + margin);
            const y = 130 + row * (pixelSize + margin);
            
            // Cuadrado de color
            ctx.fillStyle = `#${color}`;
            ctx.fillRect(x, y, pixelSize, pixelSize);
            
            // Borde
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, pixelSize, pixelSize);
            
            // Código hex
            ctx.fillStyle = '#1a1a2e';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`#${color}`, x + pixelSize / 2, y + pixelSize + 15);
            
            // Número de índice
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 12px Arial';
            ctx.fillText((index + 1).toString(), x + pixelSize / 2, y + pixelSize / 2);
        });
        
        // Pie de página
        ctx.fillStyle = '#1a1a2e';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Sistema de Cifrado Visual', 30, canvasHeight - 20);
        
        ctx.textAlign = 'right';
        const timestamp = new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        ctx.fillText(`Generado: ${timestamp}`, canvasWidth - 30, canvasHeight - 20);
        
        return canvas;
    }

    saveAsImageSimple() {
        if (!this.currentColorPairs || this.currentColorPairs.length === 0) {
            this.showToast('⚠️ Primero genera colores con "Cifrar"');
            return;
        }

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const colors = this.currentColorPairs;
            
            // Configuración simple
            const pixelSize = 40;
            const cols = 10;
            const rows = Math.ceil(colors.length / cols);
            const margin = 5;
            
            canvas.width = cols * (pixelSize + margin) + margin;
            canvas.height = rows * (pixelSize + margin) + margin + 40;
            
            // Fondo
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Título
            ctx.fillStyle = '#333333';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('CIFRADO VISUAL', canvas.width / 2, 25);
            
            // Dibujar colores
            colors.forEach((color, index) => {
                const row = Math.floor(index / cols);
                const col = index % cols;
                
                const x = margin + col * (pixelSize + margin);
                const y = margin + 40 + row * (pixelSize + margin);
                
                ctx.fillStyle = `#${color}`;
                ctx.fillRect(x, y, pixelSize, pixelSize);
                
                // Borde
                ctx.strokeStyle = '#CCCCCC';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, pixelSize, pixelSize);
            });
            
            // Información
            ctx.fillStyle = '#666666';
            ctx.font = '12px Arial';
            ctx.fillText(
                `${colors.length} colores generados`,
                canvas.width / 2,
                canvas.height - 10
            );
            
            // Descargar
            const dataUrl = canvas.toDataURL('image/png');
            this.downloadDataUrl(dataUrl, `cifrado-simple-${Date.now()}.png`);
            this.showToast('📸 Imagen simple descargada');
            
        } catch (error) {
            console.error('Error:', error);
            this.showToast('❌ Error al guardar imagen');
        }
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    }

    downloadDataUrl(dataUrl, filename) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
            document.body.removeChild(link);
        }, 100);
    }

    showColorDetails(color) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.95);
            color: white;
            padding: 20px;
            border-radius: 15px;
            z-index: 1000;
            text-align: center;
            border: 2px solid ${color};
            max-width: 90%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        `;
        
        modal.innerHTML = `
            <div style="width: 100px; height: 100px; background: ${color}; 
                       margin: 0 auto 15px; border-radius: 10px; border: 3px solid white;"></div>
            <h3 style="margin: 0 0 10px 0; color: ${color};">${color}</h3>
            <p style="margin: 0 0 15px 0; opacity: 0.8;">Toca para cerrar</p>
            <button onclick="this.closest('div').remove()" 
                    style="background: #4361ee; color: white; border: none; 
                           padding: 8px 16px; border-radius: 8px; cursor: pointer;">
                Cerrar
            </button>
        `;
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        document.body.appendChild(modal);
    }

    // Sistema de notificaciones
    showToast(message) {
        this.toast.textContent = message;
        this.toast.classList.add('show');
        
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    const app = new MobileColorCipher();
    window.app = app;
    
    // Precargar un ejemplo
    setTimeout(() => {
        if (!app.textInput.value) {
            app.textInput.value = "¡Hola Mundo! Prueba el cifrado visual 📱";
            app.charCount.textContent = app.textInput.value.length;
        }
    }, 500);
});