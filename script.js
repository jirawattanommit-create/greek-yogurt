// =====================================================
// 🟢 ใส่ค่านักพัฒนาจาก LINE Developers ที่นี่
// =====================================================
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx7GU2CGbZx6tMeAi8RHz1NkEb7VEbHTJY2dybkcDIZS8MUouxbr9endAa0bh7H2o5G/exec";
const LINE_USER_ID = "U0e1d477c5ad81b49d34cbe5bafb9bbbc";
const LINE_ACCESS_TOKEN = "44LpdXwdRP88grIfBDgM6Z1Q4/7ujL5OtA2DDZNBOTkP6ihYFKjASE6pr1kQOEIXZaMzZLE57MqRROkSfK/uJJuoicxhsvddo6RKksHrXuyPPO5yxDqMxvlNuo+iZDsE5jWtBoH8HnxGVsPhDg0HbwdB04t89/1O/w1cDnyilFU="; 

// =====================================================
// CART
// =====================================================
let cart = [];

// =====================================================
// CURRENT PRODUCT
// =====================================================
let currentProduct = {
    name: "",
    price: 0,
    quantity: 1
};

// =====================================================
// CUSTOMER DATA
// =====================================================
let customerData = {
    name: "",
    phone: "",
    place: "",
    room: "",
    detail: ""
};

// =====================================================
// OPEN PRODUCT
// =====================================================
function openProduct(name, price) {
    currentProduct.name = name;
    currentProduct.price = price;
    currentProduct.quantity = 1;

    document.getElementById("modal-product-name").textContent = name;
    document.getElementById("modal-product-price").textContent = price;
    document.getElementById("product-quantity").textContent = 1;

    // ล้าง Topping
    const toppings = document.querySelectorAll(".topping-item input");
    toppings.forEach(function (checkbox) {
        checkbox.checked = false;
    });

    updateProductPrice();
    document.getElementById("product-modal").classList.add("show");
}

// =====================================================
// CLOSE PRODUCT
// =====================================================
function closeProduct() {
    document.getElementById("product-modal").classList.remove("show");
}

// =====================================================
// CHANGE PRODUCT QUANTITY
// =====================================================
function changeProductQuantity(change) {
    currentProduct.quantity += change;

    if (currentProduct.quantity < 1) {
        currentProduct.quantity = 1;
    }

    document.getElementById("product-quantity").textContent = currentProduct.quantity;
    updateProductPrice();
}

// =====================================================
// GET TOPPINGS
// =====================================================
function getSelectedToppings() {
    const selected = [];
    const checkboxes = document.querySelectorAll(".topping-item input:checked");

    checkboxes.forEach(function (checkbox) {
        selected.push({
            name: checkbox.dataset.name,
            price: Number(checkbox.value)
        });
    });

    return selected;
}

// =====================================================
// CALCULATE PRODUCT PRICE
// =====================================================
function calculateProductPrice() {
    let price = currentProduct.price;
    const toppings = getSelectedToppings();

    toppings.forEach(function (topping) {
        price += topping.price;
    });

    return price * currentProduct.quantity;
}

// =====================================================
// UPDATE PRODUCT PRICE
// =====================================================
function updateProductPrice() {
    const total = calculateProductPrice();
    document.getElementById("product-total-price").textContent = total;
}

// =====================================================
// ADD PRODUCT TO CART (ปรับปรุงการรวมรายการซ้ำ)
// =====================================================
function addProductToCart() {
    const toppings = getSelectedToppings();

    const toppingPrice = toppings.reduce(function (sum, topping) {
        return sum + topping.price;
    }, 0);

    const itemPrice = currentProduct.price + toppingPrice;

    // สร้าง String ของ Topping เพื่อใช้เปรียบเทียบความซ้ำ
    const toppingKey = toppings.map(t => t.name).sort().join(",");

    // ตรวจสอบว่ามีสินค้าชนิดเดียวกัน และ Topping เดียวกันอยู่ในตะกร้าแล้วหรือยัง
    const existingItem = cart.find(item => {
        const itemToppingKey = item.toppings.map(t => t.name).sort().join(",");
        return item.name === currentProduct.name && itemToppingKey === toppingKey;
    });

    if (existingItem) {
        // หากมีรายการเดียวกันแล้ว ให้บวกจำนวนเพิ่ม
        existingItem.quantity += currentProduct.quantity;
    } else {
        // หากยังไม่มี ให้สร้างรายการใหม่
        const item = {
            id: Date.now(),
            name: currentProduct.name,
            basePrice: currentProduct.price,
            toppings: toppings,
            quantity: currentProduct.quantity,
            price: itemPrice
        };
        cart.push(item);
    }

    // อัปเดตข้อมูลตะกร้าและราคารวม
    updateCart();
    const cartBarTotal = document.getElementById("cart-bar-total");
    if (cartBarTotal) {
        cartBarTotal.textContent = getCartTotal() + " ฿";
    }

    // ปิด Modal สินค้าลงแบบนุ่มนวล
    closeProduct();

    // 🟢 เอฟเฟกต์แถบ Cart Bar ด้านล่างเด้งรับสินค้าทันที
    const cartBar = document.querySelector(".cart-bar");
    if (cartBar) {
        cartBar.classList.remove("cart-bounce");
        void cartBar.offsetWidth; // รีเซ็ต Animation ของเบราว์เซอร์
        cartBar.classList.add("cart-bounce");
    }
}

// =====================================================
// UPDATE CART
// =====================================================
function updateCart() {
    let totalItems = 0;

    cart.forEach(function (item) {
        totalItems += item.quantity;
    });

    document.getElementById("cart-count").textContent = totalItems;

    const modal = document.getElementById("cart-modal");
    if (modal && modal.classList.contains("show")) {
        renderCart();
    }

    const cartBarTotal = document.getElementById("cart-bar-total");
    if (cartBarTotal) {
        cartBarTotal.textContent = getCartTotal() + " ฿";
    }

    animateCartBadge();
}

// =====================================================
// OPEN CART
// =====================================================
function openCart() {
    renderCart();
    document.getElementById("cart-modal").classList.add("show");
}

// =====================================================
// CLOSE CART
// =====================================================
function closeCart() {
    document.getElementById("cart-modal").classList.remove("show");
}

// =====================================================
// RENDER CART
// =====================================================
function renderCart() {
    const cartItems = document.getElementById("cart-items");
    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                🛒
                <br><br>
                ยังไม่มีสินค้าในตะกร้า
            </div>
        `;
        document.getElementById("cart-total").textContent = "0 บาท";
        return;
    }

    let total = 0;

    cart.forEach(function (item) {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        let toppingText = "ไม่มี Topping";
        if (item.toppings && item.toppings.length > 0) {
            toppingText = item.toppings
                .map(function (topping) {
                    return topping.name + " +" + topping.price + " บาท";
                })
                .join(", ");
        }

        cartItems.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-toppings">${toppingText}</div>
                    <div class="cart-item-price">${itemTotal} บาท</div>
                </div>
                <div class="quantity-control">
                    <button onclick="decreaseCartItem(${item.id})">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="increaseCartItem(${item.id})">+</button>
                </div>
            </div>
        `;
    });

    document.getElementById("cart-total").textContent = total + " บาท";
}

// =====================================================
// INCREASE CART
// =====================================================
function increaseCartItem(id) {
    const item = cart.find(function (item) {
        return item.id === id;
    });

    if (item) {
        item.quantity++;
    }

    updateCart();
}

// =====================================================
// DECREASE CART
// =====================================================
function decreaseCartItem(id) {
    const item = cart.find(function (item) {
        return item.id === id;
    });

    if (!item) return;

    item.quantity--;

    if (item.quantity <= 0) {
        cart = cart.filter(function (item) {
            return item.id !== id;
        });
    }

    updateCart();
}

// =====================================================
// OPEN CUSTOMER FORM
// =====================================================
function openCustomerForm() {
    if (cart.length === 0) {
        alert("กรุณาเลือกสินค้าก่อนสั่งซื้อ");
        return;
    }

    closeCart();
    document.getElementById("customer-modal").classList.add("show");
}

// =====================================================
// CLOSE CUSTOMER FORM
// =====================================================
function closeCustomerForm() {
    document.getElementById("customer-modal").classList.remove("show");
}

// =====================================================
// GET CART TOTAL
// =====================================================
function getCartTotal() {
    let total = 0;
    cart.forEach(function (item) {
        total += item.price * item.quantity;
    });
    return total;
}

// =====================================================
// GO TO PAYMENT
// =====================================================
function goToPayment() {
    const name = document.getElementById("customer-name").value.trim();
    const phone = document.getElementById("customer-phone").value.trim();
    const place = document.getElementById("customer-place").value.trim();
    const room = document.getElementById("customer-room").value.trim();
    const detail = document.getElementById("customer-detail").value.trim();

    if (!name) {
        alert("กรุณากรอกชื่อผู้สั่งซื้อ");
        return;
    }

    if (!phone) {
        alert("กรุณากรอกเบอร์โทรศัพท์");
        return;
    }

    const phoneRegex = /^[0-9]{9,10}$/;
    if (!phoneRegex.test(phone)) {
        alert("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง");
        return;
    }

    if (!place) {
        alert("กรุณากรอกชื่อหอพัก / บ้านพัก");
        return;
    }

    if (!room) {
        alert("กรุณากรอกเลขห้อง / บ้านเลขที่");
        return;
    }

    customerData = {
        name: name,
        phone: phone,
        place: place,
        room: room,
        detail: detail
    };

    document.getElementById("summary-name").textContent = name;
    document.getElementById("summary-phone").textContent = phone;
    document.getElementById("summary-place").textContent = place;
    document.getElementById("summary-room").textContent = room;
    document.getElementById("summary-detail").textContent = detail || "-";
    document.getElementById("payment-total").textContent = getCartTotal() + " บาท";

    closeCustomerForm();
    document.getElementById("payment-modal").classList.add("show");
}

// =====================================================
// CLOSE PAYMENT
// =====================================================
function closePayment() {
    document.getElementById("payment-modal").classList.remove("show");
}

// =====================================================
// SEND ORDER TO GOOGLE APPS SCRIPT
// =====================================================
function sendOrderToGoogleSheet(orderNumber) {
    let itemsText = "";

    cart.forEach(function (item, index) {
        let toppingNames =
            item.toppings && item.toppings.length > 0
                ? item.toppings.map(t => t.name).join(", ")
                : "ไม่มี Topping";

        itemsText += `${index + 1}. ${item.name} x${item.quantity}`;
        itemsText += ` | Topping: ${toppingNames}`;
        itemsText += ` | ราคา: ${item.price * item.quantity} บาท\n`;
    });

    let address = `${customerData.place} ห้อง/บ้านเลขที่ ${customerData.room}`;

    const payload = {
        orderId: orderNumber,
        customerName: customerData.name,
        phone: customerData.phone,
        address: address,
        items: itemsText,
        totalPrice: getCartTotal()
    };

    console.log("กำลังส่งออเดอร์:", payload);

    fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
    })
    .then(() => {
        console.log("บันทึกออเดอร์ลง Google Sheets แล้ว");
    })
    .catch(error => {
        console.error("ไม่สามารถส่งออเดอร์:", error);
    });
}

// =====================================================
// 🟢 LINE NOTIFICATION FUNCTION (เพิ่มระบบแจ้งเตือนเข้า Line OA)
// =====================================================
function sendLineNotification(orderNumber, itemsText) {
    const address = `${customerData.place} ห้อง ${customerData.room}` + (customerData.detail ? ` (หมายเหตุ: ${customerData.detail})` : '');
    
    const message = `🔔 มีออเดอร์ใหม่เข้ามา!\n\n` +
                    `📋 เลขออเดอร์: #${orderNumber}\n` +
                    `👤 ชื่อ: ${customerData.name}\n` +
                    `📞 เบอร์: ${customerData.phone}\n` +
                    `📍 ที่อยู่: ${address}\n\n` +
                    `🛒 รายการสินค้า:\n${itemsText}\n` +
                    `💰 ยอดรวมทั้งสิ้น: ${getCartTotal()} บาท`;

    fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + LINE_ACCESS_TOKEN
        },
        body: JSON.stringify({
            to: LINE_USER_ID,
            messages: [{ type: 'text', text: message }]
        })
    })
    .then(response => {
        if (!response.ok) {
            console.error('Line API Error status:', response.status);
        } else {
            console.log('ส่งแจ้งเตือนเข้า Line สำเร็จ');
        }
    })
    .catch(error => console.error('Line Notification Error:', error));
}

// =====================================================
// PAYMENT SUCCESS
// =====================================================
function paymentSuccess() {
    // สร้างเลขออเดอร์
    const orderNumber = createOrderNumber();

    // แสดงเลขออเดอร์
    document.getElementById("order-number").textContent = orderNumber;

    // รวบรวมรายการสินค้าสำหรับส่งเข้า Line
    let itemsText = "";
    cart.forEach(function (item, index) {
        let toppingNames = item.toppings && item.toppings.length > 0
            ? item.toppings.map(t => t.name).join(", ")
            : "ไม่มี Topping";
        itemsText += `${index + 1}. ${item.name} x${item.quantity} (${toppingNames}) - ${item.price * item.quantity} บาท\n`;
    });

    // บันทึกออเดอร์ลง Google Sheets
    sendOrderToGoogleSheet(orderNumber);

    // 🟢 ส่งแจ้งเตือนเข้า Line OA ทันที
    sendLineNotification(orderNumber, itemsText);

    // ปิดหน้าชำระเงิน
    closePayment();

    // แสดงหน้าสั่งซื้อสำเร็จ
    document.getElementById("success-modal").classList.add("show");
}

// =====================================================
// CREATE ORDER NUMBER
// =====================================================
function createOrderNumber() {
    const now = new Date();
    const random = Math.floor(Math.random() * 900) + 100;

    return (
        "GY" +
        now.getHours().toString().padStart(2, "0") +
        now.getMinutes().toString().padStart(2, "0") +
        random
    );
}

// =====================================================
// FINISH ORDER
// =====================================================
function finishOrder() {
    cart = [];
    updateCart();

    customerData = {
        name: "",
        phone: "",
        place: "",
        room: "",
        detail: ""
    };

    document.getElementById("customer-name").value = "";
    document.getElementById("customer-phone").value = "";
    document.getElementById("customer-place").value = "";
    document.getElementById("customer-room").value = "";
    document.getElementById("customer-detail").value = "";

    document.getElementById("success-modal").classList.remove("show");
}

// =====================================================
// ANIMATE CART BADGE
// =====================================================
function animateCartBadge() {
    const badge = document.getElementById("cart-count");
    if (badge) {
        badge.classList.remove("badge-bounce");
        void badge.offsetWidth; // รีเซ็ต Animation ของเบราว์เซอร์
        badge.classList.add("badge-bounce");
    }
}

// =====================================================
// 🟢 CATEGORY NAV CLICK HANDLER (เพิ่มระบบสลับหมวดหมู่)
// =====================================================
document.addEventListener("DOMContentLoaded", function () {
    const categoryButtons = document.querySelectorAll(".category-btn");
    categoryButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            categoryButtons.forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");
        });
    });
});
