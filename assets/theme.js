/**
 * SPROUTLY THEME JAVASCRIPT
 * Core functionality and interactions
 */

/* ==========================================================================
   THEME UTILITIES
   ========================================================================== */

const SproutlyTheme = {
  config: {
    mobileBreakpoint: 750,
    animationDuration: 300,
    enableAnimations: true
  },

  // Utility functions
  utils: {
    // Debounce function for performance
    debounce: (func, wait, immediate) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          timeout = null;
          if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
      };
    },

    // Throttle function for scroll events
    throttle: (func, limit) => {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },

    // Check if element is in viewport
    isInViewport: (element, offset = 0) => {
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 - offset &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    },

    // Get breakpoint state
    isMobile: () => window.innerWidth < SproutlyTheme.config.mobileBreakpoint,

    // Animation helper
    animate: (element, keyframes, options = {}) => {
      if (!SproutlyTheme.config.enableAnimations || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return Promise.resolve();
      }
      return element.animate(keyframes, {
        duration: options.duration || SproutlyTheme.config.animationDuration,
        easing: options.easing || 'ease-out',
        fill: 'forwards',
        ...options
      }).finished;
    }
  },

  // Initialize theme
  init: () => {
    SproutlyTheme.mobileMenu.init();
    SproutlyTheme.accordions.init();
    SproutlyTheme.carousels.init();
    SproutlyTheme.animations.init();
    SproutlyTheme.tierComparison.init();
    SproutlyTheme.forms.init();
    
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      SproutlyTheme.config.enableAnimations = false;
    }
  }
};

/* ==========================================================================
   MOBILE MENU
   ========================================================================== */

SproutlyTheme.mobileMenu = {
  init: () => {
    const menuToggle = document.querySelector('[data-mobile-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');
    const menuOverlay = document.querySelector('[data-mobile-menu-overlay]');

    if (!menuToggle || !mobileMenu) return;

    const toggleMenu = () => {
      const isOpen = mobileMenu.getAttribute('aria-expanded') === 'true';
      
      menuToggle.setAttribute('aria-expanded', !isOpen);
      mobileMenu.setAttribute('aria-expanded', !isOpen);
      
      if (!isOpen) {
        document.body.classList.add('mobile-menu-open');
        mobileMenu.style.display = 'block';
        SproutlyTheme.utils.animate(mobileMenu, [
          { transform: 'translateX(-100%)', opacity: 0 },
          { transform: 'translateX(0)', opacity: 1 }
        ]);
      } else {
        SproutlyTheme.utils.animate(mobileMenu, [
          { transform: 'translateX(0)', opacity: 1 },
          { transform: 'translateX(-100%)', opacity: 0 }
        ]).then(() => {
          mobileMenu.style.display = 'none';
          document.body.classList.remove('mobile-menu-open');
        });
      }
    };

    menuToggle.addEventListener('click', toggleMenu);
    
    if (menuOverlay) {
      menuOverlay.addEventListener('click', toggleMenu);
    }

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.getAttribute('aria-expanded') === 'true') {
        toggleMenu();
      }
    });

    // Close menu on window resize if mobile breakpoint is exceeded
    window.addEventListener('resize', SproutlyTheme.utils.debounce(() => {
      if (!SproutlyTheme.utils.isMobile() && mobileMenu.getAttribute('aria-expanded') === 'true') {
        toggleMenu();
      }
    }, 250));
  }
};

/* ==========================================================================
   ACCORDION FUNCTIONALITY
   ========================================================================== */

SproutlyTheme.accordions = {
  init: () => {
    const accordions = document.querySelectorAll('[data-accordion]');
    
    accordions.forEach(accordion => {
      SproutlyTheme.accordions.setupAccordion(accordion);
    });
  },

  setupAccordion: (accordion) => {
    const triggers = accordion.querySelectorAll('[data-accordion-trigger]');
    
    triggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        SproutlyTheme.accordions.toggleAccordion(trigger);
      });
    });
  },

  toggleAccordion: (trigger) => {
    const content = document.getElementById(trigger.getAttribute('aria-controls'));
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
    
    if (!content) return;

    // Toggle states
    trigger.setAttribute('aria-expanded', !isExpanded);
    
    if (isExpanded) {
      // Close
      SproutlyTheme.utils.animate(content, [
        { height: content.scrollHeight + 'px', opacity: 1 },
        { height: '0px', opacity: 0 }
      ]).then(() => {
        content.hidden = true;
        content.style.height = '';
      });
    } else {
      // Open
      content.hidden = false;
      content.style.height = '0px';
      SproutlyTheme.utils.animate(content, [
        { height: '0px', opacity: 0 },
        { height: content.scrollHeight + 'px', opacity: 1 }
      ]).then(() => {
        content.style.height = 'auto';
      });
    }

    // Update chevron icon rotation
    const icon = trigger.querySelector('[data-accordion-icon]');
    if (icon) {
      icon.style.transform = !isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
    }
  }
};

/* ==========================================================================
   CAROUSEL FUNCTIONALITY
   ========================================================================== */

SproutlyTheme.carousels = {
  init: () => {
    const carousels = document.querySelectorAll('[data-carousel]');
    
    carousels.forEach(carousel => {
      SproutlyTheme.carousels.setupCarousel(carousel);
    });
  },

  setupCarousel: (carousel) => {
    const track = carousel.querySelector('[data-carousel-track]');
    const slides = carousel.querySelectorAll('[data-carousel-slide]');
    const prevButton = carousel.querySelector('[data-carousel-prev]');
    const nextButton = carousel.querySelector('[data-carousel-next]');
    const dots = carousel.querySelectorAll('[data-carousel-dot]');
    
    if (!track || slides.length === 0) return;

    let currentSlide = 0;
    const totalSlides = slides.length;

    const updateCarousel = () => {
      // Update track position
      const translateX = -currentSlide * 100;
      track.style.transform = `translateX(${translateX}%)`;
      
      // Update active states
      slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
      });
      
      // Update dots
      dots.forEach((dot, index) => {
        dot.classList.toggle('testimonials__dot--active', index === currentSlide);
      });
      
      // Update button states
      if (prevButton) prevButton.disabled = currentSlide === 0;
      if (nextButton) nextButton.disabled = currentSlide === totalSlides - 1;
    };

    const goToSlide = (index) => {
      currentSlide = Math.max(0, Math.min(index, totalSlides - 1));
      updateCarousel();
    };

    const nextSlide = () => goToSlide(currentSlide + 1);
    const prevSlide = () => goToSlide(currentSlide - 1);

    // Event listeners
    if (prevButton) prevButton.addEventListener('click', prevSlide);
    if (nextButton) nextButton.addEventListener('click', nextSlide);
    
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => goToSlide(index));
    });

    // Touch/swipe support for mobile
    if (SproutlyTheme.utils.isMobile()) {
      let startX = 0;
      let currentX = 0;
      let isDragging = false;

      track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
      });

      track.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
      });

      track.addEventListener('touchend', () => {
        if (!isDragging) return;
        
        const diff = startX - currentX;
        const threshold = 50;
        
        if (Math.abs(diff) > threshold) {
          if (diff > 0) nextSlide();
          else prevSlide();
        }
        
        isDragging = false;
      });
    }

    // Auto-play (optional)
    const autoplay = carousel.dataset.autoplay;
    if (autoplay && parseInt(autoplay) > 0) {
      setInterval(() => {
        if (currentSlide === totalSlides - 1) {
          goToSlide(0);
        } else {
          nextSlide();
        }
      }, parseInt(autoplay) * 1000);
    }

    // Initialize
    updateCarousel();
  }
};

/* ==========================================================================
   SCROLL ANIMATIONS
   ========================================================================== */

SproutlyTheme.animations = {
  init: () => {
    if (!SproutlyTheme.config.enableAnimations) return;
    
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    if (animatedElements.length === 0) return;

    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          SproutlyTheme.animations.animateElement(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animatedElements.forEach(element => {
      observer.observe(element);
    });
  },

  animateElement: (element) => {
    const animationType = element.dataset.animate || 'fade-in';
    const delay = parseInt(element.dataset.animateDelay) || 0;
    
    setTimeout(() => {
      SproutlyTheme.animations.applyAnimation(element, animationType);
    }, delay);
  },

  applyAnimation: (element, type) => {
    const animations = {
      'fade-in': [
        { opacity: 0, transform: 'translateY(20px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ],
      'slide-left': [
        { opacity: 0, transform: 'translateX(-30px)' },
        { opacity: 1, transform: 'translateX(0)' }
      ],
      'slide-right': [
        { opacity: 0, transform: 'translateX(30px)' },
        { opacity: 1, transform: 'translateX(0)' }
      ],
      'scale-in': [
        { opacity: 0, transform: 'scale(0.8)' },
        { opacity: 1, transform: 'scale(1)' }
      ]
    };

    const keyframes = animations[type] || animations['fade-in'];
    
    SproutlyTheme.utils.animate(element, keyframes, {
      duration: 600,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
    });
  }
};

/* ==========================================================================
   TIER COMPARISON
   ========================================================================== */

SproutlyTheme.tierComparison = {
  init: () => {
    const comparisonButtons = document.querySelectorAll('.tier-comparison__button');
    
    comparisonButtons.forEach(button => {
      button.addEventListener('click', SproutlyTheme.tierComparison.toggleComparison);
    });
  },

  toggleComparison: (e) => {
    const button = e.currentTarget;
    const table = button.nextElementSibling;
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    
    if (!table) return;

    button.setAttribute('aria-expanded', !isExpanded);
    
    if (isExpanded) {
      table.hidden = true;
      button.querySelector('span').textContent = 'Compare All Features';
    } else {
      table.hidden = false;
      button.querySelector('span').textContent = 'Hide Comparison';
      
      // Smooth scroll to table
      table.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
};

/* ==========================================================================
   FORM ENHANCEMENTS
   ========================================================================== */

SproutlyTheme.forms = {
  init: () => {
    // Newsletter forms
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
      SproutlyTheme.forms.enhanceNewsletterForm(form);
    });

    // Product forms
    const productForms = document.querySelectorAll('[data-type="add-to-cart-form"]');
    productForms.forEach(form => {
      SproutlyTheme.forms.enhanceProductForm(form);
    });
  },

  enhanceNewsletterForm: (form) => {
    const input = form.querySelector('input[type="email"]');
    const button = form.querySelector('button[type="submit"]');
    
    if (!input || !button) return;

    // Add loading state on submit
    form.addEventListener('submit', () => {
      button.classList.add('button--loading');
      button.disabled = true;
    });

    // Real-time validation
    input.addEventListener('input', SproutlyTheme.utils.debounce(() => {
      SproutlyTheme.forms.validateEmail(input);
    }, 300));
  },

  enhanceProductForm: (form) => {
    const submitButton = form.querySelector('[type="submit"]');
    
    if (!submitButton) return;

    form.addEventListener('submit', (e) => {
      submitButton.classList.add('button--loading');
      
      // Re-enable after 3 seconds (in case of error)
      setTimeout(() => {
        submitButton.classList.remove('button--loading');
      }, 3000);
    });
  },

  validateEmail: (input) => {
    const email = input.value;
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    input.classList.toggle('field__input--error', !isValid && email.length > 0);
    input.classList.toggle('field__input--valid', isValid);
    
    return isValid;
  }
};

/* ==========================================================================
   CART FUNCTIONALITY
   ========================================================================== */

SproutlyTheme.cart = {
  // Cart drawer toggle
  toggleDrawer: () => {
    const drawer = document.getElementById('cart-drawer');
    if (!drawer) return;
    
    const isOpen = drawer.classList.contains('cart-drawer--open');
    
    if (isOpen) {
      SproutlyTheme.cart.closeDrawer();
    } else {
      SproutlyTheme.cart.openDrawer();
    }
  },

  openDrawer: () => {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-drawer-overlay');
    
    if (!drawer) return;
    
    drawer.classList.add('cart-drawer--open');
    if (overlay) overlay.classList.add('cart-drawer-overlay--visible');
    document.body.classList.add('cart-drawer-open');
    
    // Focus management
    const closeButton = drawer.querySelector('[data-cart-drawer-close]');
    if (closeButton) closeButton.focus();
  },

  closeDrawer: () => {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-drawer-overlay');
    
    if (!drawer) return;
    
    drawer.classList.remove('cart-drawer--open');
    if (overlay) overlay.classList.remove('cart-drawer-overlay--visible');
    document.body.classList.remove('cart-drawer-open');
  }
};

// Make cart functions globally available
window.SproutlyTheme = SproutlyTheme;

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', SproutlyTheme.init);
} else {
  SproutlyTheme.init();
}

// Re-initialize on AJAX page loads (for SPAs)
document.addEventListener('shopify:section:load', SproutlyTheme.init);