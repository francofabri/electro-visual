import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit {
  //closeResult: string;
  value: string;
  @Output() private textoEmitido = new EventEmitter<string>();

  constructor(private modalService: NgbModal) {}

  ngOnInit() {}

  open(content:any) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.textoEmitido.emit(this.value);
    });
  }

}
