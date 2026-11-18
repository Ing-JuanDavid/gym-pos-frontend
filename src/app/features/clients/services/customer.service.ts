import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map, Observable } from 'rxjs';

import { CustomerDto, CustomerUpdate, CreateCustomerRequest } from '../models/customer.dto';
import { Customer } from '../models/customer.model';
import { CustomerMapper } from '../mappers/customer.mappper';
@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8000/customers';

  getByNuip(
    nuip: number
  ): Observable<Customer> {

    return this.http
      .get<CustomerDto>(
        `${this.apiUrl}/${nuip}`
      )
      .pipe(
        map(CustomerMapper.toModel)
      );
  }

  getAll(): Observable<Customer[]> {

    return this.http
      .get<CustomerDto[]>(this.apiUrl)
      .pipe(
        map(customers =>
          customers.map(CustomerMapper.toModel)
        )
      );
  }

  create(
    payload: CreateCustomerRequest
  ): Observable<Customer> {

    return this.http
      .post<CustomerDto>(
        this.apiUrl,
        payload
      )
      .pipe(
        map(CustomerMapper.toModel)
      );
  }


  update(
    nuip: number,
    customer: CustomerUpdate
  ): Observable<Customer> {

    console.log("data:", customer)

    return this.http.patch<CustomerDto>(
      `${this.apiUrl}/${nuip}`,
      customer
    ).pipe(
      map(response => CustomerMapper.toModel(response))
    );
  }

  delete(
    nuip: number
  ): Observable<{ messaje: string }> {

    return this.http.delete<{ messaje: string }>(
      `${this.apiUrl}/${nuip}`
    );
  }

}