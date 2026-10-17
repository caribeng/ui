import {
  DestroyRef,
  Directive,
  ElementRef,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';

/**
 * Directiva AnimateOnScroll de CaribeNG (`[cbAnimateOnScroll]`):
 * aplica clases de entrada/salida al elemento anfitrión según su intersección con el viewport.
 */
@Directive({
  selector: '[cbAnimateOnScroll]',
  host: {
    class: 'cb-animate-on-scroll',
    '[class.cb-is-in-view]': 'inView()',
  },
})
export class CbAnimateOnScrollDirective implements OnInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly enterClass = input<string>('cb-animate-enter');
  readonly leaveClass = input<string>('');
  readonly once = input<boolean>(true);
  readonly threshold = input<number>(0.15);

  readonly inView = signal(false);

  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.applyEnter();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.applyEnter();
            if (this.once()) {
              this.observer?.disconnect();
            }
          } else if (!this.once()) {
            this.applyLeave();
          }
        }
      },
      { threshold: this.threshold() }
    );

    this.observer.observe(this.host.nativeElement);
    this.destroyRef.onDestroy(() => this.observer?.disconnect());
  }

  applyEnter(): void {
    const el = this.host.nativeElement;
    const leave = this.leaveClass().trim();
    const enter = this.enterClass().trim();
    if (leave) el.classList.remove(...leave.split(/\s+/));
    if (enter) el.classList.add(...enter.split(/\s+/));
    this.inView.set(true);
  }

  applyLeave(): void {
    const el = this.host.nativeElement;
    const enter = this.enterClass().trim();
    const leave = this.leaveClass().trim();
    if (enter) el.classList.remove(...enter.split(/\s+/));
    if (leave) el.classList.add(...leave.split(/\s+/));
    this.inView.set(false);
  }
}
