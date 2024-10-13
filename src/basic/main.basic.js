let sel, addBtn, cartItemsDisplay, sum, stockInfo;
let lastSel,
  bonusPts = 0,
  itemCnt = 0;

const PROD_LIST = [
  { id: 'p1', name: '상품1', price: 10000, quantity: 50 },
  { id: 'p2', name: '상품2', price: 20000, quantity: 30 },
  { id: 'p3', name: '상품3', price: 30000, quantity: 20 },
  { id: 'p4', name: '상품4', price: 15000, quantity: 0 },
  { id: 'p5', name: '상품5', price: 25000, quantity: 10 },
];

const main = () => {
  renderCartUI();
  calcCart();
  scheduleRandomSales();
};

const renderCartUI = () => {
  const root = document.getElementById('app');
  let cont = document.createElement('div');
  const wrap = document.createElement('div');
  const title = document.createElement('h1');
  cartItemsDisplay = document.createElement('div');
  sum = document.createElement('div');
  sel = document.createElement('select');
  addBtn = document.createElement('button');
  stockInfo = document.createElement('div');

  cartItemsDisplay.id = 'cart-items';
  sum.id = 'cart-total';
  sel.id = 'product-select';
  addBtn.id = 'add-to-cart';
  stockInfo.id = 'stock-status';

  cont.className = 'bg-gray-100 p-8';
  wrap.className = 'max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8';
  title.className = 'text-2xl font-bold mb-4';
  sum.className = 'text-xl font-bold my-4';
  sel.className = 'border rounded p-2 mr-2';
  addBtn.className = 'bg-blue-500 text-white px-4 py-2 rounded';
  stockInfo.className = 'text-sm text-gray-500 mt-2';
  title.textContent = '장바구니';
  addBtn.textContent = '추가';

  updateSelOpts();

  wrap.appendChild(title);
  wrap.appendChild(cartItemsDisplay);
  wrap.appendChild(sum);
  wrap.appendChild(sel);
  wrap.appendChild(addBtn);
  wrap.appendChild(stockInfo);
  cont.appendChild(wrap);
  root.appendChild(cont);
};
const scheduleRandomSales = () => {
  setTimeout(() => {
    setInterval(() => {
      const luckyItem = PROD_LIST[Math.floor(Math.random() * PROD_LIST.length)];
      if (Math.random() < 0.3 && luckyItem.quantity > 0) {
        luckyItem.price = Math.round(luckyItem.price * 0.8);
        alert('번개세일! ' + luckyItem.name + '이(가) 20% 할인 중입니다!');
        updateSelOpts();
      }
    }, 30000);
  }, Math.random() * 10000);

  setTimeout(() => {
    setInterval(() => {
      if (lastSel) {
        const suggest = PROD_LIST.find((item) => {
          return item.id !== lastSel && item.quantity > 0;
        });
        if (suggest) {
          alert(suggest.name + '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!');
          suggest.price = Math.round(suggest.price * 0.95);
          updateSelOpts();
        }
      }
    }, 60000);
  }, Math.random() * 20000);
};

const updateSelOpts = () => {
  sel.innerHTML = '';
  PROD_LIST.forEach((item) => {
    const opt = document.createElement('option');
    opt.value = item.id;

    opt.textContent = item.name + ' - ' + item.price + '원';
    if (item.quantity === 0) opt.disabled = true;
    sel.appendChild(opt);
  });
};

const getProductBulkDiscountRate = (productId, quantity) => {
  const PRODUCT_BULK_DISCOUNT_AMOUNT = 10;
  const PRODUCT_BULK_DISCOUNT_RATE = {
    p1: 0.1,
    p2: 0.15,
    p3: 0.2,
    p4: 0.05,
    p5: 0.25,
  };

  if (quantity >= PRODUCT_BULK_DISCOUNT_AMOUNT) return PRODUCT_BULK_DISCOUNT_RATE[productId];
  return 0;
};

const calcCart = () => {
  let totalPrice = 0;
  let discountedTotalPrice = 0;
  itemCnt = 0;

  // 장바구니에 담긴 상품들을 순회하며 총액 계산 + 상품개수에 따른 할인 적용
  const cartItems = cartItemsDisplay.children;
  for (let i = 0; i < cartItems.length; i++) {
    let curItem;
    for (let j = 0; j < PROD_LIST.length; j++) {
      if (PROD_LIST[j].id === cartItems[i].id) {
        curItem = PROD_LIST[j];
        break;
      }
    }

    const quantity = parseInt(cartItems[i].querySelector('span').textContent.split('x ')[1]);
    const productTotalPrice = curItem.price * quantity;
    itemCnt += quantity;
    totalPrice += productTotalPrice;

    const productBulkDiscountRate = getProductBulkDiscountRate(curItem.id, quantity);
    discountedTotalPrice += productTotalPrice * (1 - productBulkDiscountRate);
  }
  const { updatedTotalPrice, discRate } = calcDiscounts(totalPrice, discountedTotalPrice);

  updateSumInfo(updatedTotalPrice, discRate);
  updateStockInfo();
  renderBonusPts(updatedTotalPrice);
};

const calcDiscounts = (totalPrice, discountedTotalPrice) => {
  let updatedTotalPrice = 0;
  let discRate = 0;

  // 총합 개수 bulk 할인
  const TOTAL_BULK_DISCOUNT_AMOUNT = 30;
  if (itemCnt >= TOTAL_BULK_DISCOUNT_AMOUNT) {
    const bulkDiscountedPrice = discountedTotalPrice * 0.25;
    const itemBulkDiscountedPrice = totalPrice - discountedTotalPrice;
    if (bulkDiscountedPrice > itemBulkDiscountedPrice) {
      updatedTotalPrice = totalPrice * (1 - 0.25);
      discRate = 0.25;
    } else {
      updatedTotalPrice = discountedTotalPrice;
      discRate = (totalPrice - discountedTotalPrice) / totalPrice;
    }
  } else {
    updatedTotalPrice = discountedTotalPrice;
    discRate = (totalPrice - discountedTotalPrice) / totalPrice;
  }

  // 화요일 할인
  const SALE_DAY = 2;
  const SALE_DAY_DISCOUNT_RATE = 0.1;
  if (new Date().getDay() === SALE_DAY) {
    updatedTotalPrice *= 1 - SALE_DAY_DISCOUNT_RATE;
    discRate = Math.max(discRate, SALE_DAY_DISCOUNT_RATE);
  }

  return { updatedTotalPrice, discRate };
};
const updateSumInfo = (discountedTotalPrice, discRate) => {
  sum.textContent = '총액: ' + Math.round(discountedTotalPrice) + '원';
  if (discRate > 0) {
    const span = document.createElement('span');
    span.className = 'text-green-500 ml-2';
    span.textContent = '(' + (discRate * 100).toFixed(1) + '% 할인 적용)';
    sum.appendChild(span);
  }
};
const updateStockInfo = () => {
  let infoMsg = '';
  PROD_LIST.forEach((item) => {
    if (item.quantity < 5) {
      infoMsg += item.name + ': ' + (item.quantity > 0 ? '재고 부족 (' + item.quantity + '개 남음)' : '품절') + '\n';
    }
  });
  stockInfo.textContent = infoMsg;
};
const renderBonusPts = (totalPrice) => {
  bonusPts += Math.floor(totalPrice / 1000);
  let ptsTag = document.getElementById('loyalty-points');
  if (!ptsTag) {
    ptsTag = document.createElement('span');
    ptsTag.id = 'loyalty-points';
    ptsTag.className = 'text-blue-500 ml-2';
    sum.appendChild(ptsTag);
  }
  ptsTag.textContent = '(포인트: ' + bonusPts + ')';
};

main();

addBtn.addEventListener('click', () => {
  const selItem = sel.value;
  const itemToAdd = PROD_LIST.find((p) => {
    return p.id === selItem;
  });
  if (itemToAdd && itemToAdd.quantity > 0) {
    const item = document.getElementById(itemToAdd.id);
    if (item) {
      const newQty = parseInt(item.querySelector('span').textContent.split('x ')[1]) + 1;
      if (newQty <= itemToAdd.quantity) {
        item.querySelector('span').textContent = itemToAdd.name + ' - ' + itemToAdd.price + '원 x ' + newQty;
        itemToAdd.quantity--;
      } else {
        alert('재고가 부족합니다.');
      }
    } else {
      const newItem = document.createElement('div');
      newItem.id = itemToAdd.id;
      newItem.className = 'flex justify-between items-center mb-2';
      newItem.innerHTML =
        '<span>' +
        itemToAdd.name +
        ' - ' +
        itemToAdd.price +
        '원 x 1</span><div>' +
        '<button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="' +
        itemToAdd.id +
        '" data-change="-1">-</button>' +
        '<button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="' +
        itemToAdd.id +
        '" data-change="1">+</button>' +
        '<button class="remove-item bg-red-500 text-white px-2 py-1 rounded" data-product-id="' +
        itemToAdd.id +
        '">삭제</button></div>';
      cartItemsDisplay.appendChild(newItem);
      itemToAdd.quantity--;
    }
    calcCart();
    lastSel = selItem;
  }
});
cartItemsDisplay.addEventListener('click', (event) => {
  const tgt = event.target;

  if (tgt.classList.contains('quantity-change') || tgt.classList.contains('remove-item')) {
    const prodId = tgt.dataset.productId;
    const itemElem = document.getElementById(prodId);
    const prod = PROD_LIST.find((p) => {
      return p.id === prodId;
    });
    if (tgt.classList.contains('quantity-change')) {
      const qtyChange = parseInt(tgt.dataset.change);
      const newQty = parseInt(itemElem.querySelector('span').textContent.split('x ')[1]) + qtyChange;
      if (newQty > 0 && newQty <= prod.quantity + parseInt(itemElem.querySelector('span').textContent.split('x ')[1])) {
        itemElem.querySelector('span').textContent =
          itemElem.querySelector('span').textContent.split('x ')[0] + 'x ' + newQty;
        prod.quantity -= qtyChange;
      } else if (newQty <= 0) {
        itemElem.remove();
        prod.quantity -= qtyChange;
      } else {
        alert('재고가 부족합니다.');
      }
    } else if (tgt.classList.contains('remove-item')) {
      const remQty = parseInt(itemElem.querySelector('span').textContent.split('x ')[1]);
      prod.quantity += remQty;
      itemElem.remove();
    }
    calcCart();
  }
});
