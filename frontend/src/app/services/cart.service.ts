import { ProductModelServer } from './../models/product.model';
import { CartModelPublic, CartModelServer } from './../models/cart.model';
import { environment } from './../../environments/environment';
import { OrderService } from './order.service';
import { ProductService } from 'src/app/services/product.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private SERVER_URL = environment.SERVER_URL;
  // data variable to store the cart info on the client's local storage
  private cartDataClient: CartModelPublic = {
    total: 0,
    prodData: [{
      incart: 0,
      id: 0
    }]
  };

  // data variable to store cart info on the frontend server
  private cartDataServer: CartModelServer = {
    total: 0,
    data: [{
      numInCart: 0,
      product: undefined,
    }]
  };

  // OBSERVABLES FOR THE COMPONENTS TO SUBSCRIBE
  cartTotal$ = new BehaviorSubject<number>(0);
  cartData$ = new BehaviorSubject<CartModelServer>(this.cartDataServer);

  constructor(private http: HttpClient,
    private productService: ProductService,
    private orderService: OrderService,
    private router: Router) {
    this.cartTotal$.next(this.cartDataServer.total);
    this.cartData$.next(this.cartDataServer);

    // get info from local storage (if any)
    const info: CartModelPublic = JSON.parse(localStorage.getItem('cart'));

    // check if info variable is null or not
    if (info !== null && info !== undefined && info.prodData[0].incart !== 0) {
      // local storage is not empty, assign to cartDataClient
      this.cartDataClient = info;

      // loop through each entry and put it in the cartDataServer object
      this.cartDataClient.prodData.forEach(p => {
        this.productService.getSingleProduct(p.id).subscribe((actualProductInfo: ProductModelServer) => {
          if (this.cartDataServer.data[0].numInCart === 0) {
            this.cartDataServer.data[0].numInCart = p.incart;
            this.cartDataServer.data[0].product = actualProductInfo;
            // TODO - create calculate total function and replace it here
            this.cartDataClient.total = this.cartDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          } else {
            // cartDataServer already has some entry
            this.cartDataServer.data.push({
              numInCart: p.incart,
              product: actualProductInfo
            });
            // TODO - create calculate total function and replace it here
            this.cartDataClient.total = this.cartDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          }
          this.cartData$.next({ ...this.cartDataServer });
        });
      });
    }
  }

  // add product to cart
  addCartItem(id: number, qty?: number) {
    this.productService.getSingleProduct(id).subscribe(prod => {

      // 1. if cart is empty
      if (this.cartDataServer.data[0].product === undefined) {
        this.cartDataServer.data[0].product = prod;
        this.cartDataServer.data[0].numInCart = qty !== undefined ? qty : 1;
        // TODO - create calculate total function and replace it here
        this.cartDataClient.prodData[0].incart = this.cartDataServer.data[0].numInCart;
        this.cartDataClient.prodData[0].id = prod.id;
        this.cartDataClient.total = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
        this.cartData$.next({ ...this.cartDataServer });
        // TODO - display toast notification
      }

      // 2. if cart has some items
      else {
        let idx = this.cartDataServer.data.findIndex(p => p.product.id === prod.id); // -1 or +ve value

        // 2.1 if item is in the cart
        if (idx !== -1) {
          if (qty !== undefined && qty <= prod.quantity) {
            this.cartDataServer.data[idx].numInCart = this.cartDataServer.data[idx].numInCart < prod.quantity ? qty : prod.quantity;
          } else {
            this.cartDataServer.data[idx].numInCart = this.cartDataServer.data[idx].numInCart < prod.quantity ? this.cartDataServer.data[idx].numInCart++ : prod.quantity;
          }
          this.cartDataClient.prodData[idx].incart = this.cartDataServer.data[idx].numInCart;
          // TODO - display toast notification
        }
        // 2.2 if item is not in the cart
        else {
          this.cartDataServer.data.push({
            numInCart: 1,
            product: prod
          });
          this.cartDataClient.prodData.push({
            incart: 1,
            id: prod.id
          });
          // TODO - display toast notification
          // TODO - create calculate total function and replace it here
          this.cartDataClient.total = this.cartDataServer.total;
          localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          this.cartData$.next({ ...this.cartDataServer });
        }
      }

    });
  }

  // update cart items
  updateCartItem(index: number, increase: boolean) {
    let data = this.cartDataServer.data[index];
    if (increase) {
      data.numInCart < data.product.quantity ? data.numInCart++ : data.product.quantity;
      this.cartDataClient.prodData[index].incart = data.numInCart;
      // TODO - create calculate total function and replace it here
      this.cartDataClient.total = this.cartDataServer.total;
      localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      this.cartData$.next({ ...this.cartDataServer });
    } else {
      data.numInCart--;
      if (data.numInCart < 1) {
        // TODO - delete the product from cart
        this.cartData$.next({ ...this.cartDataServer });
      } else {
        this.cartData$.next({ ...this.cartDataServer });
        this.cartDataClient.prodData[index].incart = data.numInCart;
        // TODO - create calculate total function and replace it here
        this.cartDataClient.total = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      }
    }
  }

  // delete product from cart
  deleteCartItem(index: number) {
    if (window.confirm('Are ypu sure ypu want to remove the item from cart ?')) {
      this.cartDataServer.data.splice(index, 1);
      this.cartDataClient.prodData.splice(index, 1);
      // TODO - create calculate total function and replace it here
      this.cartDataClient.total = this.cartDataServer.total;

      if (this.cartDataClient.total === 0) {
        this.cartDataClient = {
          total: 0,
          prodData: [{
            incart: 0,
            id: 0
          }]
        };
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      } else {
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      }

      if (this.cartDataServer.total === 0) {
        this.cartDataServer = {
          total: 0,
          data: [{
            numInCart: 0,
            product: undefined,
          }]
        };
        this.cartData$.next({ ...this.cartDataServer });
      } else {
        this.cartData$.next({ ...this.cartDataServer });
      }
    }
    // if user clicks no
    else {
      return;
    }
  }

  private calculateTotal() {
    let total = 0;
    this.cartDataServer.data.forEach(prod => {
      const { numInCart } = prod;
      const { price } = prod.product;
      total += numInCart * price;
    });
    this.cartDataServer.total = total;
    this.cartTotal$.next(this.cartDataServer.total);
  }

  checkoutFromCart(userId: number) {
    this.http.post(`${this.SERVER_URL}/orders/payment`, null).subscribe((res: { success: boolean }) => {
      if (res.success) {
        this.resetServerData();
        this.http.post(`${this.SERVER_URL}/orders/new`, {
          userId: userId,
          products: this.cartDataClient.prodData
        }).subscribe((data: OrderResponse) => {

          this.orderService.getSingleOrder(data.order_id).then(prods => {
            if (data.success) {
              const navigationExtras: NavigationExtras = {
                state: {
                  message: data.message,
                  products: prods,
                  orderId: data.order_id,
                  total: this.cartDataClient.total
                }
              };

              // TODO - Hide spinner

              this.router.navigate(['/thankyou'], navigationExtras).then(p => {
                this.cartDataClient = {
                  total: 0,
                  prodData: [{
                    incart: 0,
                    id: 0
                  }]
                };
                this.cartTotal$.next(0);
                localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
              });
            }
          });
        })
      }
    });
  }

  private resetServerData() {
    this.cartDataServer = {
      total: 0,
      data: [{
        numInCart: 0,
        product: undefined,
      }]
    };
    this.cartData$.next({ ...this.cartDataServer });
  }
}

interface OrderResponse {
  order_id: number,
  success: boolean,
  message: string,
  products: [{
    id: string,
    numInCart: string
  }];
}
