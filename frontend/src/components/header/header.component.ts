import { Component, Inject, OnInit, Renderer2, ElementRef, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { DOCUMENT } from '@angular/common';

type Theme = 'light' | 'dark';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, LucideAngularModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  isDark = false;
  isMenuOpen = false; // <-- état du dropdown

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private doc: Document,
    private el: ElementRef<HTMLElement>   // <-- pour détecter clics hors composant
  ) {}

  ngOnInit(): void {
    const stored = (localStorage.getItem('theme') as Theme | null);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme: Theme = stored ?? (prefersDark ? 'dark' : 'light');
    this.applyTheme(theme);
  }

  // --- Theme ---
  toggleTheme(): void { this.applyTheme(this.isDark ? 'light' : 'dark'); }
  private applyTheme(theme: Theme) {
    this.renderer.setAttribute(this.doc.documentElement, 'data-theme', theme);
    this.isDark = theme === 'dark';
    localStorage.setItem('theme', theme);
  }
  get themeBtnLabel() { return this.isDark ? 'Activer le mode clair' : 'Activer le mode sombre'; }
  get themeIcon() { return this.isDark ? 'sun' : 'moon'; }

  // --- Dropdown profil ---
  toggleMenu(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }
  closeMenu() { this.isMenuOpen = false; }

  // Ferme si clic en dehors
  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    if (!this.el.nativeElement.contains(ev.target as Node)) {
      this.closeMenu();
    }
  }

  // Ferme avec Echap
  @HostListener('document:keydown.escape')
  onEsc() { this.closeMenu(); }
}
