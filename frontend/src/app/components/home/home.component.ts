import { CartService } from './../../services/cart.service';
import { ProductModelServer, ServerResponse } from './../../models/product.model';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  products: ProductModelServer[] = [];

  constructor(private productService: ProductService, private router: Router, private cartService: CartService) {
  }

  ngOnInit(): void {
    this.productService.getAllProducts().subscribe((prods: ServerResponse) => {
      this.products = prods.products;
    });
  }

  selectProduct(id: Number) {
    this.router.navigate([`/product`, id])
      .then();
  }

  AddToCart(id: number) {
    this.cartService.AddProductToCart(id);
  }
}
