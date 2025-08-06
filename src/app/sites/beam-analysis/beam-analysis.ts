import { Component, AfterViewInit, ViewChild, ElementRef, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser, CommonModule, KeyValuePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import type { Chart, registerables, ChartOptions, ChartData } from 'chart.js';
import type Konva from 'konva';

// --- Interfaces (sin cambios) ---
enum SupportTypeAPI { PINNED = "PINNED", FIXED = "FIXED", ROLLER = "ROLLER" }
interface SupportIn { type: SupportTypeAPI; position: number; }
interface PointLoadIn { magnitude: number; position: number; }
interface PointMomentIn { magnitude: number; position: number; }
interface DistributedLoadIn { start_magnitude: number; end_magnitude: number; start_position: number; end_position: number; }
interface SolverResultsOut { reactions: { [key: string]: { Fx: number; Fy: number; Mz: number; } }; shear_diagram: {x:number, y:number}[]; moment_diagram: {x:number, y:number}[]; deflection_diagram: {x:number, y:number}[]; }
interface BeamModelIn { length: number; E: number; I: number; supports: SupportIn[]; point_loads: PointLoadIn[]; point_moments: PointMomentIn[]; distributed_loads: DistributedLoadIn[]; }

@Component({
  selector: 'app-beam-analysis',
  standalone: true,
  imports: [ CommonModule, FormsModule, HttpClientModule, KeyValuePipe, DecimalPipe ],
  templateUrl: './beam-analysis.html',
  styleUrls: ['./beam-analysis.css']
})
export class BeamAnalysis implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  @ViewChild('konvaContainer') konvaContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('shearChartCanvas') shearChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('momentChartCanvas') momentChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('deflectionChartCanvas') deflectionChartCanvas!: ElementRef<HTMLCanvasElement>;
  
  beamLength: number = 10;
  beamE: number = 210e9;
  beamI: number = 5e-6;
  
  private apiUrl = 'http://127.0.0.1:8000';
  
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
  
  supports: SupportIn[] = [];
  pointLoads: PointLoadIn[] = [];
  pointMoments: PointMomentIn[] = [];
  distributedLoads: DistributedLoadIn[] = [];
  
  results: SolverResultsOut | null = null;
  errorResult: string | null = null;
  isLoading: boolean = false;

  private Konva?: typeof Konva;
  private Chart?: typeof Chart;
  private stage?: Konva.Stage;
  private layer?: Konva.Layer;
  private shearChart?: Chart;
  private momentChart?: Chart;
  private deflectionChart?: Chart;
  
  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      try {
        this.Konva = (await import('konva')).default;
        const chartJs = await import('chart.js');
        this.Chart = chartJs.Chart;
        this.Chart.register(...chartJs.registerables);
        
        this.initKonva();
        this.resetModel();
      } catch (error) {
        console.error('Error inicializando librerías:', error);
        this.errorResult = 'Error cargando las librerías de visualización.';
      }
    }
  }

  private initKonva(): void {
    if (!this.Konva || !this.konvaContainer?.nativeElement) return;
    const width = this.konvaContainer.nativeElement.offsetWidth;
    const height = 150;
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
      alert(`Posición del apoyo inválida. Debe estar entre 0 y ${this.beamLength}.`); 
      return; 
    } 
    this.supports.push({ type: this.supportType, position: this.supportPos }); 
    this.redrawKonva(); 
  }

  addPointLoad(): void { 
    if (isNaN(this.loadPos) || isNaN(this.loadMag) || this.loadPos < 0 || this.loadPos > this.beamLength) { 
      alert(`Valores de carga inválidos. La posición debe estar entre 0 y ${this.beamLength}.`); 
      return; 
    } 
    this.pointLoads.push({ magnitude: this.loadMag, position: this.loadPos }); 
    this.redrawKonva(); 
  }

  addPointMoment(): void { 
    if (isNaN(this.momentPos) || isNaN(this.momentMag) || this.momentPos < 0 || this.momentPos > this.beamLength) { 
      alert(`Valores de momento inválidos. La posición debe estar entre 0 y ${this.beamLength}.`); 
      return; 
    } 
    this.pointMoments.push({ magnitude: this.momentMag, position: this.momentPos }); 
    this.redrawKonva(); 
  }

  addDistributedLoad(): void { 
    if (isNaN(this.distLoadStartPos) || isNaN(this.distLoadEndPos) || isNaN(this.distLoadStartMag) || isNaN(this.distLoadEndMag)) { 
      alert("Rellena todos los campos de la carga distribuida."); 
      return; 
    } 
    if (this.distLoadStartPos >= this.distLoadEndPos || this.distLoadStartPos < 0 || this.distLoadEndPos > this.beamLength) { 
      alert(`Las posiciones de la carga son inválidas. Deben estar entre 0 y ${this.beamLength}.`); 
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
    this.addDefaultSupports();
    this.redrawKonva();
  }

  redrawKonva(): void {
    const Konva = this.Konva, layer = this.layer, stage = this.stage;
    if (!Konva || !stage || !layer) return;

    layer.destroyChildren();
    if (this.beamLength <= 0) { layer.draw(); return; }

    const padding = 40, width = stage.width() - 2 * padding, scaleX = width / this.beamLength, beamY = stage.height() / 2;
    const toPx = (pos: number) => padding + pos * scaleX;
    
    layer.add(new Konva.Rect({ x: toPx(0), y: beamY - 5, width: this.beamLength * scaleX, height: 10, fill: '#A0A0A0', stroke: 'black', strokeWidth: 1 }));
    
    this.supports.forEach(s => { 
        const x = toPx(s.position); 
        if (s.type === 'PINNED') { 
            layer.add(new Konva.Path({ x, y: beamY + 5, data: 'M 0 0 L -10 15 L 10 15 Z', fill: 'cyan', stroke: 'black', strokeWidth: 1 })); 
        } else if (s.type === 'ROLLER') { 
            layer.add(new Konva.Circle({ x, y: beamY + 12.5, radius: 7.5, fill: 'cyan', stroke: 'black', strokeWidth: 1 })); 
            layer.add(new Konva.Line({ points: [x - 12, beamY + 20, x + 12, beamY + 20], stroke: 'black', strokeWidth: 1 })); 
        } else { 
            layer.add(new Konva.Line({ points: [x, beamY - 15, x, beamY + 15], stroke: 'cyan', strokeWidth: 5 })); 
        } 
    });

    this.pointLoads.forEach(l => { 
        const x = toPx(l.position); 
        layer.add(new Konva.Arrow({ x, y: beamY - 40, points: [0, 0, 0, 35], pointerLength: 8, pointerWidth: 8, fill: 'red', stroke: 'red', strokeWidth: 2 })); 
    });
    
    this.pointMoments.forEach(moment => {
      const x = toPx(moment.position);
      const radius = 18;
      const isPositive = moment.magnitude > 0;
      const startPointX = x, startPointY = beamY + radius, endPointX = x, endPointY = beamY - radius;
      const sweepFlag = isPositive ? 0 : 1;
      const arcPathData = `M ${startPointX} ${startPointY} A ${radius} ${radius} 0 0 ${sweepFlag} ${endPointX} ${endPointY}`;
      const arcPath = new Konva.Path({ data: arcPathData, stroke: 'purple', strokeWidth: 2 });
      const arrow = new Konva.Arrow({ points: [0, 0], x: endPointX, y: endPointY, pointerLength: 6, pointerWidth: 6, fill: 'purple', stroke: 'purple', strokeWidth: 2, rotation: isPositive ? 90 : -90 });
      layer.add(arcPath, arrow);
    });

    this.distributedLoads.forEach(dload => { 
        const x1 = toPx(dload.start_position), x2 = toPx(dload.end_position); 
        const shape = new Konva.Line({ points: [x1, beamY - 30, x2, beamY - 30, x2, beamY - 5, x1, beamY - 5], fill: 'rgba(255, 165, 0, 0.4)', stroke: 'orange', strokeWidth: 1, closed: true }); 
        layer.add(shape); 
        for (let x_arrow = x1; x_arrow <= x2; x_arrow += 30) { 
            layer.add(new Konva.Arrow({ x: x_arrow, y: beamY - 45, points: [0, 0, 0, 15], pointerLength: 5, pointerWidth: 5, fill: 'orange', stroke: 'orange', strokeWidth: 1.5 })); 
        } 
    });

    layer.draw();
  }

  calculate(): void {
    if (this.beamLength <= 0 || this.beamE <= 0 || this.beamI <= 0) { 
      this.errorResult = 'La longitud, Módulo de Young e Inercia deben ser valores positivos.'; 
      return; 
    }
    if (this.supports.length < 2) { 
      this.errorResult = 'La viga debe tener al menos 2 apoyos para ser estable.'; 
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

    this.http.post<SolverResultsOut>(`${this.apiUrl}/api/v1/solve`, payload).subscribe({
      next: (data) => {
        if (!data || !data.reactions || !data.shear_diagram) {
            this.errorResult = 'La respuesta del servidor es inválida o está incompleta.';
            this.isLoading = false;
            return;
        }

        this.results = data;
        this.isLoading = false;
        this.cdr.detectChanges();

        setTimeout(() => {
            try {
                this.createCharts(data);
            } catch (e) {
                this.errorResult = `Error al renderizar los resultados: ${(e as Error).message}`;
                this.cdr.detectChanges(); 
            }
        }, 50);
      },
      error: (err) => {
        this.errorResult = err.error?.detail || err.message || 'Error de comunicación con el servidor.';
        this.isLoading = false;
      }
    });
  }
  
  /**
   * (CORREGIDO) - Crea las gráficas de resultados, formateando ejes y unidades.
   */
  private createCharts(data: SolverResultsOut): void {
    if (!this.Chart) return;

    /**
     * Función de ayuda para generar opciones comunes de las gráficas.
     * Incluye formateo de los ejes para mostrar un máximo de 2 decimales.
     */
    const commonOptions = (title: string, yAxisLabel: string): ChartOptions => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: 'Posición (m)' }
        },
        y: {
          title: { display: true, text: yAxisLabel },
          ticks: {
            callback: function(value) {
              // Formatea el valor a un máximo de 2 decimales si no es un entero.
              if (typeof value === 'number' && value % 1 !== 0) {
                return Number(value.toFixed(2));
              }
              return value; // Devuelve el valor original si es entero.
            }
          }
        }
      },
      plugins: {
        title: { display: true, text: title, font: { size: 16 } },
        legend: { display: false } // Ocultamos la leyenda ya que solo hay una serie de datos
      }
    });

    // 1. Gráfica de Cortante (kN)
    if (this.shearChartCanvas) {
      this.shearChart = new this.Chart(this.shearChartCanvas.nativeElement, {
        type: 'line',
        data: this.formatChartData(data.shear_diagram),
        options: commonOptions('Diagrama de Cortante', 'Cortante (kN)')
      });
    }

    // 2. Gráfica de Momento (kNm)
    if (this.momentChartCanvas) {
      this.momentChart = new this.Chart(this.momentChartCanvas.nativeElement, {
        type: 'line',
        data: this.formatChartData(data.moment_diagram),
        options: commonOptions('Diagrama de Momento Flector', 'Momento (kNm)')
      });
    }

    // 3. Gráfica de Deformada (mm)
    if (this.deflectionChartCanvas) {
      // (CAMBIO CLAVE) Convierte los datos de deformada de metros (del API) a milímetros
      const deflectionDataInMm = data.deflection_diagram.map(point => ({
        x: point.x,
        y: point.y * 1000 // Conversión m -> mm
      }));

      this.deflectionChart = new this.Chart(this.deflectionChartCanvas.nativeElement, {
        type: 'line',
        data: this.formatChartData(deflectionDataInMm, true), // Usa los datos convertidos
        options: commonOptions('Diagrama de Deformada (Elástica)', 'Deformada (mm)') // Etiqueta actualizada
      });
    }
  }

  private formatChartData(points: {x:number, y:number}[], noFill = false): ChartData {
    if (!points || points.length === 0) return { datasets: [] };
    return {
      datasets: [{
        label: 'Valor', // Etiqueta para tooltips
        data: points, 
        borderColor: '#36A2EB', 
        backgroundColor: noFill ? 'transparent' : 'rgba(54, 162, 235, 0.2)',
        fill: !noFill, 
        tension: 0.1, 
        pointRadius: 1, 
        pointHoverRadius: 4,
        borderWidth: 2
      }]
    };
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