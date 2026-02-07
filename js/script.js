class MobileColorCipher {
    constructor() {
        this.mode = 'encode'; // 'encode' o 'decode'
        this.initElements();
        this.initEventListeners();
        this.initTouchEvents();
        this.pixelSize = 20;
        this.currentColorPairs = [];
        this.isProcessing = false;
    }

    initElements() {
        // Modo y switch
        this.modeToggle = document.getElementById('modeToggle');
        this.currentModeText = document.getElementById('currentMode');
        this.inputTitle = document.getElementById('inputTitle');
        this.outputTitle = document.getElementById('outputTitle');
        this.processBtn = document.getElementById('processBtn');
        this.processText = document.getElementById('processText');
        this.modeHelp = document.getElementById('modeHelp');
        this.instructionsTitle = document.getElementById('modeInstructions');
        this.instructionsList = document.getElementById('instructionsList');
        this.footerMode = document.getElementById('footerMode');
        
        // Input y output
        this.textInput = document.getElementById('textInput');
        this.outputDisplay = document.getElementById('outputDisplay');
        this.colorPalette = document.getElementById('colorPalette');
        this.htmlColors = document.getElementById('htmlColors');
        this.visualRepresentation = document.getElementById('visualRepresentation');
        this.infoDisplay = document.getElementById('infoDisplay');
        
        // Contadores
        this.charCount = document.getElementById('charCount');
        this.colorCount = document.getElementById('colorCount');
        
        // Botones principales
        this.clearBtn = document.getElementById('clearBtn');
        
        // Botones de utilidad
        this.pasteBtn = document.getElementById('pasteBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.sampleBtn = document.getElementById('sampleBtn');
        
        // Botones de copiado
        this.copyOutputBtn = document.getElementById('copyOutputBtn');
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
        
        // Modal de ayuda
        this.helpModal = document.getElementById('helpModal');
        this.closeHelpBtn = document.getElementById('closeHelpBtn');
        
        // Toast
        this.toast = document.getElementById('toast');
    }

    initEventListeners() {
        // Cambio de modo
        this.modeToggle.addEventListener('change', () => this.toggleMode());
        
        // Ayuda del modo
        this.modeHelp.addEventListener('click', () => this.showHelpModal());
        this.closeHelpBtn.addEventListener('click', () => this.hideHelpModal());
        this.helpModal.addEventListener('click', (e) => {
            if (e.target === this.helpModal) this.hideHelpModal();
        });

        // Contador de caracteres
        this.textInput.addEventListener('input', () => {
            this.charCount.textContent = this.textInput.value.length;
        });

        // Botón principal (procesar)
        this.processBtn.addEventListener('click', () => this.process());

        // Botón limpiar
        this.clearBtn.addEventListener('click', () => this.clearAll());

        // Botones de utilidad
        this.pasteBtn.addEventListener('click', () => this.pasteFromClipboard());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.sampleBtn.addEventListener('click', () => this.loadSample());

        // Botones de copiado
        this.copyOutputBtn.addEventListener('click', () => this.copyOutput());
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
            if (e.target === this.exportModal) this.hideExportModal();
        });

        // Enter para procesar en dispositivos con teclado físico
        this.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                this.process();
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

    // Funciones del modo
    toggleMode() {
        this.mode = this.modeToggle.checked ? 'decode' : 'encode';
        this.updateUIForMode();
        this.clearAll();
        this.showToast(`Modo cambiado a: ${this.mode === 'encode' ? 'Codificación' : 'Decodificación'}`);
    }

    updateUIForMode() {
        const isEncodeMode = this.mode === 'encode';
        
        // Actualizar textos
        this.currentModeText.textContent = `Modo: ${isEncodeMode ? 'Codificación' : 'Decodificación'}`;
        this.footerMode.textContent = isEncodeMode ? 'Codificación' : 'Decodificación';
        
        // Actualizar títulos
        this.inputTitle.innerHTML = `<i class="fas fa-keyboard"></i> ${isEncodeMode ? 'Texto a Codificar' : 'Hexadecimal a Decodificar'}`;
        this.outputTitle.innerHTML = `<i class="fas fa-code"></i> ${isEncodeMode ? 'Hexadecimal' : 'Texto Decodificado'}`;
        
        // Actualizar botón principal
        this.processText.textContent = isEncodeMode ? 'Codificar' : 'Decodificar';
        this.processBtn.innerHTML = `<i class="fas fa-sync-alt"></i> <span id="processText">${isEncodeMode ? 'Codificar' : 'Decodificar'}</span>`;
        
        // Actualizar placeholder del textarea
        this.textInput.placeholder = isEncodeMode 
            ? 'Escribe el texto que quieres codificar...' 
            : 'Pega el código hexadecimal que quieres decodificar...';
        
        // Actualizar instrucciones
        this.instructionsTitle.innerHTML = `<i class="fas fa-mobile-alt"></i> ${isEncodeMode ? 'Modo Codificación' : 'Modo Decodificación'}`;
        
        const encodeInstructions = `
            <li>Escribe texto en el área superior</li>
            <li>Toca "Codificar" para generar colores</li>
            <li>Toca un color para copiar su código</li>
            <li>Usa "Descargar Imagen" para guardar</li>
        `;
        
        const decodeInstructions = `
            <li>Pega código hexadecimal en el área superior</li>
            <li>Toca "Decodificar" para obtener texto</li>
            <li>El texto aparecerá en la sección inferior</li>
            <li>También verás los colores correspondientes</li>
        `;
        
        this.instructionsList.innerHTML = isEncodeMode ? encodeInstructions : decodeInstructions;
    }

    showHelpModal() {
        this.helpModal.style.display = 'flex';
    }

    hideHelpModal() {
        this.helpModal.style.display = 'none';
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
        // Validar que el hexadecimal sea válido
        if (!/^[0-9a-fA-F]+$/.test(hex)) {
            throw new Error('El código hexadecimal contiene caracteres inválidos');
        }
        
        if (hex.length % 2 !== 0) {
            throw new Error('La longitud del hexadecimal debe ser múltiplo de 2');
        }
        
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

    validateInput(input, mode) {
        if (!input.trim()) {
            throw new Error('Por favor, ingresa algún contenido');
        }

        if (mode === 'decode') {
            // Validar hexadecimal para decodificación
            const cleanHex = input.replace(/\s+/g, '').replace(/^#/, '');
            
            if (!/^[0-9a-fA-F]+$/.test(cleanHex)) {
                throw new Error('El código hexadecimal contiene caracteres inválidos. Solo se permiten: 0-9, A-F, a-f');
            }
            
            if (cleanHex.length % 2 !== 0) {
                throw new Error(`La longitud del hexadecimal (${cleanHex.length}) debe ser múltiplo de 2.`);
            }
            
            return cleanHex;
        }
        
        // Validación para codificación (solo longitud)
        if (input.length > 1000) {
            throw new Error('El texto no puede exceder los 1000 caracteres');
        }
        
        return input;
    }

    async process() {
        if (this.isProcessing) return;
        
        const input = this.textInput.value.trim();
        
        try {
            this.isProcessing = true;
            this.processBtn.disabled = true;
            this.processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
            
            const validatedInput = this.validateInput(input, this.mode);
            
            if (this.mode === 'encode') {
                await this.encodeProcess(validatedInput);
            } else {
                await this.decodeProcess(validatedInput);
            }
            
        } catch (error) {
            this.showToast(`❌ ${error.message}`);
            console.error(error);
        } finally {
            this.isProcessing = false;
            this.processBtn.disabled = false;
            this.updateUIForMode();
        }
    }

    async encodeProcess(text) {
        this.showToast('🔐 Codificando...');
        
        // Convertir a hexadecimal
        const hex = this.textToHex(text);
        this.outputDisplay.textContent = hex;
        
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
        this.displayInfo(text, hex, colorPairs, 'encode');
        
        this.showToast('✅ Texto codificado correctamente');
    }

    async decodeProcess(hex) {
        this.showToast('🔓 Decodificando...');
        
        // Convertir hexadecimal a texto
        const text = this.hexToText(hex);
        this.outputDisplay.textContent = text;
        
        // Generar colores a partir del hexadecimal
        const colorPairs = this.hexToColorPairs(hex);
        this.currentColorPairs = colorPairs;
        this.colorCount.textContent = `${colorPairs.length} colores en el código`;
        
        // Crear paleta de colores
        this.createColorPalette(colorPairs);
        
        // Crear vista previa
        this.createVisualRepresentation(colorPairs);
        
        // Generar código HTML
        this.generateHTMLCode(colorPairs);
        
        // Mostrar información
        this.displayInfo(text, hex, colorPairs, 'decode');
        
        this.showToast('✅ Hexadecimal decodificado correctamente');
    }

    clearAll() {
        this.textInput.value = '';
        this.outputDisplay.textContent = '';
        this.colorPalette.innerHTML = '';
        this.htmlColors.textContent = '';
        this.visualRepresentation.innerHTML = '';
        this.infoDisplay.innerHTML = '';
        this.charCount.textContent = '0';
        this.colorCount.textContent = `0 colores ${this.mode === 'encode' ? 'generados' : 'encontrados'}`;
        this.pixelSize = 20;
        this.currentColorPairs = [];
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
            this.showToast('📋 Contenido pegado');
        } catch (error) {
            this.showToast('👆 Use el menú contextual para pegar');
            this.textInput.focus();
        }
    }

    async copyToClipboard() {
        const text = this.textInput.value;
        if (!text) {
            this.showToast('⚠️ No hay contenido para copiar');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showToast('📋 Contenido copiado');
        } catch (error) {
            this.showToast('❌ Error al copiar');
        }
    }

    loadSample() {
        if (this.mode === 'encode') {
            const encodeSamples = [
                "¡Hola Mundo! 🌍",
                "El cifrado visual es increíble",
                "Texto a colores hexadecimales",
                "Prueba este sistema móvil",
                "1234567890 ABCDEF"
            ];
            
            const randomSample = encodeSamples[Math.floor(Math.random() * encodeSamples.length)];
            this.textInput.value = randomSample;
            this.charCount.textContent = randomSample.length;
            this.showToast('✨ Ejemplo de texto cargado');
        } else {
            const decodeSamples = [
                "486f6c61204d756e646f21", // "Hola Mundo!"
                "546578746f20646520656a656d706c6f", // "Texto de ejemplo"
                "6369667261646f2068657861646563696d616c", // "cifrado hexadecimal"
                "707275656261206465636f64696669636163696f6e", // "prueba decodificacion"
                "31323334353637383930" // "1234567890"
            ];
            
            const randomSample = decodeSamples[Math.floor(Math.random() * decodeSamples.length)];
            this.textInput.value = randomSample;
            this.charCount.textContent = randomSample.length;
            this.showToast('✨ Ejemplo hexadecimal cargado');
        }
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

    displayInfo(primaryText, hex, colorPairs, operation) {
        const charCount = primaryText.length;
        const hexLength = hex.length;
        const colorCount = colorPairs.length;
        
        if (operation === 'encode') {
            this.infoDisplay.innerHTML = `
                <div class="info-item">
                    <strong>Texto original:</strong> ${charCount} caracteres
                </div>
                <div class="info-item">
                    <strong>Hexadecimal:</strong> ${hexLength} caracteres
                </div>
                <div class="info-item">
                    <strong>Colores generados:</strong> ${colorCount}
                </div>
                <div class="info-item">
                    <strong>Relación:</strong> ${(charCount/colorCount).toFixed(2)}:1
                </div>
                <div class="info-item">
                    <strong>Bytes:</strong> ${Math.ceil(hexLength/2)}
                </div>
                <div class="info-item">
                    <strong>Tamaño píxel:</strong> ${this.pixelSize}px
                </div>
            `;
        } else {
            this.infoDisplay.innerHTML = `
                <div class="info-item">
                    <strong>Texto decodificado:</strong> ${charCount} caracteres
                </div>
                <div class="info-item">
                    <strong>Hexadecimal:</strong> ${hexLength} caracteres
                </div>
                <div class="info-item">
                    <strong>Colores encontrados:</strong> ${colorCount}
                </div>
                <div class="info-item">
                    <strong>Bytes:</strong> ${Math.ceil(hexLength/2)}
                </div>
                <div class="info-item">
                    <strong>Longitud hex:</strong> ${hexLength}
                </div>
                <div class="info-item">
                    <strong>Validación:</strong> ✓ Correcta
                </div>
            `;
        }
    }

    // Funciones de copiado
    async copyOutput() {
        const output = this.outputDisplay.textContent;
        if (!output) {
            this.showToast('⚠️ No hay contenido');
            return;
        }

        try {
            await navigator.clipboard.writeText(output);
            this.showToast(`📋 ${this.mode === 'encode' ? 'Hexadecimal' : 'Texto'} copiado`);
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
            this.showToast('⚠️ Primero procesa algún contenido');
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
                
                const modeText = this.mode === 'encode' ? 'codificacion' : 'decodificacion';
                this.downloadBlob(blob, `cifrado-${modeText}-${Date.now()}.${extension}`);
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
        const canvasHeight = padding * 2 + rows * (pixelSize + margin) + 120;
        
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
        ctx.fillText(
            this.mode === 'encode' ? '🎨 PALETA DE COLORES CIFRADA' : '🔓 PALETA DECODIFICADA', 
            canvasWidth / 2, 
            60
        );
        
        // Información
        ctx.fillStyle = '#4361ee';
        ctx.font = '14px Arial';
        
        const displayText = this.mode === 'encode' 
            ? this.textInput.value.substring(0, 30)
            : this.outputDisplay.textContent.substring(0, 30);
            
        ctx.fillText(
            `"${displayText}${displayText.length >= 30 ? '...' : ''}"`, 
            canvasWidth / 2, 
            85
        );
        
        ctx.fillStyle = '#6c757d';
        ctx.font = '12px Arial';
        ctx.fillText(
            `${colors.length} colores | Modo: ${this.mode === 'encode' ? 'Codificación' : 'Decodificación'}`,
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
            this.showToast('⚠️ No hay colores para exportar');
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
            ctx.fillText(
                this.mode === 'encode' ? 'CIFRADO VISUAL' : 'DECODIFICACIÓN', 
                canvas.width / 2, 
                25
            );
            
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
                `${colors.length} colores - ${this.mode === 'encode' ? 'Codificación' : 'Decodificación'}`,
                canvas.width / 2,
                canvas.height - 10
            );
            
            // Descargar
            const dataUrl = canvas.toDataURL('image/png');
            const modeText = this.mode === 'encode' ? 'codificacion' : 'decodificacion';
            this.downloadDataUrl(dataUrl, `cifrado-${modeText}-simple-${Date.now()}.png`);
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
    
    // Precargar un ejemplo basado en el modo inicial
    setTimeout(() => {
        if (!app.textInput.value) {
            if (app.mode === 'encode') {
                app.textInput.value = "¡Hola Mundo! Prueba el cifrado visual 📱";
            } else {
                app.textInput.value = "486f6c61204d756e646f21";
            }
            app.charCount.textContent = app.textInput.value.length;
        }
    }, 500);
});
