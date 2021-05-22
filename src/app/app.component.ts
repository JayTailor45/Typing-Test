import { Component, AfterViewInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { BehaviorSubject, fromEvent, interval, Subject } from 'rxjs';
import { first, share, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  @ViewChild('paragraph', {static: false}) paragraph!: ElementRef;

  text: string = `The Mahabharata is a story about a great battle between the Kauravas and the Pandavas. The battle was fought in Kurukshetra near Delhi. Many kings and princes took part in the battle. The Pandavas defeated the Kauravas. The Bhagvad Gita is a holy book of the Hindus. It is a part of the Mahabharata. Then, Lord Rama, with the help of It is a book of collection of teachings of Lord Krishna to Arjuna in the battlefield. It is the longest epic in the world.`;

  private keyDown$ = fromEvent<KeyboardEvent>(document, 'keydown');

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
      if(cursorIndex == 0) {
        this.timer$.pipe(
          takeUntil(this.gameOver$),
          tap(tick => this.secoundPassed$.next(tick)),
        ).subscribe(_=> null, err => null);
      }
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

  }

  ngOnDestroy() { }
}
