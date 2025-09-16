import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BRA_BranchProvider, OST_FunctionalMatrixProvider, OST_ValueChainProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { FunctionalMatrixDetailPage } from '../functional-matrix-detail/functional-matrix-detail.page';
import { ActivatedRoute, Router } from '@angular/router';
import { ValueChainDetailPage } from '../value-chain-detail/value-chain-detail.page';
import { BranchDetailPage } from '../branch-detail/branch-detail.page';

@Component({
	selector: 'app-functional-matrix',
	templateUrl: 'functional-matrix.page.html',
	styleUrls: ['functional-matrix.page.scss'],
	standalone: false,
})
export class FunctionalMatrixPage extends PageBase {
	supportActivities = [];
	primaryActivities = [];
	valueChainList = [];
	rawBranchList = [];
	branchList = [];
	isAllRowOpened = true;
	constructor(
		public pageProvider: OST_FunctionalMatrixProvider,
		public branchProvider: BRA_BranchProvider,
		public valueChainProvider: OST_ValueChainProvider,
		public modalController: ModalController,
		public popoverCtrl: PopoverController,
		public router: Router,
		public route: ActivatedRoute,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public navCtrl: NavController,
		public location: Location
	) {
		super();
		this.pageConfig.ShowAdd = false;
		this.pageConfig.ShowAddNew = true;
		this.subscriptions.push(
			this.env.getEvents().subscribe((data) => {
				if (data.Code == 'changeBranch') {
					this.id = null;
					this.preLoadData(null);
				}
				else if(data.Code == this.pageConfig.pageName)this.preLoadData(null);
			})
		);
		// this.id = this.route.snapshot?.paramMap?.get('id');
	}
	currentBranch;
	preLoadData(event?: any): void {
		this.branchProvider
			.read({ Take: 5000 })
			.then((values: any) => {
				if (values.data) {
					this.rawBranchList = values.data;
					this.buildFlatTree(values.data, [], this.isAllRowOpened).then((resp: any) => {
						this.rawBranchList = resp;
					});
				}
				super.preLoadData(event);
			})
			.catch((err) => {
				super.preLoadData(event);
			});
	}
	loadedData(event) {
		let root = this.env.branchList.find((d) => !d.IDParent && d.Code == 'Root');
		this.currentBranch = this.rawBranchList.find((d) => d.Id == this.env.selectedBranch);
		if (this.id) this.currentBranch = this.rawBranchList.find((d) => d.Id == this.id);
		this.parentBranch = this.rawBranchList.find((d) => d.Id == this.currentBranch?.IDParent);
		history.pushState({}, null, '#/' + this.pageConfig.pageName + '/' + this.currentBranch.Id);
		if (this.currentBranch?.Id == root.Id) {
			this.branchList = this.rawBranchList.filter((d) => d.IDParent == root?.Id);
		} else this.branchList = this.rawBranchList.filter((d) => d.IDParent == this.currentBranch.Id);
		this.query.IDBranch = this.branchList.map((s) => s.Id).toString();
		Promise.all([this.valueChainProvider.read({ IDBranch: root.Query })])
			.then((values: any) => {
				this.supportActivities = [];
				this.primaryActivities = [];
				this.valueChainList = [];
				this.valueChainList = values[0].data;

				this.valueChainList
					.filter((d) => !d.IDParent)
					.forEach((i) => {
						if (i.Type === 'Primary') this.primaryActivities.push(i);
						else this.supportActivities.push(i);
						this.valueChainList
							.filter((d) => d.IDParent == i.Id)
							.forEach((c) => {
								if (!i.Sections) i.Sections = [];
								i.Sections.push(c);
							});
					});
				// super.preLoadData(event);

				super.loadedData(event);
			})
			.catch((err) => super.loadedData(event));
	}
	getRowSpan(list) {
		return list.reduce((sum, a) => sum + (a.Sections?.length ? a.Sections.length : 1), 0);
	}
	async showModal(desc, branch) {
		let datas = this.items.filter((d) => d.IDBranch == branch?.Id && d.IDValueChain == desc?.Id);
		const modal = await this.modalController.create({
			component: FunctionalMatrixDetailPage,
			componentProps: {
				items: datas,
				valueChain: desc,
				branch: branch,
			},
			cssClass: 'modal90',
		});
		await modal.present();
		const { data } = await modal.onWillDismiss();
		if (data) this.refresh();
	}

	isOpenAddNewPopover = false;
	@ViewChild('addNewPopover') addNewPopover!: HTMLIonPopoverElement;
	presentAddNewPopover(e) {
		this.addNewPopover.event = e;
		this.isOpenAddNewPopover = !this.isOpenAddNewPopover;
	}

	addActivity(isblockBelong = false) {
		let newItem = {
			Id: 0,
			IsDisabled: false,
			Type: null,
		};
		this.showModalActivity(newItem, null, null, isblockBelong);
	}

	async showModalActivity(i, type = null, IDParent = null, isblockBelong = false) {
		if (i?.Id && !this.pageConfig.canEdit) return;
		if (!i)
			i = {
				Id: 0,
				IsDisabled: false,
				Type: null,
			};
		if (type) i.Type = type;
		if (IDParent) i.IDParent = IDParent;
		const modal = await this.modalController.create({
			component: ValueChainDetailPage,
			componentProps: {
				items: this.valueChainList,
				item: i,
				id: i?.Id,
				isBlockBelong: isblockBelong,
			},
			cssClass: 'my-custom-class',
		});
		await modal.present();
		const { data } = await modal.onWillDismiss();
		
	}

	async showModalBranch(i) {
		const modal = await this.modalController.create({
			component: BranchDetailPage,
			componentProps: {
				items: this.rawBranchList,
				item: i,
				id: i.Id,
			},
			cssClass: 'modal90',
		});
		await modal.present();
		const { data } = await modal.onWillDismiss();
		if (data) this.preLoadData(null);
		// return await modal.present();

	}

	parentBranch;
	addBranch() {
		let newItem = {
			Id: 0,
			IDParent: this.currentBranch?.Id,
		};
		this.showModalBranch(newItem);
	}
}
