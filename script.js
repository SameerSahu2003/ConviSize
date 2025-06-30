document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const chooseFileBtn = document.getElementById('chooseFileBtn');
    const formatSelect = document.getElementById('formatSelect');
    const qualitySlider = document.getElementById('qualitySlider');
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const aspectRatio = document.getElementById('aspectRatio');
    const filterOptions = document.querySelectorAll('input[name="filter"]');
    const convertBtn = document.getElementById('convertBtn');
    const outputPreview = document.getElementById('outputPreview');
    const downloadBtn = document.getElementById('downloadBtn');

    // Variables to store image data
    let selectedImages = [];
    let currentImageIndex = 0;
    let originalImage = null;
    let originalWidth = 0;
    let originalHeight = 0;
    let aspectRatioValue = 0;

    // Initialize the app
    initApp();

    function initApp() {
        // Set up event listeners
        setupEventListeners();
        
        // Sort format options by popularity
        sortFormatsByPopularity();
    }

    function setupEventListeners() {
        // File input change event
        fileInput.addEventListener('change', handleFileSelect);

        // Choose file button click event
        chooseFileBtn.addEventListener('click', () => fileInput.click());

        // Drag and drop events
        dropArea.addEventListener('dragover', handleDragOver);
        dropArea.addEventListener('dragleave', handleDragLeave);
        dropArea.addEventListener('drop', handleDrop);

        // Dimension input events
        widthInput.addEventListener('input', handleWidthChange);
        heightInput.addEventListener('input', handleHeightChange);

        // Convert button click event
        convertBtn.addEventListener('click', convertImage);
    }

    function sortFormatsByPopularity() {
        // Format popularity ranking (based on common usage)
        const popularityRanking = ['jpg', 'png', 'webp', 'gif', 'bmp'];
        
        // Get all options
        const options = Array.from(formatSelect.options);
        
        // Sort options based on popularity ranking
        options.sort((a, b) => {
            return popularityRanking.indexOf(a.value) - popularityRanking.indexOf(b.value);
        });
        
        // Clear select element
        formatSelect.innerHTML = '';
        
        // Append sorted options
        options.forEach(option => formatSelect.appendChild(option));
        
        // Set JPG as default
        formatSelect.value = 'jpg';
    }

    function handleDragOver(e) {
        e.preventDefault();
        dropArea.classList.add('dragover');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        dropArea.classList.remove('dragover');
    }

    function handleDrop(e) {
        e.preventDefault();
        dropArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect(e);
        }
    }

    function handleFileSelect(e) {
        const files = fileInput.files;
        
        if (files.length === 0) {
            return;
        }
        
        // Clear previous selections
        selectedImages = [];
        dropArea.innerHTML = '';
        
        // Create a container for the images
        const imageContainer = document.createElement('div');
        imageContainer.className = 'selected-images-container';
        dropArea.appendChild(imageContainer);
        
        // Add counter text
        const counterText = document.createElement('p');
        counterText.className = 'image-counter';
        counterText.textContent = `Selected ${files.length} image${files.length > 1 ? 's' : ''}`;
        dropArea.appendChild(counterText);
        
        // Process each file
        Array.from(files).forEach((file, index) => {
            if (file.type.match('image.*')) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    // Create image to get dimensions
                    const img = new Image();
                    img.onload = function() {
                        // Store image data
                        selectedImages.push({
                            img: img,
                            width: img.width,
                            height: img.height,
                            aspectRatio: img.width / img.height,
                            file: file
                        });
                        
                        // Create thumbnail
                        const thumbnail = document.createElement('div');
                        thumbnail.className = 'image-thumbnail';
                        thumbnail.dataset.index = selectedImages.length - 1;
                        thumbnail.onclick = function() {
                            selectImage(parseInt(this.dataset.index));
                        };
                        
                        const thumbImg = document.createElement('img');
                        thumbImg.src = e.target.result;
                        thumbImg.alt = `Image ${selectedImages.length}`;
                        thumbnail.appendChild(thumbImg);
                        
                        imageContainer.appendChild(thumbnail);
                        
                        // If this is the first image, select it
                        if (selectedImages.length === 1) {
                            selectImage(0);
                        }
                        
                        // Enable convert button if we have at least one image
                        if (selectedImages.length > 0) {
                            convertBtn.disabled = false;
                        }
                        
                        // Add batch conversion options if multiple images
                        if (selectedImages.length > 1 && !document.getElementById('batchOptions')) {
                            addBatchConversionOptions();
                        }
                    };
                    img.src = e.target.result;
                };
                
                reader.readAsDataURL(file);
            }
        });
    }
    
    function addBatchConversionOptions() {
        // Create batch options container
        const batchOptions = document.createElement('div');
        batchOptions.id = 'batchOptions';
        batchOptions.className = 'batch-options';
        
        // Create convert all button
        const convertAllBtn = document.createElement('button');
        convertAllBtn.id = 'convertAllBtn';
        convertAllBtn.className = 'batch-btn';
        convertAllBtn.textContent = 'Convert & Download All';
        convertAllBtn.onclick = convertAllImages;
        
        // Add to drop area
        batchOptions.appendChild(convertAllBtn);
        dropArea.appendChild(batchOptions);
    }
    
    function selectImage(index) {
        if (index < 0 || index >= selectedImages.length) {
            return;
        }
        
        currentImageIndex = index;
        const imageData = selectedImages[index];
        
        // Update current image data
        originalImage = imageData.img;
        originalWidth = imageData.width;
        originalHeight = imageData.height;
        aspectRatioValue = imageData.aspectRatio;
        
        // Set width and height inputs
        widthInput.value = originalWidth;
        heightInput.value = originalHeight;
        
        // Highlight selected thumbnail
        const thumbnails = document.querySelectorAll('.image-thumbnail');
        thumbnails.forEach(thumb => {
            thumb.classList.remove('selected');
        });
        thumbnails[index].classList.add('selected');
    }

    function handleWidthChange() {
        if (aspectRatio.checked && originalImage) {
            const newWidth = parseInt(widthInput.value);
            if (!isNaN(newWidth)) {
                heightInput.value = Math.round(newWidth / aspectRatioValue);
            }
        }
    }

    function handleHeightChange() {
        if (aspectRatio.checked && originalImage) {
            const newHeight = parseInt(heightInput.value);
            if (!isNaN(newHeight)) {
                widthInput.value = Math.round(newHeight * aspectRatioValue);
            }
        }
    }

    function getSelectedFilter() {
        for (const option of filterOptions) {
            if (option.checked) {
                return option.value;
            }
        }
        return 'none';
    }

    function convertImage() {
        if (selectedImages.length === 0 || !originalImage) {
            alert('Please select an image first');
            return;
        }

        // Create canvas for image processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Get conversion parameters
        const format = formatSelect.value;
        const quality = parseInt(qualitySlider.value) / 100;
        const filter = getSelectedFilter();
        
        // Set canvas dimensions
        let width = parseInt(widthInput.value) || originalWidth;
        let height = parseInt(heightInput.value) || originalHeight;
        
        // Ensure dimensions are valid
        width = Math.max(1, Math.min(width, 5000));
        height = Math.max(1, Math.min(height, 5000));
        
        canvas.width = width;
        canvas.height = height;
        
        // Apply filters
        if (filter !== 'none') {
            switch (filter) {
                case 'grayscale':
                    ctx.filter = 'grayscale(100%)';
                    break;
                case 'sepia':
                    ctx.filter = 'sepia(100%)';
                    break;
                case 'invert':
                    ctx.filter = 'invert(100%)';
                    break;
            }
        }
        
        // Draw image on canvas
        ctx.drawImage(originalImage, 0, 0, width, height);
        
        // Convert to selected format
        let mimeType;
        switch (format) {
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
        let dataURL;
        if (format === 'jpg' || format === 'jpeg' || format === 'webp') {
            dataURL = canvas.toDataURL(mimeType, quality);
        } else {
            dataURL = canvas.toDataURL(mimeType);
        }
        
        // Store the converted image in the current image object
        selectedImages[currentImageIndex].convertedImage = dataURL;
        selectedImages[currentImageIndex].convertedFormat = format;
        
        // Display converted image
        displayConvertedImage(dataURL, format);
    }
    
    function convertAllImages() {
        if (selectedImages.length === 0) {
            alert('Please select at least one image first');
            return;
        }
        
        // Get selected format
        const format = formatSelect.value;
        
        // Get quality value
        const quality = qualitySlider.value / 100;
        
        // Get filter settings
        const grayscaleCheckbox = document.getElementById('filterGrayscale');
        const sepiaCheckbox = document.getElementById('filterSepia');
        const invertCheckbox = document.getElementById('filterInvert');
        
        // Convert each image
        selectedImages.forEach((imageData, index) => {
            // Create canvas for conversion
            const canvas = document.createElement('canvas');
            
            // Get dimensions (use original or specified)
            let width, height;
            if (document.getElementById('aspectRatio').checked) {
                // Use the current width/height inputs but maintain each image's aspect ratio
                width = parseInt(widthInput.value) || imageData.width;
                height = Math.round(width / imageData.aspectRatio);
            } else {
                width = parseInt(widthInput.value) || imageData.width;
                height = parseInt(heightInput.value) || imageData.height;
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            // Apply filters if selected
            if (grayscaleCheckbox.checked || sepiaCheckbox.checked || invertCheckbox.checked) {
                // Draw image to canvas
                ctx.drawImage(imageData.img, 0, 0, width, height);
                
                // Get image data
                const imgData = ctx.getImageData(0, 0, width, height);
                const data = imgData.data;
                
                // Apply filters
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    // Apply grayscale
                    if (grayscaleCheckbox.checked) {
                        const gray = 0.3 * r + 0.59 * g + 0.11 * b;
                        data[i] = gray;
                        data[i + 1] = gray;
                        data[i + 2] = gray;
                    }
                    
                    // Apply sepia
                    if (sepiaCheckbox.checked) {
                        data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
                        data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
                        data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
                    }
                    
                    // Apply invert
                    if (invertCheckbox.checked) {
                        data[i] = 255 - r;
                        data[i + 1] = 255 - g;
                        data[i + 2] = 255 - b;
                    }
                }
                
                // Put modified image data back to canvas
                ctx.putImageData(imgData, 0, 0);
            } else {
                // Just draw the image to canvas without filters
                ctx.drawImage(imageData.img, 0, 0, width, height);
            }
            
            // Generate data URL based on format
            let mimeType;
            let fileExtension;
            
            switch (format) {
                case 'jpg':
                case 'jpeg':
                    mimeType = 'image/jpeg';
                    fileExtension = 'jpg';
                    break;
                case 'png':
                    mimeType = 'image/png';
                    fileExtension = 'png';
                    break;
                case 'webp':
                    mimeType = 'image/webp';
                    fileExtension = 'webp';
                    break;
                case 'gif':
                    mimeType = 'image/gif';
                    fileExtension = 'gif';
                    break;
                case 'bmp':
                    mimeType = 'image/bmp';
                    fileExtension = 'bmp';
                    break;
                default:
                    mimeType = 'image/png';
                    fileExtension = 'png';
            }
            
            // Generate data URL
            let dataURL;
            if (format === 'jpg' || format === 'jpeg' || format === 'webp') {
                dataURL = canvas.toDataURL(mimeType, quality);
            } else {
                dataURL = canvas.toDataURL(mimeType);
            }
            
            // Store the converted image
            selectedImages[index].convertedImage = dataURL;
            selectedImages[index].convertedFormat = fileExtension;
        });
        
        // Create zip file with all converted images
        createAndDownloadZip();
    }
    
    function createAndDownloadZip() {
        // Show loading message
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'loading-message';
        loadingMsg.textContent = 'Preparing download...';
        document.body.appendChild(loadingMsg);
        
        // Create a link to download all images
        const downloadAllLink = document.createElement('a');
        downloadAllLink.style.display = 'none';
        document.body.appendChild(downloadAllLink);
        
        // If only one image, just download it directly
        if (selectedImages.length === 1) {
            const imageData = selectedImages[0];
            downloadAllLink.href = imageData.convertedImage;
            downloadAllLink.download = `converted_image.${imageData.convertedFormat}`;
            downloadAllLink.click();
            document.body.removeChild(downloadAllLink);
            document.body.removeChild(loadingMsg);
            return;
        }
        
        // For multiple images, create a zip file
        // Since we can't use external libraries like JSZip in this environment,
        // we'll create multiple download links and trigger them sequentially
        
        let downloadCount = 0;
        const totalImages = selectedImages.length;
        
        function downloadNext() {
            if (downloadCount >= totalImages) {
                // All downloads complete
                document.body.removeChild(downloadAllLink);
                document.body.removeChild(loadingMsg);
                return;
            }
            
            const imageData = selectedImages[downloadCount];
            downloadAllLink.href = imageData.convertedImage;
            
            // Use the correct file extension (original format might have been converted)
            let fileExtension = imageData.convertedFormat;
            
            // Update loading message
            loadingMsg.textContent = `Downloading image ${downloadCount + 1} of ${totalImages}...`;
            
            downloadAllLink.download = `converted_image_${downloadCount + 1}.${fileExtension}`;
            downloadAllLink.click();
            
            // Update loading message
            loadingMsg.textContent = `Downloading image ${downloadCount + 1} of ${totalImages}...`;
            
            // Move to next image after a short delay
            setTimeout(() => {
                downloadCount++;
                downloadNext();
            }, 500);
        }
        
        // Start the download process
        downloadNext();
    }

    function displayConvertedImage(dataURL, format) {
        // Clear previous content
        outputPreview.innerHTML = '';
        
        // Create image element
        const img = new Image();
        img.src = dataURL;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.objectFit = 'contain';
        
        // Add image to preview
        outputPreview.appendChild(img);
        
        // Update download button
        downloadBtn.href = dataURL;
        downloadBtn.download = `converted-image.${format}`;
        downloadBtn.style.display = 'block';
    }
});