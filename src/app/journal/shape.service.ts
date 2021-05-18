import { Injectable } from '@angular/core';
import Konva from 'konva';

@Injectable({
  providedIn: 'root',
})
/**
 * Contains the logic for creating shapes
 * on the canvas
 */
export class ShapeService {
  constructor() {}

  /**
   * Creates a new konva line object and returns it
   * @param pos Position object
   * @param mode the mode of the line, either brush or erase
   * @param color the color of the line
   */
  line(pos, mode: string = 'brush', color: string) {
    //Set the size of the stroke. Eraser is bigger
    let strokeWidth = mode === 'brush' ? 5 : 10;
    return new Konva.Line({
      stroke: color,
      strokeWidth: strokeWidth,
      globalCompositeOperation:
        mode === 'brush' ? 'source-over' : 'destination-out',
      points: [pos.x, pos.y],
      draggable: mode == 'brush',
    });
  }
}
