import {Component, Inject, OnInit} from '@angular/core';
import {DialogData} from '../shared/dialog-data';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DataService} from '../services/data.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {
  value: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData,
              private dialogRef: MatDialogRef<DialogComponent>,
              private dataService: DataService) {

        this.value='5'; //5 px de valor por defecto de la unidad patrón
  }

  close() {
    this.dialogRef.close(true);
    this.dataService.setValue(this.value);
  }

  ngOnInit() {
  }

}
