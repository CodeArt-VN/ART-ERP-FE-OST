import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { lib } from 'src/app/services/static/global-functions';
import { BRA_BranchProvider } from 'src/app/services/static/services.service';
import { BranchDetailPage } from '../branch-detail/branch-detail.page';

@Component({
  selector: 'app-branch',
  templateUrl: 'branch.page.html',
  styleUrls: ['branch.page.scss'],
})
export class BranchPage extends PageBase {
  itemsState: any = [];
  isAllRowOpened = true;

  constructor(
    public pageProvider: BRA_BranchProvider,
    public modalController: ModalController,
    public alertCtrl: AlertController,
    public loadingController: LoadingController,
    public env: EnvService,
    public navCtrl: NavController,
  ) {
    super();
    this.query.Take = 5000;
    this.query.AllChildren = true;
    this.query.AllParent = true;
  }

  loadData(event) {
    this.query.Id = this.env.selectedBranchAndChildren;
    super.loadData(event);
  }

  loadedData(event) {
    this.items.forEach((i) => {
      this.getBranchType(i);
      i.AdministrationManager = lib.getAttrib(i.IDAdministrationManager, this.items);
    });

    this.buildFlatTree(this.items, this.itemsState, this.isAllRowOpened).then((resp: any) => {
      this.itemsState = resp;
    });
    super.loadedData(event);
  }

  getBranchType(branch) {
    if (branch.Type == 'Company') {
      branch.Icon = 'city';
    } else if (branch.Type == 'Branch') {
      branch.Icon = 'landmark';
    } else if (branch.Type == 'OfficeCenter') {
      branch.Icon = 'business';
    } else if (branch.Type == 'Department') {
      branch.Icon = 'sitemap';
    } else if (branch.Type == 'Warehouse') {
      branch.Icon = 'warehouse';
    } else if (branch.Type == 'Team') {
      branch.Icon = 'people';
    } else if (branch.Type == 'TitlePosition') {
      branch.Icon = 'user-tie';
    } else {
      branch.Icon = '';
    }
  }

  toggleRowAll() {
    this.isAllRowOpened = !this.isAllRowOpened;
    this.itemsState.forEach((i) => {
      i.showdetail = !this.isAllRowOpened;
      this.toggleRow(this.itemsState, i, true);
    });
  }

  async showModal(i) {
    this.lastIDParent = i.IDParent;
    const modal = await this.modalController.create({
      component: BranchDetailPage,
      componentProps: {
        items: this.itemsState,
        item: i,
        id: i.Id,
      },
      cssClass: 'my-custom-class',
    });
    return await modal.present();
  }

  lastIDParent = this.env.selectedBranch;
  add() {
    let newItem = {
      Id: 0,
      IDParent: this.lastIDParent,
    };
    this.showModal(newItem);
  }
}
