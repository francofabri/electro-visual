import * as d3 from 'd3';

export class Reference {
    private ref_width: number;
    private ref_height: number;
    private ref_svg: any;
    private background_color: string;

    constructor(width: number, height: number, color: string){
        this.ref_width= width;
        this.ref_height= height;
        this.ref_svg= d3.select('#container2').append('svg');
        this.background_color= color;
    }

    public createRef(){
        this.initSVG();
    }

    private initSVG(){
        this.ref_svg.attr('width', this.ref_width + '%')
                    .attr('height', this.ref_height + '%')
                    .attr('class','reference')
                    .style('background-color',this.background_color)
                    .attr('g');
    }

    public drawRef(refs: string[], container_width: number, container_height:number){
        var w_aux= container_width * (this.ref_width/100);
        var h_aux= container_height * (this.ref_height/100);
        var num_elements= refs.length;
        var segment_height= h_aux/(num_elements + 1);
        var array_widths= [0, w_aux/3, w_aux/3, 2*w_aux/3,
                            2*w_aux/3, w_aux];
        var array_heights= [segment_height, segment_height, 0.5*segment_height,
                            0.5*segment_height, segment_height, segment_height];
        var points;
        var text_height=0;
        var rect_height=0;

        for(var i=0; i<num_elements; i++){

            for(var k=0; k<array_widths.length; k++){
                if(i > 0){
                    array_heights[k] += segment_height;
                }
            }

            points='';
            for(var j=0; j<array_widths.length; j++){
                points += array_widths[j] + ',' + array_heights[j] + ' ';
            }

            this.ref_svg.append('polyline')
                .attr('points',points)
                .attr('fill','none')
                .attr('stroke','#A0CDF1')
                .attr('stroke-width',1);

            rect_height=(i+1)*segment_height -0.375*segment_height;
            this.ref_svg.append('rect')
                .attr('width',0.5*w_aux)
                .attr('height',0.25*segment_height)
                .attr('x',0)
                .attr('y',rect_height)
                .attr('fill','#2B4791');

            text_height=(i+1)*segment_height - 0.2*segment_height;
            this.ref_svg.append('text')
                .attr('x',0.2*w_aux)
                .attr('y',text_height)
                .attr('font-family','Verdana')
                .attr('font-size',12)
                .attr('fill','white')
                .text(refs[i]);
        }
    }
}
