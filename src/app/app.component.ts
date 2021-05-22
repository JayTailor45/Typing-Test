import { Component, AfterViewInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { fromEvent } from 'rxjs';
import { share } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  @ViewChild('paragraph', {static: false}) paragraph!: ElementRef;

  text: string = `It's easy to make a buck. It's a lot tougher to make a difference.`;

  private keyDown$ = fromEvent<KeyboardEvent>(document, 'keydown')
    .pipe(share());

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    const chars = this.text.split('').map(char => {
      const span = this.renderer.createElement('span');
      const text = this.renderer.createText(char);
      this.renderer.appendChild(span, text);
      this.renderer.appendChild(this.paragraph.nativeElement, span);
      return char;
    });

    const spanElementRefs: HTMLElement[] = this.paragraph.nativeElement.children;

    let cursorIndex = 0;
    let currentSpanRef = spanElementRefs[cursorIndex];
    let currentChar = chars[cursorIndex];

    this.renderer.addClass(currentSpanRef, 'current-char');

    this.keyDown$.subscribe(({key}) => {
      if(key === currentChar) {
        this.renderer.removeClass(currentSpanRef, 'current-char');
        this.renderer.addClass(currentSpanRef, 'typed');

        // Increnemt for next character
        currentSpanRef = this.renderer.nextSibling(currentSpanRef); // TODO: Handle case of last element
        currentChar = chars[++cursorIndex];
        this.renderer.addClass(currentSpanRef, 'current-char');
      }
      console.log(key);
    });
  }

  getParagraphElement() {
  }
}
