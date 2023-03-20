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
    styleUrls: ['branch.page.scss']
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

    loadData(event){
        this.query.Id = this.env.selectedBranchAndChildren;
        super.loadData(event);
    }

    loadedData(event) {
        this.items.forEach(i => {
            this.getBranchType(i);
            i.AdministrationManager = lib.getAttrib(i.IDAdministrationManager, this.items);
        });

        this.buildFlatTree(this.items, this.itemsState, this.isAllRowOpened).then((resp:any)=>{
            this.itemsState = resp;
        });
        super.loadedData(event);
    }



    getBranchType(branch) {
        if (branch.IDType == 111) {
            branch.Type = 'Tổng công ty / Công ty';
            branch.Icon = 'city';
        }
        else if (branch.IDType == 112) {
            branch.Type = 'Chi nhánh';
            branch.Icon = 'landmark';
        }
        else if (branch.IDType == 113) {
            branch.Type = 'Văn phòng / Trung tâm';
            branch.Icon = 'business';
        }
        else if (branch.IDType == 114) {
            branch.Type = 'Phòng ban';
            branch.Icon = 'sitemap';
        }
        else if (branch.IDType == 115) {
            branch.Type = 'Kho hàng / Phân xưởng';
            branch.Icon = 'warehouse';
        }
        else if (branch.IDType == 116) {
            branch.Type = 'Nhóm / Tổ / Đội';
            branch.Icon = 'people';
        }
        else if (branch.IDType == 119) {
            branch.Type = 'Chức danh';
            branch.Icon = 'user-tie';
        }
        else {
            branch.Type = '???';
            branch.Icon = '';
        }
        /* 
        0: Tổng công ty, 
        1: Chi nhánh (đơn vị trực thuộc tổng công ty), 
        2: Văn phòng / trung tâm (đơn vị trực thuộc của chi nhánh / công ty),
        3: Phòng ban (đơn vị trực thuộc của 0,1,2),
        4: Kho hàng / Phân xưởng (đơn vị trực thuộc của 0,1,2), 
        5: Nhóm/Tổ/Đội (trực thuộc của 3,4)
        */
    }

    toggleRowAll() {
        this.isAllRowOpened = !this.isAllRowOpened;
        this.itemsState.forEach(i => {
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
                id: i.Id
            },
            cssClass: 'my-custom-class'
        });
        return await modal.present();
    }

    lastIDParent = this.env.selectedBranch;
    add() {
        let newItem = {
            Id: 0,
            IsDisabled: false,
            IDType: 10,
            IDParent: this.lastIDParent
        };
        this.showModal(newItem);
    }

}
