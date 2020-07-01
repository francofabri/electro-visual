import { Component, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { Reference } from '../modules/reference';
import { Chart } from '../modules/chart';
import { Signal } from '../modules/signal';
import {RhythmChannelComponent } from '../rhythm-channel/rhythm-channel.component';
import {DialogService} from '../services/dialog.service';
import {DataService} from '../services/data.service';
import {DialogData} from '../shared/dialog-data';

@Component({
  selector: 'app-graphic',
  templateUrl: './graphic.component.html',
  styleUrls: ['./graphic.component.css']
})
export class GraphicComponent implements OnInit {
  private value: string;
  //private aux: any;

  private width: number;
  private height: number;
  private chart_width: number;
  private chart_heigth: number;
  private panel_controls_width: number;
  private panel_controls_height: number;
  private signal: Signal;
  private derivations: string;
  private timeScale: string;
  private amplitudeScale: string;
  private reference1: Reference;
  private reference2: Reference;
  private reference3: Reference;
  private reference4: Reference;
  private chart1: Chart;
  private chart2: Chart;
  private chart3: Chart;
  private chart4: Chart;
  private bandera: boolean;
  private reference_unit: number; //Unidad de referecia para la graficación de la grilla y las derivaciones sobre la misma.
  private time_position: number;
  @ViewChild('graphicData', { static: false }) graphicData: RhythmChannelComponent; //Acceder a las propiedades y métodos del componente rhythm-channel

  constructor(private dataService: DataService, private dialogService: DialogService) {
    var screen_width=screen.availWidth;
    var screen_height=screen.availHeight;
    this.width=0.9*screen_width;
    this.height=0.8*screen_height;
    this.chart_width=0.847*this.width;
    this.chart_heigth=this.height;
    this.panel_controls_width= 0.15*this.width;
    this.panel_controls_height= this.height;
    this.derivations='6x2';
    this.timeScale='25 mm/S';
    this.amplitudeScale='10 mm/mV'
    this.bandera=false;
    this.signal= new Signal();
    this.reference_unit=5; //Tomamos 5 px como unidad de medida inicial
    this.time_position=0; //Al comiezo se grafica desde la posición correspondiente a los 0 segundos
    this.value= dataService.getValue();
    //this.aux= dataService
    console.log('Esto viene desde el servicio: ' + this.value);
  }

  ngOnInit() {
    this.loadFile();
    this.initSvg();
    this.drawGraph();
  }

  private loadFile(){
    //Read the file and store it in a string variable
    var signal_aux=this.signal;
    function readFile(event){
      let file= event.target.files[0];
      let reader= new FileReader();
      reader.onload= (e) =>{
        let text=reader.result;
        text= text.toString();
        //tabulations between numbers are remplaced by commas
        let data= text.replace(/[\t]+/g,',');
        signal_aux.set_derivations(data);

      }
      reader.readAsText(file);
      this.bandera=true;
    }

    document.getElementById('file-input').addEventListener('change',readFile,false);
  }

  private initSvg(){
    //console.log('Alto container');
    //console.log(this.height);
    d3.select('#container')
      .style('margin','0 auto')
      .style('width', this.width + 'px')
      .style('height', 1.127*this.height + 'px');
    d3.select('#container2')
      .style('float','left')
      .style('width', this.chart_width + 'px')
      .style('height', this.chart_heigth + 'px');
    d3.select('#container3')
      .style('float','left')
      .style('width', this.panel_controls_width + 'px')
      .style('height', this.panel_controls_height + 'px');
    d3.selectAll('select')
      .style('width', this.panel_controls_width + 'px');

  }

  scaleChanged(selectedValue: string){
    //console.log(selectedValue);
    switch(selectedValue){
      case '1/4':
          this.amplitudeScale="2.5 mm/mV";
          this.timeScale="6.25 mm/S";
          this.graphicData.timeScale=this.timeScale;
          this.graphicData.timeChanged();
        break;
      case '1/2':
          this.amplitudeScale="5 mm/mV";
          this.timeScale="12.5 mm/S";
          this.graphicData.timeScale=this.timeScale;
          this.graphicData.timeChanged();
        break;
      case '1':
          this.amplitudeScale="10 mm/mV";
          this.timeScale="25 mm/S";
          this.graphicData.timeScale=this.timeScale;
          this.graphicData.timeChanged();
        break;
      case '2':
          this.amplitudeScale="20 mm/mV";
          this.timeScale="50 mm/S";
          this.graphicData.timeScale=this.timeScale;
          this.graphicData.timeChanged();
        break;
      case '4':
          this.amplitudeScale="40 mm/mV";
          this.timeScale="100 mm/S";
          this.graphicData.timeScale=this.timeScale;
          this.graphicData.timeChanged();
        break;
    }
    this.drawGraph();
  }

  derivationChanged(selectedValue: string){
    this.derivations=selectedValue;
    this.bandera=true;
    this.drawGraph();
    //Pasaje de la información de la señal al componente rhythm-channel
    this.graphicData.signal=this.signal;
    this.graphicData.signalChanged();
    this.graphicData.derivation=this.derivations;
    this.graphicData.derivationChanged();
  }

  timeChanged(selectedValue: string){
    this.timeScale=selectedValue;
    this.bandera=true;
    this.drawGraph();
    //Pasaje de la información de la señal al componente rhythm-channel
    this.graphicData.timeScale=this.timeScale;
    this.graphicData.timeChanged();
  }

  amplitudeChanged(selectedValue: string){
    this.amplitudeScale=selectedValue;
    //console.log(this.amplitudeScale);
    this.drawGraph();
  }

  actualizar(datoDelPopup: number) {
    let medida: number= Number(datoDelPopup);
   this.reference_unit= 200/(10*medida);
   //console.log(this.reference_unit);
   this.drawGraph();
   //Pasaje de la unidad de referecia para graficar al componente rhythm-channel
   this.graphicData.reference_unit=this.reference_unit;
   this.graphicData.referenceUnitChanged();
  }

  positionChanged(time_position: number){
    this.time_position= time_position;
    this.drawGraph();
  }

  openDialog() {

    const dialogData: DialogData = {
      title: 'Ajustar tamaño grilla',
      message: 'Medir con una regla la longitud (en cm) de la línea azul',
      showOKBtn: true,
      showCancelBtn: true
    };

    const dialogRef = this.dialogService.openDialog(
      dialogData, {disableClose: true});

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('User clicked OK');
        this.value= this.dataService.getValue();
        let num= Number(this.value);
        this.actualizar(num);
        //console.log('Desde openDialog(): ' + num);
      } else {
        console.log('User clicked Cancel');
      }
    });
  }

  private drawGraph(){
    let array_derivations: string[];

    switch(this.derivations){
      case 'Principales':
          array_derivations=['DI','DII','DIII'];
          this.plotGridRef('Principales',array_derivations);
          if(this.bandera){
            d3.selectAll('.ecgsig').remove(); //Limpiar los path dibujados sobre la/s grilla/s
            d3.selectAll('.heartbeats').remove(); //Limpiar los latidos dibujados sobre la/s grilla/s
            this.chart1.drawPath(this.signal,array_derivations,this.chart_heigth,this.amplitudeScale,this.timeScale,this.time_position);
            this.chart1.drawHeartBeats(this.signal,this.timeScale,true,this.time_position);
          }
        break;
      case 'Aumentadas':
          array_derivations=['aVr','aVl','aVf'];
          this.plotGridRef('Aumentadas',array_derivations);
          if(this.bandera){
            d3.selectAll('.ecgsig').remove(); //Limpiar los path dibujados sobre la/s grilla/s
            d3.selectAll('.heartbeats').remove(); //Limpiar los latidos dibujados sobre la/s grilla/s
            this.chart1.drawPath(this.signal,array_derivations,this.chart_heigth,this.amplitudeScale,this.timeScale,this.time_position);
            this.chart1.drawHeartBeats(this.signal,this.timeScale,true,this.time_position);
          }
        break;
      case 'V1, V2 y V3':
          array_derivations=['V1','V2','V3'];
          this.plotGridRef('V1, V2 y V3',array_derivations);
          if(this.bandera){
            d3.selectAll('.ecgsig').remove(); //Limpiar los path dibujados sobre la/s grilla/s
            d3.selectAll('.heartbeats').remove(); //Limpiar los latidos dibujados sobre la/s grilla/s
            this.chart1.drawPath(this.signal,array_derivations,this.chart_heigth,this.amplitudeScale,this.timeScale,this.time_position);
            this.chart1.drawHeartBeats(this.signal,this.timeScale,true,this.time_position);
          }
        break;
      case 'V4, V5 y V6':
          array_derivations=['V4','V5','V6'];
          this.plotGridRef('V4, V5 y V6',array_derivations);
          if(this.bandera){
            d3.selectAll('.ecgsig').remove(); //Limpiar los path dibujados sobre la/s grilla/s
            d3.selectAll('.heartbeats').remove(); //Limpiar los latidos dibujados sobre la/s grilla/s
            this.chart1.drawPath(this.signal,array_derivations,this.chart_heigth,this.amplitudeScale,this.timeScale,this.time_position);
            this.chart1.drawHeartBeats(this.signal,this.timeScale,true,this.time_position);
          }
        break;
      case 'Miembros':
          array_derivations=['DI','DII','DIII','aVr','aVl','aVf'];
          this.plotGridRef('Miembros',array_derivations);
          if(this.bandera){
            d3.selectAll('.ecgsig').remove(); //Limpiar los path dibujados sobre la/s grilla/s
            d3.selectAll('.heartbeats').remove(); //Limpiar los latidos dibujados sobre la/s grilla/s
            this.chart1.drawPath(this.signal,array_derivations,this.chart_heigth,this.amplitudeScale,this.timeScale,this.time_position);
            this.chart1.drawHeartBeats(this.signal,this.timeScale,true,this.time_position);
          }
        break;
      case 'Precordiales':
          array_derivations=['V1','V2','V3','V4','V5','V6'];
          this.plotGridRef('Precordiales',array_derivations);
          if(this.bandera){
            d3.selectAll('.ecgsig').remove(); //Limpiar los path dibujados sobre la/s grilla/s
            d3.selectAll('.heartbeats').remove(); //Limpiar los latidos dibujados sobre la/s grilla/s
            this.chart1.drawPath(this.signal,array_derivations,this.chart_heigth,this.amplitudeScale,this.timeScale,this.time_position);
            this.chart1.drawHeartBeats(this.signal,this.timeScale,true,this.time_position);
          }
        break;
      case 'DII, V2 y V5':
          array_derivations=['DII','V2','V5'];
          this.plotGridRef('DII, V2 y V5',array_derivations);
          if(this.bandera){
            d3.selectAll('.ecgsig').remove(); //Limpiar los path dibujados sobre la/s grilla/s
            d3.selectAll('.heartbeats').remove(); //Limpiar los latidos dibujados sobre la/s grilla/s
            this.chart1.drawPath(this.signal,array_derivations,this.chart_heigth,this.amplitudeScale,this.timeScale,this.time_position);
            this.chart1.drawHeartBeats(this.signal,this.timeScale,true,this.time_position);
          }
        break;
      case '12x1':
          array_derivations=['DI','DII','DIII','aVr','aVl','aVf','V1','V2','V3','V4','V5','V6'];
          this.plotGridRef('12x1',array_derivations);
          if(this.bandera){
            d3.selectAll('.ecgsig').remove(); //Limpiar los path dibujados sobre la/s grilla/s
            d3.selectAll('.heartbeats').remove(); //Limpiar los latidos dibujados sobre la/s grilla/s
            this.chart1.drawPath(this.signal,array_derivations,this.chart_heigth,this.amplitudeScale,this.timeScale,this.time_position);
            this.chart1.drawHeartBeats(this.signal,this.timeScale,true,this.time_position);
          }
        break;
      case '6x2':
          this.plotGridRef('6x2',null);
          if(this.bandera){
            d3.selectAll('.ecgsig').remove(); //Limpiar los path dibujados sobre la/s grilla/s
            d3.selectAll('.heartbeats').remove(); //Limpiar los latidos dibujados sobre la/s grilla/s
            this.chart1.drawPath(this.signal,['DI','DII','DIII','aVr','aVl','aVf'],this.chart_heigth,this.amplitudeScale,this.timeScale,this.time_position);
            this.chart2.drawPath(this.signal,['V1','V2','V3','V4','V5','V6'],this.chart_heigth,this.amplitudeScale,this.timeScale,this.time_position);
            this.chart1.drawHeartBeats(this.signal,this.timeScale,true,this.time_position);
            this.chart2.drawHeartBeats(this.signal,this.timeScale,true,this.time_position);
          }
        break;
      case '3x4':
          this.plotGridRef('3x4',null);
          if(this.bandera){
            d3.selectAll('.ecgsig').remove(); //Limpiar los path dibujados sobre la/s grilla/s
            d3.selectAll('.heartbeats').remove(); //Limpiar los latidos dibujados sobre la/s grilla/s
            this.chart1.drawPath(this.signal,['DI','DII','DIII'],this.chart_heigth,this.amplitudeScale,this.timeScale,this.time_position);
            this.chart2.drawPath(this.signal,['aVr','aVl','aVf'],this.chart_heigth,this.amplitudeScale,this.timeScale,this.time_position);
            this.chart3.drawPath(this.signal,['V1','V2','V3'],this.chart_heigth,this.amplitudeScale,this.timeScale,this.time_position);
            this.chart4.drawPath(this.signal,['V4','V5','V6'],this.chart_heigth,this.amplitudeScale,this.timeScale,this.time_position);
            this.chart1.drawHeartBeats(this.signal,this.timeScale,true,this.time_position);
            this.chart2.drawHeartBeats(this.signal,this.timeScale,true,this.time_position);
            this.chart3.drawHeartBeats(this.signal,this.timeScale,true,this.time_position);
            this.chart4.drawHeartBeats(this.signal,this.timeScale,true,this.time_position);
          }
        break;
      case 'DI':
          array_derivations=['DI'];
          this.plotGridRef('DI',array_derivations);
          if(this.bandera){
            d3.selectAll('.ecgsig').remove(); //Limpiar los path dibujados sobre la/s grilla/s
            d3.selectAll('.heartbeats').remove(); //Limpiar los latidos dibujados sobre la/s grilla/s
            this.chart1.drawPath(this.signal,array_derivations,this.chart_heigth,this.amplitudeScale,this.timeScale,this.time_position);
            this.chart1.drawHeartBeats(this.signal,this.timeScale,true,this.time_position);
          }
        break;
      case 'DII':
          array_derivations=['DII'];
          this.plotGridRef('DII',array_derivations);
          if(this.bandera){
            d3.selectAll('.ecgsig').remove(); //Limpiar los path dibujados sobre la/s grilla/s
            d3.selectAll('.heartbeats').remove(); //Limpiar los latidos dibujados sobre la/s grilla/s
            this.chart1.drawPath(this.signal,array_derivations,this.chart_heigth,this.amplitudeScale,this.timeScale,this.time_position);
            this.chart1.drawHeartBeats(this.signal,this.timeScale,true,this.time_position);
          }
        break;
      case 'DIII':
          array_derivations=['DIII'];
          this.plotGridRef('DIII',array_derivations);
          if(this.bandera){
            d3.selectAll('.ecgsig').remove(); //Limpiar los path dibujados sobre la/s grilla/s
            d3.selectAll('.heartbeats').remove(); //Limpiar los latidos dibujados sobre la/s grilla/s
            this.chart1.drawPath(this.signal,array_derivations,this.chart_heigth,this.amplitudeScale,this.timeScale,this.time_position);
            this.chart1.drawHeartBeats(this.signal,this.timeScale,true,this.time_position);
          }
        break;
      case 'aVr':
          array_derivations=['aVr'];
          this.plotGridRef('aVr',array_derivations);
          if(this.bandera){
            d3.selectAll('.ecgsig').remove(); //Limpiar los path dibujados sobre la/s grilla/s
            d3.selectAll('.heartbeats').remove(); //Limpiar los latidos dibujados sobre la/s grilla/s
            this.chart1.drawPath(this.signal,array_derivations,this.chart_heigth,this.amplitudeScale,this.timeScale,this.time_position);
            this.chart1.drawHeartBeats(this.signal,this.timeScale,true,this.time_position);
          }
        break;
      case 'aVl':
          array_derivations=['aVl'];
          this.plotGridRef('aVl',array_derivations);
          if(this.bandera){
            d3.selectAll('.ecgsig').remove(); //Limpiar los path dibujados sobre la/s grilla/s
            d3.selectAll('.heartbeats').remove(); //Limpiar los latidos dibujados sobre la/s grilla/s
            this.chart1.drawPath(this.signal,array_derivations,this.chart_heigth,this.amplitudeScale,this.timeScale,this.time_position);
            this.chart1.drawHeartBeats(this.signal,this.timeScale,true,this.time_position);
          }
        break;
      case 'aVf':
          array_derivations=['aVf'];
          this.plotGridRef('aVf',array_derivations);
          if(this.bandera){
            d3.selectAll('.ecgsig').remove(); //Limpiar los path dibujados sobre la/s grilla/s
            d3.selectAll('.heartbeats').remove(); //Limpiar los latidos dibujados sobre la/s grilla/s
            this.chart1.drawPath(this.signal,array_derivations,this.chart_heigth,this.amplitudeScale,this.timeScale,this.time_position);
            this.chart1.drawHeartBeats(this.signal,this.timeScale,true,this.time_position);
          }
        break;
      case 'V1':
          array_derivations=['V1'];
          this.plotGridRef('V1',array_derivations);
          if(this.bandera){
            d3.selectAll('.ecgsig').remove(); //Limpiar los path dibujados sobre la/s grilla/s
            d3.selectAll('.heartbeats').remove(); //Limpiar los latidos dibujados sobre la/s grilla/s
            this.chart1.drawPath(this.signal,array_derivations,this.chart_heigth,this.amplitudeScale,this.timeScale,this.time_position);
            this.chart1.drawHeartBeats(this.signal,this.timeScale,true,this.time_position);
          }
        break;
      case 'V2':
          array_derivations=['V2'];
          this.plotGridRef('V2',array_derivations);
          if(this.bandera){
            d3.selectAll('.ecgsig').remove(); //Limpiar los path dibujados sobre la/s grilla/s
            d3.selectAll('.heartbeats').remove(); //Limpiar los latidos dibujados sobre la/s grilla/s
            this.chart1.drawPath(this.signal,array_derivations,this.chart_heigth,this.amplitudeScale,this.timeScale,this.time_position);
            this.chart1.drawHeartBeats(this.signal,this.timeScale,true,this.time_position);
          }
        break;
      case 'V3':
          array_derivations=['V3'];
          this.plotGridRef('V3',array_derivations);
          if(this.bandera){
            d3.selectAll('.ecgsig').remove(); //Limpiar los path dibujados sobre la/s grilla/s
            d3.selectAll('.heartbeats').remove(); //Limpiar los latidos dibujados sobre la/s grilla/s
            this.chart1.drawPath(this.signal,array_derivations,this.chart_heigth,this.amplitudeScale,this.timeScale,this.time_position);
            this.chart1.drawHeartBeats(this.signal,this.timeScale,true,this.time_position);
          }
        break;
      case 'V4':
          array_derivations=['V4'];
          this.plotGridRef('V4',array_derivations);
          if(this.bandera){
            d3.selectAll('.ecgsig').remove(); //Limpiar los path dibujados sobre la/s grilla/s
            d3.selectAll('.heartbeats').remove(); //Limpiar los latidos dibujados sobre la/s grilla/s
            this.chart1.drawPath(this.signal,array_derivations,this.chart_heigth,this.amplitudeScale,this.timeScale,this.time_position);
            this.chart1.drawHeartBeats(this.signal,this.timeScale,true,this.time_position);
          }
        break;
      case 'V5':
          array_derivations=['V5'];
          this.plotGridRef('V5',array_derivations);
          if(this.bandera){
            d3.selectAll('.ecgsig').remove(); //Limpiar los path dibujados sobre la/s grilla/s
            d3.selectAll('.heartbeats').remove(); //Limpiar los latidos dibujados sobre la/s grilla/s
            this.chart1.drawPath(this.signal,array_derivations,this.chart_heigth,this.amplitudeScale,this.timeScale,this.time_position);
            this.chart1.drawHeartBeats(this.signal,this.timeScale,true,this.time_position);
          }
        break;
      case 'V6':
          array_derivations=['V6'];
          this.plotGridRef('V6',array_derivations);
          if(this.bandera){
            d3.selectAll('.ecgsig').remove(); //Limpiar los path dibujados sobre la/s grilla/s
            d3.selectAll('.heartbeats').remove(); //Limpiar los latidos dibujados sobre la/s grilla/s
            this.chart1.drawPath(this.signal,array_derivations,this.chart_heigth,this.amplitudeScale,this.timeScale,this.time_position);
            this.chart1.drawHeartBeats(this.signal,this.timeScale,true,this.time_position);
          }
        break;
    }
  }

  private plotGridRef(derivations: string, array_derivations: string[]){

    if((derivations=='Principales') || (derivations=='Aumentadas') || (derivations=='V1, V2 y V3') || (derivations=='V4, V5 y V6') ||
       (derivations=='Miembros') || (derivations=='Precordiales') || (derivations=='DII, V2 y V5') || (derivations=='DI') || (derivations=='DII') ||
       (derivations=='DIII') || (derivations=='aVr') || (derivations=='aVl') || (derivations=='aVf') || (derivations=='V1') || (derivations=='V2') || (derivations=='V3') || (derivations=='V4') ||
       (derivations=='V5') || (derivations=='V6') || (derivations=='12x1')){

      d3.selectAll('.chart_grid').remove(); //Limpiar por completo el contenido
      d3.selectAll('.reference').remove();
      this.reference1= new Reference(5,100,'#2B4791');
      this.reference1.createRef();
      this.reference1.drawRef(array_derivations, this.chart_width, this.chart_heigth);
      this.chart1= new Chart(95,100,'#2B4791',this.reference_unit);
      this.chart1.createGrid();
    }else if(derivations == '6x2'){
      d3.selectAll('.chart_grid').remove(); //Limpiar por completo el contenido
      d3.selectAll('.reference').remove();
      this.reference1= new Reference(5,100,'#2B4791');
      this.reference1.createRef();
      this.reference1.drawRef(['DI','DII','DIII','aVr','aVl','aVf'], this.chart_width, this.chart_heigth);
      this.chart1= new Chart(45,100,'#2B4791',this.reference_unit);
      this.chart1.createGrid();
      this.reference2= new Reference(5,100,'#2B4791');
      this.reference2.createRef();
      this.reference2.drawRef(['V1','V2','V3','V4','V5','V6'], this.chart_width, this.chart_heigth);
      this.chart2= new Chart(45,100,'#2B4791',this.reference_unit);
      this.chart2.createGrid();
    }else if(derivations == '3x4'){
      d3.selectAll('.chart_grid').remove(); //Limpiar por completo el contenido
      d3.selectAll('.reference').remove();
      this.reference1= new Reference(5,100,'#2B4791');
      this.reference1.createRef();
      this.reference1.drawRef(['DI','DII','DIII'], this.chart_width, this.chart_heigth);
      this.chart1= new Chart(20,100,'#2B4791',this.reference_unit);
      this.chart1.createGrid();
      this.reference2= new Reference(5,100,'#2B4791');
      this.reference2.createRef();
      this.reference2.drawRef(['aVr','aVl','aVf'], this.chart_width, this.chart_heigth);
      this.chart2= new Chart(20,100,'#2B4791',this.reference_unit);
      this.chart2.createGrid();
      this.reference3= new Reference(5,100,'#2B4791');
      this.reference3.createRef();
      this.reference3.drawRef(['V1','V2','V3'], this.chart_width, this.chart_heigth);
      this.chart3= new Chart(20,100,'#2B4791',this.reference_unit);
      this.chart3.createGrid();
      this.reference4= new Reference(5,100,'#2B4791');
      this.reference4.createRef();
      this.reference4.drawRef(['V4','V5','V6'], this.chart_width, this.chart_heigth);
      this.chart4= new Chart(20,100,'#2B4791',this.reference_unit);
      this.chart4.createGrid();
    }
  }

} /** */
