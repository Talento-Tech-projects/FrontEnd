import { Component, AfterViewInit } from '@angular/core';
import { Layer } from 'konva/lib/Layer';
import { Stage } from 'konva/lib/Stage';
import { Line } from 'konva/lib/shapes/Line';
import { Circle } from 'konva/lib/shapes/Circle';
import { Arrow } from 'konva/lib/shapes/Arrow';
import { Rect } from 'konva/lib/shapes/Rect';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Konva from 'konva';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [ReactiveFormsModule, 
    CommonModule],
  templateUrl: './workspace.html',
  styleUrl: './workspace.css'
})
export class Workspace implements AfterViewInit {

  beamForm: FormGroup;
  supportForm: FormGroup;
  loadForm: FormGroup;
  momentForm: FormGroup;
  distLoadForm: FormGroup;
  supports: any[] = [];
  loads: any[] = [];
  moments: any[] = [];
  distributedLoads: any[] = [];


  stage: Stage | null = null;
  layer: Layer | null = null;

  constructor(private fb: FormBuilder) {
    this.beamForm = this.fb.group({
      beamLength: [10, [Validators.required, Validators.min(1)]],
      beamE: ['210e9', Validators.required],
      beamI: ['5e-6', Validators.required]
    });

    this.supportForm = this.fb.group({
      position: [0, Validators.required],
      type: ['PINNED', Validators.required]
    });

    this.loadForm = this.fb.group({
      position: [0, Validators.required],
      magnitude: [0, Validators.required]
    });

    this.momentForm = this.fb.group({
      position: [0, Validators.required],
      magnitude: [0, Validators.required]
    });

    this.distLoadForm = this.fb.group({
      startPos: [0, Validators.required],
      endPos: [0, Validators.required],
      startMag: [0, Validators.required],
      endMag: [0, Validators.required]
    });
  }

  ngAfterViewInit() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    this.renderCanvas();
  }

renderCanvas() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const container = document.getElementById('canvas-container');
  if (!container) return;
  container.innerHTML = '';

  const width = container.offsetWidth;
  const height = 250;

  const stage = new Konva.Stage({
    container: 'canvas-container',
    width,
    height
  });

  const layer = new Konva.Layer();
  const tooltipLayer = new Konva.Layer();
  stage.add(layer);
  stage.add(tooltipLayer);

  const tooltip = new Konva.Label({
    opacity: 0.75,
    visible: false
  });
  tooltip.add(new Konva.Tag({ fill: 'white' }));
  tooltip.add(new Konva.Text({ text: '', fontSize: 14, padding: 4, fill: 'black' }));
  tooltipLayer.add(tooltip);

  const showTooltip = (shape: Konva.Shape, text: string) => {
    tooltip.position({ x: shape.x(), y: shape.y() - 20 });
    (tooltip.children[1] as Konva.Text).text(text);
    tooltip.show();
    tooltipLayer.batchDraw();
  };

  const hideTooltip = () => {
    tooltip.hide();
    tooltipLayer.batchDraw();
  };

  // Draw beam line
  const beam = new Konva.Line({
    points: [20, 125, width - 20, 125],
    stroke: 'black',
    strokeWidth: 4
  });
  layer.add(beam);

  // Add all supports
  this.supports.forEach(s => {
    const x = (s.position / this.beamForm.value.beamLength) * (width - 40) + 20;
    const support = new Konva.Rect({
      x: x - 5,
      y: 115,
      width: 10,
      height: 10,
      fill: 'blue'
    });
    layer.add(support);
    layer.add(new Konva.Text({ x: x - 20, y: 130, text: s.type, fontSize: 12, fill: 'blue' }));
    support.on('mouseover', () => showTooltip(support, `Soporte: ${s.type}`));
    support.on('mouseout', hideTooltip);
  });

  // Add all point loads
  this.loads.forEach(l => {
    const x = (l.position / this.beamForm.value.beamLength) * (width - 40) + 20;
    const load = new Konva.Arrow({
      points: [x, 105, x, 125],
      stroke: 'red',
      fill: 'red',
      pointerLength: 6,
      pointerWidth: 6
    });
    layer.add(load);
    layer.add(new Konva.Text({ x: x - 15, y: 90, text: `${l.magnitude}kN`, fontSize: 12, fill: 'red' }));
    load.on('mouseover', () => showTooltip(load, `Carga Puntual: ${l.magnitude}kN`));
    load.on('mouseout', hideTooltip);
  });

  // Add moments
  this.moments.forEach(m => {
    const x = (m.position / this.beamForm.value.beamLength) * (width - 40) + 20;
    const moment = new Konva.Circle({
      x,
      y: 105,
      radius: 6,
      stroke: 'purple'
    });
    layer.add(moment);
    layer.add(new Konva.Text({ x: x - 15, y: 90, text: `${m.magnitude}kNm`, fontSize: 12, fill: 'purple' }));
    moment.on('mouseover', () => showTooltip(moment, `Momento: ${m.magnitude}kNm`));
    moment.on('mouseout', hideTooltip);
  });

  // Add distributed loads
  this.distributedLoads.forEach(d => {
    const startX = (d.startPos / this.beamForm.value.beamLength) * (width - 40) + 20;
    const endX = (d.endPos / this.beamForm.value.beamLength) * (width - 40) + 20;
    const distLoad = new Konva.Line({
      points: [startX, 110, endX, 110],
      stroke: 'green',
      strokeWidth: 2
    });
    layer.add(distLoad);
    layer.add(new Konva.Text({
      x: (startX + endX) / 2 - 30,
      y: 90,
      text: `${d.startMag}→${d.endMag} kN/m`,
      fontSize: 12,
      fill: 'green'
    }));
    distLoad.on('mouseover', () =>
      showTooltip(distLoad, `Carga Distribuida: ${d.startMag}→${d.endMag} kN/m`)
    );
    distLoad.on('mouseout', hideTooltip);
  });

  layer.draw();
}


  addSupport() {
    this.supports.push(this.supportForm.value);
    this.supportForm.reset({ type: 'PINNED', position: 0 });
    this.renderCanvas();
  }

  addLoad() {
    this.loads.push(this.loadForm.value);
    this.loadForm.reset({ position: 0, magnitude: 0 });
    this.renderCanvas();
  }

  addMoment() {
    this.moments.push(this.momentForm.value);
    this.momentForm.reset({ position: 0, magnitude: 0 });
    this.renderCanvas();
  }

  addDistLoad() {
    this.distributedLoads.push(this.distLoadForm.value);
    this.distLoadForm.reset({ startPos: 0, endPos: 0, startMag: 0, endMag: 0 });
    this.renderCanvas();
  }

  async calculateResults() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    console.log('Calcular clicked', this.beamForm.value);

    const Plotly = await import('plotly.js');

    const length = this.beamForm.value.beamLength;
    const x = Array.from({ length: 100 }, (_, i) => i * length / 99);
    const y = x.map(xi => Math.sin((Math.PI / length) * xi)); // TODO: Replace with real solver

    const container = document.getElementById('results-container');
    if (!container) {
      console.error('Missing results-container div');
      return;
    }

    container.innerHTML = '';
    const chartDiv = document.createElement('div');
    container.appendChild(chartDiv);

    Plotly.newPlot(chartDiv, [
      { x, y, type: 'scatter', mode: 'lines', name: 'Desplazamiento' }
    ], {
      title: { text: 'Gráfica de Resultados' },
      xaxis: { title: { text: 'Longitud (m)' } },
      yaxis: { title: { text: 'Desplazamiento (m)' } },
      margin: { t: 40 }
    });
  }


  resetModel() {
    this.supports = [];
    this.loads = [];
    this.moments = [];
    this.distributedLoads = [];

    this.beamForm.reset({ beamLength: 10, beamE: '210e9', beamI: '5e-6' });
    this.supportForm.reset({ type: 'PINNED', position: 0 });
    this.loadForm.reset({ position: 0, magnitude: 0 });
    this.momentForm.reset({ position: 0, magnitude: 0 });
    this.distLoadForm.reset({ startPos: 0, endPos: 0, startMag: 0, endMag: 0 });

    this.renderCanvas();

    const summaryList = document.getElementById('summary-list');
    if (summaryList) summaryList.innerHTML = '';

    const results = document.getElementById('results-container');
    if (results) results.innerHTML = '';
  }
}
