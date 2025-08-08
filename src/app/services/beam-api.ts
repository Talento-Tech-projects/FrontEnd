import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BeamDTO } from '../models/beam.model';

// --- INTERFACES: El "contrato" de datos con la API ---
// Es una buena práctica tenerlas aquí o en un archivo separado (ej. models.ts)
export enum SupportTypeAPI { PINNED = "PINNED", FIXED = "FIXED", ROLLER = "ROLLER" }
export interface SupportIn { type: SupportTypeAPI; position: number; }
export interface PointLoadIn { magnitude: number; position: number; }
export interface PointMomentIn { magnitude: number; position: number; }
export interface DistributedLoadIn { start_magnitude: number; end_magnitude: number; start_position: number; end_position: number; }
export interface SolverResultsOut { reactions: { [key: string]: { Fx: number; Fy: number; Mz: number; } }; shear_diagram: {x:number, y:number}[]; moment_diagram: {x:number, y:number}[]; deflection_diagram: {x:number, y:number}[]; }
export interface BeamModelIn { length: number; E: number; I: number; supports: SupportIn[]; point_loads: PointLoadIn[]; point_moments: PointMomentIn[]; distributed_loads: DistributedLoadIn[]; }


@Injectable({
  providedIn: 'root' // <-- Esto hace que el servicio esté disponible en toda la app
})
export class BeamApiService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000'; // La URL de la API vive aquí
    private apiUrlback = 'http://localhost:8080'; // La URL de la API vive aquí


  constructor() { }

  /**
   * Llama a la API para resolver el análisis de la viga.
   * @param payload El modelo de la viga con sus cargas y apoyos.
   * @returns Un Observable con los resultados del análisis.
   */
 public solveBeam(payload: BeamModelIn): Observable<SolverResultsOut> {
    return this.http.post<SolverResultsOut>(`${this.apiUrl}/api/v1/solve`, payload);
  }

  public updateBeam(id: number, beamModel: BeamModelIn): Observable<BeamDTO> {
  const beamDto: BeamDTO = {
    id: id,
    projectName: '', // o el que tengas guardado
    status: true,
    lastDate: new Date().toISOString(),
    beamLength: beamModel.length,
    e: beamModel.E,
    i: beamModel.I,
    userId: 1, // o el que tengas del login

    supports: beamModel.supports.map(s => ({
      supportType: s.type,   // mapeo de "type" a "supportType"
      position: s.position
    })),

    pointLoads: beamModel.point_loads.map(p => ({
      loadValue: p.magnitude, // mapeo de "magnitude" a "loadValue"
      position: p.position
    })),

    pointMoments: beamModel.point_moments.map(m => ({
      momentValue: m.magnitude, // mapeo de "magnitude" a "momentValue"
      position: m.position
    })),

    distributedLoads: beamModel.distributed_loads.map(d => ({
    startMagnitude: d.start_magnitude,
    endMagnitude: d.end_magnitude,
    startPosition: d.start_position,
    endPosition: d.end_position,
    loadValue: d.start_magnitude // o el cálculo que corresponda
}))
  };

  return this.http.patch<BeamDTO>(`${this.apiUrlback}/api/beams/${id}`, beamDto);
}
 

  getBeam(id: number): Observable<BeamDTO> {
    return this.http.get<BeamDTO>(`${this.apiUrlback}/api/beams/${id}`);
  }
}
