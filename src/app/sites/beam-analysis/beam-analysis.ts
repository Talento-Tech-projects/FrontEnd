import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser, CommonModule, KeyValuePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs'; 
import { BeamApiService, BeamModelIn, DistributedLoadIn, PointLoadIn, PointMomentIn, SolverResultsOut, SupportIn, SupportTypeAPI } from '../../services/beam-api';

import type { Chart, registerables, ChartOptions, ChartData } from 'chart.js';
import type Konva from 'konva';

@Component({
  selector: 'app-beam-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule, KeyValuePipe, DecimalPipe],
  templateUrl: './beam-analysis.html',
  styleUrls: ['./beam-analysis.css']
})
export class BeamAnalysis implements OnInit, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private beamapiService = inject(BeamApiService);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  @ViewChild('konvaContainer') konvaContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('shearChartCanvas') shearChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('momentChartCanvas') momentChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('deflectionChartCanvas') deflectionChartCanvas!: ElementRef<HTMLCanvasElement>;

  // Beam data fields
  beamLength = 0;
  beamE = 0;
  beamI = 0;
  supports: SupportIn[] = [];
  pointLoads: PointLoadIn[] = [];
  pointMoments: PointMomentIn[] = [];
  distributedLoads: DistributedLoadIn[] = [];

  // Form fields for user input (used in template)
  supportPos: number = 0;
  supportType: SupportTypeAPI = SupportTypeAPI.PINNED;
  loadPos: number = 5;
  loadMag: number = 10;
  momentPos: number = 3;
  momentMag: number = 15;
  distLoadStartPos: number = 2;
  distLoadEndPos: number = 8;
  distLoadStartMag: number = 5;
  distLoadEndMag: number = 5;

  // UI State
  results: SolverResultsOut | null = null;
  errorResult: string | null = null;
  isLoading = false;
  currentView: 'model' | 'results' = 'model';

  private Konva?: typeof Konva;
  private Chart?: typeof Chart;
  private stage?: Konva.Stage;
  private layer?: Konva.Layer;
  private shearChart?: Chart;
  private momentChart?: Chart;
  private deflectionChart?: Chart;

  ngOnInit(): void {
    const beam = localStorage.getItem('beamData');
    if (beam) {
      try {
        const parsed = JSON.parse(beam);
        this.beamLength = parsed.beamLength;
        this.beamE = parsed.E;
        this.beamI = parsed.I;
        this.supports = parsed.supports || [];
        this.pointLoads = parsed.pointLoads || [];
        this.pointMoments = parsed.pointMoments || [];
        this.distributedLoads = parsed.distributedLoads || [];
      } catch (e) {
        console.error('Error parsing saved beam data:', e);
      }
    }
  }

  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      try {
        this.Konva = (await import('konva')).default;
        const chartJs = await import('chart.js');
        this.Chart = chartJs.Chart;
        this.Chart.register(...chartJs.registerables);

        setTimeout(() => {
          this.initKonva();
          this.redrawKonva();
        }, 0);
      } catch (error) {
        console.error('Error initializing libraries:', error);
        this.errorResult = 'Error loading visualization libraries.';
      }
    }
  }

  showModelView(): void {
    this.currentView = 'model';
    setTimeout(() => this.redrawKonva(), 0);
  }

  showResultsView(): void {
    if (this.results || this.errorResult) {
      this.currentView = 'results';
    }
  }

  private initKonva(): void {
    if (!this.Konva || !this.konvaContainer?.nativeElement) return;
    const width = this.konvaContainer.nativeElement.offsetWidth;
    const height = this.konvaContainer.nativeElement.offsetHeight;
    this.stage = new this.Konva.Stage({ container: this.konvaContainer.nativeElement, width, height });
    this.layer = new this.Konva.Layer();
    this.stage.add(this.layer);
  }

  addDefaultSupports(): void { 
    this.supports = [
      { type: SupportTypeAPI.PINNED, position: 0 }, 
      { type: SupportTypeAPI.ROLLER, position: this.beamLength }
    ]; 
  }

  addSupport(): void { 
    if (isNaN(this.supportPos) || this.supportPos < 0 || this.supportPos > this.beamLength) { 
      alert(`Invalid support position. It must be between 0 and ${this.beamLength}.`); 
      return; 
    } 
    this.supports.push({ type: this.supportType, position: this.supportPos }); 
    this.redrawKonva(); 
  }

  addPointLoad(): void { 
    if (isNaN(this.loadPos) || isNaN(this.loadMag) || this.loadPos < 0 || this.loadPos > this.beamLength) { 
      alert(`Invalid load values. Position must be between 0 and ${this.beamLength}.`); 
      return; 
    } 
    this.pointLoads.push({ magnitude: this.loadMag, position: this.loadPos }); 
    this.redrawKonva(); 
  }

  addPointMoment(): void { 
    if (isNaN(this.momentPos) || isNaN(this.momentMag) || this.momentPos < 0 || this.momentPos > this.beamLength) { 
      alert(`Invalid moment values. Position must be between 0 and ${this.beamLength}.`); 
      return; 
    } 
    this.pointMoments.push({ magnitude: this.momentMag, position: this.momentPos }); 
    this.redrawKonva(); 
  }

  addDistributedLoad(): void { 
    if (isNaN(this.distLoadStartPos) || isNaN(this.distLoadEndPos) || isNaN(this.distLoadStartMag) || isNaN(this.distLoadEndMag)) { 
      alert("Please fill all fields for the distributed load."); 
      return; 
    } 
    if (this.distLoadStartPos >= this.distLoadEndPos || this.distLoadStartPos < 0 || this.distLoadEndPos > this.beamLength) { 
      alert(`Invalid load positions. They must be between 0 and ${this.beamLength}.`); 
      return; 
    } 
    this.distributedLoads.push({ start_position: this.distLoadStartPos, end_position: this.distLoadEndPos, start_magnitude: this.distLoadStartMag, end_magnitude: this.distLoadEndMag }); 
    this.redrawKonva(); 
  }
  
  resetModel(): void {
    this.beamLength = 10; this.beamE = 210e9; this.beamI = 5e-6;
    this.supports = []; this.pointLoads = []; this.pointMoments = []; this.distributedLoads = [];
    this.results = null; this.errorResult = null; this.isLoading = false;
    this.destroyCharts();
    // this.addDefaultSupports();
    this.redrawKonva();
    this.currentView = 'model';
  }

  // --- UPDATED redrawKonva function with bigger icons ---
  redrawKonva(): void {
    const Konva = this.Konva, layer = this.layer, stage = this.stage;
    if (!Konva || !stage || !layer) return;

    stage.width(this.konvaContainer.nativeElement.offsetWidth);
    stage.height(this.konvaContainer.nativeElement.offsetHeight);

    layer.destroyChildren();
    if (this.beamLength <= 0) { layer.draw(); return; }

    const padding = 50; // Increased padding for more space
    const width = stage.width() - 2 * padding;
    const beamY = stage.height() / 2;
    const scaleX = width / this.beamLength;
    
    const toPx = (pos: number) => padding + pos * scaleX;
    
    // Beam with increased thickness
    layer.add(new Konva.Rect({ x: toPx(0), y: beamY - 8, width: this.beamLength * scaleX, height: 50, fill: '#0B9BF4', stroke: '#003366', strokeWidth: 2 }));
    
    // Supports with increased size
    this.supports.forEach(s => { 
        const x = toPx(s.position); 
        if (s.type === 'PINNED') { 
            layer.add(new Konva.Path({ x, y: beamY + 8, data: 'M 0 0 L -30 40 L 30 40 Z', fill: '#0BCDF4', stroke: 'black', strokeWidth: 1.5 })); 
        } else if (s.type === 'ROLLER') { 
            layer.add(new Konva.Circle({ x, y: beamY + 67, radius: 24, fill: '#0BCDF4', stroke: 'black', strokeWidth: 1.5 })); 
            layer.add(new Konva.Line({ points: [x - 30, beamY + 92, x + 30, beamY + 92], stroke: 'black', strokeWidth: 2 })); 
        } else { // Fixed
            layer.add(new Konva.Rect({ x: x - 4, y: beamY - 31, width: 16, height: 100, fill: '#0BCDF4', stroke: 'black', strokeWidth: 1.5 }));
        } 
    });

    // Point loads with increased size
    this.pointLoads.forEach(l => { 
        const x = toPx(l.position); 
        const arrowY = beamY - 60; // Increased distance from beam
        layer.add(new Konva.Arrow({ x, y: arrowY, points: [0, 0, 0, 50], pointerLength: 12, pointerWidth: 12, fill: 'red', stroke: 'darkred', strokeWidth: 2.5 })); 
    });
    
    // Point moments with increased size
    this.pointMoments.forEach(moment => {
      const x = toPx(moment.position);
      const radius = 40; // Increased radius
      const isPositive = moment.magnitude > 0;
      const startPointX = x, startPointY = beamY + radius + 15, endPointX = x, endPointY = beamY - radius + 15;
      const sweepFlag = isPositive ? 0 : 1;
      const arcPathData = `M ${startPointX} ${startPointY} A ${radius} ${radius} 0 0 ${sweepFlag} ${endPointX} ${endPointY}`;
      const arcPath = new Konva.Path({ data: arcPathData, stroke: '#4BD678', strokeWidth: 3 });
      const arrow = new Konva.Arrow({ points: [5, 5], x: endPointX, y: endPointY, pointerLength: 10, pointerWidth: 10, fill: '#4BD678', stroke: '#4BD678', strokeWidth: 3, rotation: isPositive ? 90 : -90 });
      layer.add(arcPath, arrow);
    });

    // Distributed loads with increased size
    this.distributedLoads.forEach(dload => { 
        const x1 = toPx(dload.start_position), x2 = toPx(dload.end_position); 
        const arrowBaseY = beamY - 45; // Increased distance
        const shape = new Konva.Line({ points: [x1, arrowBaseY, x2, arrowBaseY, x2, beamY - 8, x1, beamY - 8], fill: 'rgba(255, 165, 0, 0.4)', stroke: 'orange', strokeWidth: 1, closed: true }); 
        layer.add(shape); 
        for (let x_arrow = x1 + 15; x_arrow <= x2 - 15; x_arrow += 40) { // Increased spacing
            layer.add(new Konva.Arrow({ x: x_arrow, y: arrowBaseY - 20, points: [0, 0, 0, 20], pointerLength: 8, pointerWidth: 8, fill: 'orange', stroke: 'darkorange', strokeWidth: 2 })); 
        } 
    });

    layer.draw();
   const rulerY = beamY + 300; // Position the ruler below everything else

    // 1. Draw the main axis line
    layer.add(new Konva.Line({
        points: [toPx(0), rulerY, toPx(this.beamLength), rulerY],
        stroke: 'black',
        strokeWidth: 2,
    }));

    // 2. Determine a good interval for ticks
    let majorTickStep = 1;
    if (this.beamLength > 50) {
        majorTickStep = 10;
    } else if (this.beamLength > 20) {
        majorTickStep = 5;
    } else if (this.beamLength > 10) {
        majorTickStep = 2;
    }

    // 3. Draw ticks and labels
    for (let pos = 0; pos <= this.beamLength; pos += majorTickStep) {
        const x = toPx(pos);
        // Draw major tick
        layer.add(new Konva.Line({
            points: [x, rulerY - 6, x, rulerY + 6],
            stroke: 'black',
            strokeWidth: 2,
        }));
        // Draw label for the tick
        const text = new Konva.Text({
            y: rulerY + 12,
            text: pos.toString(),
            fontSize: 12,
            fill: 'black',
        });
        text.x(x - text.width() / 2); // Center the text on the tick
        layer.add(text);
    }
    // Ensure the final tick and label at the very end are always drawn
    const endX = toPx(this.beamLength);
    const endLabelText = this.beamLength.toString();
    layer.add(new Konva.Line({
        points: [endX, rulerY - 6, endX, rulerY + 6],
        stroke: 'black',
        strokeWidth: 2,
    }));
    const endLabel = new Konva.Text({
        y: rulerY + 12,
        text: endLabelText,
        fontSize: 12,
        fill: 'black',
    });
    endLabel.x(endX - endLabel.width() / 2);
    layer.add(endLabel);


    // 4. Add the axis label "x (m)"
    layer.add(new Konva.Text({
        x: toPx(this.beamLength) + 15,
        y: rulerY - 8,
        text: 'x (m)',
        fontSize: 14,
        fontStyle: 'italic',
        fill: 'black',
    }));

    layer.draw();
  }




   calculate(): void {
    if (this.beamLength <= 0 || this.beamE <= 0 || this.beamI <= 0) { 
      this.errorResult = 'Length, Young\'s Modulus, and Inertia must be positive values.'; 
      this.currentView = 'results';
      return; 
    }
    if (this.supports.length < 2) { 
      this.errorResult = 'The beam must have at least 2 supports to be stable.'; 
      this.currentView = 'results';
      return; 
    }
    
    this.isLoading = true; 
    this.errorResult = null; 
    this.results = null; 
    this.destroyCharts();

    const payload: BeamModelIn = {
      length: Number(this.beamLength), E: Number(this.beamE), I: Number(this.beamI),
      supports: this.supports, point_loads: this.pointLoads,
      point_moments: this.pointMoments, distributed_loads: this.distributedLoads
    };

    // --- ¡AQUÍ ESTÁ EL CAMBIO PRINCIPAL! ---
    // Llamamos al método del servicio en lugar de usar http directamente.
    this.beamapiService.solveBeam(payload).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        if (!data || !data.reactions || !data.shear_diagram) {
            this.errorResult = 'The server response is invalid or incomplete.';
            this.currentView = 'results';
            return;
        }
        
        this.results = data;
        this.currentView = 'results';
        this.cdr.detectChanges(); 

        setTimeout(() => {
            try {
                this.createCharts(data);
            } catch (e) {
                this.errorResult = `Error rendering results: ${(e as Error).message}`;
                this.cdr.detectChanges(); 
            }
        }, 0);
      },
      error: (err) => {
        if (err.error?.detail) {
          this.errorResult = err.error.detail;
        } else {
          this.errorResult = `Could not connect to the calculation server. (Status: ${err.statusText || 'Unknown Error'})`;
        }
        this.currentView = 'results';
      }
    });
  }
  
  private createCharts(data: SolverResultsOut): void {
    if (!this.Chart) return;
    
    const commonOptions = (title: string, yAxisLabel: string): ChartOptions => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: 'Position (m)' }
        },
        y: {
          title: { display: true, text: yAxisLabel },
          ticks: {
            callback: function(value) {
              if (typeof value === 'number' && value % 1 !== 0) {
                return Number(value.toFixed(2));
              }
              return value;
            }
          }
        }
      },
      plugins: {
        title: { display: true, text: title, font: { size: 16 } },
        legend: { display: false }
      }
    });

    if (this.shearChartCanvas) {
      this.shearChart = new this.Chart(this.shearChartCanvas.nativeElement, {
        type: 'line',
        data: this.formatChartData(data.shear_diagram),
        options: commonOptions('Shear Diagram', 'Shear (kN)')
      });
    }

    if (this.momentChartCanvas) {
      this.momentChart = new this.Chart(this.momentChartCanvas.nativeElement, {
        type: 'line',
        data: this.formatChartData(data.moment_diagram),
        options: commonOptions('Bending Moment Diagram', 'Moment (kNm)')
      });
    }

    if (this.deflectionChartCanvas) {
      const deflectionDataInMm = data.deflection_diagram.map(point => ({
        x: point.x,
        y: point.y * 1000 
      }));

      this.deflectionChart = new this.Chart(this.deflectionChartCanvas.nativeElement, {
        type: 'line',
        data: this.formatChartData(deflectionDataInMm, true),
        options: commonOptions('Deflection Diagram (Elastic)', 'Deflection (mm)')
      });
    }
  }

  private formatChartData(points: {x:number, y:number}[], noFill = false): ChartData {
    if (!points || points.length === 0) return { datasets: [] };
    return {
      datasets: [{
        label: 'Value',
        data: points, 
        borderColor: '#35D47A', 
        backgroundColor: noFill ? 'transparent' : 'rgba(75, 214, 120, 0.2)',
        fill: !noFill, 
        tension: 0.1, 
        pointRadius: 1, 
        pointHoverRadius: 4,
        borderWidth: 2
      }]
    };
  }

  deleteSupport(index: number): void {
    this.supports.splice(index, 1);
    this.redrawKonva();
  }

  deletePointLoad(index: number): void {
    this.pointLoads.splice(index, 1);
    this.redrawKonva();
  }

  deletePointMoment(index: number): void {
    this.pointMoments.splice(index, 1);
    this.redrawKonva();
  }

  deleteDistributedLoad(index: number): void {
    this.distributedLoads.splice(index, 1);
    this.redrawKonva();
  }

  private destroyCharts(): void {
    this.shearChart?.destroy(); 
    this.momentChart?.destroy(); 
    this.deflectionChart?.destroy();
    this.shearChart = undefined; 
    this.momentChart = undefined; 
    this.deflectionChart = undefined;
  }
}
