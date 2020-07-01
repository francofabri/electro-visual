import { Component, OnInit, Input,  Output, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import { Signal } from '../modules/signal';

@Component({
  selector: 'app-rhythm-channel',
  templateUrl: './rhythm-channel.component.html',
  styleUrls: ['./rhythm-channel.component.css']
})
export class RhythmChannelComponent implements OnInit {
  private width: number;
  private height: number;
  private data_signal: Signal;
  private temporalScale: string;
  private ref_unit: number;
  private derivation_aux: string;
  private grid_width: number;
  private scale: number;
  private left_edge: number;  //Borde izquierdo del rectángulo indicador
  private rect_width: number; //Ancho del rectángulo indicador
  private time: number;
  private total_time: number;
  private channel_svg: any;
  @Input() signal: Signal;    //Almaceno información proveniente de GraphicComponent
  @Input() timeScale: string; //Almaceno información proveniente de GraphicComponent
  @Input() reference_unit: number; //Almaceno información proveniente de GraphicComponent
  @Input() derivation: string; //Almaceno información proveniente de GraphicComponent
  @Output() private position = new EventEmitter<number>();

  constructor() {
    var screen_width=0.9*screen.availWidth;
    var screen_height=0.1*screen.availHeight;
    this.width=0.847*screen_width;
    this.height=screen_height;
    this.ref_unit=5; //Tomamos 5 px como unidad de medida inicial
    this.scale=1;
    this.grid_width=0.95*this.width;
    this.left_edge=0;
    this.rect_width=0;
  }

  ngOnInit() {
    d3.select('#cr')
      .style('margin','0 auto')
      .style('float','left')
      .style('width', this.width + 'px')
      .style('height', this.height + 'px');

    this.channel_svg= d3.selectAll('#cr').append('svg');
    this.channel_svg.attr('width', '100%')
                    .attr('height', '100%')
                    .attr('class','channel_rhythm')
                    .style('background-color','#2B4791')
                    .attr('g');

    this.channel_svg.append('rect')
                  .attr('x', 0)
                  .attr('y', 0)
                  .attr('width','99.9%')
                  .attr('height','99.5%')
                  .attr('stroke','#FFD072')
                  .attr('stroke-width',1.5)
                  .style('fill','#A0CDF1') //Necesario 'llenar' para que respondan los eventos de ratón
                  .style('fill-opacity',0)
                  .on('click', (data)=>{
                      this.getCoordenada();
                  });
  }

  derivationChanged(){
    this.derivation_aux=this.derivation;
    if(this.derivation_aux == '6x2'){
      this.grid_width=0.45*this.width;
    }else if(this.derivation_aux == '3x4'){
      this.grid_width=0.20*this.width;
    }else{
      this.grid_width=0.95*this.width;
    }
    this.drawRhythm();
  }

  signalChanged(){
    this.data_signal=this.signal;
    this.drawRhythm()
  }

  timeChanged(){
    this.temporalScale=this.timeScale;
    if(this.temporalScale == "6.25 mm/S")
        this.scale=0.25;
    else if(this.temporalScale == "12.5 mm/S")
        this.scale=0.5;
    else if(this.temporalScale == "25 mm/S")
        this.scale=1;
    else if(this.temporalScale == "50 mm/S")
        this.scale=2;
    else
        this.scale=4;

    this.drawRhythm();
  }

  referenceUnitChanged(){
    this.ref_unit=this.reference_unit;
    this.drawRhythm();
  }


  drawRhythm(){
    d3.selectAll('.rhythm').remove(); //Limpiar el path antes de volver a dibujar
    d3.selectAll('.rectrhythm').remove(); //Limpiar el recuadro antes de volver a dibujar
    let lineGenerator=d3.line();
    let pathData: string;
    let signal_aux=this.data_signal.get_derivation("DII","2.5 mm/mV","6.25 mm/S",this.height/2,this.ref_unit,0);
    pathData=lineGenerator(signal_aux);
    let signal_length= signal_aux.length;

    //Cálculo del ancho del rectángulo indicador de la porción visualizada de la Señal, es decir el rango de tiempo en la grilla
    this.time= this.grid_width/(25*this.ref_unit*this.scale);
    this.total_time= signal_aux[signal_length-1][0]/(25*this.ref_unit*0.25); //Recalculo el tiempo total de la señal
    //let rect_width: number;

    if(this.grid_width >= (25*this.ref_unit*this.scale*this.total_time)){
      this.rect_width= 25*this.ref_unit*0.25*this.total_time;
    }else{
      this.rect_width= 25*this.ref_unit*0.25*this.time;
    }

    this.channel_svg.append('rect')
            .attr('class','rectrhythm')
            .attr('x',this.left_edge)
            .attr('y',0)
            .attr('width',this.rect_width)
            .attr('height',this.height)
            .style('fill','#A0CDF1')
            .style('fill-opacity',0.2)
            //.on("mouseover", this.handleMouseOver)
            //.on("mouseout", this.handleMouseOut);
            .on('click', (data)=>{
                this.getCoordenada()
            });
            //.on('mousedown',(data)=>{
            //  this.getCoordenada();
            //});

    this.channel_svg.append('path')
            .attr('class','rhythm')
            .attr('stroke','#A0CDF1')
            .attr('fill','none')
            .attr('stroke-width',1)
            .attr('stroke-linejoin','round')
            .attr('d', pathData);
            //.on("mouseover", this.handleMouseOver)
            //.on("mouseout", this.handleMouseOut);

    this.channel_svg.append('text')
            .attr('class','textrhythm')
            .attr('x',5)
            .attr('y',10)
            .attr('font-family','Verdana')
            .attr('font-size',10)
            .attr('fill','white')
            .text('DII');
  }

  handleMouseOver(){
    d3.select('.rectrhythm')
      .style('fill','yellow')
      .style('fill-opacity',0.2);
  }

  handleMouseOut(){
    d3.select('.rectrhythm')
      .style('fill','#A0CDF1')
      .style('fill-opacity',0.2);
  }

  getCoordenada(){
    let coords = d3.mouse(d3.event.currentTarget);
    let center_rect= coords[0];

    this.left_edge= center_rect - this.rect_width/2.0;

    if(this.left_edge < 0){
      this.left_edge= 0;
    }

    if(this.left_edge > (25*this.ref_unit*0.25*this.total_time) - this.rect_width){
      this.left_edge= (25*this.ref_unit*0.25*this.total_time) - this.rect_width;
    }

    //Cálculo del instante de tiempo donde la señal comienza a graficarse en la grilla
    let time= this.left_edge/(25*this.ref_unit*0.25);
    //Ahora se procede a determinar la posición del vector de tiempo desde donde se debe empezar a graficar
    let time_position: number=0;
    let signal_aux=this.data_signal.get_derivation("DII","2.5 mm/mV","6.25 mm/S",this.height/2,this.ref_unit,0);
    for(let i=0; i<signal_aux.length; i++){
      if((signal_aux[i][0]/(25*this.ref_unit*0.25))>= time){
        time_position=i;
        break;
      }
    }

    d3.select('.rectrhythm')
      .attr('x',this.left_edge)
      .attr('y',0);

    this.position.emit(time_position);
    this.drawRhythm();
  }

  shift_left(){
    this.left_edge -= 15;
    if(this.left_edge < 0){
      this.left_edge= 0;
    }
    //Cálculo del instante de tiempo donde la señal comienza a graficarse en la grilla
    let time= this.left_edge/(25*this.ref_unit*0.25);
    //Ahora se procede a determinar la posición del vector de tiempo desde donde se debe empezar a graficar
    let time_position: number=0;
    let signal_aux=this.data_signal.get_derivation("DII","2.5 mm/mV","6.25 mm/S",this.height/2,this.ref_unit,0);
    for(let i=0; i<signal_aux.length; i++){
      if((signal_aux[i][0]/(25*this.ref_unit*0.25))>= time){
        time_position=i;
        break;
      }
    }
    this.position.emit(time_position);
    this.drawRhythm();
  }

  shift_right(){
    this.left_edge += 15;
    if(this.left_edge > (25*this.ref_unit*0.25*this.total_time) - this.rect_width){
      this.left_edge= (25*this.ref_unit*0.25*this.total_time) - this.rect_width;
    }
    //Cálculo del instante de tiempo donde la señal comienza a graficarse en la grilla
    let time= this.left_edge/(25*this.ref_unit*0.25);
    //Ahora se procede a determinar la posición del vector de tiempo desde donde se debe empezar a graficar
    let time_position: number=0;
    let signal_aux=this.data_signal.get_derivation("DII","2.5 mm/mV","6.25 mm/S",this.height/2,this.ref_unit,0);
    for(let i=0; i<signal_aux.length; i++){
      if((signal_aux[i][0]/(25*this.ref_unit*0.25))>= time){
        time_position=i;
        break;
      }
    }
    this.position.emit(time_position);
    this.drawRhythm();
  }

}
