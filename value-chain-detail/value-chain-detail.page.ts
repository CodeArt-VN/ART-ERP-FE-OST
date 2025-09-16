import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, ModalController, NavParams, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { OST_ValueChainProvider } from 'src/app/services/static/services.service';
import { FormBuilder, Validators } from '@angular/forms';
import { lib } from 'src/app/services/static/global-functions';

@Component({
	selector: 'app-value-chain-detail',
	templateUrl: './value-chain-detail.page.html',
	styleUrls: ['./value-chain-detail.page.scss'],
	standalone: false,
})
export class ValueChainDetailPage extends PageBase {
	itemParents: any = [];
	isBlockBelong = false;
	typeList = [
		{ Code: 'Primary', Name: 'Primary activities' },
		{ Code: 'Support', Name: 'Support activities' },
	];

	constructor(
		public pageProvider: OST_ValueChainProvider,
		public env: EnvService,
		public navCtrl: NavController,
		public route: ActivatedRoute,

		public modalController: ModalController,
		public alertCtrl: AlertController,
		public navParams: NavParams,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public loadingController: LoadingController
	) {
		super();
		this.pageConfig.isDetailPage = true;
		this.id = this.route.snapshot.paramMap.get('id');
		this.formGroup = formBuilder.group({
			IDBranch: [this.env.selectedBranch],
			IDParent: [''],
			Type: ['', Validators.required],
			Id: [''],
			Code: [''],
			Name: ['', Validators.required],
			Remark: [''],
			Sort: [''],
		});
	}
	buildForm(){
		this.formGroup = this.formBuilder.group({
			IDBranch: [this.env.selectedBranch],
			IDParent: [''],
			Type: ['', Validators.required],
			Id: [''],
			Code: [''],
			Name: ['', Validators.required],
			Remark: [''],
			Sort: [''],
		});
	}
	preLoadData() {
		if (this.navParams) {
			this.items = JSON.parse(JSON.stringify(this.navParams.data.items));
			lib.buildFlatTree(this.items, [], true).then((res: any) => {
				this.items = res;
			});

			this.item = JSON.parse(JSON.stringify(this.navParams.data.item));
			this.id = this.navParams.data.id;
			this.loadedData();
		}
	}
	loadedData() {
		super.loadedData();
		if (!this.item.Id) {
			this.formGroup.controls.IDBranch.markAsDirty();
			if (this.item.Type) this.formGroup.controls.Type.markAsDirty();
			if (this.item.IDParent) this.formGroup.controls.IDParent.markAsDirty();
		}
		this.changeType({Code:this.item.Type});
	}

	changeType(e){
		if(e.Code == 'Primary'){
			this.itemParents = this.items.filter(d=> d.Type == 'Primary' && !d.IDParent)
		}
		else{
			this.itemParents = this.items.filter(d=> d.Type == 'Support' && !d.IDParent)
		}
		let parent = this.items?.find(d=> d.Id == this.formGroup.controls.IDParent.value);
		if(parent && parent.Type != e.Code){
			this.formGroup.controls.IDParent.setValue(null);
			this.formGroup.controls.IDParent.markAsDirty();
		}
	}

	
	refresh(event?: any): void {
		this.preLoadData();
	}
	savedState = false;
	async saveChange(isContinue?:any) {
		super.saveChange2().then((res: any) => {
			this.savedState = true;
			if(!isContinue) this.modalController.dismiss(this.savedState);
			else{
				this.buildForm();
				this.item = {};
				this.item.Id = 0;
				this.item.Type = res.Type;
				this.item.IDParent = res.IDParent
				this.loadedData();
			}
		});
	}
	async closeModal(){
		this.modalController.dismiss(this.savedState);
	}
	async delete(publishEventCode = this.pageConfig.pageName) {
		if (this.pageConfig.ShowDelete) {
			this.env
				.actionConfirm('delete', this.selectedItems.length, this.item?.Name, this.pageConfig.pageTitle, () =>
					this.pageProvider.delete(this.pageConfig.isDetailPage ? this.item : this.selectedItems)
				)
				.then((_) => {
					this.env.showMessage('DELETE_RESULT_SUCCESS', 'success');
					this.env.publishEvent({ Code: publishEventCode });
					this.closeModal();
				})
				.catch((err: any) => {
					if (err != 'User abort action') this.env.showMessage('DELETE_RESULT_FAIL', 'danger');
					console.log(err);
				});
		}
	}
}
