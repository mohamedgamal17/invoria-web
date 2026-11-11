import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-products-shell-page',
  standalone: true,
  imports: [RouterOutlet, ToastModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './products-shell-page.component.html',
})
export class ProductsShellPageComponent {}
