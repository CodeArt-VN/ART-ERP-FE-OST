import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, ModalController, NavParams, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { OST_FunctionalMatrixProvider } from 'src/app/services/static/services.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { lib } from 'src/app/services/static/global-functions';

@Component({
	selector: 'app-functional-matrix-detail',
	templateUrl: './functional-matrix-detail.page.html',
	styleUrls: ['./functional-matrix-detail.page.scss'],
	standalone: false,
})
export class FunctionalMatrixDetailPage extends PageBase {
	itemParents: any = [];
	isBlockBelong = false;
	formArray = new FormArray([]);
	typeList = [
		{ Code: 'C', Name: 'Preside over and take responsibility (C)' },
		{ Code: 'P', Name: 'Coordinate, perform parallel (P)' },
		{ Code: 'T', Name: 'Participate in the process (T)' },
		{ Code: 'H', Name: 'Support when required (H)' },
	];

	constructor(
		public pageProvider: OST_FunctionalMatrixProvider,
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
	}
	valueChain;
	currentBranch;
	preLoadData() {
		this.query.branch = this.env.selectedBranch;

		if (this.navParams) {
			this.items = JSON.parse(JSON.stringify(this.navParams.data.items));
			lib.buildFlatTree(this.items, [], true).then((res: any) => {
				this.items = res;
			});

			this.valueChain = JSON.parse(JSON.stringify(this.navParams.data.valueChain));
			this.currentBranch = JSON.parse(JSON.stringify(this.navParams.data.branch));
			// this.id = this.navParams.data.id;
			this.loadedData();
		}
	}
	loadedData() {
		if (!this.currentBranch) this.currentBranch = this.env.selectedBranch;
		super.loadedData();
		this.patchFormArray();
		if (this.formArray.length == 0 && this.pageConfig.canAdd) this.addFormGroup({});
	}
	patchFormArray() {
		this.formArray = new FormArray([]);
		this.items.forEach((i) => {
			this.addFormGroup(i);
		});
		if (!this.pageConfig.canEdit) {
			this.formArray.controls.forEach((fg: FormGroup) => {
				if (fg.value.Id) {
					fg.disable();
				}
			});
		}
	}

	addFormGroup(i) {
		let group = this.formBuilder.group({
			IDBranch: [this.currentBranch.Id],
			IDValueChain: [i.IDValueChain ?? this.valueChain.Id],
			Type: [i.Type, Validators.required],
			Id: [i.Id],
			Name: [i.Name, Validators.required],
		});
		if (i.IsDisabled) group.disable();
		this.formArray.push(group);
		if (!i.Id) {
			group.get('IDValueChain').markAsDirty();
		}
	}

	refresh(event?: any): void {
		this.preLoadData();
	}
	savedState = false;
	async saveChange(isContinue = false) {
		let objPost = [];
		let groups = this.formArray.controls;
		groups.forEach(async (g: FormGroup) => {
			g.updateValueAndValidity();
			if (!g.valid) {
				let invalidControls = this.findInvalidControlsRecursive(g);
				const translationPromises = invalidControls.map((control) => this.env.translateResource(control));
				await Promise.all(translationPromises).then((values) => {
					let invalidControls = values;
					this.env.showMessage('Please recheck control(s): {{value}}', 'warning', invalidControls.join(' | '));
				});
			} else {
				let submitValue = this.getDirtyValues(g);
				objPost.push(submitValue);
			}
		});
		this.pageProvider.commonService
			.connect('POST', 'OST/FunctionalMatrix/PostItems', objPost)
			.toPromise()
			.then((resp: any) => {
				this.savedState = true;
				this.env.showMessage('SAVE_SUCCESS', 'success');
				if (!isContinue) this.modalController.dismiss(this.savedState);
				else {
					this.formArray = new FormArray([]);
					this.items.forEach((i) => {
						i.Id = 0;
						this.addFormGroup(i);
					});
					this.loadedData();
				}
			});
	}
	async closeModal(){
		this.modalController.dismiss(this.savedState);
	}
	async deleteFG(fg, idx) {
		if (fg.value.Id) {
			this.env
				.actionConfirm('delete', this.selectedItems.length, this.item?.Name, this.pageConfig.pageTitle, () =>
					this.pageProvider.delete(this.pageConfig.isDetailPage ? this.item : this.selectedItems)
				)
				.then((_) => {
					this.formArray.removeAt(idx);
					this.env.showMessage('DELETE_RESULT_SUCCESS', 'success');
				})
				.catch((err: any) => {
					if (err != 'User abort action') this.env.showMessage('DELETE_RESULT_FAIL', 'danger');
					console.log(err);
				});
		} else {
			this.formArray.removeAt(idx);
		}
	}
}
