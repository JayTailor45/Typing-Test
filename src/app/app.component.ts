import { Component, AfterViewInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { BehaviorSubject, fromEvent, interval, Subject } from 'rxjs';
import { share, takeUntil, tap } from 'rxjs/operators';

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

  private timer$ = interval(1000);
  private secoundPassed$: BehaviorSubject<number> = new BehaviorSubject(0);
  private gameOver$: Subject<any> = new Subject();

  status: {
    wpm: number | null,
    cpm: number | null,
    time: number | null,
  } = {
    wpm: null,
    cpm: null,
    time: null,
  };

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
    let totalWords = this.text.split(' ').length;

    this.renderer.addClass(currentSpanRef, 'current-char');

    this.keyDown$.subscribe(({key}) => {
      if(cursorIndex >= chars.length -1) {
        this.gameOver$.error(null);
        this.gameOver$.complete();

        // Show result
        const totalTime = this.secoundPassed$.getValue();
        this.status.time = totalTime;
        this.status.wpm = (totalWords / totalTime) * 60;
        this.status.cpm = (chars.length / totalTime) * 60;
        return;
      }

      if(key === currentChar) {
        this.renderer.removeClass(currentSpanRef, 'current-char');
        this.renderer.addClass(currentSpanRef, 'typed');

        // Increnemt for next character
        currentSpanRef = this.renderer.nextSibling(currentSpanRef);
        currentChar = chars[++cursorIndex];
        this.renderer.addClass(currentSpanRef, 'current-char');
      }
    });

    this.timer$.pipe(
      takeUntil(this.gameOver$),
      tap(tick => this.secoundPassed$.next(tick)),
    ).subscribe(val => {
    }, err => { });
  }

  ngOnDestroy() { }
}
