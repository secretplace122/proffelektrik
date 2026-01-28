class SchemaBuilder {
    constructor() {
        this.selectedType = '1';
        this.selectedColor = '#ffffff';
        this.selectedText = '';
        this.selectedPhase = 'L1';
        this.gridState = [];
        this.isMobile = window.innerWidth <= 1024;
        
        this.gridBody = document.getElementById('gridBody');
        this.schemaTable = document.getElementById('schemaTable');
        this.emptyState = document.getElementById('emptyState');
        this.rowsInput = document.getElementById('rowsCount');
        this.columnsInput = document.getElementById('columnsCount');
        this.createBtn = document.getElementById('createSchema');
        this.saveBtn = document.getElementById('saveSchema');
        this.clearBtn = document.getElementById('clearSchema');
        this.textArea = document.getElementById('breakerText');
        
        this.cellWidth = this.isMobile ? 40 : 70;
        this.cellHeight = this.isMobile ? 40 : 70;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadFromStorage();
        this.setupPhaseSelector();
        this.updateToolSelection();
        this.updateColorSelection();
        this.createMobileSaveButton();
    }
    
    createMobileSaveButton() {
        if (this.isMobile) {
            const mobileSaveBtn = document.createElement('button');
            mobileSaveBtn.className = 'mobile-save-btn';
            mobileSaveBtn.innerHTML = '<i class="fas fa-download"></i>';
            mobileSaveBtn.title = 'Сохранить схему';
            mobileSaveBtn.addEventListener('click', () => this.saveAsImage());
            document.body.appendChild(mobileSaveBtn);
        }
    }
    
    bindEvents() {
        this.createBtn.addEventListener('click', () => this.createSchema());
        this.saveBtn.addEventListener('click', () => this.saveAsImage());
        this.clearBtn.addEventListener('click', () => {
            if (confirm('Очистить всю схему?')) this.clearSchema();
        });
        
        document.querySelectorAll('.tool-btn[data-type]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectedType = e.currentTarget.dataset.type;
                this.updateToolSelection();
            });
        });
        
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectedColor = e.currentTarget.dataset.color;
                this.updateColorSelection();
            });
        });
        
        this.textArea.addEventListener('input', (e) => {
            this.selectedText = e.target.value;
        });
    }
    
    setupPhaseSelector() {
        document.querySelectorAll('.phase-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectedPhase = e.currentTarget.dataset.phase;
                document.querySelectorAll('.phase-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
    }
    
    updateToolSelection() {
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`.tool-btn[data-type="${this.selectedType}"]`);
        if (activeBtn) activeBtn.classList.add('active');
    }
    
    updateColorSelection() {
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.color === this.selectedColor) {
                btn.classList.add('active');
            }
        });
    }
    
    createSchema() {
        const rows = Math.min(parseInt(this.rowsInput.value) || 3, 8);
        const cols = Math.min(parseInt(this.columnsInput.value) || 10, 15);
        
        this.emptyState.style.display = 'none';
        this.schemaTable.style.display = 'table';
        this.gridBody.innerHTML = '';
        this.gridState = Array.from({ length: rows }, () => Array(cols).fill(null));
        
        for (let r = 0; r < rows; r++) {
            const row = document.createElement('tr');
            
            for (let c = 0; c < cols; c++) {
                const cell = document.createElement('td');
                cell.dataset.row = r;
                cell.dataset.col = c;
                
                const index = document.createElement('div');
                index.className = 'cell-index';
                index.textContent = `${String.fromCharCode(65 + r)}${c + 1}`;
                cell.appendChild(index);
                
                cell.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleCellAction(r, c);
                });
                
                cell.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleCellAction(r, c);
                }, { passive: false });
                
                row.appendChild(cell);
            }
            
            this.gridBody.appendChild(row);
        }
        
        this.schemaTable.style.width = `${cols * this.cellWidth}px`;
        const cells = this.gridBody.querySelectorAll('td');
        cells.forEach(cell => {
            cell.style.width = `${this.cellWidth}px`;
            cell.style.height = `${this.cellHeight}px`;
        });
        
        this.saveToStorage();
    }
    
    handleCellAction(row, col) {
        const module = this.gridState[row][col];
        
        if (module) {
            this.clearModule(row, col);
            if (this.selectedType !== 'clear') {
                setTimeout(() => {
                    this.placeModule(row, col);
                }, 10);
            }
        } else {
            this.placeModule(row, col);
        }
    }
    
    placeModule(row, col) {
        const width = this.selectedType === 'rcd' ? 1 : parseInt(this.selectedType) || 1;
        const cols = parseInt(this.columnsInput.value);
        
        if (col + width > cols) {
            return;
        }
        
        for (let c = col; c < col + width; c++) {
            if (this.gridState[row][c] !== null) {
                this.clearModule(row, c);
            }
        }
        
        this.createModule(row, col, width);
        this.saveToStorage();
    }
    
    createModule(row, col, width) {
        const moduleData = {
            type: this.selectedType,
            width: width,
            color: this.selectedType === 'rcd' ? '#2196F3' : this.selectedColor,
            phase: this.selectedPhase,
            text: this.selectedText,
            startCol: col,
            row: row
        };
        
        for (let c = col; c < col + width; c++) {
            this.gridState[row][c] = moduleData;
        }

        for (let c = col; c < col + width; c++) {
            const cell = this.getCell(row, c);
            if (cell) {
                cell.innerHTML = '';
                cell.classList.add('has-module');
            }
        }
        
        const startCell = this.getCell(row, col);
        if (!startCell) return;
        
        const module = document.createElement('div');
        module.className = `grid-module ${this.selectedType === 'rcd' ? 'rcd' : ''}`;
        module.dataset.width = width;
        module.style.width = `${this.cellWidth * width}px`;
        module.style.backgroundColor = moduleData.color;
        
        const textColor = this.getTextColor(moduleData.color);
        
        const phaseBadge = document.createElement('div');
        phaseBadge.className = 'phase-badge';
        phaseBadge.textContent = this.selectedPhase;
        phaseBadge.style.color = textColor;
        module.appendChild(phaseBadge);
        
        const content = document.createElement('div');
        content.className = 'module-content';
        
        const text = document.createElement('div');
        text.className = 'module-text';
        const displayText = this.selectedText || 
            (this.selectedType === 'rcd' ? 'УЗО' : `${width}P автомат`);
        text.textContent = displayText;
        text.style.color = textColor;
        content.appendChild(text);
        
        module.appendChild(content);
        startCell.appendChild(module);
        
        for (let c = col + 1; c < col + width; c++) {
            const cell = this.getCell(row, c);
            if (cell) {
                cell.style.borderLeft = 'none';
            }
        }
    }
    
    clearModule(row, col) {
        const module = this.gridState[row][col];
        if (!module) return;
        
        const { startCol, width } = module;
        
        for (let c = startCol; c < startCol + width; c++) {
            this.gridState[row][c] = null;
        }
        
        for (let c = startCol; c < startCol + width; c++) {
            const cell = this.getCell(row, c);
            if (cell) {
                cell.innerHTML = '';
                cell.classList.remove('has-module');
                cell.style.borderLeft = '';
                
                const index = document.createElement('div');
                index.className = 'cell-index';
                index.textContent = `${String.fromCharCode(65 + row)}${c + 1}`;
                cell.appendChild(index);
            }
        }
        
        this.saveToStorage();
    }
    
    getCell(row, col) {
        return this.gridBody.querySelector(`td[data-row="${row}"][data-col="${col}"]`);
    }
    
    getTextColor(backgroundColor) {
        try {
            const hex = backgroundColor.replace('#', '');
            let r, g, b;
            
            if (hex.length === 3) {
                r = parseInt(hex[0] + hex[0], 16);
                g = parseInt(hex[1] + hex[1], 16);
                b = parseInt(hex[2] + hex[2], 16);
            } else if (hex.length === 6) {
                r = parseInt(hex.substr(0, 2), 16);
                g = parseInt(hex.substr(2, 2), 16);
                b = parseInt(hex.substr(4, 2), 16);
            } else {
                return '#000000';
            }
            
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            return brightness > 128 ? '#000000' : '#ffffff';
        } catch (e) {
            return '#000000';
        }
    }
    
    clearSchema() {
        this.gridBody.innerHTML = '';
        this.gridState = [];
        this.schemaTable.style.display = 'none';
        this.emptyState.style.display = 'flex';
        localStorage.removeItem('electricalSchema');
    }
    
    saveAsImage() {
        if (!this.gridBody.children.length) {
            alert('Сначала создайте схему!');
            return;
        }
        
        const rows = this.gridBody.children.length;
        const cols = this.gridBody.children[0]?.children.length || 0;
        
        if (rows === 0 || cols === 0) {
            alert('Схема пуста!');
            return;
        }
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const a4Width = 1123;
        const a4Height = 794;
        canvas.width = a4Width;
        canvas.height = a4Height;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, a4Width, a4Height);
        
        const margin = 50;
        const availableWidth = a4Width - margin * 2;
        const availableHeight = a4Height - margin * 2 - 60;
        const cellSize = Math.min(availableWidth / cols, availableHeight / rows);
        const startX = margin + (availableWidth - cols * cellSize) / 2;
        const startY = margin + 60 + (availableHeight - rows * cellSize) / 2;
        
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 28px Montserrat, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Схема электрощита', a4Width / 2, margin + 30);
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const module = this.gridState[r][c];
                if (module && module.startCol === c) {
                    const x = startX + c * cellSize;
                    const y = startY + r * cellSize;
                    this.drawModule(ctx, x, y, cellSize, module);
                }
            }
        }
        
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `схема-электрощита-${new Date().toISOString().slice(0,10)}.png`;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
            document.body.removeChild(link);
        }, 100);
        
        if (!this.isMobile) {
            alert('Схема успешно сохранена!');
        }
    }
    
    drawModule(ctx, x, y, cellSize, module) {
        const { type, width, color, phase, text } = module;
        const moduleWidth = cellSize * width;
        
        ctx.fillStyle = color;
        ctx.fillRect(x, y, moduleWidth, cellSize);
        
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, moduleWidth, cellSize);
        
        if (width > 1) {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = 1;
            for (let i = 1; i < width; i++) {
                const dividerX = x + i * cellSize;
                ctx.beginPath();
                ctx.moveTo(dividerX, y + 2);
                ctx.lineTo(dividerX, y + cellSize - 2);
                ctx.stroke();
            }
        }
        
        const textColor = this.getTextColor(color);
        
        ctx.fillStyle = textColor;
        ctx.font = 'bold 12px Roboto, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(phase, x + moduleWidth - 5, y + 5);
        
        const displayText = text || (type === 'rcd' ? 'УЗО' : `${width}P автомат`);
        
        ctx.fillStyle = textColor;
        ctx.font = '11px Roboto, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        const lines = this.wrapText(ctx, displayText, moduleWidth - 20);
        const lineHeight = 14;
        const startY = y + cellSize / 2 - (lines.length * lineHeight) / 2 + lineHeight / 2;
        
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], x + 10, startY + i * lineHeight);
        }
    }
    
    wrapText(ctx, text, maxWidth) {
        const words = text.split('\n');
        const lines = [];
        
        for (const line of words) {
            const subWords = line.split(' ');
            let currentLine = '';
            
            for (const word of subWords) {
                const testLine = currentLine ? currentLine + ' ' + word : word;
                const metrics = ctx.measureText(testLine);
                
                if (metrics.width > maxWidth && currentLine !== '') {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            }
            
            if (currentLine) {
                lines.push(currentLine);
            }
        }
        
        return lines.slice(0, 3);
    }
    
    saveToStorage() {
        const savedState = [];
        const rows = this.gridState.length;
        const cols = this.gridState[0]?.length || 0;
        
        for (let r = 0; r < rows; r++) {
            savedState[r] = Array(cols).fill(null);
        }
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const module = this.gridState[r][c];
                if (module && module.startCol === c) {
                    savedState[r][c] = module;
                }
            }
        }
        
        const data = {
            rows: this.rowsInput.value,
            cols: this.columnsInput.value,
            gridState: savedState
        };
        localStorage.setItem('electricalSchema', JSON.stringify(data));
    }
    
    loadFromStorage() {
        const saved = localStorage.getItem('electricalSchema');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.rowsInput.value = data.rows || 3;
                this.columnsInput.value = data.cols || 10;
                
                this.createSchema();
                
                if (data.gridState) {
                    setTimeout(() => {
                        for (let r = 0; r < data.gridState.length; r++) {
                            for (let c = 0; c < data.gridState[r].length; c++) {
                                const module = data.gridState[r][c];
                                if (module) {
                                    this.selectedType = module.type;
                                    this.selectedColor = module.color;
                                    this.selectedPhase = module.phase || 'L1';
                                    this.selectedText = module.text || '';
                                    this.createModule(r, c, module.width);
                                }
                            }
                        }
                        
                        this.selectedType = '1';
                        this.selectedColor = '#ffffff';
                        this.selectedText = '';
                        this.updateToolSelection();
                        this.updateColorSelection();
                    }, 10);
                }
            } catch (e) {
                console.error('Ошибка загрузки:', e);
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SchemaBuilder();
    
    const homeLink = document.querySelector('.header-phone');
    if (homeLink) {
        const icon = homeLink.querySelector('i');
        if (icon) {
            icon.style.display = 'inline-block';
        }
    }
});