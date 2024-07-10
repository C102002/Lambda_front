import { Component, inject, signal, ElementRef, ViewChild, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute,RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { BasicHeaderComponent } from '../../../components/basic-header/basic-header.component';
import { PlayerComponent } from './components/player/player.component';
import { CommentsComponent } from './components/comments/comments.component';
import { Course, Lesson } from '../../../../../core/course/domain/course.model';
import { CourseUsecaseProvider } from '../../../../../core/course/infrastructure/providers/course-usecase-provider';
import { CommentBoxComponent } from './components/comment-box/comment-box.component';
import { IComment } from '../../../../../core/comments/domain/comment.model';
import { ProgressCourseUseCaseProvider } from '../../../../../core/progress/infraestructure/providers/progress-course-usecase.provider';


@Component({
  selector: 'app-player-video',
  standalone: true,
  imports: [RouterLink, BasicHeaderComponent, TranslocoModule, CommentsComponent, CommentBoxComponent ,PlayerComponent],
  templateUrl: './player-video.component.html',
  styleUrl: './player-video.component.css'
})
export class PlayerVideoComponent {

  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  @ViewChild('comments') commentSection!: CommentsComponent;
  
  public courseUseCaseService = inject(CourseUsecaseProvider);

  public lesson?: Lesson;
  public course? : Course;
  public idCourse?: string;
  public idLesson = signal('');
  public indexLesson: number = 1
  public video = signal('')
  public propertiesSection = signal({idCourse: '', idLesson: '', indexLesson: 0})

  public isLoading = false;
  
  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.queryParams.subscribe( (params: { [key: string ]: string }) => {
      if(params['course']) {
        this.idCourse = params['course'];
      }else{
        this.router.navigate(['/home'])
      }
      if(params['lesson']) {
        this.idLesson?.set(params['lesson']);
      }
      this.getCourse(this.idCourse!);
    })
  }

  public getCourse(id: string): void{
    this.isLoading = true
    this.courseUseCaseService.usecase.getById(id)
    .subscribe( course =>{
      this.course = course
      if(this.idLesson()){
        this.lesson = course.lessons.find(lesson => lesson.id == this.idLesson())
        this.indexLesson = course.lessons.findIndex(lesson => lesson.id == this.idLesson()) + 1
      }else{
        this.lesson = course.lessons[0]
        this.idLesson.set(this.lesson.id)
        this.indexLesson = 1
      }
      this.video.set(this.lesson?.video)
      this.propertiesSection.set({idCourse: this.idCourse!, idLesson: this.idLesson(), indexLesson: this.indexLesson})
    }).add(() => this.isLoading = false)
  }

  public hasNext(): boolean{
    if(this.lesson?.id == this.course?.lessons[this.course?.lessons.length - 1].id){
      return false
    }
    return true
  }

  public hasPrevious(): boolean{
    if(this.lesson?.id == this.course?.lessons[0].id){
      return false
    }
    return true
  }

  public setNextLesson(): void{
    if(this.hasNext()){
      let indexLesson = this.course?.lessons.findIndex(lesson => lesson.id == this.lesson?.id)
      this.router.navigate([] ,{queryParams: {course: this.idCourse, lesson: this.course?.lessons[indexLesson! + 1].id}, queryParamsHandling: 'merge'});
      this.lesson = this.course?.lessons[indexLesson! + 1];
      this.indexLesson = indexLesson! + 1
      this.video.set(this.lesson?.video)
      this.propertiesSection.set({idCourse: this.idCourse!, idLesson: this.idLesson(), indexLesson: this.indexLesson})
    }
  }

  public setPreviusLesson(): void{
    if(this.hasPrevious()){
      let indexLesson = this.course?.lessons.findIndex(lesson => lesson.id == this.lesson?.id)
      this.router.navigate([] ,{queryParams: { lesson: this.course?.lessons[indexLesson! - 1].id}, queryParamsHandling: 'merge'});
      this.lesson = this.course?.lessons[indexLesson! - 1];
      this.indexLesson = indexLesson! - 1
      this.video.set(this.lesson?.video)
      this.propertiesSection.set({idCourse: this.idCourse!, idLesson: this.idLesson(), indexLesson: this.indexLesson})
    }
  }

  onCommentCreated($event: IComment) {
    this.commentSection.comments.set([...this.commentSection.comments(), $event]);
  }
}
