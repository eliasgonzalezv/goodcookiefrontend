import { HttpResponse } from '@angular/common/http';
import { ParsedEvent } from '@angular/compiler';
import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  OnInit,
} from '@angular/core';
import Konva from 'konva';
import { ToastrService } from 'ngx-toastr';
import { throwError } from 'rxjs';
import { AuthService } from '../auth/shared/auth.service';
import { ResourceService } from '../resource/resource.service';
import { SaveJournalRequest } from '../resource/saveJournal.request.payload';
import { ShapeService } from './shape.service';
import { TextNodeService } from './text-node.service';

@Component({
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.css'],
})
/**
 *
 */
export class JournalComponent implements OnInit, AfterViewInit {
  shapes: any = []; //shapes currently on the canvas
  stage: Konva.Stage; //Konva stage
  layer: Konva.Layer; //Konva layer
  selectedButton: any = {
    lineBlack: false,
    lineRed: false,
    lineBlue: false,
    clear: false,
    undo: false,
    erase: false,
    text: false,
    save: false,
  };
  erase: boolean = false;
  transformers: Konva.Transformer[] = [];
  saveJournalRequest: SaveJournalRequest;
  userLoggedIn: boolean;

  constructor(
    private shapeService: ShapeService,
    private textNodeService: TextNodeService,
    private authService: AuthService,
    private resourceService: ResourceService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.userLoggedIn = this.authService.isLoggedIn();
    //Initialize the canvas
    let width = window.innerWidth * 0.75;
    let height = window.innerHeight * 0.8;
    this.stage = new Konva.Stage({
      container: 'canvasContainer',
      width: width,
      height: height,
    });

    this.layer = new Konva.Layer();

    this.saveJournalRequest = {
      username: '',
      journalDataUrl: '',
    };

    //Place holder text on the board
    let simpleText = new Konva.Text({
      x: width * 0.5,
      y: height * 0.25,
      text:
        'Type or draw your thoughts on this journal' +
        ' using the buttons on the toolbar.\n' +
        'If you want to save your journals, ' +
        'you need to log in.' +
        '\n Click the "Clear" button to get started!',
      align: 'center',
      width: width * 0.5,
      fontSize: 18,
    });

    simpleText.offsetX(simpleText.width() / 2);

    this.layer.add(simpleText);
    this.stage.add(this.layer);
    this.addLineListeners();
  }

  ngAfterViewInit(): void {
    //Add classes to the canvas element
    document
      .querySelector('canvas')
      .setAttribute('class', 'border border-dark rounded');
  }

  /**
   * Clear all selected buttons
   */
  clearSelection() {
    Object.keys(this.selectedButton).forEach((key) => {
      this.selectedButton[key] = false;
    });
  }

  /**
   * Sets the selection of a button
   * @param type type of button selected
   */
  setSelection(type: string) {
    this.selectedButton[type] = true;
  }

  /**
   * Adds a 'shape' to the canvas.
   * @param type The type of shape to add
   */
  addShape(type: string) {
    this.clearSelection();
    this.setSelection(type);

    if (type == 'lineBlack' || type == 'lineRed' || type == 'lineBlue') {
      this.addLine(type);
    } else if (type == 'text') {
      this.addText();
    }
  }

  /**
   * Adds text to the canvas
   */
  addText() {
    const text = this.textNodeService.textNode(this.stage, this.layer);
    this.shapes.push(text.textNode);
    this.transformers.push(text.transformer);
  }

  /**
   * Sets the selected button of the line
   */
  addLine(lineType: string) {
    this.selectedButton[lineType] = true;
  }

  /**
   * Adds the lines listeners to perform
   * line drawing and erasing on the canvas layer
   */
  addLineListeners() {
    const component = this;
    let lastLine;
    let isPaint;

    //Start drawing/erasing
    this.stage.on('mousedown touchstart', function (e) {
      //Ensure selection is either line or eraser
      if (
        !(
          component.selectedButton['lineBlack'] ||
          component.selectedButton['lineRed'] ||
          component.selectedButton['lineBlue']
        ) &&
        !component.erase
      ) {
        return;
      }

      isPaint = true;
      let pos = component.stage.getPointerPosition();
      const mode = component.erase ? 'erase' : 'brush';
      //color of the line
      let color = component.selectedButton['lineBlack']
        ? 'black'
        : component.selectedButton['lineRed']
        ? 'red'
        : 'blue';

      //Call on service to create the line on canvas
      lastLine = component.shapeService.line(pos, mode, color);
      //add it to the layers and shapes
      component.shapes.push(lastLine);
      component.layer.add(lastLine);
    });

    //Stop drawing
    this.stage.on('mouseup touchend', function () {
      isPaint = false;
    });

    //drawing functionality
    this.stage.on('mousemove touchmove', function () {
      if (!isPaint) {
        return;
      }

      const pos = component.stage.getPointerPosition();
      var newPoints = lastLine.points().concat([pos.x, pos.y]);
      lastLine.points(newPoints);
      component.layer.batchDraw();
    });
  }

  /**
   * Allows to perform the undo operation. Deletes
   * all lines/shapes created by the user so far.
   */
  undo() {
    const removedShape = this.shapes.pop();
    //Detach the shape from the transoformer
    this.transformers.forEach((t) => {
      t.detach();
    });

    if (removedShape) {
      removedShape.remove();
    }
    //redraw the layer
    this.layer.draw();
  }

  /**
   * Clears the entire canvas object
   */
  clear() {
    this.stage.clear();
    this.layer.removeChildren();
  }

  /**
   * Adds transformers to the layer in order
   * to allow resizing of shapes
   */
  addTransformerListeners() {
    const component = this;
    const transformer = new Konva.Transformer();
    this.stage.on('click', function (e) {
      if (!this.clickStartShape) {
        return;
      }

      if (e.target._id == this.clickStartShape._id) {
        component.addDeleteListener(e.target);
        component.layer.add(transformer);
        transformer.attachTo(e.target);
        component.transformers.push(transformer);
        component.layer.draw();
      } else {
        transformer.detach();
        component.layer.draw();
      }
    });
  }

  /**
   * Adds the listeners necessary to perform
   * a deletion of a shape from the layer.
   */
  addDeleteListener(shape) {
    const component = this;
    window.addEventListener('keydown', function (e) {
      if (e.keyCode === 46) {
        shape.remove();
        component.transformers.forEach((t) => {
          t.detach();
        });
        const selectedShape = component.shapes.find((s) => s._id == shape._id);
        selectedShape.remove();
        e.preventDefault();
      }
      component.layer.batchDraw();
    });
  }

  /**
   * Exports the canvas to an image for saving
   * and calls on the resource service to save the journal
   * if the user is logged in
   */
  saveJournal() {
    let devicePixelRatio = window.devicePixelRatio;
    //Extract the canvas base 64 url
    let canvasDataUrl = this.stage.toDataURL({
      mimeType: 'image/png',
      pixelRatio: devicePixelRatio,
    });

    console.log(canvasDataUrl);

    this.saveJournalRequest = {
      username: this.authService.getUsername(),
      journalDataUrl: canvasDataUrl,
    };
    //call on service to perform save in the backend
    let response = this.resourceService
      .saveJournal(this.saveJournalRequest)
      .subscribe((res) => {
        if (res) {
          // console.log(res);
          //Display success notification
          this.toastr.success(res);
        } else {
          throwError(res);
        }
      });
  }
}
