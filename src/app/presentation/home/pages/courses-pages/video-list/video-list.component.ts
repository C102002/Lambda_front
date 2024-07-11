import { Component, inject, signal } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { PartialCourseToPlayerCard } from '../../../adapters/PlayerCardAdapter';
import { PlayerCardComponent } from '../../../components/player-card/player-card.component';
import { Category } from '../../../../../core/categories/domain/category.model';
import { CategoyUseCaseProvider } from '../../../../../core/categories/infrastructure/providers/category-usecase-provider';
import { finalize } from 'rxjs';
import { CourseUsecaseProvider } from '../../../../../core/course/infrastructure/providers/course-usecase-provider';
import { PartialCourse } from '../../../../../core/course/domain/course.model';
import { SquareSkeletonComponent } from '../../../../shared/components/square-skeleton/square-skeleton.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@Component({
  selector: 'app-video-list',
  standalone: true,
  imports: [
    RouterLink,
    TranslocoModule,
    CommonModule,
    PlayerCardComponent,
    SquareSkeletonComponent,
    InfiniteScrollModule
  ],
  templateUrl: './video-list.component.html',
  styleUrl: './video-list.component.css'
})
export class VideoListComponent {

  private currentPage = 1;
  private categoryUseCaseService = inject(CategoyUseCaseProvider);
  private param?: string
  public fetchedCategories= signal<Category[]>([])
  public selectedCategory?: Category;
  public isLoadingCategories = false;
  public coursesUseCaseService = inject(CourseUsecaseProvider);
  public isLoadingCourses = false;
  public coursesByCategory = signal<PartialCourse[]>([]);
  public isLoadingMoreCoursesByCategory = false;
  public scrollContainer = inject(DOCUMENT).getElementById('scrollContainer');
  public hasNoMoreCourses = false;

  constructor(private router:Router, private route:ActivatedRoute) {
    this.route.queryParams.subscribe((params: { [key: string ]: string }) => {
      const categories = this.fetchedCategories();
      const categoryParam = params['category'];
      if (categoryParam) {
        this.param = categoryParam;
        const category = categories.find(c => c.name === this.param);
        if (category) this.setSelectedCategory(category);
        else if (categories.length === 0) this.getCategories();
      } else if (categories.length) this.setSelectedCategory(categories[0]);
      else this.getCategories(); 
    });
  }

  adaptToPlayerCard(video: PartialCourse) {
    return PartialCourseToPlayerCard(video);
  }

  public getCategories(params?: string) {
    this.isLoadingCategories = true;
    params='?perPage=10&page=1';
    this.categoryUseCaseService.usecase.getByParams(params)
      .pipe(finalize(() => this.isLoadingCategories = false))
      .subscribe(
        c => {
          this.fetchedCategories.set(c)
          if(this.param){
            this.setSelectedCategory(this.fetchedCategories().find(category => category.name == this.param)!)
          }
          else{
            this.setSelectedCategory(c[0])
          }
        }
      )
  }

  public getCoursesByCategory() {
    if(this.currentPage === 1) this.isLoadingCourses = true;
    else this.isLoadingMoreCoursesByCategory = true;
    this.coursesUseCaseService.usecase
      .getCoursesByParams(`?filter=RECENT&page=${this.currentPage}&perPage=5&category=${this.selectedCategory?.id}`)
      .pipe(
        finalize(() => {
          this.isLoadingCourses = false;
          this.isLoadingMoreCoursesByCategory = false;
          this.currentPage++;
        }),
      ).subscribe(c => {
        if(c.length === 0) this.hasNoMoreCourses = true;
        this.coursesByCategory.set([...this.coursesByCategory(), ...c])
      })
  }


  onCategorySelected(category: Category) {
    this.router.navigate([] ,{queryParams: {category: category.name}, queryParamsHandling: 'merge'}); 
  }

  private setSelectedCategory(category : Category) {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.hasNoMoreCourses = false;
    this.coursesByCategory.set([]);
    this.getCoursesByCategory();
  }
}
