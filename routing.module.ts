import { Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/app.guard';

export const OSTRoutes: Routes = [

    { path: 'branch', loadChildren: () => import('./branch/branch.module').then(m => m.BranchPageModule), canActivate: [AuthGuard] },
    { path: 'branch/:id', loadChildren: () => import('./branch-detail/branch-detail.module').then(m => m.BranchDetailPageModule), canActivate: [AuthGuard] },

    { path: 'office', loadChildren: () => import('./office/office.module').then(m => m.OfficePageModule), canActivate: [AuthGuard] },
    { path: 'office/:id', loadChildren: () => import('./office-detail/office-detail.module').then(m => m.OfficeDetailPageModule), canActivate: [AuthGuard] },

];
