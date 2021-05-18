import { Injectable } from '@angular/core';
import Konva from 'konva';

@Injectable({
  providedIn: 'root',
})
/**
 * Contains the logic for creating a text node
 * on the canvas
 */
export class TextNodeService {
  constructor() {}

  /**
   * Create a text node on the given stage and layer
   */
  textNode(stage: Konva.Stage, layer: Konva.Layer) {
    const textNode = new Konva.Text({
      text: 'Type here...',
      x: stage.width() * 0.35,
      y: stage.height() * 0.25,
      fontSize: 20,
      draggable: true,
      width: 200,
    });

    layer.add(textNode);

    let transformer = new Konva.Transformer({
      node: textNode as any,
      enabledAnchors: ['middle-left', 'middle-right'],
      //set min width of the text
      boundBoxFunc: function (oldBox, newBox) {
        newBox.width = Math.max(30, newBox.width);
        return newBox;
      },
    });

    stage.on('click', function (e) {
      if (!this.clickStartShape) {
        return;
      }

      if (e.target._id == this.clickStartShape._id) {
        layer.add(transformer);
        transformer.attachTo(e.target);
        layer.draw();
      } else {
        transformer.detach();
        layer.draw();
      }
    });

    textNode.on('transform', function () {
      //reset scale, only width is changing by transformer
      textNode.setAttrs({
        width: textNode.width() * textNode.scaleX(),
        scaleX: 1,
      });
    });

    layer.add(transformer);
    layer.draw();

    textNode.on('dblclick', () => {
      //hide text node and transformer
      textNode.hide();
      transformer.hide();
      layer.draw();

      //create textarea over canvas with absolute position
      //first find position of text node relative to the stage
      let textPosition = (textNode as any).absolutePosition();
      //find position of stage container on the page
      let stageBox = stage.container().getBoundingClientRect();
      //Position of text area is the sum of the positions above
      let areaPosition = {
        x: stageBox.width * 0.5,
        y: stageBox.height * 0.25 + textPosition.y * 0.25,
      };

      //create text area and style it
      let canvasContainer = document.querySelector('#canvasContainer');
      let textArea = document.createElement('textarea');
      // document.body.appendChild(textArea);
      canvasContainer.appendChild(textArea);

      //Apply  many styles to match text on canvas as close as possible
      //Text rendering on canvas and on the textArea cna be different
      //and sometimes it is hard to make it 100% the same.
      textArea.value = textNode.text();
      textArea.style.position = 'absolute';
      textArea.style.top = areaPosition.y + 'px';
      // textArea.style.left = areaPosition.x + 'px';
      textArea.style.width = textNode.width() - textNode.padding() * 2 + 'px';
      textArea.style.height =
        textNode.height() - textNode.padding() * 2 + 5 + 'px';
      textArea.style.fontSize = textNode.fontSize() + 'px';
      textArea.style.border = 'none';
      textArea.style.padding = '0px';
      textArea.style.margin = '0px';
      textArea.style.overflow = 'hidden';
      textArea.style.background = 'none';
      textArea.style.outline = 'none';
      textArea.style.resize = 'none';
      textArea.setAttribute('class', 'align-self-center');

      (textArea as any).style.lineHeight = textNode.lineHeight();

      textArea.style.fontFamily = textNode.fontFamily();
      textArea.style.transformOrigin = 'left top';
      textArea.style.textAlign = textNode.align();
      textArea.style.color = textNode.fill();

      let rotation = textNode.rotation();
      let transform = '';
      if (rotation) {
        transform += 'rotateZ(' + rotation + 'deg)';
      }

      let px = 0;

      //Move textArea slightly on firefox since it jumps a bit
      let isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
      if (isFirefox) {
        px += 2 + Math.round(textNode.fontSize() / 20);
      }

      transform += 'translateY(-' + px + 'px)';

      textArea.style.transform = transform;

      // reset height
      textArea.style.height = 'auto';
      //after browse resized it we can set actual value
      textArea.style.height = textArea.scrollHeight + 3 + 'px';

      textArea.focus();

      function removeTextArea() {
        textArea.parentNode.removeChild(textArea);
        window.removeEventListener('click', handleOutsideClick);
        textNode.show();
        transformer.show();
        transformer.forceUpdate();
        layer.draw();
      }

      function setTextAreaWidth(newWidth) {
        if (!newWidth) {
          //set width for placeholder
          newWidth = (textNode as any).placeholder.length * textNode.fontSize();
        }
        //Extra fixes on different browsers.
        let isSafari = /^((?!chrome|android).)*safari/i.test(
          navigator.userAgent
        );

        let isFirefox =
          navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

        if (isSafari || isFirefox) {
          newWidth = Math.ceil(newWidth);
        }

        let isEdge =
          (document as any).documentMode || /Edge/.test(navigator.userAgent);

        if (isEdge) {
          newWidth += 1;
        }

        textArea.style.width = newWidth + 'px';
      }

      textArea.addEventListener('keydown', function (e) {
        //hide on enter
        //but don't hide on shift+enter
        if (e.keyCode === 13 && !e.shiftKey) {
          textNode.text(textArea.value);
          removeTextArea();
        }

        //on esc do not set value back to node
        if (e.keyCode === 27) {
          removeTextArea();
        }
      });

      textArea.addEventListener('keydown', function (e) {
        let scale = textNode.getAbsoluteScale().x;
        setTextAreaWidth(textNode.width() * scale);

        textArea.style.height = 'auto';
        textArea.style.height =
          textArea.scrollHeight + textNode.fontSize() + 'px';
      });

      function handleOutsideClick(e) {
        if (e.target !== textArea) {
          removeTextArea();
        }
      }

      setTimeout(() => {
        window.addEventListener('click', handleOutsideClick);
      });
    });
    return { textNode, transformer };
  }
}
