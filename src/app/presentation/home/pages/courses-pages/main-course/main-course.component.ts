import { Component, OnInit, inject } from '@angular/core';
import { BasicHeaderComponent } from '../../../components/basic-header/basic-header.component';
import { ICourse } from '../../../interfaces/course-model';
import { ILittleCard } from '../../../interfaces/ILittleCard';
import { LitleCardComponent } from '../../../components/litle-card/litle-card.component';
import { CourseLitleCardAdapter, PartialCourseToILittleCard } from '../../../adapters/LitleCardAdapter';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, map, of } from 'rxjs';
import { CarruselBgImgComponent } from '../../../components/carrusel-bg-img/carrusel-bg-img.component';
import { TranslocoModule } from '@jsverse/transloco';
import { AsyncPipe } from '@angular/common';
import { CourseUsecaseProvider } from '../../../../../core/course/infrastructure/providers/course-usecase-provider';
import { Course } from '../../../../../core/course/domain/course.model';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-main-course',
  standalone: true,
  imports: [
    BasicHeaderComponent,
    LitleCardComponent,
    CarruselBgImgComponent,
    TranslocoModule,
    RouterLink,
    AsyncPipe,
    MatExpansionModule,
  ],
  templateUrl: './main-course.component.html',
  styleUrl: './main-course.component.css'
})
export class MainCourseComponent {

  private id?: string;
  public courseUseCaseService = inject(CourseUsecaseProvider);
  public logoPath = 'assets/icons/app-logo.svg'
  public course?: Course;
  public popularCourses$ = of<ILittleCard[]>([]);

  constructor(private router:Router, private route:ActivatedRoute) {
    this.route.queryParams.subscribe((params) => {
      if(params['id']) {
        this.id = params['id'];
        this.getById();
        this.popularCourses$ = this.getPopulars();
      } else this.router.navigate(['/home'])
    });
  }

  // adaptCourseToLittleCard(course: ICourse): ILittleCard {
  //   return CourseLitleCardAdapter(course);
  // }

  getById() {
    this.courseUseCaseService.usecase.getById(this.id!)
      .subscribe( course => this.course = course)
  }

  public getPopulars(): Observable<ILittleCard[]> {
    return this.courseUseCaseService.usecase.getCoursesByParams('?filter=POPULAR&perPage=5')
      .pipe(map(courses => courses.map(PartialCourseToILittleCard)))
  }

}
