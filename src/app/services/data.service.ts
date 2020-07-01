import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  value: string;
  constructor() {
    this.value='5'; //Unidad patrón tiene 5 px por defecto
  }

  setValue(value: string){
    this.value=value;
  }

  getValue(){
    return this.value;
  }
}
