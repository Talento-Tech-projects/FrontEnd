
export interface BeamDTO {
  id: number | null;
  status: boolean;      // Estado (activo/inactivo)
  lastDate: string | Date;  // Fecha de la última actualización o acción (puede ser una fecha o string en formato ISO)
  beamLength: number;  // Longitud de la viga
  E: number;           // Módulo de Young (E)
  I: number;           // Momento de inercia (I)
  userId: number;      // ID del usuario
  supports: SupportDTO[];        // Soportes de la viga
  pointLoads: PointLoadDTO[];    // Cargas puntuales
  pointMoments: PointMomentDTO[]; // Momentos puntuales
  distributedLoads: DistributedLoadDTO[]; // Cargas distribuidas
  
}


export interface SupportDTO {
  supportType: string;   // Tipo de soporte (por ejemplo: 'simple', 'empotrado')
  position: number;      // Posición del soporte a lo largo de la viga
}

export interface PointLoadDTO {
  position: number;      // Posición de la carga puntual
  loadValue: number;     // Valor de la carga puntual
}

export interface PointMomentDTO {
  position: number;      // Posición del momento puntual
  momentValue: number;   // Valor del momento puntual
}

export interface DistributedLoadDTO {
  startPosition: number; // Posición de inicio de la carga distribuida
  endPosition: number;   // Posición final de la carga distribuida
  loadValue: number;     // Magnitud de la carga distribuida
}