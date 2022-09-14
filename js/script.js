import allProducts from './products.json' assert { type: 'json' };

const menuDomElement = document.querySelector('.menu');
const menuToggleButton = document.querySelector('.menu__toggle-button');
const cartDomElement = document.querySelector('.cart');
const cartButton = document.querySelector('.cart__button');
const cartCloseButton = document.querySelector('.cart__close-button');
const heroArrowDown = document.querySelector('.hero__arrow-down');
const promotionSectionDomElement = document.querySelector('.promotion');

const productGallery = document.querySelector('.products__gallery');
const promotionGallery = document.querySelector('.promotion__gallery');
const searchInput = document.querySelector('.filters__search-input');
const brandList = document.querySelector('.filters__brand-list');
const priceFilter = document.querySelector('.filters__range-box');

let products = allProducts; //this variable represents items to display, for correct product filters cooperation
const promotionProducts = allProducts.slice(1, 4);

menuToggleButton.addEventListener('click', () => {
  menuDomElement.classList.toggle('menu_active');
});
cartButton.addEventListener('click', () => {
  cartDomElement.classList.add('cart_active');
});
cartCloseButton.addEventListener('click', () => {
  cartDomElement.classList.remove('cart_active');
});
heroArrowDown?.addEventListener('click', () => {
  promotionSectionDomElement.scrollIntoView({ behavior: 'smooth' });
});

window.addEventListener('load', handlePageLoad);
searchInput?.addEventListener('input', handleSearch);

function handlePageLoad() {
  showGallery(products, productGallery);
  showGallery(promotionProducts, promotionGallery);
  getBrands();
  handlePriceFilter();
  showCartTotals();
  showCartList();
}

function handleSearch(event) {
  const filteredData = products.filter(({ name }) => name.toLowerCase().includes(event.target.value.toLowerCase()));
  showGallery(filteredData, productGallery);
  handlePriceFilter();
}

function handlePriceFilter() {
  if (priceFilter) {
    const priceArray = products.map(({ price }) => price);
    const maxPrice = Math.ceil(Math.max(...priceArray) / 100);
    const minPrice = Math.floor(Math.min(...priceArray) / 100);
    priceFilter.innerHTML = `
   <input type="range" name="price" min="${minPrice}" max="${maxPrice}" value="${maxPrice}" class="filters__range-input">
   <p class="filters__range-value">Value: $${minPrice} - $${maxPrice}</p>`;

    const priceInput = priceFilter.querySelector('.filters__range-input');
    const priceValue = priceFilter.querySelector('.filters__range-value');
    priceInput.addEventListener('input', () => {
      const currentValue = +priceInput.value;
      priceValue.textContent = `Value: $${minPrice} - $${currentValue}`;
      const filteredData = products.filter(({ price }) => price / 100 <= currentValue);
      showGallery(filteredData, productGallery);
      searchInput.value = '';
    });
  }
}

function getBrands() {
  if (brandList) {
    const brandSet = new Set(allProducts.map(({ brand }) => brand));
    const brands = Array.from(brandSet);
    brands.unshift('All');
    handleBrandFilter(brands);
  }
}

function handleBrandFilter(brands) {
  brands.forEach((item) => {
    const brand = document.createElement('li');
    item === 'All' ? brand.classList.add('filters__brand-item', 'filters__brand-item_active') : brand.classList.add('filters__brand-item');
    brand.textContent = item;
    brandList.appendChild(brand);

    brand.addEventListener('click', (event) => {
      brandList.querySelectorAll('.filters__brand-item').forEach((item) => item.classList.remove('filters__brand-item_active'));
      event.target.classList.add('filters__brand-item_active');
      products = allProducts;
      if (item === 'All') {
        showGallery(products, productGallery);
        handlePriceFilter();
      } else {
        const filteredData = products.filter(({ brand }) => brand.toLowerCase().includes(item.toLowerCase()));
        products = filteredData;
        showGallery(filteredData, productGallery);
        handlePriceFilter();
      }
      searchInput.value = '';
    });
  });
}

function showGallery(productArray, domElement) {
  if (domElement) {
    domElement.innerHTML = ``;
    productArray.forEach((item) => {
      const { id, name, brand, price, image } = item;
      const card = document.createElement('div');
      card.classList.add('gallery__card', 'card');
      card.innerHTML = ` <img src="${image}" alt="${name}" class="card__image">
    <div class="card__description">
        <h4 class="card__title">${name}, ${brand}</h4>
        <p class="card__price">${new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: 'USD',
        }).format(price / 100)}</p>
        <button class="card__add-button" data-key="${id}">Add to cart</button>
    </div>`;
      domElement.appendChild(card);
    });
  }
}

//Cart Functionality
const gallery = document.querySelector('.gallery');
const cartBadge = document.querySelector('.cart__badge');
const cartList = document.querySelector('.cart__list');
const cartTotalDomElement = document.querySelector('.cart__total');
const cartCheckoutButton = document.querySelector('.cart__checkout-button');

let cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : {};

const productObject = allProducts.reduce((acc, curr) => {
  acc[curr['id']] = curr;
  return acc;
}, {});

gallery?.addEventListener('click', (event) => {
  event.preventDefault();
  if (event.target.classList.contains('card__add-button')) {
    increaseCartQuantity(event.target.getAttribute('data-key'));
  }
});

cartList?.addEventListener('click', (event) => {
  event.preventDefault();
  if (event.target.classList.contains('product__increase-quantity')) {
    increaseCartQuantity(event.target.getAttribute('data-key'));
  }
  if (event.target.classList.contains('product__decrease-quantity')) {
    decreaseCartQuantity(event.target.getAttribute('data-key'));
  }
  if (event.target.classList.contains('product__remove-button')) {
    removeFromCart(event.target.getAttribute('data-key'));
  }
});

cartCheckoutButton.addEventListener('click', (event) => {
  event.preventDefault();
  clearCart();
});

function increaseCartQuantity(key) {
  if (cart[key] === undefined) cart[key] = 0;
  cart[key] += 1;
  localStorage.setItem('cart', JSON.stringify(cart));
  showCartList();
  showCartTotals();
}
function decreaseCartQuantity(key) {
  if (cart[key] > 1) cart[key] -= 1;
  localStorage.setItem('cart', JSON.stringify(cart));
  showCartList();
  showCartTotals();
}
function removeFromCart(key) {
  delete cart[key];
  localStorage.setItem('cart', JSON.stringify(cart));
  showCartList();
  showCartTotals();
}
function clearCart() {
  cart = {};
  localStorage.setItem('cart', JSON.stringify(cart));
  showCartList();
  showCartTotals();
  cartDomElement.classList.remove('cart_active');
}

function showCartList() {
  cartList.innerHTML = ``;
  if (Object.keys(cart).length) {
    Object.keys(cart).forEach((item) => {
      const { image, name, price, id } = productObject[item];
      const product = document.createElement('li');
      product.classList.add('cart__product', 'product');
      product.innerHTML = `
    <img src="${image}" alt="${name}" class="product__image">
    <div class="product__description">
        <h4 class="product__title">${name}</h4>
        <p class="product__price">${new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: 'USD',
        }).format(price / 100)}</p>
        <button class="product__remove-button" data-key="${id}">remove</button>
    </div>
    <div class="product__quantity-box">
        <button class="product__increase-quantity" data-key="${id}"><svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 20 20">
                <path fill="currentColor" d="M15.484 12.452c-.436.446-1.043.481-1.576 0L10 8.705l-3.908 3.747c-.533.481-1.141.446-1.574 0c-.436-.445-.408-1.197 0-1.615c.406-.418 4.695-4.502 4.695-4.502a1.095 1.095 0 0 1 1.576 0s4.287 4.084 4.695 4.502c.409.418.436 1.17 0 1.615z" />
            </svg></button>
        <span class="product__quantity">${cart[item]}</span>
        <button class="${cart[item] > 1 ? `product__decrease-quantity` : `product__decrease-quantity _muted`}" data-key="${id}"><svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 20 20">
                <path fill="currentColor" d="M4.516 7.548c.436-.446 1.043-.481 1.576 0L10 11.295l3.908-3.747c.533-.481 1.141-.446 1.574 0c.436.445.408 1.197 0 1.615c-.406.418-4.695 4.502-4.695 4.502a1.095 1.095 0 0 1-1.576 0S4.924 9.581 4.516 9.163c-.409-.418-.436-1.17 0-1.615z" />
            </svg></button>
    </div>`;

      cartList.appendChild(product);
    });
  } else {
    cartList.innerHTML = `<p class="cart__message">Your bag is empty</p>`;
  }
}

function showCartTotals() {
  const totalItems = Object.keys(cart).reduce((acc, curr) => {
    acc += +cart[curr];
    return acc;
  }, 0);
  const totalCost = Object.keys(cart).reduce((acc, curr) => {
    acc += +cart[curr] * productObject[curr]['price'];
    return acc;
  }, 0);

  cartTotalDomElement.textContent = `Total: ${new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(totalCost / 100)}`;
  cartBadge.textContent = totalItems;
}
