document.addEventListener('DOMContentLoaded', function () {
    const images = document.querySelectorAll('.article-main-image');

    function setupImage(img) {
        const container = img.parentElement;
        const nw = img.naturalWidth;
        const nh = img.naturalHeight;
        const ar = nw / nh;
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        const cr = cw / ch;

        img.classList.remove('horizontal', 'vertical', 'square');

        if (ar > cr * 1.1) {
            img.classList.add('horizontal');
            container.style.backgroundColor = '#f8f9fa';
        } else if (ar < cr * 0.9) {
            img.classList.add('vertical');
            container.style.backgroundColor = '#1a1a1a';
        } else {
            img.classList.add('square');
            container.style.backgroundColor = '#f8f9fa';
        }

        img.classList.add('loaded');
    }

    images.forEach(img => {
        img.alt = '';

        if (img.complete && img.naturalWidth > 0) {
            setupImage(img);
        } else {
            img.addEventListener('load', () => setupImage(img));
            img.addEventListener('error', () => {
                img.parentElement.style.backgroundColor = '#f8f9fa';
                img.classList.add('loaded');
            });
        }
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            images.forEach(img => {
                if (img.classList.contains('loaded')) {
                    setupImage(img);
                }
            });
        }, 200);
    });
});
document.getElementById('currentYear').textContent = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const backParam = urlParams.get('back');

    if (backParam === 'articles') {
        const backButton = document.getElementById('backButton');
        const bottomBackButton = document.getElementById('bottomBackButton');

        if (backButton) {
            backButton.href = '/#articles';
            document.querySelector('.back-text').textContent = 'К списку статей';
        }

        if (bottomBackButton) {
            bottomBackButton.href = '/#articles';
            document.querySelector('.bottom-back-text').textContent = 'К списку статей';
        }
    }
});
