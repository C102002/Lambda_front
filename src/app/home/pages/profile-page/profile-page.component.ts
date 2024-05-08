import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { CarruselBgImgComponent } from '../../components/carrusel-bg-img/carrusel-bg-img.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { DarkModeService } from '../../../shared/services/dark-mode/dark-mode.service';
import { ILittleCard } from '../../interfaces/ILittleCard';
import { CourseLitleCardAdapter } from '../../adapters/LitleCardAdapter';
import { CoursesPopularService } from '../../services/courses/getPopulars/courses-popular.service';


@Component({
    selector: 'app-profile-page',
    templateUrl: './profile-page.component.html',
    styleUrl: './profile-page.component.css',
    standalone: true,
    imports: [RouterLink, CommonModule, CarruselBgImgComponent, TranslocoModule, NgxChartsModule]
})
export class ProfilePageComponent {

  public popularService = inject(CoursesPopularService);
 
  public getPopulars(): ILittleCard[] {
    let popular= this.popularService.getPopulars();
    return popular.map((course) => CourseLitleCardAdapter(course));
  }

  progressValue = 50;

  chartDataStatistics = [
    {
      name: 'Mon',
      value: 100
    },
    {
      name: 'Tue',
      value: 200
    },
    {
      name: 'Wed',
      value: 150
    },
    {
      name: 'Thu',
      value: 300
    },
    {
      name: 'Fri',
      value: 250
    },
    {
      name: 'Sat',
      value: 180
    },
    {
      name: 'Sun',
      value: 220
    }
  ];

  isDarkMode!: boolean;

  ColorSchemeBar: Color = {
    name: 'myLightScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#27AE60']
  };


  lightColorSchemeStatistics: Color = {
    name: 'myLightScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#4F14A0', '#27AE60']
  };
  
  darkColorSchemeStatistics: Color = {
    name: 'myDarkScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#FFFFFF', '#27AE60']
  };

  constructor(private darkModeService: DarkModeService) {
    this.isDarkMode = this.darkModeService.isDarkMode();
  }

  get colorSchemeStatistics(): Color {
    return this.isDarkMode ? this.darkColorSchemeStatistics : this.lightColorSchemeStatistics;
  }

  onBarSelect(event: any) {
    console.log(event);
  }

 }
