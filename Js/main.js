const shopApi = new API("https://fakestoreapi.com/products", {
    "Content-type": "application/json",
});

const cartApi = new API("https://fakestoreapi.com/carts/1", {
    "Content-type": "application/json",
});

const localCartApi = new API("http://127.0.0.1:5500//Js/cart.json", {
    "Content-Type": "application/json",
});

const localProductsApi = new API("http://127.0.0.1:5500//Js/products.json", {
    "Content-Type": "application/json",
});

localCartApi.get("").then((data) => console.log(data, "!!!!!"));
localProductsApi.get("").then((data) => console.log(data, "!!!!!"));

class Cart {
    constructor(cartElements = []) {
        this.cartElements = cartElements;
        this.view = document.querySelector("#cart-items");

        this.getInitialCart().then(() => this.render(this.view));
        this.render(this.view);
    }

    async getInitialCart() {
        const initialCart = await cartApi.get("/");
        const products = await shopApi.get("/");

        this.cartElements = initialCart.products.map((productData) => {
            const product = products.find(
                (pr) => pr.id === productData.productId
            );

            return new Item(product, productData.quantity);
        });
        return initialCart;
    }

    // async sumPrice() {
    //     const quantity = this.quantity;
    //     const sumPriceProduct = this.itemData.price;

    //     if (quantity > 1) {
    //         sumPriceProduct++;
    //         console.log(sumPriceProduct);
    //     }
    // }

    // async add(item) {
    //     this.cartElements.push(item);

    //     const response = await cartApi.patch("", null, {
    //         userId: 1,
    //         products: this.cartElements.map((item) => ({
    //             products: { productId: item.itemData.id, quantity: 1 },
    //         })),
    //     });

    //     this.render(this.view);

    //     console.log(response, "response");
    //     console.log(this.cartElements);
    // }

    async add(item) {
        const existingCartItem = this.cartElements.find(
            (cartItem) => cartItem.itemData.id === item.itemData.id
        );

        if (existingCartItem) {
            // Если товар уже присутствует в корзине, увеличиваем его количество
            existingCartItem.quantity++;
        } else {
            // Если товар отсутствует в корзине, добавляем его
            this.cartElements.push(item);
        }

        const response = await cartApi.patch("", null, {
            userId: 1,
            products: this.cartElements.map((cartItem) => ({
                productId: cartItem.itemData.id,
                quantity: cartItem.quantity,
            })),
        });

        this.render(this.view);
    }

    // async remove(item) {
    //     this.cartElements = this.cartElements.filter(
    //         (cartItem) => cartItem.itemData.id !== item.itemData.id
    //     );

    //     const response = await cartApi.patch("", null, {
    //         userId: 1,
    //         products: this.cartElements.map((item) => ({
    //             products: { productId: item.id, quantity: 1 },
    //         })),
    //     });

    //     this.render(this.view);

    //     console.log(response, "response");
    // }

    async remove(item) {
        const existingCartItem = this.cartElements.find(
            (cartItem) => cartItem.itemData.id === item.itemData.id
        );

        if (existingCartItem) {
            // Уменьшаем количество товара на 1
            existingCartItem.quantity--;

            // Если количество товара становится равным нулю, удаляем его из корзины
            if (existingCartItem.quantity === 0) {
                this.cartElements = this.cartElements.filter(
                    (cartItem) => cartItem.itemData.id !== item.itemData.id
                );
            }
        }

        const response = await cartApi.patch("", null, {
            userId: 1,
            products: this.cartElements.map((cartItem) => ({
                productId: cartItem.itemData.id,
                quantity: cartItem.quantity,
            })),
        });

        this.render(this.view);
    }

    render(parent) {
        parent.innerHTML = "";
        this.cartElements.forEach((item) => item.render(parent));
    }
}

const cart = new Cart();

class Catalog {
    constructor(items = []) {
        this.items = items;
        this.view = document.querySelector("#catalog-items");

        this.getCatalogItems().then(() => this.render(this.view));
    }

    async getCatalogItems() {
        const items = await shopApi.get("/");
        this.items = items.map((item) => new Item(item));

        return this;
    }

    render(parent) {
        parent.innerHTML = "";
        this.items.forEach((item) => item.render(parent));
    }
}

class Item {
    static initialItemData = {
        id: "",
        title: "",
        category: "",
        description: "",
        image: "",
        rating: { rate: 0, count: 0 },
        price: 0,
    };
    constructor(itemData = Item.initialItemData, quantity = 0) {
        this.itemData = itemData;
        this.quantity = quantity;
    }

    render(parent) {
        const isAddedToCart = cart.cartElements.some(
            (cartElement) => cartElement.itemData.id === this.itemData.id
        );

        const totalPrice = this.itemData.price * this.quantity;

        parent.innerHTML += `
                <div class="item-card">
                    <img src =${this.itemData.image} />
                    <article>
                        <h3>${this.itemData.title}</h3>
                        
                        <p>${this.itemData.description.slice(0, 100)}...</p>
                        <p>${this.itemData.category}</p>
                        <p>Rate: ${this.itemData.rating.rate} / Count ${
            this.itemData.rating.count
        }</p>
                    </article>
                    ${
                        this.quantity
                            ? `<h4>Quantity: ${this.quantity}  </h4>`
                            : ""
                    }
                    ${
                        this.quantity
                            ? `<h4>Total price: ${totalPrice}$</h4>`
                            : `<h4>Price: ${this.itemData.price}$</h4>`
                    }

                    ${
                        isAddedToCart
                            ? `<button 
                        id="btn-cart-${this.itemData.id}"
                        class="add-to-cart-btn" 
                        data-itemId="${this.itemData.id}">Remove from cart
                        </button>`
                            : `<button 
                        id="btn-catalog-${this.itemData.id}"
                        class="add-to-cart-btn" 
                        data-itemId="${this.itemData.id}">Add to cart
                        </button>`
                    }
                </div>
            `;

        setTimeout(() => {
            const cataloButton = document.querySelector(
                `#btn-catalog-${this.itemData.id}`
            );

            const cartButton = document.querySelector(
                `#btn-cart-${this.itemData.id}`
            );

            cataloButton.onclick = () => {
                cart.add(this);
            };

            cartButton.onclick = () => {
                cart.remove(this);
            };
        }, 10);
    }
}

const catalog = new Catalog();
