import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { SquareSkeletonComponent } from '../../../../../shared/components/square-skeleton/square-skeleton.component';
import { CategoyUseCaseProvider } from '../../../../../../core/categories/infrastructure/providers/category-usecase-provider';
import { finalize } from 'rxjs';
import { Category } from '../../../../../../core/categories/domain/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [RouterLink, TranslocoModule, SquareSkeletonComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
  
  private categoryUseCaseService = inject(CategoyUseCaseProvider);
  public isLoadingCategories = false;
  public categories: Category[] = [];

  ngOnInit(): void {
    this.getCategories('?perPage=10&page=1')
  }

  public getCategories(params?: string) {
    this.isLoadingCategories = true
    this.categoryUseCaseService.usecase.getByParams(params ?? '')
      .pipe(finalize(() => this.isLoadingCategories = false))
      .subscribe(c => this.categories = c)
  }

}
