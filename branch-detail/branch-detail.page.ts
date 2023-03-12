import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, ModalController, NavParams, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider } from 'src/app/services/static/services.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { lib } from 'src/app/services/static/global-functions';


@Component({
    selector: 'app-branch-detail',
    templateUrl: './branch-detail.page.html',
    styleUrls: ['./branch-detail.page.scss'],
})
export class BranchDetailPage extends PageBase {
    formGroup: FormGroup;
    typeList = [
        {Id: 111, Name: 'Tổng công ty / Công ty'},
        {Id: 112, Name: 'Chi nhánh (đơn vị trực thuộc tổng công ty)'},
        {Id: 113, Name: 'Văn phòng / trung tâm (đơn vị trực thuộc của chi nhánh / công ty)'},
        {Id: 114, Name: 'Phòng ban (đơn vị trực thuộc của 0,1,2)'},
        {Id: 115, Name: 'Kho hàng / Phân xưởng (đơn vị trực thuộc của 0,1,2)'},
        {Id: 116, Name: 'Nhóm/Tổ/Đội (trực thuộc của 3,4)'},
        {Id: 119, Name: 'Chức danh'},
    ];

    constructor(
        public pageProvider: BRA_BranchProvider,
        public env: EnvService,
        public navCtrl: NavController,
        public route: ActivatedRoute,

        public modalController: ModalController,
        public alertCtrl: AlertController,
        public navParams: NavParams,
        public formBuilder: FormBuilder,
        public cdr: ChangeDetectorRef,
        public loadingController: LoadingController,
    ) {
        super();
        this.pageConfig.isDetailPage = true;
        this.id = this.route.snapshot.paramMap.get('id');
        this.formGroup = formBuilder.group({
            IDParent: [''],
            IDType: [''],
            Id: [''],
            Code: [''],
            Name: ['', Validators.required],
            ShortName: [''],
            Remark: [''],
            Email: [''],
            Fax: [''],
            Phone: [''],
            Phone2: [''],
            Address: [''],
            BusinessRegistrationNumber: [''],
            IssueDate: [''],
            IssuedBy: [''],
            TaxCode: [''],
            IDAdministrationManager: [''],
            IDSpecializedManagement: [''],
            Sort: [''],
            IsDisabled: [''],
            Website: [''],
            BankAccount: [''],
            TemplateHeader: [''],
            TemplateFooter: [''],
            TemplateConfig: [''],
            LogoURL: [''],
            BannerURL: [''],
            ImageURL: [''],
            BackgroundColor: [''],
            IsHeadOfDepartment: [''],
        });
    }

    branchList = [];
    preLoadData(){
        if(this.pageConfig.canEditBranch){
            this.pageConfig.canEdit = true;
        }

        if(this.navParams){
            this.branchList = JSON.parse(JSON.stringify(this.navParams.data.items));
            this.branchList.forEach(i=>{
                let prefix = '';
                for (let j = 1; j < i.level; j++) {
                    prefix += '- '
                }
                i.Name = prefix + i.Name;
            })
            this.item = JSON.parse(JSON.stringify(this.navParams.data.item));
            this.id = this.navParams.data.id;

            if (this.pageConfig.canEdit || this.pageConfig.canEditBranch) {
                this.formGroup.enable()
            }

            this.removeCurrentNode();
            this.cdr.detectChanges();
            this.loadedData();
        }
    }

    loadedData(){
        this.items.forEach(i => {
            i.IssueDate = i.IssueDate? lib.dateFormat(i.IssueDate, 'yyyy-mm-dd') : '';
        });
        super.loadedData();
    }
    
    removeCurrentNode(){
        let currentItem = this.branchList.find(i=>i.Id==this.id);
        if(currentItem){
            currentItem.flag = true;
            lib.markNestedNode(this.branchList, this.id)
        }
    }

    saveChange(publishEventCode?: any): Promise<unknown> {
        return this.saveChange2();
    }

}
