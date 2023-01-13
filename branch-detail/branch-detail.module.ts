import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { BranchDetailPage } from './branch-detail.page';
import { ShareModule } from 'src/app/share.module';

const routes: Routes = [
  {
    path: '',
    component: BranchDetailPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ShareModule,
    IonicModule,
    ReactiveFormsModule,
    ShareModule,
    RouterModule.forChild(routes)
  ],
  declarations: [BranchDetailPage]
})
export class BranchDetailPageModule {}
