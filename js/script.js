const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwAkeJZ9nAbpJ1cNARJOzYVBStQeSpIyN3G7u7F9XSsByk14dgoh8e5TqE7waSAM4lm/exec';

class Gallery {
    constructor() {
        this.currentPage = 0;
        this.itemsPerPage = window.innerWidth < 768 ? 1 : 8;
        this.photos = [];
        this.totalPages = 0;
        this.currentPhotoIndex = 0;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.isSwiping = false;

        this.grid = document.getElementById('galleryGrid');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.dotsContainer = document.getElementById('dotsContainer');

        this.galleryModal = document.getElementById('galleryModal');
        this.modalImage = this.galleryModal?.querySelector('.gallery-modal-image');
        this.modalPrevBtn = this.galleryModal?.querySelector('.gallery-modal-prev');
        this.modalNextBtn = this.galleryModal?.querySelector('.gallery-modal-next');
        this.modalCloseBtn = this.galleryModal?.querySelector('.gallery-modal-close');

        this.loadPhotos();
    }

    async loadPhotos() {
        try {
            const response = await fetch('photo.json');
            this.photos = await response.json();
            this.initGallery();
        } catch (error) {
            console.error('Ошибка загрузки фотографий:', error);
            this.photos = this.getDefaultPhotos();
            this.initGallery();
        }
    }

    getDefaultPhotos() {
        return [
            'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1622556786669-83cb32f0d2b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        ];
    }

    initGallery() {
        this.totalPages = Math.ceil(this.photos.length / this.itemsPerPage);
        this.renderGallery();
        this.setupControls();
        this.updateControls();
        this.setupModal();
        this.setupSwipeForGallery();

        window.addEventListener('resize', () => {
            this.itemsPerPage = window.innerWidth < 768 ? 1 : 8;
            this.totalPages = Math.ceil(this.photos.length / this.itemsPerPage);
            this.currentPage = 0;
            this.renderGallery();
            this.updateControls();
            if (window.innerWidth >= 768) {
                this.createDots();
            }
        });
    }

    renderGallery() {
        this.grid.innerHTML = '';

        const startIndex = this.currentPage * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const photosToShow = this.photos.slice(startIndex, endIndex);

        photosToShow.forEach((photoUrl, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';

            const img = document.createElement('img');
            img.src = photoUrl;
            img.alt = `Пример электромонтажных работ ${startIndex + index + 1}`;
            img.loading = index < 2 ? 'eager' : 'lazy';

            img.onerror = function () {
                this.src = 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
            };

            galleryItem.appendChild(img);

            galleryItem.addEventListener('click', () => {
                this.currentPhotoIndex = startIndex + index;
                this.openModal();
            });

            this.grid.appendChild(galleryItem);
        });
    }

    createDots() {
        this.dotsContainer.innerHTML = '';

        if (window.innerWidth < 768) {
            return;
        }

        for (let i = 0; i < this.totalPages; i++) {
            const dot = document.createElement('button');
            dot.className = `gallery-dot ${i === this.currentPage ? 'active' : ''}`;
            dot.setAttribute('data-page', i);
            dot.setAttribute('aria-label', `Перейти к странице ${i + 1}`);
            dot.addEventListener('click', () => {
                this.currentPage = i;
                this.renderGallery();
                this.updateControls();
            });
            this.dotsContainer.appendChild(dot);
        }
    }

    setupControls() {
        this.prevBtn.addEventListener('click', () => {
            if (this.currentPage > 0) {
                this.currentPage--;
                this.renderGallery();
                this.updateControls();
            }
        });

        this.nextBtn.addEventListener('click', () => {
            if (this.currentPage < this.totalPages - 1) {
                this.currentPage++;
                this.renderGallery();
                this.updateControls();
            }
        });

        this.createDots();
    }

    updateControls() {
        this.prevBtn.disabled = this.currentPage === 0;
        this.nextBtn.disabled = this.currentPage === this.totalPages - 1;

        if (window.innerWidth >= 768) {
            document.querySelectorAll('.gallery-dot').forEach((dot, index) => {
                if (index === this.currentPage) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
    }

    setupSwipeForGallery() {
        if (window.innerWidth >= 768) return;

        const galleryWrapper = document.querySelector('.gallery-wrapper');
        
        galleryWrapper.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
            this.isSwiping = false;
        }, { passive: true });

        galleryWrapper.addEventListener('touchmove', (e) => {
            this.isSwiping = true;
        }, { passive: true });

        galleryWrapper.addEventListener('touchend', (e) => {
            if (!this.isSwiping) return;
            
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleGallerySwipe();
        }, { passive: true });
    }

    handleGallerySwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                if (this.currentPage < this.totalPages - 1) {
                    this.currentPage++;
                    this.renderGallery();
                    this.updateControls();
                }
            } else {
                if (this.currentPage > 0) {
                    this.currentPage--;
                    this.renderGallery();
                    this.updateControls();
                }
            }
        }
    }

    setupModal() {
        if (!this.galleryModal) return;

        this.modalPrevBtn.addEventListener('click', () => this.prevPhoto());
        this.modalNextBtn.addEventListener('click', () => this.nextPhoto());
        this.modalCloseBtn.addEventListener('click', () => this.closeModal());

        document.addEventListener('keydown', (e) => {
            if (!this.galleryModal.classList.contains('active')) return;

            if (e.key === 'Escape') {
                this.closeModal();
            } else if (e.key === 'ArrowLeft') {
                this.prevPhoto();
            } else if (e.key === 'ArrowRight') {
                this.nextPhoto();
            }
        });

        this.galleryModal.addEventListener('click', (e) => {
            if (e.target === this.galleryModal) {
                this.closeModal();
            }
        });

        this.galleryModal.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.galleryModal.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextPhoto();
            } else {
                this.prevPhoto();
            }
        }
    }

    openModal() {
        if (!this.photos.length) return;

        this.updateModalImage();
        this.galleryModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.galleryModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    prevPhoto() {
        if (this.currentPhotoIndex > 0) {
            this.currentPhotoIndex--;
            this.updateModalImage();
        }
    }

    nextPhoto() {
        if (this.currentPhotoIndex < this.photos.length - 1) {
            this.currentPhotoIndex++;
            this.updateModalImage();
        }
    }

    updateModalImage() {
        if (!this.modalImage) return;

        this.modalImage.src = this.photos[this.currentPhotoIndex];
    }
}

function setupGalleryHeight() {
    if (window.innerWidth < 768) {
        const galleryWrapper = document.querySelector('.gallery-wrapper');
        const galleryItems = document.querySelectorAll('.gallery-item');

        galleryWrapper.classList.add('height-medium');

        galleryItems.forEach(item => {
            item.classList.add('height-medium');
        });
    }
}

document.addEventListener('DOMContentLoaded', setupGalleryHeight);
window.addEventListener('resize', setupGalleryHeight);

function initForm() {
    const form = document.getElementById('requestForm');
    const successModal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModal');

    if (!form) return;

    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function () {
            if (this.value.length > 20) {
                this.value = this.value.substring(0, 20);
            }
        });
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            message: document.getElementById('message').value.trim() || '',
            source: 'electrician-website'
        };

        if (!formData.name || !formData.phone) {
            alert('Пожалуйста, заполните имя и телефон');
            return;
        }

        const digitCount = (formData.phone.match(/\d/g) || []).length;
        if (digitCount < 5) {
            alert('Пожалуйста, введите корректный номер телефона (минимум 5 цифр)');
            return;
        }

        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;

        setTimeout(async () => {
            try {
                await fetch(APPS_SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    mode: 'no-cors',
                    body: JSON.stringify(formData)
                });

                successModal.style.display = 'block';
                form.reset();

                setTimeout(() => {
                    if (successModal.style.display === 'block') {
                        successModal.style.display = 'none';
                    }
                }, 4000);

            } catch (error) {
                successModal.style.display = 'block';
                form.reset();

                setTimeout(() => {
                    if (successModal.style.display === 'block') {
                        successModal.style.display = 'none';
                    }
                }, 4000);
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }, 10);
    });

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            successModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.style.display = 'none';
        }
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const targetElement = document.querySelector(href);
            if (targetElement) {
                e.preventDefault();

                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initHeaderEffect() {
    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.style.padding = '8px 0';
            header.style.boxShadow = '0 5px 25px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.padding = '15px 0';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }

        lastScroll = currentScroll;
    });
}

function initServiceCardsAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.service-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

function initCurrentYear() {
    const currentYear = new Date().getFullYear();
    const yearElements = document.querySelectorAll('.footer-bottom p');
    yearElements.forEach(element => {
        element.innerHTML = element.innerHTML.replace('2026', currentYear);
    });
}

document.getElementById('currentYear').textContent = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', function () {
    new Gallery();
    initForm();
    initSmoothScroll();
    initHeaderEffect();
    initServiceCardsAnimation();
});

function initCalculator() {
    const totalElement = document.getElementById('calcTotal');
    const items = document.querySelectorAll('.calculator-item');
    const quantityInputs = document.querySelectorAll('.calc-quantity-input');
    const plusButtons = document.querySelectorAll('.calc-quantity-btn.plus');
    const minusButtons = document.querySelectorAll('.calc-quantity-btn.minus');

    function formatNumber(num) {
        return new Intl.NumberFormat('ru-RU').format(num);
    }

    function calculateTotal() {
        let total = 0;

        items.forEach(item => {
            const price = parseInt(item.getAttribute('data-price'));
            const quantityInput = item.querySelector('.calc-quantity-input');
            const quantity = parseInt(quantityInput.value) || 0;

            total += price * quantity;
        });

        totalElement.textContent = formatNumber(total);
    }

    plusButtons.forEach(button => {
        button.addEventListener('click', function () {
            const input = this.parentNode.querySelector('.calc-quantity-input');
            let value = parseInt(input.value) || 0;
            const max = parseInt(input.getAttribute('max')) || 99;

            if (value < max) {
                value++;
                input.value = value;
                calculateTotal();
            }
        });
    });

    minusButtons.forEach(button => {
        button.addEventListener('click', function () {
            const input = this.parentNode.querySelector('.calc-quantity-input');
            let value = parseInt(input.value) || 0;
            const min = parseInt(input.getAttribute('min')) || 0;

            if (value > min) {
                value--;
                input.value = value;
                calculateTotal();
            }
        });
    });

    quantityInputs.forEach(input => {
        input.addEventListener('input', function () {
            let value = parseInt(this.value) || 0;
            const min = parseInt(this.getAttribute('min')) || 0;
            const max = parseInt(this.getAttribute('max')) || 99;

            if (value < min) {
                value = min;
                this.value = value;
            } else if (value > max) {
                value = max;
                this.value = value;
            }

            calculateTotal();
        });

        input.addEventListener('change', function () {
            if (!this.value || this.value === '' || parseInt(this.value) < 0) {
                this.value = 0;
                calculateTotal();
            }
        });
    });

    calculateTotal();
}

document.addEventListener('DOMContentLoaded', initCalculator);