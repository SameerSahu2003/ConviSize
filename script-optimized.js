/**
 * ConviSize - Smart Image Converter
 * Optimized JavaScript with improved performance and organization
 */

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    const ConviSize = {
        // DOM Elements
        elements: {
            dropArea: document.getElementById('dropArea'),
            fileInput: document.getElementById('fileInput'),
            chooseFileBtn: document.getElementById('chooseFileBtn'),
            formatSelect: document.getElementById('formatSelect'),
            qualitySlider: document.getElementById('qualitySlider'),
            widthInput: document.getElementById('widthInput'),
            heightInput: document.getElementById('heightInput'),
            aspectRatio: document.getElementById('aspectRatio'),
            filterOptions: document.querySelectorAll('input[name="filter"]'),
            convertBtn: document.getElementById('convertBtn'),
            outputPreview: document.getElementById('outputPreview'),
            downloadBtn: document.getElementById('downloadBtn')
        },
        
        // State variables
        state: {
            selectedImages: [],
            currentImageIndex: 0,
            originalImage: null,
            originalWidth: 0,
            originalHeight: 0,
            aspectRatioValue: 0
        },
        
        // Initialize the application
        init() {
            this.setupEventListeners();
            this.sortFormatsByPopularity();
        },
        
        // Set up all event listeners
        setupEventListeners() {
            const { elements } = this;
            
            // Check if all required elements exist
            const requiredElements = ['fileInput', 'chooseFileBtn', 'dropArea', 'widthInput', 'heightInput', 'convertBtn'];
            for (const elementName of requiredElements) {
                if (!elements[elementName]) {
                    console.error(`Required element '${elementName}' not found`);
                    return;
                }
            }
            
            // File input change event
            elements.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
            
            // Choose file button click event
            elements.chooseFileBtn.addEventListener('click', () => elements.fileInput.click());
            
            // Drag and drop events
            elements.dropArea.addEventListener('dragover', this.handleDragOver.bind(this));
            elements.dropArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
            elements.dropArea.addEventListener('drop', this.handleDrop.bind(this));
            
            // Dimension input events
            elements.widthInput.addEventListener('input', this.handleWidthChange.bind(this));
            elements.heightInput.addEventListener('input', this.handleHeightChange.bind(this));
            
            // Convert button click event
            elements.convertBtn.addEventListener('click', this.convertImage.bind(this));
        },
        
        // Sort format options by popularity
        sortFormatsByPopularity() {
            const { formatSelect } = this.elements;
            
            // Format popularity ranking
            const popularityRanking = ['jpg', 'png', 'webp', 'pdf', 'gif', 'bmp'];
            
            // Get all options and sort them
            const options = Array.from(formatSelect.options);
            options.sort((a, b) => {
                return popularityRanking.indexOf(a.value) - popularityRanking.indexOf(b.value);
            });
            
            // Clear and rebuild select element
            formatSelect.innerHTML = '';
            options.forEach(option => formatSelect.appendChild(option));
            
            // Set JPG as default
            formatSelect.value = 'jpg';
        },
        
        // Handle drag over event
        handleDragOver(e) {
            e.preventDefault();
            this.elements.dropArea.classList.add('dragover');
        },
        
        // Handle drag leave event
        handleDragLeave(e) {
            e.preventDefault();
            this.elements.dropArea.classList.remove('dragover');
        },
        
        // Handle drop event
        handleDrop(e) {
            e.preventDefault();
            this.elements.dropArea.classList.remove('dragover');
            
            if (e.dataTransfer.files.length) {
                this.elements.fileInput.files = e.dataTransfer.files;
                this.handleFileSelect();
            }
        },
        
        // Handle file selection
        handleFileSelect() {
            const { fileInput, dropArea } = this.elements;
            const files = fileInput.files;
            
            if (files.length === 0) return;
            
            // Clear previous selections
            this.state.selectedImages = [];
            dropArea.innerHTML = '';
            
            // Create container for images
            const imageContainer = document.createElement('div');
            imageContainer.className = 'selected-images-container';
            dropArea.appendChild(imageContainer);
            
            // Add counter text
            const counterText = document.createElement('p');
            counterText.className = 'image-counter';
            counterText.textContent = `Selected ${files.length} image${files.length > 1 ? 's' : ''}`;
            dropArea.appendChild(counterText);
            
            // Process each file with lazy loading
            Array.from(files).forEach((file, index) => {
                // Validate file type
                if (!file.type.match('image.*')) {
                    console.warn(`Skipping non-image file: ${file.name}`);
                    return;
                }
                
                // Validate file size (max 50MB)
                const maxSize = 50 * 1024 * 1024; // 50MB in bytes
                if (file.size > maxSize) {
                    console.error(`File too large: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 50MB.`);
                    alert(`File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 50MB.`);
                    return;
                }
                
                this.processImageFile(file, imageContainer, index);
            });
        },
        
        // Process image file with performance optimizations
        processImageFile(file, container, index) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                // Use createImageBitmap for better performance when available
                if ('createImageBitmap' in window) {
                    // Create a blob from the file
                    const blob = new Blob([new Uint8Array(e.target.result)], {type: file.type});
                    
                    createImageBitmap(blob).then(bitmap => {
                        this.addImageToSelection(bitmap, file, container, index, e.target.result);
                    }).catch(() => {
                        // Fallback to Image if createImageBitmap fails
                        this.createImageFallback(e.target.result, file, container, index);
                    });
                } else {
                    // Fallback for browsers without createImageBitmap
                    this.createImageFallback(e.target.result, file, container, index);
                }
            };
            
            // Read as array buffer for better performance with large images
            reader.readAsArrayBuffer(file);
        },
        
        // Fallback to traditional Image object
        createImageFallback(src, file, container, index) {
            const img = new Image();
            
            img.onload = () => {
                this.addImageToSelection(img, file, container, index, src);
            };
            
            img.src = URL.createObjectURL(file);
        },
        
        // Add image to selection
        addImageToSelection(img, file, container, index, src) {
            // Store image data
            this.state.selectedImages.push({
                img: img,
                width: img.width || img.naturalWidth,
                height: img.height || img.naturalHeight,
                aspectRatio: (img.width || img.naturalWidth) / (img.height || img.naturalHeight),
                file: file,
                src: src
            });
            
            // Create thumbnail with lazy loading
            const thumbnail = document.createElement('div');
            thumbnail.className = 'image-thumbnail';
            thumbnail.dataset.index = this.state.selectedImages.length - 1;
            thumbnail.onclick = () => {
                this.selectImage(parseInt(thumbnail.dataset.index));
            };
            
            const thumbImg = document.createElement('img');
            thumbImg.loading = 'lazy'; // Use native lazy loading
            const objectUrl = URL.createObjectURL(file);
            thumbImg.src = objectUrl;
            thumbImg.alt = `Image ${this.state.selectedImages.length}`;
            
            // Clean up object URL after image loads
            thumbImg.onload = () => {
                URL.revokeObjectURL(objectUrl);
            };
            
            // Also clean up on error
            thumbImg.onerror = () => {
                URL.revokeObjectURL(objectUrl);
            };
            
            thumbnail.appendChild(thumbImg);
            
            container.appendChild(thumbnail);
            
            // If this is the first image, select it
            if (this.state.selectedImages.length === 1) {
                this.selectImage(0);
            }
            
            // Enable convert button
            this.elements.convertBtn.disabled = false;
            
            // Add batch conversion options if multiple images
            if (this.state.selectedImages.length > 1 && !document.getElementById('batchOptions')) {
                this.addBatchConversionOptions();
            }
        },
        
        // Add batch conversion options
        addBatchConversionOptions() {
            const { dropArea } = this.elements;
            
            // Create batch options container
            const batchOptions = document.createElement('div');
            batchOptions.id = 'batchOptions';
            batchOptions.className = 'batch-options';
            
            // Create convert all button
            const convertAllBtn = document.createElement('button');
            convertAllBtn.id = 'convertAllBtn';
            convertAllBtn.className = 'btn primary-btn';
            convertAllBtn.textContent = 'Convert & Download All';
            convertAllBtn.onclick = this.convertAllImages.bind(this);
            
            // Create consolidated PDF button
            const consolidatedPdfBtn = document.createElement('button');
            consolidatedPdfBtn.id = 'consolidatedPdfBtn';
            consolidatedPdfBtn.className = 'btn secondary-btn';
            consolidatedPdfBtn.textContent = 'Create Single PDF';
            consolidatedPdfBtn.onclick = this.createConsolidatedPdf.bind(this);
            
            // Add to drop area
            batchOptions.appendChild(convertAllBtn);
            batchOptions.appendChild(consolidatedPdfBtn);
            dropArea.appendChild(batchOptions);
        },
        
        // Select an image
        selectImage(index) {
            if (index < 0 || index >= this.state.selectedImages.length) return;
            
            // Update current index
            this.state.currentImageIndex = index;
            const imageData = this.state.selectedImages[index];
            
            // Update thumbnails
            const thumbnails = document.querySelectorAll('.image-thumbnail');
            thumbnails.forEach(thumb => {
                thumb.classList.remove('selected');
                if (parseInt(thumb.dataset.index) === index) {
                    thumb.classList.add('selected');
                }
            });
            
            // Update dimension inputs
            this.state.originalWidth = imageData.width;
            this.state.originalHeight = imageData.height;
            this.state.aspectRatioValue = imageData.aspectRatio;
            
            this.elements.widthInput.value = imageData.width;
            this.elements.heightInput.value = imageData.height;
            
            // Store original image
            this.state.originalImage = imageData.img;
        },
        
        // Handle width change
        handleWidthChange() {
            if (!this.elements.aspectRatio.checked) return;
            
            const newWidth = parseInt(this.elements.widthInput.value);
            if (isNaN(newWidth) || newWidth <= 0) return;
            
            // Calculate height based on aspect ratio
            const newHeight = Math.round(newWidth / this.state.aspectRatioValue);
            this.elements.heightInput.value = newHeight;
        },
        
        // Handle height change
        handleHeightChange() {
            if (!this.elements.aspectRatio.checked) return;
            
            const newHeight = parseInt(this.elements.heightInput.value);
            if (isNaN(newHeight) || newHeight <= 0) return;
            
            // Calculate width based on aspect ratio
            const newWidth = Math.round(newHeight * this.state.aspectRatioValue);
            this.elements.widthInput.value = newWidth;
        },
        
        // Convert current image
        convertImage() {
            const { elements, state } = this;
            
            if (state.selectedImages.length === 0) return;
            
            // Show loading indicator
            this.showLoading();
            
            // Get selected image
            const imageData = state.selectedImages[state.currentImageIndex];
            
            // Get conversion settings
            const format = elements.formatSelect.value;
            const quality = parseInt(elements.qualitySlider.value) / 100;
            const width = parseInt(elements.widthInput.value) || imageData.width;
            const height = parseInt(elements.heightInput.value) || imageData.height;
            
            // Get selected filter
            let filter = 'none';
            elements.filterOptions.forEach(option => {
                if (option.checked) filter = option.value;
            });
            
            try {
                // Process the image
                this.processImage(imageData.img, format, quality, width, height, filter);
            } catch (error) {
                console.error('Error converting image:', error);
                this.hideLoading();
                alert('An error occurred while converting the image. Please try again.');
            }
        },
        
        // Process image with canvas
        processImage(image, format, quality, width, height, filter) {
            // Create canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            // Apply filter if needed
            if (filter !== 'none') {
                ctx.filter = this.getFilterString(filter);
            }
            
            // Draw image on canvas with resizing
            ctx.drawImage(image, 0, 0, width, height);
            
            // Convert to selected format
            let mimeType;
            let dataURL;
            
            try {
                // Handle PDF format separately
                if (format === 'pdf') {
                    try {
                        // Use jsPDF to create PDF
                        const { jsPDF } = window.jspdf;
                        const pdf = new jsPDF({
                            orientation: width > height ? 'landscape' : 'portrait',
                            unit: 'px',
                            format: [width, height]
                        });
                        
                        // Add the image to the PDF
                        pdf.addImage(canvas.toDataURL('image/jpeg', quality), 'JPEG', 0, 0, width, height);
                        
                        // Get the PDF as data URL
                        dataURL = pdf.output('datauristring');
                        mimeType = 'application/pdf';
                    } catch (error) {
                        console.error('Error creating PDF in processImage:', error);
                        throw new Error('Failed to create PDF: ' + error.message);
                    }
                } else {
                    // Handle image formats
                    switch (format) {
                        case 'jpg':
                            mimeType = 'image/jpeg';
                            break;
                        case 'png':
                            mimeType = 'image/png';
                            break;
                        case 'webp':
                            mimeType = 'image/webp';
                            break;
                        case 'gif':
                            mimeType = 'image/gif';
                            break;
                        case 'bmp':
                            mimeType = 'image/bmp';
                            break;
                        default:
                            mimeType = 'image/jpeg';
                    }
                    
                    // Get data URL for image formats
                    dataURL = canvas.toDataURL(mimeType, quality);
                }
                
                // Update preview and download button
                this.updatePreview(dataURL, format);
            } finally {
                // Clean up canvas to prevent memory leaks
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.width = 0;
                canvas.height = 0;
                
                // Hide loading indicator
                this.hideLoading();
            }
        },
        
        // Get CSS filter string
        getFilterString(filter) {
            switch (filter) {
                case 'grayscale':
                    return 'grayscale(100%)';
                case 'sepia':
                    return 'sepia(100%)';
                case 'invert':
                    return 'invert(100%)';
                default:
                    return 'none';
            }
        },
        
        // Update preview and download button
        updatePreview(dataURL, format) {
            const { outputPreview, downloadBtn } = this.elements;
            
            // Clear previous preview
            outputPreview.innerHTML = '';
            
            if (format === 'pdf') {
                // For PDF, create a special preview with PDF icon and message
                const pdfPreview = document.createElement('div');
                pdfPreview.className = 'pdf-preview fade-in';
                
                // Add PDF icon
                const pdfIcon = document.createElement('div');
                pdfIcon.className = 'pdf-icon';
                pdfIcon.innerHTML = '<svg width="50" height="50" viewBox="0 0 24 24"><path fill="#e74c3c" d="M12 16.5l4-4h-3v-9h-2v9H8l4 4zm9-13h-6v1.5h6v15H3v-15h6V3.5H3c-.83 0-1.5.67-1.5 1.5v15c0 .83.67 1.5 1.5 1.5h18c.83 0 1.5-.67 1.5-1.5V5c0-.83-.67-1.5-1.5-1.5z"/></svg>';
                
                // Add message
                const pdfMessage = document.createElement('p');
                pdfMessage.textContent = 'PDF created successfully. Click the download button to save.';
                
                pdfPreview.appendChild(pdfIcon);
                pdfPreview.appendChild(pdfMessage);
                outputPreview.appendChild(pdfPreview);
            } else {
                // Create image element for image formats
                const img = document.createElement('img');
                img.src = dataURL;
                img.alt = 'Converted image';
                img.style.maxWidth = '100%';
                img.style.maxHeight = '300px';
                img.className = 'fade-in';
                outputPreview.appendChild(img);
            }
            
            // Update download button
            downloadBtn.href = dataURL;
            downloadBtn.download = `converted-image.${format}`;
            downloadBtn.style.display = 'block';
        },
        
        // Convert all images in batch
        convertAllImages() {
            const { elements, state } = this;
            
            if (state.selectedImages.length <= 1) return;
            
            // Show loading indicator
            this.showLoading('Converting all images...');
            
            // Get conversion settings
            const format = elements.formatSelect.value;
            const quality = parseInt(elements.qualitySlider.value) / 100;
            
            // Get selected filter
            let filter = 'none';
            elements.filterOptions.forEach(option => {
                if (option.checked) filter = option.value;
            });
            
            try {
                // Process images sequentially to avoid memory issues
                this.processBatchImages(0, format, quality, filter);
            } catch (error) {
                console.error('Error in batch conversion:', error);
                this.hideLoading();
                alert('An error occurred during batch conversion. Please try again.');
            }
        },
        
        // Process batch images recursively
        processBatchImages(index, format, quality, filter) {
            const { state } = this;
            
            try {
                if (index >= state.selectedImages.length) {
                    // All images processed
                    this.hideLoading();
                    return;
                }
                
                const imageData = state.selectedImages[index];
                const width = parseInt(this.elements.widthInput.value) || imageData.width;
                const height = parseInt(this.elements.heightInput.value) || imageData.height;
                
                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                
                // Apply filter if needed
                if (filter !== 'none') {
                    ctx.filter = this.getFilterString(filter);
                }
                
                // Draw image on canvas
                ctx.drawImage(imageData.img, 0, 0, width, height);
                
                // Convert to selected format
                let mimeType;
                switch (format) {
                    case 'jpg':
                        mimeType = 'image/jpeg';
                        break;
                    case 'png':
                        mimeType = 'image/png';
                        break;
                    case 'webp':
                        mimeType = 'image/webp';
                        break;
                    case 'gif':
                        mimeType = 'image/gif';
                        break;
                    case 'bmp':
                        mimeType = 'image/bmp';
                        break;
                    default:
                        mimeType = 'image/jpeg';
                }
                
                // Get data URL
                const dataURL = canvas.toDataURL(mimeType, quality);
                
                // Clean up canvas to prevent memory leaks
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.width = 0;
                canvas.height = 0;
                
                // Create download link
                const link = document.createElement('a');
                link.href = dataURL;
                link.download = `converted-image-${index + 1}.${format}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Process next image - use direct call instead of setTimeout to avoid potential issues
                this.processBatchImages(index + 1, format, quality, filter);
            } catch (error) {
                console.error(`Error processing image ${index}:`, error);
                this.hideLoading();
                alert(`An error occurred while processing image ${index + 1}. Please try again.`);
            }
        },
        
        // Show loading indicator
        showLoading(message = 'Processing...') {
            const loadingEl = document.createElement('div');
            loadingEl.className = 'loading-message';
            loadingEl.id = 'loadingMessage';
            loadingEl.textContent = message;
            document.body.appendChild(loadingEl);
        },
        
        // Create consolidated PDF from all images
        createConsolidatedPdf() {
            const { elements, state } = this;
            
            if (state.selectedImages.length <= 1) {
                alert('Please select multiple images to create a consolidated PDF');
                return;
            }
            
            // Show loading indicator
            this.showLoading('Creating consolidated PDF...');
            
            // Get conversion settings
            const quality = parseInt(elements.qualitySlider.value) / 100;
            
            // Get selected filter
            let filter = 'none';
            elements.filterOptions.forEach(option => {
                if (option.checked) filter = option.value;
            });
            
            try {
                // Initialize PDF document
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF();
                
                // Process each image and add to PDF
                this.addImagesToPdf(pdf, 0, quality, filter);
            } catch (error) {
                console.error('Error creating PDF:', error);
                this.hideLoading();
                alert('An error occurred while creating the PDF. Please try again.');
            }
        },
        
        // Recursively add images to PDF
        addImagesToPdf(pdf, index, quality, filter) {
            const { state } = this;
            
            try {
                if (index >= state.selectedImages.length) {
                    // All images processed, save the PDF
                    const pdfOutput = pdf.output('datauristring');
                    
                    // Update preview with first page
                    this.updatePreview(pdfOutput, 'pdf');
                    
                    // Create download link
                    const link = document.createElement('a');
                    link.href = pdfOutput;
                    link.download = 'consolidated-images.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    // Hide loading indicator
                    this.hideLoading();
                    return;
                }
                
                const imageData = state.selectedImages[index];
                const width = parseInt(this.elements.widthInput.value) || imageData.width;
                const height = parseInt(this.elements.heightInput.value) || imageData.height;
                
                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                
                // Apply filter if needed
                if (filter !== 'none') {
                    ctx.filter = this.getFilterString(filter);
                }
                
                // Draw image on canvas
                ctx.drawImage(imageData.img, 0, 0, width, height);
                
                // Add new page if not the first image
                if (index > 0) {
                    pdf.addPage();
                }
                
                // Calculate PDF page dimensions based on image aspect ratio
                const imgRatio = width / height;
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                
                let pdfWidth, pdfHeight;
                
                if (imgRatio > 1) {
                    // Landscape orientation
                    pdfWidth = pageWidth;
                    pdfHeight = pageWidth / imgRatio;
                } else {
                    // Portrait orientation
                    pdfHeight = pageHeight;
                    pdfWidth = pageHeight * imgRatio;
                }
                
                // Center image on page
                const x = (pageWidth - pdfWidth) / 2;
                const y = (pageHeight - pdfHeight) / 2;
                
                // Add the image to the PDF
                pdf.addImage(
                    canvas.toDataURL('image/jpeg', quality),
                    'JPEG',
                    x,
                    y,
                    pdfWidth,
                    pdfHeight
                );
                
                // Clean up canvas to prevent memory leaks
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.width = 0;
                canvas.height = 0;
                
                // Process next image - use direct call instead of setTimeout to avoid potential issues
                this.addImagesToPdf(pdf, index + 1, quality, filter);
            } catch (error) {
                console.error('Error adding image to PDF:', error);
                this.hideLoading();
                alert('An error occurred while creating the PDF. Please try again.');
            }
        },
        
        // Hide loading indicator
        hideLoading() {
            const loadingEl = document.getElementById('loadingMessage');
            if (loadingEl) loadingEl.remove();
        }
    };
    
    // Initialize the application
    ConviSize.init();
});