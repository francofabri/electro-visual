import * as d3 from 'd3';
import { Signal } from './signal';

export class Chart {
    private chart_height: number;
    private chart_width: number;
    private chart_svg: any;
    private background_color: string;
    private reference_unit: number;

    constructor(width: number, height:number, color: string, reference_unit: number){
        this.chart_width= width;
        this.chart_height= height;
        this.background_color= color;
        this.chart_svg= d3.select('#container2').append('svg');
        this.reference_unit=reference_unit;
    }

    public createGrid(){
        this.initSVG();
        this.drawGrid();
    }

    private initSVG(){
        this.chart_svg.attr('width', this.chart_width + '%')
                      .attr('height', this.chart_height + '%')
                      .attr('class','chart_grid')
                      .style('background-color',this.background_color)
                      .attr('g');
    }

    private drawGrid(){
        //Definimos los tamaños de los cuadros perqueños, medianos y grandes
        let small_square: number= this.reference_unit;
        let medium_square: number= 5*this.reference_unit;
        let big_square: number= 25*this.reference_unit;

        //Definimos los path para los atributos 'd' de los patrones
        let small_d: string='M ' + small_square + ' 0 L 0 0 0 ' + small_square;
        let medium_d: string='M ' + medium_square + ' 0 L 0 0 0 ' + medium_square;
        let big_d: string='M ' + big_square + ' 0 L 0 0 0 ' + big_square;

        var defs= this.chart_svg.append('defs');

        var pattern1= defs.append('pattern')
                    .attr('id','smallGrid')
                    .attr('width',small_square)
                    .attr('height',small_square)
                    .attr('patternUnits','userSpaceOnUse');
            pattern1.append('path')
                    .attr('fill','none')
                    .attr('stroke','#459BE1')
                    .attr('stroke-width',0.4)
                    .attr('d',small_d);

        var pattern2= defs.append('pattern')
                    .attr('id','mediumGrid')
                    .attr('width',medium_square)
                    .attr('height',medium_square)
                    .attr('patternUnits','userSpaceOnUse');
            pattern2.append('rect')
                    .attr('width',medium_square)
                    .attr('height',medium_square)
                    .attr('fill','url(#smallGrid)');
            pattern2.append('path')
                    .attr('fill','none')
                    .attr('stroke','#459BE1')
                    .attr('stroke-width',1)
                    .attr('d',medium_d);

        var pattern3= defs.append('pattern')
                    .attr('id','grid')
                    .attr('width',big_square)
                    .attr('height',big_square)
                    .attr('patternUnits','userSpaceOnUse');
            pattern3.append('rect')
                    .attr('width',big_square)
                    .attr('height',big_square)
                    .attr('fill','url(#mediumGrid)');
            pattern3.append('path')
                    .attr('fill','none')
                    .attr('stroke','#459BE1')
                    .attr('stroke-width',2.5)
                    .attr('d',big_d);

        this.chart_svg.append('rect')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('width','100%')
                    .attr('height','100%')
                    .attr('fill','url(#grid)');
    }

    public drawPath(signal: Signal, array_derivations: string[], container_height: number,
                    amp_scale: string, time_scale: string, time_position: number){
        let lineGenerator=d3.line();
        let num_elements=array_derivations.length;
        let segment_height=container_height/(num_elements+1);
        let pathData: string;
        let step=segment_height;

        for(let i=0; i<num_elements; i++){
                pathData=lineGenerator(signal.get_derivation(array_derivations[i],amp_scale,time_scale,step,this.reference_unit,time_position));

                this.chart_svg.append('path')
                        .attr('class','ecgsignal')
                        .attr('stroke','#A0CDF1')
                        .attr('fill','none')
                        .attr('stroke-width',1)
                        .attr('stroke-linejoin','round')
                        .attr('d', pathData);

                step+=segment_height;
        }
    }

    public drawHeartBeats(signal: Signal,time_scale: string, flag_heart_beats: boolean, time_position: number){
        //Recupero array con los instantes de tiempo donde se encuentran los picos
        let array_times: number[]=signal.peak_detection(time_position);
        let array_times_aux: string[]=[];
        let array_beats: number[]=[];
        let array_beats_aux: string[]=[];
        let beats: number;

        //Cálculo latidos cardíacos
        let L: number=array_times.length;

        for(let i=0; i<L-1; i++){
            array_beats.push(array_times[i+1]-array_times[i]);
        }
        array_beats.push(array_beats[L-2]);

        for(let i=0; i<L; i++){
            beats=Math.round((1/array_beats[i])*60);
            array_beats_aux.push(beats.toString());
        }

        //Escalamiento en tiempo
        let temporal_scale: number;
        if(time_scale == "6.25 mm/S")
            temporal_scale=0.25;
        else if(time_scale == "12.5 mm/S")
            temporal_scale=0.5;
        else if(time_scale == "25 mm/S")
            temporal_scale=1;
        else if(time_scale == "50 mm/S")
            temporal_scale=2;
        else
            temporal_scale=4;

        for(let i=0; i<array_times.length; i++){
            array_times[i]= 25*this.reference_unit*array_times[i]*temporal_scale;
            array_times_aux.push(array_times[i].toString());
        }

        //Graficación de los latidos cardíacos
        if(flag_heart_beats){
                for(let i=0; i<array_times_aux.length; i++){
                        this.chart_svg.append('line')
                        .attr('class','heartbeats')
                        .attr('stroke','orange')
                        .attr('fill','none')
                        .attr('stroke-width',2)
                        .attr('stroke-linejoin','round')
                        .attr('x1',array_times_aux[i])
                        .attr('y1','0')
                        .attr('x2',array_times_aux[i])
                        .attr('y2','15');
                }
                for(let i=0; i<array_times.length; i++){
                        this.chart_svg.append('text')
                        .attr('class','textbeats')
                        .attr('x',array_times[i] + 5)
                        .attr('y',10)
                        .attr('font-family','Verdana')
                        .attr('font-size',10)
                        .attr('fill','orange')
                        .text(array_beats_aux[i]);
            }
        }
    }

}
