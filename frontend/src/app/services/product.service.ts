import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable()
export class ProductService {

  private SERVER_URL = environment.SERVER_URL;
  constructor(private http: HttpClient) { }

  // fetch all products from backend server
  getAllProducts(numberOfResults: number = 10) {
    return this.http.get(this.SERVER_URL + `/products`, {
      params: {
        limit: numberOfResults.toString()
      }
    });
  }
}
