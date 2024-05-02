const shopApi = new API("https://fakestoreapi.com/products", {
    "Content-type": "application/json",
});

const cartApi = new API("https://fakestoreapi.com/carts/1", {
    "Content-type": "application/json",
});

class Cart {
    constructor(cartElements = []) {
        this.cartElements = cartElements;
        this.view = document.querySelector("#cart-items");

        this.render(this.view);
    }

    async add(item) {
        this.cartElements.push(item);

        const response = await cartApi.patch("", null, {
            userId: 1,
            products: this.cartElements.map((item) => ({
                products: { productId: item.itemData.id, quantity: 1 },
            })),
        });

        this.render(this.view);

        console.log(response, "response");
        console.log(this.cartElements);
    }

    async remove(item) {
        this.cartElements = this.cartElements.filter(
            (cartItem) => cartItem.itemData.id !== item.itemData.id
        );

        const response = await cartApi.patch("", null, {
            userId: 1,
            products: this.cartElements.map((item) => ({
                products: { productId: item.id, quantity: 1 },
            })),
        });

        this.render(this.view);

        console.log(response, "response");
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
        console.log(items);

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

        parent.innerHTML += `
                <div class="item-card">
                    <img src =${this.itemData.image} />
                    <article>
                        <h3>${this.itemData.title}</h3>
                        <span>${this.itemData.price}$</span>
                        <p>${this.itemData.description.slice(0, 100)}...</p>
                        <p>${this.itemData.category}</p>
                        <p>Rate: ${this.itemData.rating.rate} / Count ${
            this.itemData.rating.count
        }</p>
                    </article>
                    <button 
                    id="btn-${this.itemData.id}"
                    class="add-to-cart-btn" 
                    data-itemId="${this.itemData.id}">Remove from cart
                    </button>
                </div>
            `;

        setTimeout(() => {
            const addToCartButton = document.querySelector(
                `#btn-${this.itemData.id}`
            );

            addToCartButton.onclick = () => {
                const isAddedToCart = cart.cartElements.find(
                    (cartItem) => cartItem.id === this.itemData.id
                );

                isAddedToCart ? cart.remove(this) : cart.add(this);
            };

        }, 10);
    }
}

const catalog = new Catalog();
